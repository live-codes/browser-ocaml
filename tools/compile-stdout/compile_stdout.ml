(* Compile OCaml source to a linked bytecode executable and write it to stdout.

   Why this exists: `ocamlc` writes its output to a file and exits, and neither
   suits a browser. A file written into js_of_ocaml's virtual filesystem cannot
   be read back out (there is no JS-side reader), and a program that exits
   cannot be asked to do anything afterwards. This uses the *same* compiler-libs
   front end and linker that ocamlc uses, but puts the result where the caller
   wants it -- stdout, which js_of_ocaml already supports (`-o -`).

   The bytecode is emitted as **hex**, not raw bytes. js_of_ocaml's stdout goes
   through Node's UTF-8 writer, so any byte above 127 would be re-encoded and
   corrupted; hex is ASCII and survives. This is the same trap that corrupted
   .cmi files when they were staged through js_of_ocaml's filesystem.

   Usage: compile_stdout <source.ml> [output-prefix] *)

let hex_of_string s =
  let b = Buffer.create (String.length s * 2) in
  String.iter (fun c -> Buffer.add_string b (Printf.sprintf "%02x" (Char.code c))) s;
  Buffer.contents b

let read_file path =
  let ic = open_in_bin path in
  let n = in_channel_length ic in
  let s = really_input_string ic n in
  close_in ic;
  s

(* Config.standard_library is an absolute path baked in when OCaml was built, so
   it cannot resolve in a browser. Honour OCAMLLIB/CAMLLIB the way the compiler
   tools do -- which also lets a page point it somewhere through `jsoo_env`. *)
let stdlib_dir =
  let non_empty = function Some d when d <> "" -> Some d | _ -> None in
  match non_empty (Sys.getenv_opt "OCAMLLIB") with
  | Some d -> d
  | None -> (
      match non_empty (Sys.getenv_opt "CAMLLIB") with
      | Some d -> d
      | None -> Config.standard_library)

let () =
  let source_file = Sys.argv.(1) in
  let prefix = if Array.length Sys.argv > 2 then Sys.argv.(2) else Filename.remove_extension source_file in
  Load_path.init
    ~auto_include:Load_path.no_auto_include
    ~visible:[ Filename.current_dir_name; stdlib_dir ]
    ~hidden:[];
  (* Warnings are opt-in in OCaml, and an unused variable is worth saying out
     loud in a playground. `false` means a warning is not fatal, and the result
     is only an `alert` if the string names one we do not know.
     All of them except 70 (missing-mli): a single-file program has no interface
     file, so that one would fire on every compile and mean nothing. *)
  ignore (Warnings.parse_options false "+a-70");
  (* **Never call `exit`.** In a browser-target build it is not implemented --
     `exit` raises `Invalid_argument "Function 'exit' not implemented"` -- so a
     program that uses it works under node and dies in a browser. Return instead,
     and let the caller tell success from failure by whether the hex arrived.
     `Format` buffers too, so everything has to be flushed before returning. *)
  let finish () =
    Format.pp_print_flush Format.err_formatter ();
    Format.pp_print_flush Format.std_formatter ();
    flush stdout;
    flush stderr
  in
  let exception Failed in
  (* The compiler does not report its own errors; the caller has to.
     `Errors.report_error` handles every compiler exception and prints a proper
     message with a location. Left uncaught, a type error reached the caller as
     "Typecore.Error(_, _, _)" and nothing else -- which is what a browser would
     have shown the user. *)
  let fail exn =
    Errors.report_error Format.err_formatter exn;
    raise Failed
  in
  (try
     (try
        Compile.implementation
          ~start_from:Clflags.Compiler_pass.Parsing
          ~source_file
          ~output_prefix:prefix
      with exn -> fail exn);
     let cmo = prefix ^ ".cmo" in
     let byte = prefix ^ ".byte" in
     (* Absolute paths, because Bytelink resolves its arguments through Load_path
        and a bare "main.cmo" was not being found there even with "." on the path. *)
     let abs p = if Filename.is_relative p then Filename.concat (Sys.getcwd ()) p else p in
     (* Every library the compiler ships gets linked, not just the standard library.
        Bytelink pulls in only the units the program actually reaches, so naming a
        library the program never uses costs nothing in the output -- and it is what
        lets a program use js_of_ocaml's Js and Dom_html, or Str, or Zarith.
        `cmas.txt` is written by the build, stdlib first; without it, stdlib alone. *)
     let libraries () =
       let manifest = Filename.concat stdlib_dir "cmas.txt" in
       let names =
         match (try Some (read_file manifest) with _ -> None) with
         | None -> [ "stdlib.cma" ]
         | Some text ->
             List.filter (fun n -> n <> "") (List.map String.trim (String.split_on_char '\n' text))
       in
       List.map (fun n -> abs (Filename.concat stdlib_dir n)) names
     in
     (try Bytelink.link (libraries () @ [ abs cmo ]) (abs byte) with exn -> fail exn);
     print_string (hex_of_string (read_file byte))
   with
   | Failed -> ()
   | exn -> Errors.report_error Format.err_formatter exn);
  finish ()
