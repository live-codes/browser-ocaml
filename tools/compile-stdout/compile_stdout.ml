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
  Compile.implementation
    ~start_from:Clflags.Compiler_pass.Parsing
    ~source_file
    ~output_prefix:prefix;
  let cmo = prefix ^ ".cmo" in
  let byte = prefix ^ ".byte" in
  (* Absolute paths, because Bytelink resolves its arguments through Load_path
     and a bare "main.cmo" was not being found there even with "." on the path. *)
  let abs p = if Filename.is_relative p then Filename.concat (Sys.getcwd ()) p else p in
  (* Report rather than raise: an opaque exception is useless to a caller, and
     the caller here is a browser that has to turn this into diagnostics. *)
  (try Bytelink.link [ abs (Filename.concat stdlib_dir "stdlib.cma"); abs cmo ] (abs byte) with
   | Bytelink.Error e ->
       Bytelink.report_error Format.err_formatter e;
       exit 2
   | exn ->
       prerr_endline ("compile_stdout: " ^ Printexc.to_string exn);
       exit 2);
  print_string (hex_of_string (read_file byte))
