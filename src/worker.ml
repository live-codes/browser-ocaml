(* The OCaml toplevel, running inside a Web Worker.

   This is the browser end of the PoC. It is the same core as the official
   OCaml playground (ocaml.org/play): compiler-libs' toplevel, driven through
   [Js_of_ocaml_toplevel.JsooTop].

   Message protocol (deliberately tiny -- see ../web/app.js):

   - incoming: a plain string of OCaml source
   - outgoing: ["ready", banner]
               ["result", ok, stdout, stderr, result]
                 ok     "1" | "0"
                 result the toplevel's own output, e.g. "- : int = 5" *)

open Js_of_ocaml
open Js_of_ocaml_toplevel

let stdout_buff = Buffer.create 4096
let stderr_buff = Buffer.create 4096
let code_buff = Buffer.create 4096
let result_buff = Buffer.create 4096

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

let install_cmi_loader () =
  let available =
    List.map
      (fun cmi -> (Filename.chop_extension (Filename.basename cmi), cmi))
      (cmi_names ())
  in
  let open Persistent_env.Persistent_signature in
  let fallback = !load in
  load :=
    (fun ~allow_hidden ~unit_name ->
      let key = String.uncapitalize_ascii unit_name in
      match List.assoc_opt key available with
      | None -> fallback ~allow_hidden ~unit_name
      | Some cmi -> (
          match fetch (Filename.concat cmi_base cmi) with
          | None -> fallback ~allow_hidden ~unit_name
          | Some data ->
              Some
                {
                  filename = Sys.executable_name;
                  cmi = read_cmi unit_name data;
                  visibility = Load_path.Visible;
                }))

(* ~~~ Toplevel ~~~ *)

let initialize () =
  Clflags.no_check_prims := true;
  install_cmi_loader ();
  JsooTop.initialize ();
  Sys_js.set_channel_flusher stdout (Buffer.add_string stdout_buff);
  Sys_js.set_channel_flusher stderr (Buffer.add_string stderr_buff);
  Sys.interactive := false;
  ignore (JsooTop.use Format.std_formatter "open Stdlib;;");
  Sys.interactive := true

let execute phrase =
  Buffer.clear stdout_buff;
  Buffer.clear stderr_buff;
  Buffer.clear code_buff;
  Buffer.clear result_buff;
  (* [true] asks the toplevel to print the type/value of the phrase.
     Note [JsooTop.execute] returns [unit] -- unlike [use], which returns a
     [bool] but does not print values -- so success is inferred from whether
     anything was reported on stderr. *)
  JsooTop.execute true
    ~pp_code:code_ppf
    ~highlight_location:(fun _ -> ())
    result_ppf phrase;
  Format.pp_print_flush code_ppf ();
  Format.pp_print_flush result_ppf ();
  Format.pp_print_flush Format.err_formatter ();
  let stderr = Buffer.contents stderr_buff in
  ( String.length stderr = 0,
    Buffer.contents stdout_buff,
    stderr,
    Buffer.contents result_buff )

(* ~~~ Worker protocol ~~~ *)

let post msg =
  ignore
    (Js.Unsafe.meth_call Js.Unsafe.global "postMessage"
       [| Js.Unsafe.inject msg |])

let post_result ok out err res =
  post
    (Js.array
       [|
         Js.string "result";
         Js.string (if ok then "1" else "0");
         Js.string out;
         Js.string err;
         Js.string res;
       |])

let () =
  initialize ();
  post (Js.array [| Js.string "ready"; Js.string "Toplevel ready." |]);
  Js.Unsafe.set Js.Unsafe.global "onmessage"
    (Js.Unsafe.inject
       (Js.wrap_callback (fun ev ->
            let code = Js.to_string (Js.Unsafe.get ev "data") in
            let ok, out, err, res = execute (code ^ "\n;;\n") in
            post_result ok out err res)))
