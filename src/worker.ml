(* The OCaml toplevel, running inside a Web Worker.

   This is the browser end of the PoC. It is the same core as the official
   OCaml playground (ocaml.org/play): compiler-libs' toplevel, driven through
   [Js_of_ocaml_toplevel.JsooTop].

   Message protocol (deliberately tiny -- see ../web/app.js):

   - incoming: { code: <OCaml source>, input: <stdin>, args: [<string>],
                 files: [{ name: <string>, content: <string> }] }
                 args  command-line arguments; argv.(0) is "main.ml"
                 files registered in the pseudo filesystem, so open_in finds them
   - outgoing: ["ready", banner]
               ["result", exit_code, stdout, stderr, outcome, output, diagnostics]
                 exit_code    "0" | "1" | ... | "null" when the phrase never ran
                 stderr       the program's own stderr, diagnostics removed
                 outcome      the toplevel's own output, e.g. "val x : int = 3"
                 output       stdout and stderr in the order they were flushed
                 diagnostics  compiler errors and warnings, as text *)

open Js_of_ocaml
open Js_of_ocaml_toplevel

let stdout_buff = Buffer.create 4096
let stderr_buff = Buffer.create 4096
(* stdout and stderr as one stream would have shown them. The two channels are
   captured separately, so this is flush order rather than write order -- the
   same caveat a stdio-buffered program has anyway. *)
let output_buff = Buffer.create 8192
let code_buff = Buffer.create 4096
let result_buff = Buffer.create 4096

let flush_stdout s =
  Buffer.add_string stdout_buff s;
  Buffer.add_string output_buff s

let flush_stderr s =
  Buffer.add_string stderr_buff s;
  Buffer.add_string output_buff s

let code_ppf = Format.formatter_of_buffer code_buff
let result_ppf = Format.formatter_of_buffer result_buff

(* ~~~ Standard library interfaces, fetched on demand ~~~

   worker.js is built with [--no-cmis], so the .cmi interfaces the type-checker
   needs are not embedded -- embedding them is what made the file ~12 MB. They
   ship as static files under stdlib/ instead, and we override the compiler's
   persistent-signature loader to fetch one the first time it is asked for.

   The fetch must be synchronous: [load] is called from inside the
   type-checker, so it cannot await a promise. Synchronous XHR is deprecated
   but works in a worker, and it is what the official playground does too. *)

let cmi_base = "stdlib"
let cmi_manifest = "stdlib/units.txt"

let fetch url =
  let x = XmlHttpRequest.create () in
  ignore (Js.Unsafe.set x "responseType" (Js.string "arraybuffer"));
  ignore
    (Js.Unsafe.meth_call x "open"
       [|
         Js.Unsafe.inject (Js.string "GET");
         Js.Unsafe.inject (Js.string url);
         Js.Unsafe.inject Js._false;
       |]);
  ignore (Js.Unsafe.meth_call x "send" [| Js.Unsafe.inject Js.null |]);
  if Js.float_of_number (Js.Unsafe.get x "status") = 200. then
    Js.Opt.case
      (File.CoerceTo.arrayBuffer (Js.Unsafe.get x "response"))
      (fun () -> None)
      (fun buf -> Some (Typed_array.String.of_arrayBuffer buf))
  else None

let cmi_names () =
  match fetch cmi_manifest with
  | None -> []
  | Some body ->
      String.split_on_char '\n' body |> List.filter (fun line -> line <> "")

(* Let the compiler parse the interface itself: write the bytes into
   js_of_ocaml's in-memory filesystem and call its own reader, rather than
   depending on the .cmi marshalled layout. *)
let read_cmi unit_name data =
  let path = Filename.concat "/cmi" (unit_name ^ ".cmi") in
  let oc = open_out_bin path in
  output_string oc data;
  close_out oc;
  Cmi_format.read_cmi path

(* ~~~ Libraries, loaded on demand ~~~

   Third-party libraries are not linked into the toplevel. Each ships as a
   .cma that Dynlink loads at runtime, plus its .cmi files for type-checking.

   The trigger is the type-checker asking for one of those interfaces, which is
   exactly "this code uses this library" -- and it happens before the phrase
   runs, so loading there is early enough for the code to then execute. *)

let library_manifest = "libs/manifest.txt"

let libraries_loaded = Hashtbl.create 8
let cmi_library = Hashtbl.create 32
let library_archive = Hashtbl.create 8

let load_library_manifest () =
  match fetch library_manifest with
  | None -> ()
  | Some body ->
      String.split_on_char '\n' body
      |> List.filter (fun line -> line <> "")
      |> List.iter (fun line ->
             match String.split_on_char '\t' line with
             | [ library; archive; cmis ] ->
                 Hashtbl.replace library_archive library archive;
                 String.split_on_char ',' cmis
                 |> List.iter (fun cmi ->
                        if cmi <> "" then
                          Hashtbl.replace cmi_library
                            (Filename.chop_extension cmi)
                            library)
             | _ -> ())

(* Write the archive into the pseudo filesystem and Dynlink it -- the same thing
   a local `#load "lib.cma"` does. A library that cannot load (C stubs, or an
   ABI mismatch) must not take the run down, so failures are reported on stderr
   and the type-checking that follows still happens. *)
let load_library library =
  if not (Hashtbl.mem libraries_loaded library) then
    match Hashtbl.find_opt library_archive library with
    | None -> ()
    | Some archive -> (
        match fetch (Filename.concat "libs" archive) with
        | None ->
            prerr_endline ("[library] could not fetch " ^ archive)
        | Some data ->
            let path = Filename.concat "/libs" archive in
            let oc = open_out_bin path in
            output_string oc data;
            close_out oc;
            (* Use the toplevel's own loader rather than [Dynlink.loadfile].
               Dynlink refuses outright while [Sys.interactive] is set and,
               even with that cleared, it registers the code without telling
               the toplevel -- so later phrases still fail to link against the
               unit. [Topdirs.dir_load] is what `#load` calls, and it does the
               toplevel bookkeeping. *)
            let interactive = !Sys.interactive in
            Sys.interactive := false;
            (try
               Topdirs.dir_load Format.err_formatter path;
               Hashtbl.replace libraries_loaded library ()
             with
            | Dynlink.Error e ->
                prerr_endline
                  ("[library] " ^ library ^ ": " ^ Dynlink.error_message e)
            | e ->
                prerr_endline
                  ("[library] " ^ library ^ ": " ^ Printexc.to_string e));
            Sys.interactive := interactive)

let install_cmi_loader () =
  load_library_manifest ();
  let available =
    List.map
      (fun cmi -> (Filename.chop_extension (Filename.basename cmi), cmi))
      (cmi_names ())
  in
  let open Persistent_env.Persistent_signature in
  let fallback = !load in
  let signature unit_name path =
    match fetch path with
    | None -> None
    | Some data ->
        Some
          {
            filename = Sys.executable_name;
            cmi = read_cmi unit_name data;
            visibility = Load_path.Visible;
          }
  in
  load :=
    (fun ~allow_hidden ~unit_name ->
      let key = String.uncapitalize_ascii unit_name in
      match List.assoc_opt key available with
      | Some cmi -> (
          match signature unit_name (Filename.concat cmi_base cmi) with
          | Some s -> Some s
          | None -> fallback ~allow_hidden ~unit_name)
      | None -> (
          match Hashtbl.find_opt cmi_library key with
          | Some library -> (
              (* Asking for this interface is what "this code uses the
                 library" means. *)
              load_library library;
              match
                signature unit_name (Filename.concat "libs" (key ^ ".cmi"))
              with
              | Some s -> Some s
              | None -> fallback ~allow_hidden ~unit_name)
          | None -> fallback ~allow_hidden ~unit_name))

(* ~~~ Exit codes ~~~

   js_of_ocaml does not implement [exit], so user code calling it raised
   [Invalid_argument "Function 'exit' not implemented"]. We shadow it in a
   prelude that writes the code into js_of_ocaml's in-memory filesystem and
   then raises. The file outlives the toplevel's own exception handling, so
   the code can be read back reliably -- rather than pattern-matching how the
   exception happens to get printed. *)

let exit_code_path = "/exit_code"

let exit_prelude =
  {|
exception Exit_code of int
let exit n =
  let oc = open_out "/exit_code" in
  output_string oc (string_of_int n);
  close_out oc;
  raise (Exit_code n)
|}

let starts_with prefix line = String.starts_with ~prefix line

let has_exception text =
  String.split_on_char '\n' text |> List.exists (starts_with "Exception:")

(* Diagnostics and warnings share stderr. Only the ones shaped "Error..." mean
   the run failed -- a warning must not, any more than a warning fails a local
   build. *)
let has_error text =
  String.split_on_char '\n' text |> List.exists (starts_with "Error")

(* The toplevel routes compiler diagnostics and the program's own stderr to the
   same channel. Separate them by shape: a diagnostic is a location line or an
   Error/Warning/Alert line, plus the indented continuation lines belonging to
   it. A program printing something shaped like a diagnostic is misclassified
   -- the alternative is not offering the two apart at all. *)
let is_diagnostic_start line =
  List.exists
    (fun prefix -> starts_with prefix line)
    [ "Error"; "Warning"; "Alert"; "Line "; "File \"" ]

let split_diagnostics text =
  let diagnostic = ref [] and program = ref [] and in_diagnostic = ref false in
  String.split_on_char '\n' text
  |> List.iter (fun line ->
         let indented = String.length line > 0 && line.[0] = ' ' in
         if line = "" then
           if !in_diagnostic then diagnostic := line :: !diagnostic
           else program := line :: !program
         else if is_diagnostic_start line then begin
           in_diagnostic := true;
           diagnostic := line :: !diagnostic
         end
         else if !in_diagnostic && indented then
           diagnostic := line :: !diagnostic
         else begin
           in_diagnostic := false;
           program := line :: !program
         end);
  ( String.concat "\n" (List.rev !diagnostic),
    String.concat "\n" (List.rev !program) )

let strip_exit_exception text =
  String.split_on_char '\n' text
  |> List.filter (fun line -> not (starts_with "Exception: Exit_code" line))
  |> String.concat "\n"

let take_exit_code () =
  if not (Sys.file_exists exit_code_path) then None
  else begin
    let ic = open_in exit_code_path in
    let code =
      try int_of_string (String.trim (input_line ic)) with _ -> 1
    in
    close_in ic;
    Sys.remove exit_code_path;
    Some code
  end

(* ~~~ stdin ~~~

   js_of_ocaml leaves [stdin] unbacked in a browser, so [input_line stdin] used
   to fail with [EBADF]. [Sys_js.set_channel_filler] lets us back the real
   channel, which is what makes this work properly: [read_line], [input_line],
   [read_int], [Scanf] and [In_channel] all read the same channel, so they all
   work -- including library code that reads stdin internally, which shadowing
   [input_line] in a prelude would not have covered.

   The filler hands over the whole input on the first fill and "" afterwards,
   which is how the channel is told there is no more input. *)

let stdin_data = ref ""
let stdin_drained = ref true

let stdin_filler () =
  if !stdin_drained then ""
  else begin
    stdin_drained := true;
    !stdin_data
  end

let set_stdin text =
  (* A trailing newline matters. Without one the final line is never
     terminated, so the reader asks for another fill, gets "", and the runtime
     then detaches the filler (that is how a channel learns there is no more
     input) and falls back to the unbacked fd -- which raises EBADF rather than
     reporting a clean EOF. Normalising here makes the last line readable. *)
  let text =
    if String.length text = 0 || text.[String.length text - 1] = '\n' then text
    else text ^ "\n"
  in
  stdin_data := text;
  stdin_drained := false;
  (* Register per run, once the input is armed. Re-registering each run is what
     makes repeated runs work, since the runtime detaches the filler the first
     time it returns an empty string. *)
  Sys_js.set_channel_filler stdin stdin_filler

(* ~~~ argv and files ~~~

   Two more things a local build gives you that a bare toplevel does not. *)

(* [Sys.argv] is a value, not a ref, so it cannot be assigned. Shadowing the
   [Sys] module at the toplevel does work, and re-evaluating it per run is how
   the arguments change. [Arg.parse] reads [Stdlib.Sys.argv] from inside the
   [Arg] module, so it does not see the shadowed binding -- hence shadowing
   [Arg] as well and routing it through [Arg.parse_argv]. *)
let ocaml_string_literal s =
  let b = Buffer.create (String.length s + 2) in
  Buffer.add_char b '"';
  String.iter
    (fun c ->
      match c with
      | '"' -> Buffer.add_string b "\\\""
      | '\\' -> Buffer.add_string b "\\\\"
      | '\n' -> Buffer.add_string b "\\n"
      | '\t' -> Buffer.add_string b "\\t"
      | '\r' -> Buffer.add_string b "\\r"
      | c when Char.code c < 32 || Char.code c > 126 ->
          Buffer.add_string b (Printf.sprintf "\\%03d" (Char.code c))
      | c -> Buffer.add_char b c)
    s;
  Buffer.add_char b '"';
  Buffer.contents b

let argv_prelude args =
  let literals = String.concat "; " (List.map ocaml_string_literal args) in
  Printf.sprintf
    {|
module Sys = struct
  include Sys
  let argv = [| %s |]
end
module Arg = struct
  include Arg
  let parse specs anon usage = parse_argv Sys.argv specs anon usage
  let parse_expand specs anon usage =
    let current = ref 0 in
    let argv = ref Sys.argv in
    let specs = ref specs in
    parse_and_expand_argv_dynamic current argv specs anon usage
end
|}
    literals

(* Files are registered in js_of_ocaml's pseudo filesystem, so ordinary
   [open_in "name"] finds them. Re-registering per run keeps content current. *)
let set_files files =
  List.iter
    (fun (name, content) ->
      if Sys.file_exists name then Sys_js.update_file ~name ~content
      else Sys_js.create_file ~name ~content)
    files

(* ~~~ Toplevel ~~~ *)

(* Setup phrases print their bindings; that noise is not the user's output. *)
let silent_ppf = Format.formatter_of_buffer (Buffer.create 128)

let initialize () =
  Clflags.no_check_prims := true;
  install_cmi_loader ();
  JsooTop.initialize ();
  Sys_js.set_channel_flusher stdout flush_stdout;
  Sys_js.set_channel_flusher stderr flush_stderr;
  Sys.interactive := false;
  ignore (JsooTop.use silent_ppf "open Stdlib;;");
  Sys.interactive := true;
  ignore (JsooTop.use silent_ppf exit_prelude);
  (* The interactive toplevel silences most warnings by default; a local build
     does not. Turn them on to match, and note they arrive on stderr just like
     errors -- which is why [execute] tells the two apart. *)
  ignore (JsooTop.use silent_ppf "#warnings \"+a\";;")

(* [JsooTop.execute] returns [unit], and it swallows runtime exceptions into
   the outcome rather than raising them. So the exit code is derived from what
   it leaves behind: an explicit code from the [exit] prelude, otherwise a
   failure if anything was reported on stderr or an exception was printed.

   [setup] is evaluated inside the captured window rather than before it. It
   used to run beforehand, which meant a setup that failed to compile reported
   its error into buffers that were then cleared -- silently. *)
let execute setup phrase =
  Buffer.clear stdout_buff;
  Buffer.clear stderr_buff;
  Buffer.clear output_buff;
  Buffer.clear code_buff;
  Buffer.clear result_buff;
  let setup_ok = JsooTop.use silent_ppf setup in
  (* [true] asks the toplevel to print the type/value of the phrase. *)
  JsooTop.execute true
    ~pp_code:code_ppf
    ~highlight_location:(fun _ -> ())
    result_ppf phrase;
  Format.pp_print_flush code_ppf ();
  Format.pp_print_flush result_ppf ();
  Format.pp_print_flush Format.err_formatter ();
  (* Make sure anything still sitting in the channels reaches the flushers. *)
  flush stdout;
  flush stderr;
  let out_text = Buffer.contents stdout_buff in
  let err_text = Buffer.contents stderr_buff in
  let output = Buffer.contents output_buff in
  let outcome = Buffer.contents result_buff in
  let diagnostics, program_err = split_diagnostics err_text in
  match take_exit_code () with
  | Some code ->
      ( Some code,
        out_text,
        program_err,
        strip_exit_exception outcome,
        output,
        diagnostics )
  | None ->
      (* [None] means the phrase never ran, which is the case when it failed to
         compile. A warning is not a failure, so only Error-shaped lines count. *)
      let ran = setup_ok && not (has_error diagnostics) in
      let code =
        if not ran then None
        else if has_exception outcome then Some 1
        else Some 0
      in
      (code, out_text, program_err, outcome, output, diagnostics)

(* ~~~ Worker protocol ~~~ *)

let post msg =
  ignore
    (Js.Unsafe.meth_call Js.Unsafe.global "postMessage"
       [| Js.Unsafe.inject msg |])

let post_result exit_code out err res output diagnostics =
  let code =
    match exit_code with Some n -> string_of_int n | None -> "null"
  in
  post
    (Js.array
       [|
         Js.string "result";
         Js.string code;
         Js.string out;
         Js.string err;
         Js.string res;
         Js.string output;
         Js.string diagnostics;
       |])

(* Missing/undefined fields are treated as absent rather than crashing the
   worker -- a malformed message should not take the toplevel down, and
   [Js.to_string] of an absent field does not fail cleanly. *)
let string_of_js_or value fallback =
  match Js.Optdef.to_option value with
  | None -> fallback
  | Some v -> Js.to_string v

let string_list_of_js value =
  match Js.Optdef.to_option value with
  | None -> []
  | Some v -> Array.to_list (Js.to_array v) |> List.map Js.to_string

(* Both spellings: this package's API says `contents`, matching its sibling
   `@live-codes/clang-wasm`, while the worker's own protocol said `content`.
   Accepting both keeps the two from having to agree by accident. *)
let files_of_js value =
  match Js.Optdef.to_option value with
  | None -> []
  | Some (arr : Js.Unsafe.any Js.js_array Js.t) ->
      Array.to_list (Js.to_array arr)
      |> List.map (fun item ->
             let name = string_of_js_or (Js.Unsafe.get item "name") "" in
             let contents =
               match Js.Optdef.to_option (Js.Unsafe.get item "contents") with
               | Some v -> Js.to_string v
               | None -> string_of_js_or (Js.Unsafe.get item "content") ""
             in
             (name, contents))

let () =
  initialize ();
  post (Js.array [| Js.string "ready"; Js.string "Toplevel ready." |]);
  Js.Unsafe.set Js.Unsafe.global "onmessage"
    (Js.Unsafe.inject
       (Js.wrap_callback (fun ev ->
            let data = Js.Unsafe.get ev "data" in
            let code = string_of_js_or (Js.Unsafe.get data "code") "" in
            let input = string_of_js_or (Js.Unsafe.get data "input") "" in
            let args =
              "main.ml" :: string_list_of_js (Js.Unsafe.get data "args")
            in
            let files = files_of_js (Js.Unsafe.get data "files") in
            set_stdin input;
            set_files files;
            let exit_code, out, err, res, output, diagnostics =
              execute (argv_prelude args) (code ^ "\n;;\n")
            in
            post_result exit_code out err res output diagnostics)))
