(* Can the js_of_ocaml backend compile bytecode to JavaScript from *inside* a
   js_of_ocaml-compiled program?

   If it can, then OCaml can be a compile-to-JS language in the browser -- source
   to bytecode with compiler-libs, bytecode to JS with this pipeline, and the JS
   handed to the page -- which is the model LiveCodes uses for TS, CoffeeScript
   and ReScript.

   This is the same pipeline the `js_of_ocaml` command line uses:
     Parse_bytecode.from_exe  ->  Driver.f ~formatter
   The only difference from the command line is the formatter: the CLI writes to
   a file, and this writes to a Buffer, because a browser has no disk.

   Reads ./t.byte, writes ./probe.out.js, prints a summary. No arguments, so it
   behaves identically natively and under js_of_ocaml in Node. *)

let contains haystack needle =
  let n = String.length needle and h = String.length haystack in
  let rec go i = i + n <= h && (String.sub haystack i n = needle || go (i + 1)) in
  go 0

let () =
  let ic = open_in_bin "t.byte" in
  let one =
    Js_of_ocaml_compiler.Parse_bytecode.from_exe
      ~linkall:true
      ~link_info:false
      ~include_cmis:false
      ic
  in
  close_in ic;
  let buf = Buffer.create 65536 in
  let fmt = Js_of_ocaml_compiler.Pretty_print.to_buffer buf in
  Js_of_ocaml_compiler.Driver.configure fmt;
  ignore
    (Js_of_ocaml_compiler.Driver.f
       ~link:`All
       ~source_map:false
       ~formatter:fmt
       one.Js_of_ocaml_compiler.Parse_bytecode.code);
  let js = Buffer.contents buf in
  Printf.printf "len=%d\n" (String.length js);
  Printf.printf "contains-program-string=%b\n" (contains js "probe ok");
  Printf.printf "head=%s\n" (String.escaped (String.sub js 0 (min 40 (String.length js))));
  let oc = open_out_bin "probe.out.js" in
  output_string oc js;
  close_out oc
