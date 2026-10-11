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

let () =
  let source_file = Sys.argv.(1) in
  let prefix = if Array.length Sys.argv > 2 then Sys.argv.(2) else Filename.remove_extension source_file in
  Load_path.init
    ~auto_include:Load_path.no_auto_include
    ~visible:[ Config.standard_library ]
    ~hidden:[];
  Compile.implementation
    ~start_from:Clflags.Compiler_pass.Parsing
    ~source_file
    ~output_prefix:prefix;
  let cmo = prefix ^ ".cmo" in
  let byte = prefix ^ ".byte" in
  Bytelink.link [ Filename.concat Config.standard_library "stdlib.cma"; cmo ] byte;
  print_string (hex_of_string (read_file byte))
