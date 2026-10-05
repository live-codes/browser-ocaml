(* Does linking js_of_ocaml-compiler.runtime-files let the backend emit a
   complete, runnable bundle with no filesystem at all?

   Every runtime chunk (array.js, io.js, fs_fake.js, ...) is registered into the
   compiler by that sublibrary, through Builtins.register. Without it the
   backend looks the chunks up through Fs -- fine for the command line,
   impossible in a browser -- and silently omits whatever it cannot find, which
   is what left the output referencing `caml_register_global_predef` and then
   `caml_fs_init`.

   Reads ./t.byte; writes ./prog.<variant>.js. No arguments, so it behaves
   identically natively and under js_of_ocaml. *)

let contains haystack needle =
  let n = String.length needle and h = String.length haystack in
  let rec go i = i + n <= h && (String.sub haystack i n = needle || go (i + 1)) in
  go 0

(* Referencing this forces the module to be linked, which is what runs the
   Builtins.register calls at load time. *)
let () = ignore Js_of_ocaml_compiler_runtime_files.runtime

let () =
  (* The command line derives all of this from its flags; calling the library
     directly means setting it by hand. `Cps is what our own build uses. *)
  Js_of_ocaml_compiler.Config.set_target `JavaScript;
  Js_of_ocaml_compiler.Config.set_effects_backend `Cps;
  Js_of_ocaml_compiler.Targetint.set_num_bits 32;
  let ic = open_in_bin "t.byte" in
  let one =
    Js_of_ocaml_compiler.Parse_bytecode.from_exe
      ~linkall:true
      ~link_info:false
      ~include_cmis:false
      ic
  in
  close_in ic;
  let code = one.Js_of_ocaml_compiler.Parse_bytecode.code in
  let emit label driver =
    let buf = Buffer.create 65536 in
    let fmt = Js_of_ocaml_compiler.Pretty_print.to_buffer buf in
    Js_of_ocaml_compiler.Driver.configure fmt;
    ignore (driver fmt);
    let js = Buffer.contents buf in
    let name = "prog." ^ label ^ ".js" in
    let oc = open_out_bin name in
    output_string oc js;
    close_out oc;
    Printf.printf
      "%-20s len=%-8d program-string=%b\n"
      name
      (String.length js)
      (contains js "probe ok")
  in
  let d = Js_of_ocaml_compiler.Driver.f in
  emit "stand-all" (fun fmt ->
      d ~standalone:true ~link:`All ~source_map:false ~formatter:fmt code);
  emit "all" (fun fmt -> d ~link:`All ~source_map:false ~formatter:fmt code)
