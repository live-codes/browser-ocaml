(* Prints the actual on-disk .cmi layout, so the byte parsing in worker.ml is
   written against the format rather than an assumption about it.
   Build and run inside the toolchain container:
     ocamlfind ocamlc -package compiler-libs.common -linkpkg tools/cmi_probe.ml -o /tmp/cmi_probe && /tmp/cmi_probe *)

let () =
  let path = Sys.argv.(1) in
  let ic = open_in_bin path in
  let size = in_channel_length ic in
  let contents = really_input_string ic size in
  close_in ic;

  let magic = Config.cmi_magic_number in
  let magic_len = String.length magic in
  Printf.printf "file size        = %d\n" size;
  Printf.printf "Config.cmi_magic = %S (length %d)\n" magic magic_len;
  Printf.printf "first 24 bytes   = %S\n" (String.sub contents 0 (min 24 size));
  Printf.printf "magic matches    = %b\n"
    (String.length contents >= magic_len
    && String.sub contents 0 magic_len = magic);

  (match Marshal.from_string contents magic_len with
  | exception e -> Printf.printf "marshal at %d   = FAILED %s\n" magic_len (Printexc.to_string e)
  | (_ : string * Types.signature_item list) -> Printf.printf "marshal at %d   = a (string * signature)\n" magic_len);

  (match Cmi_format.read_cmi path with
  | exception e -> Printf.printf "Cmi_format.read_cmi = FAILED %s\n" (Printexc.to_string e)
  | info -> Printf.printf "Cmi_format.read_cmi = name=%s\n" info.cmi_name);
