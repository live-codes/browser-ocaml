//# 1 "+array.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

///////////// Array

//Provides: caml_array_sub mutable
//Alias: caml_array_sub_local
function caml_array_sub(a, i, len) {
  var a2 = new Array(len + 1);
  a2[0] = 0;
  for (var i2 = 1, i1 = i + 1; i2 <= len; i2++, i1++) {
    a2[i2] = a[i1];
  }
  return a2;
}

//Provides: caml_floatarray_sub mutable
//Requires: caml_array_sub
//Version: >= 5.3
function caml_floatarray_sub(a, i, len) {
  var r = caml_array_sub(a, i, len);
  r[0] = 254;
  return r;
}

//Provides: caml_uniform_array_sub mutable
//Requires: caml_array_sub
//Version: >= 5.3
function caml_uniform_array_sub(a, i, len) {
  return caml_array_sub(a, i, len);
}

//Provides: caml_array_append mutable
//Alias: caml_array_append_local
function caml_array_append(a1, a2) {
  var l1 = a1.length,
    l2 = a2.length;
  var l = l1 + l2 - 1;
  var a = new Array(l);
  a[0] = 0;
  var i = 1,
    j = 1;
  for (; i < l1; i++) a[i] = a1[i];
  for (; i < l; i++, j++) a[i] = a2[j];
  return a;
}

//Provides: caml_floatarray_append mutable
//Requires: caml_array_append
//Version: >= 5.3
function caml_floatarray_append(a1, a2) {
  var r = caml_array_append(a1, a2);
  r[0] = 254;
  return r;
}

//Provides: caml_uniform_array_append mutable
//Requires: caml_array_append
//Version: >= 5.3
function caml_uniform_array_append(a1, a2) {
  return caml_array_append(a1, a2);
}

//Provides: caml_array_concat mutable
//Alias: caml_array_concat_local
function caml_array_concat(l) {
  var a = [0];
  while (l !== 0) {
    var b = l[1];
    for (var i = 1; i < b.length; i++) a.push(b[i]);
    l = l[2];
  }
  return a;
}

//Provides: caml_floatarray_concat mutable
//Requires: caml_array_concat
//Version: >= 5.4
function caml_floatarray_concat(l) {
  var r = caml_array_concat(l);
  r[0] = 254;
  return r;
}

//Provides: caml_uniform_array_concat mutable
//Version: >= 5.4
function caml_uniform_array_concat(l) {
  var a = [0];
  while (l !== 0) {
    var b = l[1];
    for (var i = 1; i < b.length; i++) a.push(b[i]);
    l = l[2];
  }
  return a;
}

//Provides: caml_array_blit
function caml_array_blit(a1, i1, a2, i2, len) {
  if (i2 <= i1) {
    for (var j = 1; j <= len; j++) a2[i2 + j] = a1[i1 + j];
  } else {
    for (var j = len; j >= 1; j--) a2[i2 + j] = a1[i1 + j];
  }
  return 0;
}

//Provides: caml_floatarray_blit
//Requires: caml_array_blit
function caml_floatarray_blit(a1, i1, a2, i2, len) {
  return caml_array_blit(a1, i1, a2, i2, len);
}

//Provides: caml_uniform_array_blit
//Requires: caml_array_blit
//Version: >= 5.3
function caml_uniform_array_blit(a1, i1, a2, i2, len) {
  return caml_array_blit(a1, i1, a2, i2, len);
}

///////////// Pervasive
//Provides: caml_array_set (mutable, const, mutable)
//Requires: caml_array_bound_error
//Alias: caml_array_set_float
//Alias: caml_floatarray_set
//Alias: caml_array_set_addr
function caml_array_set(array, index, newval) {
  if (index < 0 || index >= array.length - 1) caml_array_bound_error();
  array[index + 1] = newval;
  return 0;
}

//Provides: caml_array_get mutable (mutable, const)
//Requires: caml_array_bound_error
//Alias: caml_array_get_float
//Alias: caml_floatarray_get
//Alias: caml_array_get_addr
function caml_array_get(array, index) {
  if (index < 0 || index >= array.length - 1) caml_array_bound_error();
  return array[index + 1];
}

//Provides: caml_array_fill
function caml_array_fill(array, ofs, len, v) {
  for (var i = 0; i < len; i++) {
    array[ofs + i + 1] = v;
  }
  return 0;
}

//Provides: caml_floatarray_fill
//Requires: caml_array_fill
//Version: >= 5.3
function caml_floatarray_fill(array, ofs, len, v) {
  return caml_array_fill(array, ofs, len, v);
}

//Provides: caml_floatarray_fill_unboxed
//Requires: caml_array_fill
//Version: >= 5.3
function caml_floatarray_fill_unboxed(array, ofs, len, v) {
  return caml_array_fill(array, ofs, len, v);
}

//Provides: caml_uniform_array_fill
//Requires: caml_array_fill
//Version: >= 5.3
function caml_uniform_array_fill(array, ofs, len, v) {
  return caml_array_fill(array, ofs, len, v);
}

//Provides: caml_check_bound (mutable, const)
//Requires: caml_array_bound_error
//Alias: caml_check_bound_gen
//Alias: caml_check_bound_float
function caml_check_bound(array, index) {
  if (index >>> 0 >= array.length - 1) caml_array_bound_error();
  return array;
}

//Provides: caml_array_make const (const, mutable)
//Requires: caml_invalid_argument
function caml_array_make(len, init) {
  if (len >>> 0 >= ((0x7fffffff / 4) | 0)) caml_invalid_argument("Array.make");
  var len = (len + 1) | 0;
  var b = new Array(len);
  b[0] = 0;
  for (var i = 1; i < len; i++) b[i] = init;
  return b;
}

//Provides: caml_make_vect const (const, mutable)
//Requires: caml_array_make
function caml_make_vect(len, init) {
  return caml_array_make(len, init);
}

//Provides: caml_make_float_vect const (const)
//Requires: caml_array_bound_error
function caml_make_float_vect(len) {
  if (len >>> 0 >= ((0x7fffffff / 8) | 0)) caml_array_bound_error();
  var len = (len + 1) | 0;
  var b = new Array(len);
  b[0] = 254;
  for (var i = 1; i < len; i++) b[i] = 0;
  return b;
}

//Provides: caml_array_create_float const (const)
//Requires: caml_array_bound_error
//Version: >= 5.3
function caml_array_create_float(len) {
  if (len >>> 0 >= ((0x7fffffff / 8) | 0)) caml_array_bound_error();
  var len = (len + 1) | 0;
  var b = new Array(len);
  b[0] = 254;
  for (var i = 1; i < len; i++) b[i] = 0;
  return b;
}

//Provides: caml_array_create_float const (const)
//Requires: caml_array_bound_error
//Version: >= 5.2, < 5.3
//OxCaml
function caml_array_create_float(len) {
  if (len >>> 0 >= ((0x7fffffff / 8) | 0)) caml_array_bound_error();
  var len = (len + 1) | 0;
  var b = new Array(len);
  b[0] = 254;
  for (var i = 1; i < len; i++) b[i] = 0;
  return b;
}

//Provides: caml_floatarray_create const (const)
//Requires: caml_array_bound_error
//Alias: caml_floatarray_create_local
function caml_floatarray_create(len) {
  if (len >>> 0 >= ((0x7fffffff / 8) | 0)) caml_array_bound_error();
  var len = (len + 1) | 0;
  var b = new Array(len);
  b[0] = 254;
  for (var i = 1; i < len; i++) b[i] = 0;
  return b;
}

//Provides: caml_floatarray_make const (const)
//Requires: caml_array_bound_error
//Version: >= 5.3
function caml_floatarray_make(len, init) {
  if (len >>> 0 >= ((0x7fffffff / 8) | 0)) caml_array_bound_error();
  var len = (len + 1) | 0;
  var b = new Array(len);
  b[0] = 254;
  for (var i = 1; i < len; i++) b[i] = init;
  return b;
}

//Provides: caml_floatarray_make_unboxed const (const)
//Requires: caml_floatarray_make
//Version: >= 5.3
function caml_floatarray_make_unboxed(len, init) {
  return caml_floatarray_make(len, init);
}

//Provides: caml_uniform_array_make const (const)
//Requires: caml_array_make
//Version: >= 5.3
function caml_uniform_array_make(len, init) {
  return caml_array_make(len, init);
}

//# 1 "+backtrace.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_record_backtrace_env_flag
//Requires: jsoo_sys_getenv
var caml_record_backtrace_env_flag = FLAG("with-js-error");

(function () {
  var r = jsoo_sys_getenv("OCAMLRUNPARAM");
  if (r !== undefined) {
    var l = r.split(",");
    for (var i = 0; i < l.length; i++) {
      if (l[i] === "b") {
        // left-to-right, last wins: do not stop at the first bare "b"
        caml_record_backtrace_env_flag = 1;
      } else if (l[i].startsWith("b=")) {
        caml_record_backtrace_env_flag = +l[i].slice(2);
      } else continue;
    }
  }
})();

//Provides: caml_record_backtrace_runtime_flag
//Requires: caml_record_backtrace_env_flag
var caml_record_backtrace_runtime_flag = caml_record_backtrace_env_flag;

//Provides: caml_ml_debug_info_status const
function caml_ml_debug_info_status() {
  return 0;
}
//Provides: caml_backtrace_status
//Requires: caml_record_backtrace_runtime_flag
function caml_backtrace_status(_unit) {
  return caml_record_backtrace_runtime_flag ? 1 : 0;
}
//Provides: caml_get_exception_backtrace const
function caml_get_exception_backtrace() {
  return 0;
}
//Provides: caml_get_exception_raw_backtrace const
function caml_get_exception_raw_backtrace(_unit) {
  return [0];
}
//Provides: caml_record_backtrace
//Requires: caml_record_backtrace_runtime_flag
function caml_record_backtrace(b) {
  caml_record_backtrace_runtime_flag = b;
  return 0;
}
//Provides: caml_convert_raw_backtrace const
function caml_convert_raw_backtrace() {
  return [0];
}
//Provides: caml_raw_backtrace_length
function caml_raw_backtrace_length() {
  return 0;
}
//Provides: caml_raw_backtrace_next_slot
function caml_raw_backtrace_next_slot(_slot) {
  return 0;
}
//Provides: caml_raw_backtrace_slot
//Requires: caml_invalid_argument
function caml_raw_backtrace_slot(_bt, _idx) {
  caml_invalid_argument("Printexc.get_raw_backtrace_slot: index out of bounds");
}
//Provides: caml_restore_raw_backtrace
function caml_restore_raw_backtrace(_exn, _bt) {
  return 0;
}
//Provides: caml_get_current_callstack const
function caml_get_current_callstack() {
  return [0];
}

//Provides: caml_convert_raw_backtrace_slot
//Requires: caml_failwith
function caml_convert_raw_backtrace_slot(_rbt) {
  caml_failwith("caml_convert_raw_backtrace_slot");
}

//# 1 "+bigarray.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2014 Jérôme Vouillon, Hugo Heuzard, Andy Ray
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
//
// Bigarray.
//
// - all bigarray types including Int64 and Complex.
// - fortran + c layouts
// - sub/slice/reshape
// - retain fast path for 1d array access

//Provides: caml_ba_init const
function caml_ba_init() {
  return 0;
}

//Provides: caml_ba_get_size
//Requires: caml_invalid_argument
function caml_ba_get_size(dims) {
  var n_dims = dims.length;
  var size = 1;
  for (var i = 0; i < n_dims; i++) {
    if (dims[i] < 0)
      caml_invalid_argument("Bigarray.create: negative dimension");
    size = size * dims[i];
  }
  return size;
}

//Provides: caml_double_of_float16 pure
var caml_double_of_float16 = (function () {
  var pow = Math.pow;

  var EXP_MASK16 = 31; // 2 ** 5 - 1
  var SIGNIFICAND_MASK16 = 1023; // 2 ** 10 - 1
  var MIN_SUBNORMAL16 = pow(2, -24); // 2 ** -10 * 2 ** -14
  var SIGNIFICAND_DENOM16 = 0.0009765625; // 2 ** -10

  return function (bytes) {
    var sign = bytes >>> 15;
    var exponent = (bytes >>> 10) & EXP_MASK16;
    var significand = bytes & SIGNIFICAND_MASK16;
    if (exponent === EXP_MASK16)
      return significand === 0
        ? sign === 0
          ? Number.POSITIVE_INFINITY
          : Number.NEGATIVE_INFINITY
        : Number.NaN;
    if (exponent === 0)
      return significand * (sign === 0 ? MIN_SUBNORMAL16 : -MIN_SUBNORMAL16);
    var r =
      pow(2, exponent - 15) *
      (sign === 0
        ? 1 + significand * SIGNIFICAND_DENOM16
        : -1 - significand * SIGNIFICAND_DENOM16);
    return r;
  };
})();

//Provides: caml_float16_of_double pure
var caml_float16_of_double = (function () {
  // Faithful port of the native runtime's float_to_half_fast3_rtne
  // (caml_float_to_float16 in runtime/bigarray.c). The double is first
  // rounded to a float32 (the `(float) x` cast native performs), then to a
  // float16, each step round-to-nearest-ties-to-even. Rounding the double
  // straight onto the float16 grid would double-round differently from
  // native and the wasm runtime on tie cases (e.g. 65519.99999958789 must
  // give 0x7c00, not 0x7bff).
  const buffer = new ArrayBuffer(4);
  const f32 = new Float32Array(buffer);
  const u32 = new Uint32Array(buffer);
  return function (f) {
    f32[0] = f; // round to float32
    let x = u32[0] >>> 0;
    const sign = x & 0x80000000;
    x = (x ^ sign) >>> 0;
    let o;
    if (x >= 0x47800000) {
      // |x| >= 2^16: infinity, or NaN if the float32 was a NaN
      o = x > 0x7f800000 ? 0x7e00 : 0x7c00;
    } else if (x < 0x38800000) {
      // |x| < 2^-14: subnormal, rounded via the magic-number add
      u32[0] = x;
      f32[0] = f32[0] + 0.5;
      o = (u32[0] - 0x3f000000) >>> 0;
    } else {
      // normal: round-to-nearest-even over the 13 dropped mantissa bits
      o = (x + 0xc8000fff + ((x >>> 13) & 1)) >>> 13;
    }
    return (o | (sign >>> 16)) & 0xffff;
  };
})();

//Provides: caml_ba_get_size_per_element
function caml_ba_get_size_per_element(kind) {
  switch (kind) {
    case 7:
    case 10:
    case 11:
      return 2;
    default:
      return 1;
  }
}

//Provides: caml_ba_create_buffer
//Requires: caml_ba_get_size_per_element
//Requires: caml_invalid_argument
function caml_ba_create_buffer(kind, size) {
  var view;
  switch (kind) {
    case 0:
      view = Float32Array;
      break;
    case 1:
      view = Float64Array;
      break;
    case 2:
      view = Int8Array;
      break;
    case 3:
      view = Uint8Array;
      break;
    case 4:
      view = Int16Array;
      break;
    case 5:
      view = Uint16Array;
      break;
    case 6:
      view = Int32Array;
      break;
    case 7:
      view = Int32Array;
      break;
    case 8:
      view = Int32Array;
      break;
    case 9:
      view = Int32Array;
      break;
    case 10:
      view = Float32Array;
      break;
    case 11:
      view = Float64Array;
      break;
    case 12:
      view = Uint8Array;
      break;
    case 13:
      view = Uint16Array;
      break;
  }
  if (!view) caml_invalid_argument("Bigarray.create: unsupported kind");
  var data = new view(size * caml_ba_get_size_per_element(kind));
  return data;
}

//Provides: caml_ba_custom_name
var caml_ba_custom_name = "_bigarr02";

//Provides: Ml_Bigarray
//Requires: caml_array_bound_error, caml_invalid_argument, caml_ba_custom_name
//Requires: caml_int64_create_lo_hi, caml_int64_hi32, caml_int64_lo32
//Requires: caml_float16_of_double, caml_double_of_float16
class Ml_Bigarray {
  constructor(kind, layout, dims, buffer) {
    this.kind = kind;
    this.layout = layout;
    this.dims = dims;
    this.data = buffer;
    this.caml_custom = caml_ba_custom_name;
  }

  offset(arg) {
    var ofs = 0;
    if (typeof arg === "number") arg = [arg];
    if (!Array.isArray(arg))
      caml_invalid_argument("bigarray.js: invalid offset");
    if (this.dims.length !== arg.length)
      caml_invalid_argument("Bigarray.get/set: bad number of dimensions");
    if (this.layout === 0 /* c_layout */) {
      for (var i = 0; i < this.dims.length; i++) {
        if (arg[i] < 0 || arg[i] >= this.dims[i]) caml_array_bound_error();
        ofs = ofs * this.dims[i] + arg[i];
      }
    } else {
      for (var i = this.dims.length - 1; i >= 0; i--) {
        if (arg[i] < 1 || arg[i] > this.dims[i]) {
          caml_array_bound_error();
        }
        ofs = ofs * this.dims[i] + (arg[i] - 1);
      }
    }
    return ofs;
  }

  get(ofs) {
    switch (this.kind) {
      case 7:
        // Int64
        var l = this.data[ofs * 2 + 0];
        var h = this.data[ofs * 2 + 1];
        return caml_int64_create_lo_hi(l, h);
      case 10:
      case 11:
        // Complex32, Complex64
        var r = this.data[ofs * 2 + 0];
        var i = this.data[ofs * 2 + 1];
        return [254, r, i];
      case 13:
        return caml_double_of_float16(this.data[ofs]);
      default:
        return this.data[ofs];
    }
  }

  set(ofs, v) {
    switch (this.kind) {
      case 7:
        // Int64
        this.data[ofs * 2 + 0] = caml_int64_lo32(v);
        this.data[ofs * 2 + 1] = caml_int64_hi32(v);
        break;
      case 10:
      case 11:
        // Complex32, Complex64
        this.data[ofs * 2 + 0] = v[1];
        this.data[ofs * 2 + 1] = v[2];
        break;
      case 13:
        this.data[ofs] = caml_float16_of_double(v);
        break;
      default:
        this.data[ofs] = v;
        break;
    }
    return 0;
  }

  fill(v) {
    switch (this.kind) {
      case 7:
        // Int64
        var a = caml_int64_lo32(v);
        var b = caml_int64_hi32(v);
        if (a === b) {
          this.data.fill(a);
        } else {
          for (var i = 0; i < this.data.length; i++) {
            this.data[i] = i % 2 === 0 ? a : b;
          }
        }
        break;
      case 10:
      case 11:
        // Complex32, Complex64
        var im = v[1];
        var re = v[2];
        if (im === re) {
          this.data.fill(im);
        } else {
          for (var i = 0; i < this.data.length; i++) {
            this.data[i] = i % 2 === 0 ? im : re;
          }
        }
        break;
      case 13:
        this.data.fill(caml_float16_of_double(v));
        break;
      default:
        this.data.fill(v);
        break;
    }
  }

  compare(b, total) {
    if (this.layout !== b.layout || this.kind !== b.kind) {
      var k1 = this.kind | (this.layout << 8);
      var k2 = b.kind | (b.layout << 8);
      return k2 - k1;
    }
    if (this.dims.length !== b.dims.length) {
      return b.dims.length - this.dims.length;
    }
    for (var i = 0; i < this.dims.length; i++)
      if (this.dims[i] !== b.dims[i]) return this.dims[i] < b.dims[i] ? -1 : 1;
    switch (this.kind) {
      case 0:
      case 1:
      case 10:
      case 11:
        // Floats
        var x, y;
        for (var i = 0; i < this.data.length; i++) {
          x = this.data[i];
          y = b.data[i];
          if (x < y) return -1;
          if (x > y) return 1;
          if (x !== y) {
            if (!total) return Number.NaN;
            if (!Number.isNaN(x)) return 1;
            if (!Number.isNaN(y)) return -1;
          }
        }
        break;
      case 7:
        // Int64
        for (var i = 0; i < this.data.length; i += 2) {
          // Check highest bits first
          if (this.data[i + 1] < b.data[i + 1]) return -1;
          if (this.data[i + 1] > b.data[i + 1]) return 1;
          if (this.data[i] >>> 0 < b.data[i] >>> 0) return -1;
          if (this.data[i] >>> 0 > b.data[i] >>> 0) return 1;
        }
        break;
      case 13:
        for (var i = 0; i < this.data.length; i++) {
          var aa = caml_double_of_float16(this.data[i]);
          var bb = caml_double_of_float16(b.data[i]);
          if (aa < bb) return -1;
          if (aa > bb) return 1;
          if (aa !== bb) {
            if (!total) return Number.NaN;
            if (!Number.isNaN(aa)) return 1;
            if (!Number.isNaN(bb)) return -1;
          }
        }
        break;
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 8:
      case 9:
      case 12:
        for (var i = 0; i < this.data.length; i++) {
          if (this.data[i] < b.data[i]) return -1;
          if (this.data[i] > b.data[i]) return 1;
        }
        break;
    }
    return 0;
  }
}

//Provides: Ml_Bigarray_c_1_1
//Requires: Ml_Bigarray, caml_array_bound_error, caml_invalid_argument
class Ml_Bigarray_c_1_1 extends Ml_Bigarray {
  offset(arg) {
    if (typeof arg !== "number") {
      if (Array.isArray(arg) && arg.length === 1) arg = arg[0];
      else caml_invalid_argument("Ml_Bigarray_c_1_1.offset");
    }
    if (arg < 0 || arg >= this.dims[0]) caml_array_bound_error();
    return arg;
  }

  get(ofs) {
    return this.data[ofs];
  }

  set(ofs, v) {
    this.data[ofs] = v;
    return 0;
  }

  fill(v) {
    this.data.fill(v);
    return 0;
  }
}

//Provides: caml_ba_compare
function caml_ba_compare(a, b, total) {
  return a.compare(b, total);
}

//Provides: caml_ba_create_unsafe
//Requires: Ml_Bigarray, Ml_Bigarray_c_1_1, caml_ba_get_size, caml_ba_get_size_per_element
//Requires: caml_invalid_argument
function caml_ba_create_unsafe(kind, layout, dims, data) {
  var size_per_element = caml_ba_get_size_per_element(kind);
  if (caml_ba_get_size(dims) * size_per_element !== data.length) {
    caml_invalid_argument("length doesn't match dims");
  }
  if (
    layout === 0 && // c_layout
    dims.length === 1 && // Array1
    size_per_element === 1 &&
    kind !== 13 // float16
  )
    // 1-to-1 mapping
    return new Ml_Bigarray_c_1_1(kind, layout, dims, data);
  return new Ml_Bigarray(kind, layout, dims, data);
}

//Provides: caml_ba_create
//Requires: caml_js_from_array
//Requires: caml_ba_get_size, caml_ba_create_unsafe
//Requires: caml_ba_create_buffer
function caml_ba_create(kind, layout, dims_ml) {
  var dims = caml_js_from_array(dims_ml);
  var data = caml_ba_create_buffer(kind, caml_ba_get_size(dims));
  return caml_ba_create_unsafe(kind, layout, dims, data);
}

//Provides: caml_ba_change_layout
//Requires: caml_ba_create_unsafe
function caml_ba_change_layout(ba, layout) {
  if (ba.layout === layout) return ba;
  var new_dims = [];
  for (var i = 0; i < ba.dims.length; i++)
    new_dims[i] = ba.dims[ba.dims.length - i - 1];
  return caml_ba_create_unsafe(ba.kind, layout, new_dims, ba.data);
}

//Provides: caml_ba_kind
function caml_ba_kind(ba) {
  return ba.kind;
}

//Provides: caml_ba_layout
function caml_ba_layout(ba) {
  return ba.layout;
}

//Provides: caml_ba_num_dims
function caml_ba_num_dims(ba) {
  return ba.dims.length;
}

//Provides: caml_ba_dim
//Requires: caml_invalid_argument
function caml_ba_dim(ba, i) {
  if (i < 0 || i >= ba.dims.length) caml_invalid_argument("Bigarray.dim");
  return ba.dims[i];
}

//Provides: caml_ba_dim_1
//Requires: caml_ba_dim
function caml_ba_dim_1(ba) {
  return caml_ba_dim(ba, 0);
}

//Provides: caml_ba_dim_2
//Requires: caml_ba_dim
function caml_ba_dim_2(ba) {
  return caml_ba_dim(ba, 1);
}

//Provides: caml_ba_dim_3
//Requires: caml_ba_dim
function caml_ba_dim_3(ba) {
  return caml_ba_dim(ba, 2);
}

//Provides: caml_ba_get_generic
//Requires: caml_js_from_array
function caml_ba_get_generic(ba, i) {
  var ofs = ba.offset(caml_js_from_array(i));
  return ba.get(ofs);
}

//Provides: caml_ba_uint8_get16
//Requires: caml_array_bound_error
function caml_ba_uint8_get16(ba, i0) {
  var ofs = ba.offset(i0);
  if (ofs + 1 >= ba.data.length) caml_array_bound_error();
  var b1 = ba.get(ofs);
  var b2 = ba.get(ofs + 1);
  return b1 | (b2 << 8);
}

//Provides: caml_ba_uint8_get32
//Requires: caml_array_bound_error
function caml_ba_uint8_get32(ba, i0) {
  var ofs = ba.offset(i0);
  if (ofs + 3 >= ba.data.length) caml_array_bound_error();
  var b1 = ba.get(ofs + 0);
  var b2 = ba.get(ofs + 1);
  var b3 = ba.get(ofs + 2);
  var b4 = ba.get(ofs + 3);
  return (b1 << 0) | (b2 << 8) | (b3 << 16) | (b4 << 24);
}

//Provides: caml_ba_uint8_get64
//Requires: caml_array_bound_error, caml_int64_of_bytes
function caml_ba_uint8_get64(ba, i0) {
  var ofs = ba.offset(i0);
  if (ofs + 7 >= ba.data.length) caml_array_bound_error();
  var b1 = ba.get(ofs + 0);
  var b2 = ba.get(ofs + 1);
  var b3 = ba.get(ofs + 2);
  var b4 = ba.get(ofs + 3);
  var b5 = ba.get(ofs + 4);
  var b6 = ba.get(ofs + 5);
  var b7 = ba.get(ofs + 6);
  var b8 = ba.get(ofs + 7);
  return caml_int64_of_bytes([b8, b7, b6, b5, b4, b3, b2, b1]);
}

//Provides: caml_ba_get_1
//Alias: caml_ba_float32_get_1
function caml_ba_get_1(ba, i0) {
  return ba.get(ba.offset(i0));
}

//Provides: caml_ba_get_2
//Alias: caml_ba_float32_get_2
function caml_ba_get_2(ba, i0, i1) {
  return ba.get(ba.offset([i0, i1]));
}

//Provides: caml_ba_get_3
//Alias: caml_ba_float32_get_3
function caml_ba_get_3(ba, i0, i1, i2) {
  return ba.get(ba.offset([i0, i1, i2]));
}

//Provides: caml_ba_set_generic
//Requires: caml_js_from_array
function caml_ba_set_generic(ba, i, v) {
  ba.set(ba.offset(caml_js_from_array(i)), v);
  return 0;
}

//Provides: caml_ba_uint8_set16
//Requires: caml_array_bound_error
function caml_ba_uint8_set16(ba, i0, v) {
  var ofs = ba.offset(i0);
  if (ofs + 1 >= ba.data.length) caml_array_bound_error();
  ba.set(ofs + 0, v & 0xff);
  ba.set(ofs + 1, (v >>> 8) & 0xff);
  return 0;
}

//Provides: caml_ba_uint8_set32
//Requires: caml_array_bound_error
function caml_ba_uint8_set32(ba, i0, v) {
  var ofs = ba.offset(i0);
  if (ofs + 3 >= ba.data.length) caml_array_bound_error();
  ba.set(ofs + 0, v & 0xff);
  ba.set(ofs + 1, (v >>> 8) & 0xff);
  ba.set(ofs + 2, (v >>> 16) & 0xff);
  ba.set(ofs + 3, (v >>> 24) & 0xff);
  return 0;
}

//Provides: caml_ba_uint8_set64
//Requires: caml_array_bound_error, caml_int64_to_bytes
function caml_ba_uint8_set64(ba, i0, v) {
  var ofs = ba.offset(i0);
  if (ofs + 7 >= ba.data.length) caml_array_bound_error();
  var v = caml_int64_to_bytes(v);
  for (var i = 0; i < 8; i++) ba.set(ofs + i, v[7 - i]);
  return 0;
}

//Provides: caml_ba_set_1
//Alias: caml_ba_float32_set_1
function caml_ba_set_1(ba, i0, v) {
  ba.set(ba.offset(i0), v);
  return 0;
}

//Provides: caml_ba_set_2
//Alias: caml_ba_float32_set_2
function caml_ba_set_2(ba, i0, i1, v) {
  ba.set(ba.offset([i0, i1]), v);
  return 0;
}

//Provides: caml_ba_set_3
//Alias: caml_ba_float32_set_3
function caml_ba_set_3(ba, i0, i1, i2, v) {
  ba.set(ba.offset([i0, i1, i2]), v);
  return 0;
}

//Provides: caml_ba_fill
function caml_ba_fill(ba, v) {
  ba.fill(v);
  return 0;
}

//Provides: caml_ba_blit
//Requires: caml_invalid_argument
function caml_ba_blit(src, dst) {
  if (dst.dims.length !== src.dims.length)
    caml_invalid_argument("Bigarray.blit: dimension mismatch");
  for (var i = 0; i < dst.dims.length; i++)
    if (dst.dims[i] !== src.dims[i])
      caml_invalid_argument("Bigarray.blit: dimension mismatch");
  dst.data.set(src.data);
  return 0;
}

//Provides: caml_ba_sub
//Requires: caml_invalid_argument, caml_ba_create_unsafe, caml_ba_get_size
//Requires: caml_ba_get_size_per_element
function caml_ba_sub(ba, ofs, len) {
  var changed_dim;
  var mul = 1;
  if (ba.layout === 0) {
    for (var i = 1; i < ba.dims.length; i++) mul = mul * ba.dims[i];
    changed_dim = 0;
  } else {
    for (var i = 0; i < ba.dims.length - 1; i++) mul = mul * ba.dims[i];
    changed_dim = ba.dims.length - 1;
    ofs = ofs - 1;
  }
  if (ofs < 0 || len < 0 || ofs + len > ba.dims[changed_dim]) {
    caml_invalid_argument("Bigarray.sub: bad sub-array");
  }
  var new_dims = [];
  for (var i = 0; i < ba.dims.length; i++) new_dims[i] = ba.dims[i];
  new_dims[changed_dim] = len;
  mul *= caml_ba_get_size_per_element(ba.kind);
  var new_data = ba.data.subarray(ofs * mul, (ofs + len) * mul);
  return caml_ba_create_unsafe(ba.kind, ba.layout, new_dims, new_data);
}

//Provides: caml_ba_slice
//Requires: caml_js_from_array, caml_ba_create_unsafe, caml_invalid_argument, caml_ba_get_size
//Requires: caml_ba_get_size_per_element
function caml_ba_slice(ba, vind) {
  vind = caml_js_from_array(vind);
  var num_inds = vind.length;
  var index = [];
  var sub_dims = [];
  var ofs;

  if (num_inds > ba.dims.length)
    caml_invalid_argument("Bigarray.slice: too many indices");

  // Compute offset and check bounds
  if (ba.layout === 0) {
    for (var i = 0; i < num_inds; i++) index[i] = vind[i];
    for (; i < ba.dims.length; i++) index[i] = 0;
    sub_dims = ba.dims.slice(num_inds);
  } else {
    for (var i = 0; i < num_inds; i++)
      index[ba.dims.length - num_inds + i] = vind[i];
    for (var i = 0; i < ba.dims.length - num_inds; i++) index[i] = 1;
    sub_dims = ba.dims.slice(0, ba.dims.length - num_inds);
  }
  ofs = ba.offset(index);
  var size = caml_ba_get_size(sub_dims);
  var size_per_element = caml_ba_get_size_per_element(ba.kind);
  var new_data = ba.data.subarray(
    ofs * size_per_element,
    (ofs + size) * size_per_element,
  );
  return caml_ba_create_unsafe(ba.kind, ba.layout, sub_dims, new_data);
}

//Provides: caml_ba_reshape
//Requires: caml_js_from_array, caml_invalid_argument, caml_ba_create_unsafe, caml_ba_get_size
function caml_ba_reshape(ba, vind) {
  vind = caml_js_from_array(vind);
  var new_dim = [];
  var num_dims = vind.length;

  if (num_dims < 0 || num_dims > 16) {
    caml_invalid_argument("Bigarray.reshape: bad number of dimensions");
  }
  var num_elts = 1;
  for (var i = 0; i < num_dims; i++) {
    new_dim[i] = vind[i];
    if (new_dim[i] < 0)
      caml_invalid_argument("Bigarray.reshape: negative dimension");
    num_elts = num_elts * new_dim[i];
  }

  var size = caml_ba_get_size(ba.dims);
  // Check that sizes agree
  if (num_elts !== size)
    caml_invalid_argument("Bigarray.reshape: size mismatch");
  return caml_ba_create_unsafe(ba.kind, ba.layout, new_dim, ba.data);
}

//Provides: caml_ba_serialize
//Requires: caml_int64_bits_of_float, caml_int64_to_bytes
//Requires: caml_int32_bits_of_float
//Requires: caml_float16_of_double
function caml_ba_serialize(writer, ba, sz) {
  writer.write(32, ba.dims.length);
  writer.write(32, ba.kind | (ba.layout << 8));
  if (ba.caml_custom === "_bigarr02")
    for (var i = 0; i < ba.dims.length; i++) {
      if (ba.dims[i] < 0xffff) writer.write(16, ba.dims[i]);
      else {
        writer.write(16, 0xffff);
        writer.write(32, 0);
        writer.write(32, ba.dims[i]);
      }
    }
  else for (var i = 0; i < ba.dims.length; i++) writer.write(32, ba.dims[i]);
  switch (ba.kind) {
    case 2: //Int8Array
    case 3: //Uint8Array
    case 12: //Uint8Array
      for (var i = 0; i < ba.data.length; i++) {
        writer.write(8, ba.data[i]);
      }
      break;
    case 4: // Int16Array
    case 5: // Uint16Array
      for (var i = 0; i < ba.data.length; i++) {
        writer.write(16, ba.data[i]);
      }
      break;
    case 6: // Int32Array (int32)
      for (var i = 0; i < ba.data.length; i++) {
        writer.write(32, ba.data[i]);
      }
      break;
    case 8: // Int32Array (int)
    case 9: // Int32Array (nativeint)
      writer.write(8, 0);
      for (var i = 0; i < ba.data.length; i++) {
        writer.write(32, ba.data[i]);
      }
      break;
    case 7: // Int32Array (int64)
      for (var i = 0; i < ba.data.length / 2; i++) {
        var b = caml_int64_to_bytes(ba.get(i));
        for (var j = 0; j < 8; j++) writer.write(8, b[j]);
      }
      break;
    case 1: // Float64Array
      for (var i = 0; i < ba.data.length; i++) {
        var b = caml_int64_to_bytes(caml_int64_bits_of_float(ba.get(i)));
        for (var j = 0; j < 8; j++) writer.write(8, b[j]);
      }
      break;
    case 13: // Float16Array
      for (var i = 0; i < ba.data.length; i++) {
        writer.write(16, ba.data[i]);
      }
      break;
    case 0: // Float32Array
      for (var i = 0; i < ba.data.length; i++) {
        var b = caml_int32_bits_of_float(ba.get(i));
        writer.write(32, b);
      }
      break;
    case 10: // Float32Array (complex32)
      for (var i = 0; i < ba.data.length / 2; i++) {
        var j = ba.get(i);
        writer.write(32, caml_int32_bits_of_float(j[1]));
        writer.write(32, caml_int32_bits_of_float(j[2]));
      }
      break;
    case 11: // Float64Array (complex64)
      for (var i = 0; i < ba.data.length / 2; i++) {
        var complex = ba.get(i);
        var b = caml_int64_to_bytes(caml_int64_bits_of_float(complex[1]));
        for (var j = 0; j < 8; j++) writer.write(8, b[j]);
        var b = caml_int64_to_bytes(caml_int64_bits_of_float(complex[2]));
        for (var j = 0; j < 8; j++) writer.write(8, b[j]);
      }
      break;
  }
  sz[0] = (4 + ba.dims.length) * 4;
  sz[1] = (4 + ba.dims.length) * 8;
}

//Provides: caml_ba_deserialize
//Requires: caml_ba_create_unsafe, caml_failwith
//Requires: caml_ba_get_size
//Requires: caml_int64_of_bytes, caml_int64_float_of_bits
//Requires: caml_int32_float_of_bits
//Requires: caml_ba_create_buffer
//Requires: caml_double_of_float16
function caml_ba_deserialize(reader, sz, name) {
  var num_dims = reader.read32s();
  if (num_dims < 0 || num_dims > 16)
    caml_failwith("input_value: wrong number of bigarray dimensions");
  var tag = reader.read32s();
  var kind = tag & 0xff;
  var layout = (tag >> 8) & 1;
  var dims = [];
  if (name === "_bigarr02")
    for (var i = 0; i < num_dims; i++) {
      var size_dim = reader.read16u();
      if (size_dim === 0xffff) {
        var size_dim_hi = reader.read32u();
        var size_dim_lo = reader.read32u();
        if (size_dim_hi !== 0)
          caml_failwith("input_value: bigarray dimension overflow in 32bit");
        size_dim = size_dim_lo;
      }
      dims.push(size_dim);
    }
  else for (var i = 0; i < num_dims; i++) dims.push(reader.read32u());
  var size = caml_ba_get_size(dims);
  var data = caml_ba_create_buffer(kind, size);
  var ba = caml_ba_create_unsafe(kind, layout, dims, data);
  switch (kind) {
    case 2: //Int8Array
      for (var i = 0; i < size; i++) {
        data[i] = reader.read8s();
      }
      break;
    case 3: //Uint8Array
    case 12: //Uint8Array
      for (var i = 0; i < size; i++) {
        data[i] = reader.read8u();
      }
      break;
    case 4: // Int16Array
      for (var i = 0; i < size; i++) {
        data[i] = reader.read16s();
      }
      break;
    case 5: // Uint16Array
      for (var i = 0; i < size; i++) {
        data[i] = reader.read16u();
      }
      break;
    case 6: // Int32Array (int32)
      for (var i = 0; i < size; i++) {
        data[i] = reader.read32s();
      }
      break;
    case 8: // Int32Array (int)
    case 9: // Int32Array (nativeint)
      var sixty = reader.read8u();
      if (sixty)
        caml_failwith(
          "input_value: cannot read bigarray with 64-bit OCaml ints",
        );
      for (var i = 0; i < size; i++) {
        data[i] = reader.read32s();
      }
      break;
    case 7: // (int64)
      var t = new Array(8);
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < 8; j++) t[j] = reader.read8u();
        var int64 = caml_int64_of_bytes(t);
        ba.set(i, int64);
      }
      break;
    case 1: // Float64Array
      var t = new Array(8);
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < 8; j++) t[j] = reader.read8u();
        var f = caml_int64_float_of_bits(caml_int64_of_bytes(t));
        ba.set(i, f);
      }
      break;
    case 13: // Float16Array
      for (var i = 0; i < size; i++) {
        data[i] = reader.read16u();
      }
      break;
    case 0: // Float32Array
      for (var i = 0; i < size; i++) {
        var f = caml_int32_float_of_bits(reader.read32s());
        ba.set(i, f);
      }
      break;
    case 10: // Float32Array (complex32)
      for (var i = 0; i < size; i++) {
        var re = caml_int32_float_of_bits(reader.read32s());
        var im = caml_int32_float_of_bits(reader.read32s());
        ba.set(i, [254, re, im]);
      }
      break;
    case 11: // Float64Array (complex64)
      var t = new Array(8);
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < 8; j++) t[j] = reader.read8u();
        var re = caml_int64_float_of_bits(caml_int64_of_bytes(t));
        for (var j = 0; j < 8; j++) t[j] = reader.read8u();
        var im = caml_int64_float_of_bits(caml_int64_of_bytes(t));
        ba.set(i, [254, re, im]);
      }
      break;
  }
  sz[0] = (4 + num_dims) * 4;
  return caml_ba_create_unsafe(kind, layout, dims, data);
}

//Provides: caml_ba_create_from
//Requires: caml_ba_create_unsafe, caml_invalid_argument, caml_ba_get_size_per_element
//Deprecated: Use [caml_ba_create_unsafe] instead
function caml_ba_create_from(data1, data2, _jstyp, kind, layout, dims) {
  if (data2 || caml_ba_get_size_per_element(kind) === 2) {
    caml_invalid_argument(
      "caml_ba_create_from: use return caml_ba_create_unsafe",
    );
  }
  return caml_ba_create_unsafe(kind, layout, dims, data1);
}

//Provides: caml_ba_hash const
//Requires: caml_ba_get_size, caml_hash_mix_int, caml_hash_mix_float
//Requires: caml_double_of_float16, caml_hash_mix_float16, caml_hash_mix_float32
function caml_ba_hash(ba) {
  var num_elts = caml_ba_get_size(ba.dims);
  var h = 0;
  switch (ba.kind) {
    case 2: //Int8Array
    case 3: //Uint8Array
    case 12: //Uint8Array
      if (num_elts > 256) num_elts = 256;
      var w = 0,
        i = 0;
      for (i = 0; i + 4 <= num_elts; i += 4) {
        w =
          (ba.data[i + 0] & 0xff) |
          ((ba.data[i + 1] & 0xff) << 8) |
          ((ba.data[i + 2] & 0xff) << 16) |
          (ba.data[i + 3] << 24);
        h = caml_hash_mix_int(h, w);
      }
      w = 0;
      switch (num_elts & 3) {
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
        case 3:
          w = (ba.data[i + 2] & 0xff) << 16;
        // falls through
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
        case 2:
          w |= (ba.data[i + 1] & 0xff) << 8;
        // falls through
        case 1:
          w |= ba.data[i + 0] & 0xff;
          h = caml_hash_mix_int(h, w);
      }
      break;
    case 4: // Int16Array
    case 5: // Uint16Array
      if (num_elts > 128) num_elts = 128;
      var w = 0,
        i = 0;
      for (i = 0; i + 2 <= num_elts; i += 2) {
        w = (ba.data[i + 0] & 0xffff) | (ba.data[i + 1] << 16);
        h = caml_hash_mix_int(h, w);
      }
      if ((num_elts & 1) !== 0) h = caml_hash_mix_int(h, ba.data[i] & 0xffff);
      break;
    case 6: // Int32Array (int32)
      if (num_elts > 64) num_elts = 64;
      for (var i = 0; i < num_elts; i++) h = caml_hash_mix_int(h, ba.data[i]);
      break;
    case 8: // Int32Array (int)
    case 9: // Int32Array (nativeint)
      if (num_elts > 64) num_elts = 64;
      for (var i = 0; i < num_elts; i++) h = caml_hash_mix_int(h, ba.data[i]);
      break;
    case 7: // Int32Array (int64)
      if (num_elts > 32) num_elts = 32;
      num_elts *= 2;
      for (var i = 0; i < num_elts; i++) {
        h = caml_hash_mix_int(h, ba.data[i]);
      }
      break;
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
    case 10: // Float32Array (complex32)
      num_elts *= 2;
    // falls through
    case 0: // Float32Array
      if (num_elts > 64) num_elts = 64;
      for (var i = 0; i < num_elts; i++)
        h = caml_hash_mix_float32(h, ba.data[i]);
      break;
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
    case 11: // Float64Array (complex64)
      num_elts *= 2;
    // falls through
    case 1: // Float64Array
      if (num_elts > 32) num_elts = 32;
      for (var i = 0; i < num_elts; i++) h = caml_hash_mix_float(h, ba.data[i]);
      break;
    case 13:
      if (num_elts > 128) num_elts = 128;
      for (var i = 0; i < num_elts; i++) {
        h = caml_hash_mix_float16(h, ba.data[i]);
      }
      break;
  }
  return h;
}

//Provides: caml_hash_mix_float16
//Requires: caml_hash_mix_int
function caml_hash_mix_float16(hash, d) {
  /* Normalize NaNs */
  if ((d & 0x7c00) === 0x7c00 && (d & 0x03ff) !== 0) {
    d = 0x7c01;
  } else if (d === 0x8000) {
    /* Normalize -0 into +0 */
    d = 0;
  }
  return caml_hash_mix_int(hash, d);
}

//Provides: caml_hash_mix_float32
//Requires: caml_int32_bits_of_float
//Requires: caml_hash_mix_int
function caml_hash_mix_float32(hash, v) {
  var i = caml_int32_bits_of_float(v);
  /* Normalize NaNs */
  if ((i & 0x7f800000) === 0x7f800000 && (i & 0x7fffff) !== 0) {
    i = 0x7f800001;
  } else if (i === (0x80000000 | 0)) {
    /* Normalize -0 into +0 */
    // This code path is not used by caml_hash because 0 and -0 look
    // like integers
    i = 0;
  }
  hash = caml_hash_mix_int(hash, i);
  return hash;
}

//Provides: caml_ba_to_typed_array mutable
function caml_ba_to_typed_array(ba) {
  return ba.data;
}

//Provides: caml_ba_kind_of_typed_array mutable
//Requires: caml_invalid_argument
function caml_ba_kind_of_typed_array(ta) {
  var kind;
  if (ta instanceof Float32Array) kind = 0;
  else if (ta instanceof Float64Array) kind = 1;
  else if (ta instanceof Int8Array) kind = 2;
  else if (ta instanceof Uint8Array) kind = 3;
  else if (ta instanceof Uint8ClampedArray) kind = 3;
  else if (ta instanceof Int16Array) kind = 4;
  else if (ta instanceof Uint16Array) kind = 5;
  else if (ta instanceof Int32Array) kind = 6;
  else if (ta instanceof Uint32Array) kind = 6;
  else caml_invalid_argument("caml_ba_kind_of_typed_array: unsupported kind");
  return kind;
}

//Provides: caml_ba_from_typed_array mutable
//Requires: caml_ba_kind_of_typed_array
//Requires: caml_ba_create_unsafe
function caml_ba_from_typed_array(ta) {
  var kind = caml_ba_kind_of_typed_array(ta);
  var ta =
    /* Needed to avoid unsigned setters overflowing
         the range of OCaml [int32] values. */
    ta instanceof Uint32Array
      ? new Int32Array(ta.buffer, ta.byteOffset, ta.length)
      : ta;
  return caml_ba_create_unsafe(kind, 0, [ta.length], ta);
}

//# 1 "+bigstring.js"
///////// BIGSTRING

//Provides: caml_hash_mix_bigstring
//Requires: caml_hash_mix_bytes_arr
function caml_hash_mix_bigstring(h, bs) {
  return caml_hash_mix_bytes_arr(h, bs.data);
}

//Provides: bigstring_to_array_buffer mutable
function bigstring_to_array_buffer(bs) {
  return bs.data.buffer;
}

//Provides: bigstring_to_typed_array mutable
function bigstring_to_typed_array(bs) {
  return bs.data;
}

//Provides: bigstring_of_array_buffer mutable
//Requires: caml_ba_create_unsafe
function bigstring_of_array_buffer(ab) {
  var ta = new Uint8Array(ab);
  return caml_ba_create_unsafe(12, 0, [ta.length], ta);
}

//Provides: bigstring_of_typed_array mutable
//Requires: caml_ba_create_unsafe
function bigstring_of_typed_array(ba) {
  var ta = new Uint8Array(
    ba.buffer,
    ba.byteOffset,
    ba.length * ba.BYTES_PER_ELEMENT,
  );
  return caml_ba_create_unsafe(12, 0, [ta.length], ta);
}

//Provides: caml_bigstring_memcmp
//Requires: caml_ba_get_1
function caml_bigstring_memcmp(s1, pos1, s2, pos2, len) {
  for (var i = 0; i < len; i++) {
    var a = caml_ba_get_1(s1, pos1 + i);
    var b = caml_ba_get_1(s2, pos2 + i);
    if (a < b) return -1;
    if (a > b) return 1;
  }
  return 0;
}

//Provides: caml_bigstring_blit_ba_to_ba
//Requires: caml_invalid_argument, caml_array_bound_error
function caml_bigstring_blit_ba_to_ba(ba1, pos1, ba2, pos2, len) {
  if (12 !== ba1.kind)
    caml_invalid_argument("caml_bigstring_blit_ba_to_ba: kind mismatch");
  if (12 !== ba2.kind)
    caml_invalid_argument("caml_bigstring_blit_ba_to_ba: kind mismatch");
  if (len === 0) return 0;
  // Positions are raw offsets from the start of the data, ignoring the
  // layout: these primitives back base_bigstring's bigstring_blit_*
  // stubs, whose C code indexes from `data + pos` (and so does the Wasm
  // runtime here)
  if (pos1 < 0 || pos1 + len > ba1.data.length) {
    caml_array_bound_error();
  }
  if (pos2 < 0 || pos2 + len > ba2.data.length) {
    caml_array_bound_error();
  }
  var slice = ba1.data.subarray(pos1, pos1 + len);
  ba2.data.set(slice, pos2);
  return 0;
}

//Provides: caml_bigstring_blit_string_to_ba
//Requires: caml_invalid_argument, caml_array_bound_error, caml_uint8_array_of_string
//Requires: caml_ml_string_length
function caml_bigstring_blit_string_to_ba(str1, pos1, ba2, pos2, len) {
  if (12 !== ba2.kind)
    caml_invalid_argument("caml_bigstring_blit_string_to_ba: kind mismatch");
  if (len === 0) return 0;
  // Positions are raw offsets from the start of the data, ignoring the
  // layout: these primitives back base_bigstring's bigstring_blit_*
  // stubs, whose C code indexes from `data + pos` (and so does the Wasm
  // runtime here)
  if (pos1 < 0 || pos1 + len > caml_ml_string_length(str1)) {
    caml_array_bound_error();
  }
  if (pos2 < 0 || pos2 + len > ba2.data.length) {
    caml_array_bound_error();
  }
  var slice = caml_uint8_array_of_string(str1).subarray(pos1, pos1 + len);
  ba2.data.set(slice, pos2);
  return 0;
}

//Provides: caml_bigstring_blit_bytes_to_ba
//Requires: caml_invalid_argument, caml_array_bound_error, caml_uint8_array_of_bytes
//Requires: caml_ml_bytes_length
function caml_bigstring_blit_bytes_to_ba(str1, pos1, ba2, pos2, len) {
  if (12 !== ba2.kind)
    caml_invalid_argument("caml_bigstring_blit_bytes_to_ba: kind mismatch");
  if (len === 0) return 0;
  // Positions are raw offsets from the start of the data, ignoring the
  // layout: these primitives back base_bigstring's bigstring_blit_*
  // stubs, whose C code indexes from `data + pos` (and so does the Wasm
  // runtime here)
  if (pos1 < 0 || pos1 + len > caml_ml_bytes_length(str1)) {
    caml_array_bound_error();
  }
  if (pos2 < 0 || pos2 + len > ba2.data.length) {
    caml_array_bound_error();
  }
  var slice = caml_uint8_array_of_bytes(str1).subarray(pos1, pos1 + len);
  ba2.data.set(slice, pos2);
  return 0;
}

//Provides: caml_bigstring_blit_ba_to_bytes
//Requires: caml_invalid_argument, caml_array_bound_error
//Requires: caml_blit_bytes, caml_bytes_of_uint8_array
//Requires: caml_ml_bytes_length
function caml_bigstring_blit_ba_to_bytes(ba1, pos1, bytes2, pos2, len) {
  if (12 !== ba1.kind)
    caml_invalid_argument("caml_bigstring_blit_ba_to_bytes: kind mismatch");
  if (len === 0) return 0;
  // Positions are raw offsets from the start of the data, ignoring the
  // layout: these primitives back base_bigstring's bigstring_blit_*
  // stubs, whose C code indexes from `data + pos` (and so does the Wasm
  // runtime here)
  if (pos1 < 0 || pos1 + len > ba1.data.length) {
    caml_array_bound_error();
  }
  if (pos2 < 0 || pos2 + len > caml_ml_bytes_length(bytes2)) {
    caml_array_bound_error();
  }
  var slice = ba1.data.subarray(pos1, pos1 + len);
  caml_blit_bytes(caml_bytes_of_uint8_array(slice), 0, bytes2, pos2, len);
  return 0;
}

//# 1 "+compare.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_compare_val_tag
//Requires: caml_is_ml_string, caml_is_ml_bytes
function caml_compare_val_tag(a) {
  if (a === null) return 1010; // null_tag
  if (typeof a === "number")
    return 1000; // int_tag (we use it for all numbers)
  else if (caml_is_ml_bytes(a))
    return 252; // string_tag
  else if (caml_is_ml_string(a))
    return 1252; // ocaml string (if different from bytes)
  else if (Array.isArray(a) && a[0] === a[0] >>> 0 && a[0] <= 255) {
    // Look like an ocaml block
    var tag = a[0] | 0;
    // ignore double_array_tag because we cannot accurately set
    // this tag when we create an array of float.
    return tag === 254 ? 0 : tag;
  } else if (a instanceof String)
    return 12520; // javascript string, like string_tag (252)
  else if (typeof a === "string")
    return 12520; // javascript string, like string_tag (252)
  else if (a instanceof Number)
    return 1000; // int_tag (we use it for all numbers)
  else if (a?.caml_custom)
    return 1255; // like custom_tag (255)
  else if (a?.compare)
    return 1256; // like custom_tag (255)
  else if (typeof a === "function")
    return 1247; // like closure_tag (247)
  else if (typeof a === "symbol") return 1251;
  return 1001; //out_of_heap_tag
}

//Provides: caml_compare_val_get_custom
//Requires: caml_custom_ops
function caml_compare_val_get_custom(a) {
  return (
    caml_custom_ops[a.caml_custom] && caml_custom_ops[a.caml_custom].compare
  );
}

//Provides: caml_compare_val (const, const, const)
//Requires: caml_int_compare, caml_string_compare, caml_bytes_compare
//Requires: caml_invalid_argument, caml_compare_val_get_custom, caml_compare_val_tag
//Requires: caml_jsbytes_of_string
//Requires: caml_is_continuation_tag
function caml_compare_val(a, b, total) {
  var stack = [];
  for (;;) {
    if (!(total && a === b)) {
      var tag_a = caml_compare_val_tag(a);
      // forward_tag ?
      if (tag_a === 250) {
        a = a[1];
        continue;
      }

      var tag_b = caml_compare_val_tag(b);
      // forward_tag ?
      if (tag_b === 250) {
        b = b[1];
        continue;
      }

      // tags are different
      if (tag_a !== tag_b) {
        if (tag_a === 1010) {
          // Null is less than anything else
          return -1;
        }
        if (tag_b === 1010) {
          return 1;
        }
        if (tag_a === 1000) {
          // An immediate is less than any block, including a custom block
          // (e.g. int32/int64/nativeint/bigarray): the built-in custom
          // blocks define no [compare_ext], so the C runtime orders the
          // immediate strictly before the block regardless of values.
          return -1;
        }
        if (tag_b === 1000) {
          return 1;
        }
        return tag_a < tag_b ? -1 : 1;
      }
      // tag_a = tag_b
      switch (tag_a) {
        // 246: Lazy_tag handled bellow
        case 247: // Closure_tag
          // Cannot happen
          caml_invalid_argument("compare: functional value");
          break;
        case 248: // Object
          var x = caml_int_compare(a[2], b[2]) | 0;
          if (x !== 0) return x;
          break;
        case 249: // Infix
          // Cannot happen
          caml_invalid_argument("compare: functional value");
          break;
        case 250: // Forward tag
          // Cannot happen, handled above
          caml_invalid_argument("equal: got Forward_tag, should not happen");
          break;
        case 251: //Abstract
          caml_invalid_argument("equal: abstract value");
          break;
        case 252: // OCaml bytes
          if (a !== b) {
            var x = caml_bytes_compare(a, b) | 0;
            if (x !== 0) return x;
          }
          break;
        case 253: // Double_tag
          // Cannot happen
          caml_invalid_argument("equal: got Double_tag, should not happen");
          break;
        case 254: // Double_array_tag
          // Cannot happen, handled in caml_compare_val_tag
          caml_invalid_argument(
            "equal: got Double_array_tag, should not happen",
          );
          break;
        case 255: // Custom_tag
          caml_invalid_argument("equal: got Custom_tag, should not happen");
          break;
        case 1247: // Function
          caml_invalid_argument("compare: functional value");
          break;
        case 1255: // Custom
          var comp = caml_compare_val_get_custom(a);
          if (comp !== caml_compare_val_get_custom(b)) {
            return a.caml_custom < b.caml_custom ? -1 : 1;
          }
          if (!comp) caml_invalid_argument("compare: abstract value");
          var x = comp(a, b, total);
          if (Number.isNaN(x)) {
            // Protect against invalid UNORDERED
            return total ? -1 : x;
          }
          if (x !== (x | 0)) {
            // Protect against invalid return value
            return -1;
          }
          if (x !== 0) return x | 0;
          break;
        case 1256: // compare function
          var x = a.compare(b, total);
          if (Number.isNaN(x)) {
            // Protect against invalid UNORDERED
            return total ? -1 : x;
          }
          if (x !== (x | 0)) {
            // Protect against invalid return value
            return -1;
          }
          if (x !== 0) return x | 0;
          break;
        case 1000: // Number
          a = +a;
          b = +b;
          if (a < b) return -1;
          if (a > b) return 1;
          if (a !== b) {
            if (!total) return Number.NaN;
            if (!Number.isNaN(a)) return 1;
            if (!Number.isNaN(b)) return -1;
          }
          break;
        case 1010: // Null pointer
          return 0;
        case 1001: // The rest
          // Here we can be in the following cases:
          // 1. JavaScript primitive types
          // 2. JavaScript object that can be coerced to primitive types
          // 3. JavaScript object than cannot be coerced to primitive types
          //
          // (3) will raise a [TypeError]
          // (2) will coerce to primitive types using [valueOf] or [toString]
          // (2) and (3), after eventual coercion
          // - if a and b are strings, apply lexicographic comparison
          // - if a or b are not strings, convert a and b to number
          //   and apply standard comparison
          if (a < b) return -1;
          if (a > b) return 1;
          if (a !== b) {
            return total ? 1 : Number.NaN;
          }
          break;
        case 1251: // JavaScript Symbol, no ordering.
          if (a !== b) {
            return total ? 1 : Number.NaN;
          }
          break;
        case 1252: // ocaml strings
          var a = caml_jsbytes_of_string(a);
          var b = caml_jsbytes_of_string(b);
          if (a !== b) {
            if (a < b) return -1;
            if (a > b) return 1;
          }
          break;
        case 12520: // javascript strings
          var a = a.toString();
          var b = b.toString();
          if (a !== b) {
            if (a < b) return -1;
            if (a > b) return 1;
          }
          break;
        default: // Lazy_tag or Block with other tag
          if (caml_is_continuation_tag(tag_a)) {
            caml_invalid_argument("compare: continuation value");
            break;
          }
          if (a.length !== b.length) return a.length < b.length ? -1 : 1;
          if (a.length > 1) stack.push(a, b, 1);
          break;
      }
    }
    if (stack.length === 0) return 0;
    var i = stack.pop();
    b = stack.pop();
    a = stack.pop();
    if (i + 1 < a.length) stack.push(a, b, i + 1);
    a = a[i];
    b = b[i];
  }
}

// May raise
//Provides: caml_compare (const, const)
//Requires: caml_compare_val
function caml_compare(a, b) {
  return caml_compare_val(a, b, true);
}

//Provides: caml_int_compare const
//Alias: caml_int32_compare
//Alias: caml_nativeint_compare
function caml_int_compare(a, b) {
  if (a < b) return -1;
  if (a === b) return 0;
  return 1;
}

// May raise
//Provides: caml_equal (const, const)
//Requires: caml_compare_val
function caml_equal(x, y) {
  return +(caml_compare_val(x, y, false) === 0);
}

// May raise
//Provides: caml_notequal (const, const)
//Requires: caml_compare_val
function caml_notequal(x, y) {
  return +(caml_compare_val(x, y, false) !== 0);
}

// May raise
//Provides: caml_greaterequal (const, const)
//Requires: caml_compare_val
function caml_greaterequal(x, y) {
  return +(caml_compare_val(x, y, false) >= 0);
}

// May raise
//Provides: caml_greaterthan (const, const)
//Requires: caml_compare_val
function caml_greaterthan(x, y) {
  return +(caml_compare_val(x, y, false) > 0);
}

// May raise
//Provides: caml_lessequal (const, const)
//Requires: caml_compare_val
function caml_lessequal(x, y) {
  return +(caml_compare_val(x, y, false) <= 0);
}

// May raise
//Provides: caml_lessthan (const, const)
//Requires: caml_compare_val
function caml_lessthan(x, y) {
  return +(caml_compare_val(x, y, false) < 0);
}

//# 1 "+fail.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Raise exception

//Provides: caml_raise_constant (const)
function caml_raise_constant(tag) {
  throw tag;
}

//Provides: caml_raise_with_arg (const, mutable)
//Requires: caml_maybe_attach_backtrace
function caml_raise_with_arg(tag, arg) {
  throw caml_maybe_attach_backtrace([0, tag, arg]);
}

//Provides: caml_raise_with_args (const, mutable)
//Requires: caml_maybe_attach_backtrace
function caml_raise_with_args(tag, args) {
  throw caml_maybe_attach_backtrace([0, tag].concat(args));
}

//Provides: caml_raise_with_string (const, const)
//Requires: caml_raise_with_arg, caml_string_of_jsbytes
function caml_raise_with_string(tag, msg) {
  caml_raise_with_arg(tag, caml_string_of_jsbytes(msg));
}

//Provides: caml_failwith (const)
//Requires: caml_raise_with_string, caml_global_data, caml_string_of_jsbytes
function caml_failwith(msg) {
  if (!caml_global_data["predef:Failure"])
    caml_global_data["predef:Failure"] = [
      248,
      caml_string_of_jsbytes("Failure"),
      -3,
    ];
  caml_raise_with_string(caml_global_data["predef:Failure"], msg);
}

//Provides: caml_invalid_argument (const)
//Requires: caml_raise_with_string, caml_global_data
function caml_invalid_argument(msg) {
  caml_raise_with_string(caml_global_data["predef:Invalid_argument"], msg);
}

//Provides: caml_raise_end_of_file
//Requires: caml_raise_constant, caml_global_data
function caml_raise_end_of_file() {
  caml_raise_constant(caml_global_data["predef:End_of_file"]);
}

//Provides: caml_raise_zero_divide
//Requires: caml_raise_constant, caml_global_data
function caml_raise_zero_divide() {
  caml_raise_constant(caml_global_data["predef:Division_by_zero"]);
}

//Provides: caml_raise_not_found
//Requires: caml_raise_constant, caml_global_data
function caml_raise_not_found() {
  caml_raise_constant(caml_global_data["predef:Not_found"]);
}

//Provides: caml_array_bound_error
//Requires: caml_invalid_argument
function caml_array_bound_error() {
  caml_invalid_argument("index out of bounds");
}

//Provides: caml_no_bytecode_impl
//Requires: caml_failwith
//Version: >= 5.2, < 5.3
//OxCaml
function caml_no_bytecode_impl() {
  caml_failwith("No bytecode implementation provided for this external");
}

//# 1 "+format.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

///////////// Format

//Provides: caml_parse_format
//Requires: caml_jsbytes_of_string, caml_invalid_argument
function caml_parse_format(fmt) {
  fmt = caml_jsbytes_of_string(fmt);
  var len = fmt.length;
  if (len > 31) caml_invalid_argument("format_int: format too long");
  var f = {
    justify: "+",
    signstyle: "-",
    filler: " ",
    alternate: false,
    base: 0,
    signedconv: false,
    width: 0,
    uppercase: false,
    sign: 1,
    prec: -1,
    conv: "f",
  };
  for (var i = 0; i < len; i++) {
    var c = fmt.charAt(i);
    switch (c) {
      case "-":
        f.justify = "-";
        break;
      case "+":
      case " ":
        f.signstyle = c;
        break;
      case "0":
        f.filler = "0";
        break;
      case "#":
        f.alternate = true;
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        f.width = 0;
        while (((c = fmt.charCodeAt(i) - 48), c >= 0 && c <= 9)) {
          f.width = f.width * 10 + c;
          i++;
        }
        i--;
        break;
      case ".":
        f.prec = 0;
        i++;
        while (((c = fmt.charCodeAt(i) - 48), c >= 0 && c <= 9)) {
          f.prec = f.prec * 10 + c;
          i++;
        }
        i--;
        break;
      case "d":
      case "i":
        f.signedconv = true;
        f.base = 10;
        break;
      case "u":
        f.base = 10;
        break;
      case "x":
        f.base = 16;
        break;
      case "X":
        f.base = 16;
        f.uppercase = true;
        break;
      case "o":
        f.base = 8;
        break;
      case "e":
      case "f":
      case "g":
        f.signedconv = true;
        f.conv = c;
        break;
      case "E":
      case "F":
      case "G":
        f.signedconv = true;
        f.uppercase = true;
        f.conv = c.toLowerCase();
        break;
    }
  }
  return f;
}

//Provides: caml_finish_formatting
//Requires: caml_string_of_jsbytes
function caml_finish_formatting(f, rawbuffer) {
  if (f.uppercase) rawbuffer = rawbuffer.toUpperCase();
  var len = rawbuffer.length;
  /* Adjust len to reflect additional chars (sign, etc) */
  if (f.signedconv && (f.sign < 0 || f.signstyle !== "-")) len++;
  // Like C printf, the alternate flag only prefixes non-zero values
  var alternate = f.alternate && rawbuffer !== "0";
  if (alternate) {
    if (f.base === 8) len += 1;
    if (f.base === 16) len += 2;
  }
  /* Do the formatting */
  var buffer = "";
  if (f.justify === "+" && f.filler === " ")
    for (var i = len; i < f.width; i++) buffer += " ";
  if (f.signedconv) {
    if (f.sign < 0) buffer += "-";
    else if (f.signstyle !== "-") buffer += f.signstyle;
  }
  if (alternate && f.base === 8) buffer += "0";
  if (alternate && f.base === 16) buffer += f.uppercase ? "0X" : "0x";
  if (f.justify === "+" && f.filler === "0")
    for (var i = len; i < f.width; i++) buffer += "0";
  buffer += rawbuffer;
  if (f.justify === "-") for (var i = len; i < f.width; i++) buffer += " ";
  return caml_string_of_jsbytes(buffer);
}

//# 1 "+fs.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2014 Jérôme Vouillon, Hugo Heuzard
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

///////////// Dummy filesystem

//Provides: caml_trailing_slash
function caml_trailing_slash(name) {
  return name.slice(-1) !== "/" ? name + "/" : name;
}

//Provides: caml_current_dir
//Requires: caml_trailing_slash, fs_node_supported, fs_quickjs_supported
var caml_current_dir = (function () {
  if (fs_node_supported() && globalThis.process?.cwd)
    return globalThis.process.cwd().replace(/\\/g, "/");
  if (fs_quickjs_supported()) {
    var r = globalThis.os.getcwd();
    if (r[1] === 0) return r[0];
  }
  return "/static";
})();
caml_current_dir = caml_trailing_slash(caml_current_dir);

//Provides: caml_get_root
//Requires: path_is_absolute
function caml_get_root(path) {
  var x = path_is_absolute(path);
  if (!x) return;
  return x[0] + "/";
}

//Provides: caml_root
//Requires: caml_get_root, caml_current_dir, caml_failwith
var caml_root =
  caml_get_root(caml_current_dir) ||
  caml_failwith("unable to compute caml_root");

//Provides: MlFile
function MlFile() {}

//Provides: path_is_absolute
//Requires: fs_node_supported
//Requires: jsoo_is_win32
function make_path_is_absolute() {
  function posix(path) {
    if (path.charAt(0) === "/") return ["", path.slice(1)];
    return;
  }

  function win32(path) {
    // https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
    var splitDeviceRe =
      /^([a-zA-Z]:|[\\/]{2}[^\\/]+[\\/]+[^\\/]+)?([\\/])?([\s\S]*?)$/;
    var result = splitDeviceRe.exec(path);
    var device = result[1] || "";
    var isUnc = device.length > 0 && device.charAt(1) !== ":";

    // UNC paths are always absolute
    if (result[2] || isUnc) {
      var root = result[1] || "";
      var sep = result[2] || "";
      return [root, path.slice(root.length + sep.length)];
    }
    return;
  }
  return jsoo_is_win32 ? win32 : posix;
}
var path_is_absolute = make_path_is_absolute();

//Provides: caml_make_path
//Requires: caml_current_dir
//Requires: caml_jsstring_of_string, path_is_absolute, caml_raise_system_error
function caml_make_path(name, raise_unix) {
  name = caml_jsstring_of_string(name);
  // An empty path is invalid: like native (and the wasm runtime), it must not
  // resolve to the current directory but fail with ENOENT. [raise_unix]
  // selects Unix_error (Unix callers) vs Sys_error (Sys callers).
  if (name === "")
    caml_raise_system_error(
      raise_unix,
      "ENOENT",
      "",
      "No such file or directory",
      "",
    );
  if (!path_is_absolute(name)) name = caml_current_dir + name;
  var comp0 = path_is_absolute(name);
  var comp = comp0[1].split(/[/\\]/);
  var ncomp = [];
  for (var i = 0; i < comp.length; i++) {
    switch (comp[i]) {
      case "..":
        ncomp.pop();
        break;
      case ".":
        break;
      case "":
        break;
      default:
        ncomp.push(comp[i]);
        break;
    }
  }
  ncomp.unshift(comp0[0]);
  ncomp.orig = name;
  return ncomp;
}

// QuickJS filesystem support can be added with by passing
// +fs_quickjs.js to the command line. It's not included by default to
// avoid bloat.

//Provides: MlQuickJSDevice
//Weakdef
class MlQuickJSDevice {}

//Provides: fs_quickjs_supported
//Weakdef
function fs_quickjs_supported() {
  return false;
}

//Provides: caml_sys_open_for_quickjs
//Weakdef
function caml_sys_open_for_quickjs(_fd, _flags) {
  return null;
}

//Provides:jsoo_mount_point
//Requires: MlFakeDevice, MlNodeDevice, MlQuickJSDevice, caml_root, fs_node_supported, fs_quickjs_supported
var jsoo_mount_point = [];
if (fs_node_supported()) {
  jsoo_mount_point.push({
    path: caml_root,
    device: new MlNodeDevice(caml_root),
  });
} else if (fs_quickjs_supported()) {
  jsoo_mount_point.push({
    path: caml_root,
    device: new MlQuickJSDevice(caml_root),
  });
} else {
  jsoo_mount_point.push({
    path: caml_root,
    device: new MlFakeDevice(caml_root),
  });
}
jsoo_mount_point.push({
  path: "/static/",
  device: new MlFakeDevice("/static/"),
});

//Provides:caml_list_mount_point
//Requires: jsoo_mount_point, caml_string_of_jsstring
function caml_list_mount_point() {
  var prev = 0;
  for (var i = 0; i < jsoo_mount_point.length; i++) {
    var old = prev;
    prev = [0, caml_string_of_jsstring(jsoo_mount_point[i].path), old];
  }
  return prev;
}

//Provides: resolve_fs_device
//Requires: caml_make_path, jsoo_mount_point, caml_raise_sys_error, caml_get_root, MlNodeDevice, caml_trailing_slash, fs_node_supported
function resolve_fs_device(name, raise_unix) {
  var path = caml_make_path(name, raise_unix);
  var name = path.join("/");
  var name_slash = caml_trailing_slash(name);
  var res;
  for (var i = 0; i < jsoo_mount_point.length; i++) {
    var m = jsoo_mount_point[i];
    if (
      name_slash.startsWith(m.path) &&
      (!res || res.path.length < m.path.length)
    )
      res = {
        path: m.path,
        device: m.device,
        rest: name.slice(m.path.length, name.length),
      };
  }
  if (!res && fs_node_supported()) {
    var root = caml_get_root(name);
    if (root?.match(/^[a-zA-Z]:\/$/)) {
      var m = { path: root, device: new MlNodeDevice(root) };
      jsoo_mount_point.push(m);
      res = {
        path: m.path,
        device: m.device,
        rest: name.slice(m.path.length, name.length),
      };
    }
  }
  if (res) return res;
  caml_raise_sys_error("no device found for " + name_slash);
}

//Provides: caml_mount_autoload
//Requires: MlFakeDevice, caml_make_path, jsoo_mount_point, caml_trailing_slash
function caml_mount_autoload(name, f) {
  var path = caml_make_path(name);
  var name = caml_trailing_slash(path.join("/"));
  jsoo_mount_point.push({ path: name, device: new MlFakeDevice(name, f) });
  return 0;
}

//Provides: caml_unmount
//Requires: jsoo_mount_point, caml_make_path, caml_trailing_slash
function caml_unmount(name) {
  var path = caml_make_path(name);
  var name = caml_trailing_slash(path.join("/"));
  var idx = -1;
  for (var i = 0; i < jsoo_mount_point.length; i++)
    if (jsoo_mount_point[i].path === name) idx = i;
  if (idx > -1) jsoo_mount_point.splice(idx, 1);
  return 0;
}

//Provides: caml_sys_getcwd
//Requires: caml_current_dir, caml_string_of_jsstring
//Alias: caml_unix_getcwd
//Alias: unix_getcwd
function caml_sys_getcwd() {
  return caml_string_of_jsstring(caml_current_dir);
}

//Provides: caml_sys_chdir
//Requires: caml_current_dir, caml_raise_no_such_file, resolve_fs_device, caml_trailing_slash, caml_jsstring_of_string, caml_raise_system_error
function caml_sys_chdir(dir, raise_unix) {
  var root = resolve_fs_device(dir);
  if (root.device.is_dir(root.rest)) {
    if (root.rest)
      caml_current_dir = caml_trailing_slash(root.path + root.rest);
    else caml_current_dir = root.path;
    return 0;
  } else if (root.device.exists(root.rest)) {
    caml_raise_system_error(
      raise_unix,
      "ENOTDIR",
      "chdir",
      "not a directory",
      caml_jsstring_of_string(dir),
    );
  } else {
    caml_raise_no_such_file(caml_jsstring_of_string(dir), raise_unix, "chdir");
  }
}

//Provides: caml_raise_no_such_file
//Requires: caml_raise_system_error, caml_raise_sys_error
function caml_raise_no_such_file(name, raise_unix, cmd) {
  if (raise_unix)
    caml_raise_system_error(
      raise_unix,
      "ENOENT",
      cmd || "open",
      "no such file or directory",
      name,
    );
  // match the native Sys_error message
  caml_raise_sys_error(name + ": No such file or directory");
}

//Provides: caml_sys_file_exists
//Requires: resolve_fs_device, caml_jsstring_of_string
function caml_sys_file_exists(name) {
  // An empty path exists nowhere; like native, return false rather than
  // resolving "" to the current directory (which always exists).
  if (caml_jsstring_of_string(name) === "") return 0;
  var root = resolve_fs_device(name);
  return root.device.exists(root.rest);
}

//Provides: caml_sys_read_directory
//Requires: caml_string_of_jsstring
//Requires: resolve_fs_device
function caml_sys_read_directory(name) {
  var root = resolve_fs_device(name);
  var a = root.device.readdir(root.rest);
  var l = new Array(a.length + 1);
  l[0] = 0;
  for (var i = 0; i < a.length; i++) l[i + 1] = caml_string_of_jsstring(a[i]);
  return l;
}

//Provides: caml_sys_remove
//Requires: resolve_fs_device
function caml_sys_remove(name) {
  var root = resolve_fs_device(name);
  return root.device.unlink(root.rest);
}

//Provides: caml_sys_is_directory
//Requires: resolve_fs_device
function caml_sys_is_directory(name) {
  var root = resolve_fs_device(name);
  var a = root.device.is_dir(root.rest);
  return a ? 1 : 0;
}

//Provides: caml_sys_rename
//Requires: caml_failwith, resolve_fs_device, caml_raise_sys_error
function caml_sys_rename(o, n) {
  var o_root = resolve_fs_device(o);
  var n_root = resolve_fs_device(n);
  if (o_root.device !== n_root.device)
    // native raises Sys_error (strerror of EXDEV)
    caml_raise_sys_error("Invalid cross-device link");
  if (!o_root.device.rename) caml_failwith("caml_sys_rename: not implemented");
  o_root.device.rename(o_root.rest, n_root.rest);
}

//Provides: caml_sys_mkdir
//Requires: resolve_fs_device
function caml_sys_mkdir(name, perm) {
  var root = resolve_fs_device(name);
  root.device.mkdir(root.rest, perm);
  return 0;
}

//Provides: caml_sys_rmdir
//Requires: resolve_fs_device
function caml_sys_rmdir(name) {
  var root = resolve_fs_device(name);
  root.device.rmdir(root.rest);
  return 0;
}

//Provides: caml_ba_map_file
//Requires: caml_failwith
function caml_ba_map_file(_vfd, _kind, _layout, _shared, _dims, _pos) {
  // var data = caml_sys_fds[vfd];
  caml_failwith("caml_ba_map_file not implemented");
}

//Provides: caml_ba_map_file_bytecode
//Requires: caml_ba_map_file
function caml_ba_map_file_bytecode(argv, _argn) {
  // argn === 6
  return caml_ba_map_file(argv[0], argv[1], argv[2], argv[3], argv[4], argv[5]);
}

//Provides: jsoo_create_file_extern
function jsoo_create_file_extern(name, content) {
  if (globalThis.jsoo_create_file) globalThis.jsoo_create_file(name, content);
  else {
    if (!globalThis.jsoo_fs_tmp) globalThis.jsoo_fs_tmp = [];
    globalThis.jsoo_fs_tmp.push({ name: name, content: content });
  }
  return 0;
}

//Provides: caml_fs_init
//Requires: jsoo_create_file
function caml_fs_init() {
  var tmp = globalThis.jsoo_fs_tmp;
  if (tmp) {
    for (var i = 0; i < tmp.length; i++) {
      jsoo_create_file(tmp[i].name, tmp[i].content);
    }
  }
  globalThis.jsoo_create_file = jsoo_create_file;
  globalThis.jsoo_fs_tmp = [];
  return 0;
}

//Provides: caml_create_file
//Requires: caml_failwith, resolve_fs_device
function caml_create_file(name, content) {
  var root = resolve_fs_device(name);
  if (!root.device.register) caml_failwith("cannot register file");
  root.device.register(root.rest, content);
  return 0;
}

//Provides: jsoo_create_file
//Requires: caml_create_file, caml_string_of_jsbytes, caml_string_of_jsstring
function jsoo_create_file(name, content) {
  var name = caml_string_of_jsstring(name);
  var content = caml_string_of_jsbytes(content);
  return caml_create_file(name, content);
}

//Provides: caml_read_file_content
//Requires: resolve_fs_device, caml_raise_no_such_file, caml_string_of_uint8_array
//Requires: caml_string_of_jsstring, caml_jsstring_of_string
function caml_read_file_content(name) {
  var name = typeof name === "string" ? caml_string_of_jsstring(name) : name;
  var root = resolve_fs_device(name);
  if (root.device.exists(root.rest)) {
    var file = root.device.open(root.rest, { rdonly: 1 });
    var len = file.length();
    var buf = new Uint8Array(len);
    file.read(buf, 0, len, false);
    file.close();
    return caml_string_of_uint8_array(buf);
  }
  caml_raise_no_such_file(caml_jsstring_of_string(name));
}

//# 1 "+fs_fake.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2014 Jérôme Vouillon, Hugo Heuzard
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: MlFakeDevice
//Requires: MlFakeFile, MlFakeFd, caml_create_bytes
//Requires: caml_raise_sys_error, caml_raise_no_such_file
//Requires: caml_string_of_jsbytes, caml_string_of_jsstring
//Requires: caml_bytes_of_array, caml_bytes_of_string, caml_bytes_of_jsbytes
//Requires: caml_is_ml_bytes, caml_is_ml_string
//Requires: caml_raise_system_error
class MlFakeDevice {
  constructor(root, f) {
    this.content = {};
    this.root = root;
    this.lookupFun = f;
  }

  nm(name) {
    return this.root + name;
  }

  create_dir_if_needed(name) {
    var comp = name.split("/");
    var res = "";
    for (var i = 0; i < comp.length - 1; i++) {
      res += comp[i] + "/";
      if (this.content[res]) continue;
      this.content[res] = Symbol("directory");
    }
  }

  slash(name) {
    return /\/$/.test(name) ? name : name + "/";
  }

  lookup(name) {
    if (!this.content[name] && this.lookupFun) {
      var res = this.lookupFun(
        caml_string_of_jsstring(this.root),
        caml_string_of_jsstring(name),
      );
      if (res !== 0) {
        this.create_dir_if_needed(name);
        this.content[name] = new MlFakeFile(caml_bytes_of_string(res[1]));
      }
    }
  }

  exists(name, do_not_lookup) {
    // The root of the device exists
    if (name === "") return 1;
    // Check if a directory exists
    var name_slash = this.slash(name);
    if (this.content[name_slash]) return 1;
    // Check if a file exists
    if (!do_not_lookup) this.lookup(name);
    return this.content[name] ? 1 : 0;
  }

  isFile(name) {
    if (this.exists(name) && !this.is_dir(name)) {
      return 1;
    } else {
      return 0;
    }
  }

  rename_dir(oldname, newname, raise_unix) {
    var old_slash = this.slash(oldname);
    var new_slash = this.slash(newname);
    if (newname !== oldname && new_slash.startsWith(old_slash))
      // renaming a directory into its own subtree would recurse forever
      caml_raise_system_error(
        raise_unix,
        "EINVAL",
        "rename",
        "invalid argument",
        this.nm(newname),
      );
    if (this.exists(newname)) {
      if (!this.is_dir(newname)) {
        caml_raise_system_error(
          raise_unix,
          "ENOTDIR",
          "rename",
          "not a directory",
          this.nm(newname),
        );
      }
      if (this.readdir(newname).length > 0) {
        caml_raise_system_error(
          raise_unix,
          "ENOTEMPTY",
          "rename",
          "directory not empty",
          this.nm(newname),
        );
      }
    }
    this.create_dir_if_needed(new_slash);
    for (const f of this.readdir(oldname)) {
      this.rename(old_slash + f, new_slash + f, raise_unix);
    }
    delete this.content[old_slash];
  }

  rename(oldname, newname, raise_unix) {
    if (!this.exists(oldname))
      caml_raise_no_such_file(this.nm(oldname), raise_unix, "rename");
    if (this.is_dir(oldname)) {
      this.rename_dir(oldname, newname, raise_unix);
    } else {
      if (this.exists(newname) && this.is_dir(newname)) {
        caml_raise_system_error(
          raise_unix,
          "EISDIR",
          "rename",
          "is a directory",
          this.nm(newname),
        );
      }
      if (newname !== oldname) {
        this.content[newname] = this.content[oldname];
        delete this.content[oldname];
      }
    }
  }

  mkdir(name, _mode, raise_unix) {
    if (this.exists(name))
      caml_raise_system_error(
        raise_unix,
        "EEXIST",
        "mkdir",
        "file already exists",
        this.nm(name),
      );
    var parent = /^(.*)\/[^/]+/.exec(name);
    parent = parent?.[1] || "";
    if (!this.exists(parent))
      caml_raise_system_error(
        raise_unix,
        "ENOENT",
        "mkdir",
        "no such file or directory",
        this.nm(name),
      );
    if (!this.is_dir(parent))
      caml_raise_system_error(
        raise_unix,
        "ENOTDIR",
        "mkdir",
        "not a directory",
        this.nm(name),
      );
    this.create_dir_if_needed(this.slash(name));
  }

  rmdir(name, raise_unix) {
    var name_slash = name === "" ? "" : this.slash(name);
    if (!this.exists(name))
      caml_raise_system_error(
        raise_unix,
        "ENOENT",
        "rmdir",
        "no such file or directory",
        this.nm(name),
      );
    if (!this.is_dir(name))
      caml_raise_system_error(
        raise_unix,
        "ENOTDIR",
        "rmdir",
        "not a directory",
        this.nm(name),
      );
    for (var n in this.content) {
      if (n.startsWith(name_slash) && n !== name_slash)
        caml_raise_system_error(
          raise_unix,
          "ENOTEMPTY",
          "rmdir",
          "directory not empty",
          this.nm(name),
        );
    }
    delete this.content[name_slash];
  }

  readdir(name, raise_unix) {
    var name_slash = name === "" ? "" : this.slash(name);
    if (!this.exists(name)) {
      caml_raise_no_such_file(this.nm(name), raise_unix, "readdir");
    }
    if (!this.is_dir(name)) {
      caml_raise_system_error(
        raise_unix,
        "ENOTDIR",
        "readdir",
        "not a directory",
        this.nm(name),
      );
    }
    var seen = {};
    var a = [];
    for (var n in this.content) {
      if (n.startsWith(name_slash) && n !== name_slash) {
        var last = n.indexOf("/", name_slash.length);
        if (last < 0) last = undefined;
        var m = n.slice(name_slash.length, last);
        if (m && !seen[m]) {
          seen[m] = true;
          a.push(m);
        }
      }
    }
    return a;
  }

  opendir(name, raise_unix) {
    var a = this.readdir(name, raise_unix);
    var c = false;
    var i = 0;
    return {
      readSync: function () {
        if (c)
          caml_raise_system_error(
            raise_unix,
            "EBADF",
            "readdir",
            "bad file descriptor",
          );
        if (i === a.length) return null;
        var entry = a[i];
        i++;
        return { name: entry };
      },
      closeSync: function () {
        if (c)
          caml_raise_system_error(
            raise_unix,
            "EBADF",
            "readdir",
            "bad file descriptor",
          );
        c = true;
        a = [];
      },
    };
  }

  is_dir(name) {
    if (name === "") return true;
    var name_slash = this.slash(name);
    return this.content[name_slash] ? 1 : 0;
  }

  unlink(name, raise_unix) {
    if (!this.exists(name, true)) {
      // [true] means no "lookup" if not found.
      caml_raise_system_error(
        raise_unix,
        "ENOENT",
        "unlink",
        "no such file or directory",
        name,
      );
    }
    if (this.is_dir(name))
      caml_raise_system_error(
        raise_unix,
        "EISDIR",
        "unlink",
        "is a directory",
        this.nm(name),
      );
    delete this.content[name];
    return 0;
  }

  access(name, _flags, raise_unix) {
    this.lookup(name);
    if (!this.exists(name))
      caml_raise_no_such_file(this.nm(name), raise_unix, "access");
    return 0;
  }

  open(name, f, _perms, raise_unix) {
    var file;
    this.lookup(name);
    if (this.content[name]) {
      if (this.is_dir(name))
        caml_raise_system_error(
          raise_unix,
          "EISDIR",
          "open",
          "illegal operation on a directory",
          this.nm(name),
        );
      if (f.create && f.excl)
        caml_raise_system_error(
          raise_unix,
          "EEXIST",
          "open",
          "file already exists",
          this.nm(name),
        );
      file = this.content[name];
      if (f.truncate) file.truncate(0);
    } else if (f.create) {
      this.create_dir_if_needed(name);
      this.content[name] = new MlFakeFile(caml_create_bytes(0));
      file = this.content[name];
    } else {
      caml_raise_no_such_file(this.nm(name), raise_unix, "open");
    }
    return new MlFakeFd(this.nm(name), file, f);
  }

  truncate(name, len, raise_unix) {
    var file;
    this.lookup(name);
    if (this.content[name]) {
      if (this.is_dir(name))
        caml_raise_system_error(
          raise_unix,
          "EISDIR",
          "open",
          "illegal operation on a directory",
          this.nm(name),
        );
      file = this.content[name];
      file.truncate(len);
    } else {
      caml_raise_no_such_file(this.nm(name), raise_unix, "truncate");
    }
  }

  register(name, content) {
    var file;
    if (this.content[name])
      caml_raise_sys_error(this.nm(name) + " : file already exists");
    if (caml_is_ml_bytes(content)) file = new MlFakeFile(content);
    else if (caml_is_ml_string(content))
      file = new MlFakeFile(caml_bytes_of_string(content));
    else if (Array.isArray(content))
      file = new MlFakeFile(caml_bytes_of_array(content));
    else if (typeof content === "string")
      file = new MlFakeFile(caml_bytes_of_jsbytes(content));
    else if (content.toString) {
      var bytes = caml_bytes_of_string(
        caml_string_of_jsstring(content.toString()),
      );
      file = new MlFakeFile(bytes);
    }
    if (file) {
      this.create_dir_if_needed(name);
      this.content[name] = file;
    } else
      caml_raise_sys_error(
        this.nm(name) + " : registering file with invalid content type",
      );
  }
}

//Provides: MlFakeFile
//Requires: MlFile
//Requires: caml_create_bytes, caml_ml_bytes_length, caml_blit_bytes
//Requires: caml_uint8_array_of_bytes, caml_bytes_of_uint8_array
class MlFakeFile extends MlFile {
  constructor(content) {
    super();
    this.data = content;
  }

  truncate(len) {
    var old = this.data;
    var old_len = caml_ml_bytes_length(old);
    this.data = caml_create_bytes(len | 0);
    caml_blit_bytes(old, 0, this.data, 0, Math.min(len, old_len));
  }

  length() {
    return caml_ml_bytes_length(this.data);
  }

  write(offset, buf, pos, len) {
    var clen = this.length();
    if (offset + len >= clen) {
      var new_str = caml_create_bytes(offset + len);
      var old_data = this.data;
      this.data = new_str;
      caml_blit_bytes(old_data, 0, this.data, 0, clen);
    }
    caml_blit_bytes(
      caml_bytes_of_uint8_array(buf),
      pos,
      this.data,
      offset,
      len,
    );
    return len;
  }

  read(offset, buf, pos, len) {
    var clen = this.length();
    if (offset + len >= clen) {
      len = clen - offset;
    }
    if (len > 0) {
      var data = caml_create_bytes(len | 0);
      caml_blit_bytes(this.data, offset, data, 0, len);
      buf.set(caml_uint8_array_of_bytes(data), pos);
      return len;
    }
    return 0;
  }
}

//Provides: MlFakeFd_out
//Requires: MlFakeFile, caml_create_bytes, caml_blit_bytes, caml_bytes_of_uint8_array
//Requires: caml_raise_system_error
class MlFakeFd_out extends MlFakeFile {
  constructor(fd, flags) {
    super(caml_create_bytes(0));
    // Pick a stdout / stderr sink. console.log / console.error always
    // append a newline, so wrap them to drop at most one trailing \n
    // (otherwise OCaml's own newline doubles up).
    var via_console = (sink) => (s) =>
      sink(
        s.length > 0 && s.charCodeAt(s.length - 1) === 10 ? s.slice(0, -1) : s,
      );
    if (fd === 1 && typeof console.log === "function")
      this.log = via_console(console.log);
    else if (fd === 2 && typeof console.error === "function")
      this.log = via_console(console.error);
    else if (typeof console.log === "function")
      this.log = via_console(console.log);
    else this.log = (_s) => 0;
    this.flags = flags;
  }

  length() {
    return 0;
  }

  truncate(_len, raise_unix) {
    caml_raise_system_error(
      raise_unix,
      "EINVAL",
      "ftruncate",
      "invalid argument",
    );
  }

  write(buf, pos, len, raise_unix) {
    if (this.log) {
      var src = caml_create_bytes(len);
      caml_blit_bytes(caml_bytes_of_uint8_array(buf), pos, src, 0, len);
      this.log(src.toUtf16());
      return len;
    }
    caml_raise_system_error(
      raise_unix,
      "EBADF",
      "write",
      "bad file descriptor",
    );
  }

  read(_buf, _pos, _len, raise_unix) {
    caml_raise_system_error(raise_unix, "EBADF", "read", "bad file descriptor");
  }

  seek(_len, _whence, raise_unix) {
    caml_raise_system_error(raise_unix, "ESPIPE", "lseek", "illegal seek");
  }
  pos() {
    return -1;
  }

  close() {
    this.log = undefined;
  }

  check_stream_semantics(_cmd) {}
}

//Provides: MlFakeFd
//Requires: MlFakeFile
//Requires: caml_raise_system_error
class MlFakeFd {
  constructor(name, file, flags) {
    this.file = file;
    this.name = name;
    this.flags = flags;
    // Like native [O_APPEND], the offset starts at the beginning of the file;
    // it is each [write] that repositions to the end (see [write] below).
    this.offset = 0;
    this.seeked = false;
  }

  err_closed(cmd, raise_unix) {
    caml_raise_system_error(raise_unix, "EBADF", cmd, "bad file descriptor");
  }

  length(raise_unix) {
    if (this.file) return this.file.length();
    this.err_closed("length", raise_unix);
  }

  truncate(len, raise_unix) {
    if (this.file) {
      if (!(this.flags.wronly || this.flags.rdwr))
        caml_raise_system_error(
          raise_unix,
          "EINVAL",
          "truncate",
          "invalid argument",
        );
      return this.file.truncate(len);
    }
    this.err_closed("truncate", raise_unix);
  }

  write(buf, pos, len, raise_unix) {
    if (this.file && (this.flags.wronly || this.flags.rdwr)) {
      // [O_APPEND]: every write goes to the end of the file, regardless of the
      // current offset (which may have been moved by [seek]).
      if (this.flags.append) this.offset = this.file.length();
      var offset = this.offset;
      len = this.file.write(offset, buf, pos, len);
      this.offset += len;
      return len;
    }
    this.err_closed("write", raise_unix);
  }

  read(buf, pos, len, raise_unix) {
    if (this.file && !this.flags.wronly) {
      var offset = this.offset;
      len = this.file.read(offset, buf, pos, len);
      this.offset += len;
      return len;
    }
    this.err_closed("read", raise_unix);
  }

  seek(offset, whence, raise_unix) {
    switch (whence) {
      case 0:
        break;
      case 1:
        offset += this.offset;
        break;
      case 2:
        offset += this.length();
        break;
    }
    if (offset < 0)
      caml_raise_system_error(
        raise_unix,
        "EINVAL",
        "lseek",
        "invalid argument",
      );
    this.offset = offset;
    this.seeked = true;
    return offset;
  }

  pos() {
    return this.offset;
  }

  close(raise_unix) {
    if (!this.file) this.err_closed("close", raise_unix);
    this.file = undefined;
  }

  check_stream_semantics(cmd) {
    if (!this.file) return this.err_closed(cmd, /* raise Unix_error */ 1);
  }
}

//# 1 "+fs_node.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2014 Jérôme Vouillon, Hugo Heuzard
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: jsoo_is_win32
var jsoo_is_win32 =
  globalThis.Deno?.build?.os === "windows" ||
  globalThis.process?.platform === "win32";

//Provides: fs_node_supported
function fs_node_supported() {
  return globalThis.process?.versions?.node !== undefined;
}
//Provides: fs_node_supported
//If: browser
function fs_node_supported() {
  return false;
}

//Provides: MlNodeDevice
//Requires: MlNodeFd, caml_raise_sys_error, caml_string_of_jsstring
//Requires: caml_raise_nodejs_error, ocaml_stats_from_node_stats
//Requires: jsoo_is_win32
class MlNodeDevice {
  constructor(root) {
    this.fs = require("node:fs");
    this.root = root;
  }

  nm(name) {
    return this.root + name;
  }

  exists(name) {
    try {
      return this.fs.existsSync(this.nm(name)) ? 1 : 0;
    } catch (err) {
      return 0;
    }
  }

  isFile(name) {
    try {
      return this.fs.statSync(this.nm(name)).isFile() ? 1 : 0;
    } catch (err) {
      caml_raise_sys_error(err.toString());
    }
  }

  mkdir(name, mode, raise_unix) {
    try {
      this.fs.mkdirSync(this.nm(name), { mode: mode });
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  rmdir(name, raise_unix) {
    try {
      this.fs.rmdirSync(this.nm(name));
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  readdir(name, raise_unix) {
    try {
      return this.fs.readdirSync(this.nm(name));
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  is_dir(name) {
    try {
      return this.fs.statSync(this.nm(name)).isDirectory() ? 1 : 0;
    } catch (err) {
      caml_raise_sys_error(err.toString());
    }
  }

  unlink(name, raise_unix) {
    try {
      this.fs.unlinkSync(this.nm(name));
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  utimes(name, atime, mtime, raise_unix) {
    try {
      if (atime === 0 && mtime === 0) {
        atime = Date.now() / 1000;
        mtime = atime;
      }
      this.fs.utimesSync(this.nm(name), atime, mtime);
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  truncate(name, len, raise_unix) {
    try {
      // do not truncate [len] to 32 bits; node accepts up to 2^53
      this.fs.truncateSync(this.nm(name), len);
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  access(name, f, raise_unix) {
    var consts = this.fs.constants;
    var res = 0;
    for (var key in f) {
      switch (key) {
        case "r":
          res |= consts.R_OK;
          break;
        case "w":
          res |= consts.W_OK;
          break;
        case "x":
          res |= jsoo_is_win32 ? consts.R_OK : consts.X_OK;
          break;
        case "f":
          res |= consts.F_OK;
          break;
      }
    }
    try {
      this.fs.accessSync(this.nm(name), res);
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  open(name, f, perms, raise_unix) {
    var consts = this.fs.constants;
    var res = 0;
    for (var key in f) {
      switch (key) {
        case "rdonly":
          res |= consts.O_RDONLY;
          break;
        case "wronly":
          res |= consts.O_WRONLY;
          break;
        case "rdwr":
          res |= consts.O_RDWR;
          break;
        case "append":
          res |= consts.O_APPEND;
          break;
        case "create":
          res |= consts.O_CREAT;
          break;
        case "truncate":
          res |= consts.O_TRUNC;
          break;
        case "excl":
          res |= consts.O_EXCL;
          break;
        case "binary":
          res |= consts.O_BINARY;
          break;
        case "text":
          res |= consts.O_TEXT;
          break;
        case "nonblock":
          res |= consts.O_NONBLOCK;
          break;
        case "noctty":
          res |= consts.O_NOCTTY;
          break;
        case "dsync":
          res |= consts.O_DSYNC;
          break;
        case "sync":
          res |= consts.O_SYNC;
          break;
      }
    }
    try {
      var fd = this.fs.openSync(this.nm(name), res, perms);
      return new MlNodeFd(fd, f);
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  slash(name) {
    return /\/$/.test(name) ? name : name + "/";
  }

  rename(o, n, raise_unix) {
    if (jsoo_is_win32) {
      try {
        var target = this.nm(n);
        var source = this.nm(o);
        var target_stats, source_stats;
        if (
          (target_stats = this.fs.statSync(target, {
            throwIfNoEntry: false,
          })) &&
          (source_stats = this.fs.statSync(source, {
            throwIfNoEntry: false,
          })) &&
          source_stats.isDirectory()
        ) {
          if (target_stats.isDirectory()) {
            if (!this.slash(target).startsWith(this.slash(source)))
              try {
                this.fs.rmdirSync(target);
              } catch {}
          } else {
            var err = new Error(
              `ENOTDIR: not a directory, rename '${source}' -> '${target}'`,
            );
            throw Object.assign(err, {
              errno: -20,
              code: "ENOTDIR",
              syscall: "rename",
              path: target,
            });
          }
        }
        this.fs.renameSync(this.nm(o), this.nm(n));
      } catch (err) {
        caml_raise_nodejs_error(err, raise_unix);
      }
    } else {
      try {
        this.fs.renameSync(this.nm(o), this.nm(n));
      } catch (err) {
        caml_raise_nodejs_error(err, raise_unix);
      }
    }
  }

  stat(name, large, raise_unix) {
    try {
      var js_stats = this.fs.statSync(this.nm(name));
      return ocaml_stats_from_node_stats(js_stats, large);
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  lstat(name, large, raise_unix) {
    try {
      var js_stats = this.fs.lstatSync(this.nm(name));
      return ocaml_stats_from_node_stats(js_stats, large);
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  chmod(name, perms, raise_unix) {
    try {
      this.fs.chmodSync(this.nm(name), perms);
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  link(target, path, raise_unix) {
    try {
      this.fs.linkSync(this.nm(target), this.nm(path));
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  symlink(to_dir, target, path, raise_unix) {
    try {
      this.fs.symlinkSync(
        target,
        this.nm(path),
        to_dir === 0 ? null : to_dir[1] ? "dir" : "file",
      );
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  readlink(name, raise_unix) {
    try {
      var link = this.fs.readlinkSync(this.nm(name), "utf8");
      return caml_string_of_jsstring(link);
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  opendir(name, raise_unix) {
    try {
      return this.fs.opendirSync(this.nm(name));
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }
}

//Provides: ocaml_stats_from_node_stats
//Requires: caml_int64_of_float
function ocaml_stats_from_node_stats(js_stats, large) {
  /* ===Unix.file_kind===
   * type file_kind =
   *     S_REG                       (** Regular file *)
   *   | S_DIR                       (** Directory *)
   *   | S_CHR                       (** Character device *)
   *   | S_BLK                       (** Block device *)
   *   | S_LNK                       (** Symbolic link *)
   *   | S_FIFO                      (** Named pipe *)
   *   | S_SOCK                      (** Socket *)
   */
  var file_kind;
  if (js_stats.isFile()) {
    file_kind = 0;
  } else if (js_stats.isDirectory()) {
    file_kind = 1;
  } else if (js_stats.isCharacterDevice()) {
    file_kind = 2;
  } else if (js_stats.isBlockDevice()) {
    file_kind = 3;
  } else if (js_stats.isSymbolicLink()) {
    file_kind = 4;
  } else if (js_stats.isFIFO()) {
    file_kind = 5;
  } else if (js_stats.isSocket()) {
    file_kind = 6;
  }
  /* ===Unix.stats===
   * type stats =
   *  { st_dev : int;               (** Device number *)
   *    st_ino : int;               (** Inode number *)
   *    st_kind : file_kind;        (** Kind of the file *)
   *    st_perm : file_perm;        (** Access rights *)
   *    st_nlink : int;             (** Number of links *)
   *    st_uid : int;               (** User id of the owner *)
   *    st_gid : int;               (** Group ID of the file's group *)
   *    st_rdev : int;              (** Device ID (if special file) *)
   *    st_size : int;              (** Size in bytes *)
   *    st_atime : float;           (** Last access time *)
   *    st_mtime : float;           (** Last modification time *)
   *    st_ctime : float;           (** Last status change time *)
   *  }
   */
  return BLOCK(
    0,
    js_stats.dev,
    js_stats.ino | 0,
    file_kind,
    js_stats.mode & 0o7777,
    js_stats.nlink,
    js_stats.uid,
    js_stats.gid,
    js_stats.rdev,
    large ? caml_int64_of_float(js_stats.size) : js_stats.size | 0,
    js_stats.atimeMs / 1000,
    js_stats.mtimeMs / 1000,
    js_stats.ctimeMs / 1000,
  );
}

//Provides: MlNodeDevice
//If: browser
class MlNodeDevice {}

//Provides: MlNodeFd
//Requires: MlFile, caml_uint8_array_of_string, caml_uint8_array_of_bytes, caml_bytes_set, caml_raise_sys_error
//Requires: caml_raise_nodejs_error, caml_raise_system_error, ocaml_stats_from_node_stats
class MlNodeFd extends MlFile {
  constructor(fd, flags) {
    super();
    this.fs = require("node:fs");
    this.fd = fd;
    this.flags = flags;
    try {
      var stats = this.fs.fstatSync(fd);
      flags.noSeek =
        stats.isCharacterDevice() || stats.isFIFO() || stats.isSocket();
      // Like native [O_APPEND], the offset starts at the beginning of the
      // file; each [write] repositions to the end (see [write] below).
      this.offset = 0;
    } catch (err) {
      // The fstat will fail on standard streams under Windows with node
      // 18 (and lower). See https://github.com/libuv/libuv/pull/3811.
      flags.noSeek = true;
      this.offset = 0;
    }
    this.seeked = false;
  }

  truncate(len, raise_unix) {
    try {
      // do not truncate [len] to 32 bits, and do not move the fd
      // offset: POSIX ftruncate leaves it unchanged
      this.fs.ftruncateSync(this.fd, len);
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  isatty() {
    var tty = require("node:tty");
    return tty.isatty(this.fd) ? 1 : 0;
  }

  length() {
    try {
      return this.fs.fstatSync(this.fd).size;
    } catch (err) {
      caml_raise_sys_error(err.toString());
    }
  }

  write(buf, buf_offset, len, raise_unix) {
    try {
      // [O_APPEND]: every write goes to the end of the file. The OS already
      // enforces this for the bytes (the fd was opened with O_APPEND); we
      // refresh the tracked offset so [pos]/[lseek] report the native value.
      if (this.flags.append && !this.flags.noSeek) this.offset = this.length();
      if (this.flags.noSeek || !this.seeked) {
        var written = this.fs.writeSync(this.fd, buf, buf_offset, len);
      } else {
        var written = this.fs.writeSync(
          this.fd,
          buf,
          buf_offset,
          len,
          this.offset,
        );
      }
      this.offset += written;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
    return written;
  }

  read(a, buf_offset, len, raise_unix) {
    try {
      if (this.flags.noSeek || !this.seeked) {
        var read = this.fs.readSync(this.fd, a, buf_offset, len);
      } else {
        var read = this.fs.readSync(this.fd, a, buf_offset, len, this.offset);
      }
      this.offset += read;
      return read;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  seek(offset, whence, raise_unix) {
    if (this.flags.noSeek) {
      caml_raise_system_error(raise_unix, "ESPIPE", "lseek", "illegal seek");
    }
    switch (whence) {
      case 0:
        break;
      case 1:
        offset += this.offset;
        break;
      case 2:
        offset += this.length();
        break;
    }
    if (offset < 0) {
      caml_raise_system_error(
        raise_unix,
        "EINVAL",
        "lseek",
        "invalid argument",
      );
    }
    this.offset = offset;
    this.seeked = true;
    return this.offset;
  }

  pos() {
    return this.offset;
  }

  stat(large) {
    try {
      var js_stats = this.fs.fstatSync(this.fd);
      return ocaml_stats_from_node_stats(js_stats, large);
    } catch (err) {
      caml_raise_nodejs_error(err, /* raise Unix_error */ 1);
    }
  }

  chmod(perms) {
    try {
      this.fs.fchmodSync(this.fd, perms);
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, /* raise Unix_error */ 1);
    }
  }

  sync() {
    try {
      this.fs.fsyncSync(this.fd);
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, /* raise Unix_error */ 1);
    }
  }

  close(raise_unix) {
    try {
      this.fs.closeSync(this.fd);
      return 0;
    } catch (err) {
      caml_raise_nodejs_error(err, raise_unix);
    }
  }

  check_stream_semantics(cmd) {
    try {
      var js_stats = this.fs.fstatSync(this.fd);
    } catch (err) {
      caml_raise_nodejs_error(err, /* raise Unix_error */ 1, cmd);
    }
    if (
      !(
        js_stats.isFile() ||
        js_stats.isCharacterDevice() ||
        js_stats.isFIFO() ||
        js_stats.isSocket()
      )
    )
      caml_raise_system_error(
        /* raise Unix_error */ 1,
        "EINVAL",
        cmd,
        "invalid argument",
      );
  }
}

//Provides: MlNodeFd
//If: browser
class MlNodeFd {}

//Provides: caml_sys_open_for_node
//Requires: MlNodeFd
function caml_sys_open_for_node(fd, flags) {
  if (flags.altname) {
    try {
      var fs = require("node:fs");
      var fd2 = fs.openSync(flags.altname, "rs");
      return new MlNodeFd(fd2, flags);
    } catch (e) {}
  }
  return new MlNodeFd(fd, flags);
}

//Provides: caml_sys_open_for_node
//If: browser
function caml_sys_open_for_node(_fd, _flags) {
  return null;
}

//Provides: caml_raise_nodejs_error
//Requires: caml_raise_with_args, make_unix_err_args, caml_named_value
//Requires: caml_raise_sys_error
function caml_raise_nodejs_error(err, raise_unix, cmd) {
  var unix_error = caml_named_value("Unix.Unix_error");
  if (raise_unix && unix_error) {
    var args = make_unix_err_args(
      err.code,
      cmd || err.syscall,
      err.path,
      err.errno,
    );
    caml_raise_with_args(unix_error, args);
  } else {
    caml_raise_sys_error(err.toString());
  }
}

//# 1 "+gc.js"
//Provides: caml_gc_minor
function caml_gc_minor(_unit) {
  //available with [node --expose-gc]
  if (typeof globalThis.gc === "function") globalThis.gc(true);
  return 0;
}
//Provides: caml_gc_major
function caml_gc_major(_unit) {
  //available with [node --expose-gc]
  if (typeof globalThis.gc === "function") globalThis.gc();
  return 0;
}
//Provides: caml_gc_full_major
function caml_gc_full_major(_unit) {
  //available with [node --expose-gc]
  if (typeof globalThis.gc === "function") globalThis.gc();
  return 0;
}
//Provides: caml_gc_compaction
function caml_gc_compaction(_unit) {
  return 0;
}
//Provides: caml_gc_counters
function caml_gc_counters(_unit) {
  return [0, 0, 0, 0];
}
//Provides: caml_gc_quick_stat
//Version: < 5.5
function caml_gc_quick_stat(_unit) {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

//Provides: caml_gc_quick_stat
//Version: >= 5.5
function caml_gc_quick_stat(_unit) {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

//Provides: caml_gc_stat
//Requires: caml_gc_quick_stat
function caml_gc_stat(unit) {
  return caml_gc_quick_stat(unit);
}

//Provides: caml_gc_set
function caml_gc_set(_control) {
  return 0;
}

//Provides: caml_gc_get
function caml_gc_get(_unit) {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

//Provides: caml_final_register const
function caml_final_register(_f, _x) {
  return 0;
}

//Provides: caml_final_register_called_without_value
//Requires: caml_callback
var all_finalizers = new globalThis.Set();
function caml_final_register_called_without_value(cb, a) {
  if (globalThis.FinalizationRegistry && a instanceof Object) {
    var x = new globalThis.FinalizationRegistry(function (x) {
      all_finalizers.delete(x);
      // Go through caml_callback so that the CPS calling convention
      // is respected and exceptions are handled
      caml_callback(cb, [0]);
      return;
    });
    x.register(a, x);
    all_finalizers.add(x);
  }
  return 0;
}

//Provides: caml_final_release const
function caml_final_release(_unit) {
  return 0;
}

//Provides: caml_memprof_start
function caml_memprof_start(_rate, _stack_size, _tracker) {
  return 0;
}

//Provides: caml_memprof_stop
function caml_memprof_stop(_unit) {
  return 0;
}

//Provides: caml_memprof_discard
//Version: >= 5.2
function caml_memprof_discard(_t) {
  return 0;
}

//Provides: caml_memprof_is_sampling const
//Version: >= 5.5
function caml_memprof_is_sampling(_unit) {
  return 0;
}

//Provides: caml_memprof_participate
//Version: >= 5.2, < 5.3
//OxCaml
function caml_memprof_participate(_config) {
  return 0;
}

//Provides: caml_eventlog_resume
//Version: <= 5.2
//(actually < 5.0, but OxCaml still references it)
function caml_eventlog_resume(_unit) {
  return 0;
}

//Provides: caml_eventlog_pause
//Version: <= 5.2
//(actually < 5.0, but OxCaml still references it)
function caml_eventlog_pause(_unit) {
  return 0;
}

//Provides: caml_gc_huge_fallback_count
//Version: < 5.0
function caml_gc_huge_fallback_count(_unit) {
  return 0;
}

//Provides: caml_gc_major_slice
function caml_gc_major_slice(_work) {
  return 0;
}

//Provides: caml_gc_minor_words
function caml_gc_minor_words(_unit) {
  return 0;
}

//Provides: caml_get_minor_free
function caml_get_minor_free(_unit) {
  return 0;
}

//Provides: caml_get_major_bucket
//Version: < 5.0
function caml_get_major_bucket(_n) {
  return 0;
}

//Provides: caml_get_major_credit
//Version: < 5.0
function caml_get_major_credit(_n) {
  return 0;
}

//Provides: caml_gc_tweak_get
//Requires: caml_invalid_argument
//Version: >= 5.5
//OxCaml
function caml_gc_tweak_get(_name) {
  caml_invalid_argument("Gc.Tweak: parameter not found");
}

//Provides: caml_gc_tweak_get
//Requires: caml_invalid_argument
//Version: >= 5.2, < 5.3
//OxCaml
function caml_gc_tweak_get(_name) {
  caml_invalid_argument("Gc.Tweak: parameter not found");
}

//Provides: caml_gc_tweak_set
//Requires: caml_invalid_argument
//Version: >= 5.5
function caml_gc_tweak_set(_name, _v) {
  caml_invalid_argument("Gc.Tweak: parameter not found");
}

//Provides: caml_gc_tweak_set
//Requires: caml_invalid_argument
//Version: >= 5.2, < 5.3
//OxCaml
function caml_gc_tweak_set(_name, _value) {
  caml_invalid_argument("Gc.Tweak: parameter not found");
}

//Provides: caml_gc_tweak_list_active const
//Version: >= 5.5
function caml_gc_tweak_list_active(_unit) {
  return 0;
}

//Provides: caml_gc_tweak_list_active
//Version: >= 5.2, < 5.3
//OxCaml
function caml_gc_tweak_list_active(_unit) {
  return 0;
}

//# 1 "+graphics.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2014 Hugo Heuzard

// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.

// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_gr_state
var caml_gr_state;

//Provides: caml_gr_state_get
//Requires: caml_gr_state
//Requires: caml_named_value, caml_string_of_jsbytes
//Requires: caml_maybe_attach_backtrace
function caml_gr_state_get() {
  if (caml_gr_state) {
    return caml_gr_state;
  }
  throw caml_maybe_attach_backtrace([
    0,
    caml_named_value("Graphics.Graphic_failure"),
    caml_string_of_jsbytes("Not initialized"),
  ]);
}
//Provides: caml_gr_state_set
//Requires: caml_gr_state,caml_gr_state_init
function caml_gr_state_set(ctx) {
  caml_gr_state = ctx;
  caml_gr_state_init();
  return 0;
}

//Provides: caml_gr_open_graph
//Requires: caml_gr_state_create
//Requires: caml_gr_state_set
//Requires: caml_failwith
//Requires: caml_jsstring_of_string
function caml_gr_open_graph(info) {
  var info = caml_jsstring_of_string(info);
  function get(name) {
    var res = info.match("(^|,) *" + name + " *= *([a-zA-Z0-9_]+) *(,|$)");
    if (res) return res[2];
  }
  var specs = [];
  if (!(info === "")) specs.push(info);
  var target = get("target");
  if (!target) target = "";
  var status = get("status");
  if (!status) specs.push("status=1");

  var w = get("width");
  w = w ? Number.parseInt(w) : 200;
  specs.push("width=" + w);

  var h = get("height");
  h = h ? Number.parseInt(h) : 200;
  specs.push("height=" + h);

  var win = globalThis.open("about:blank", target, specs.join(","));
  if (!win) {
    caml_failwith("Graphics.open_graph: cannot open the window");
  }
  var doc = win.document;
  var canvas = doc.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  var ctx = caml_gr_state_create(canvas, w, h);
  ctx.set_title = function (title) {
    doc.title = title;
  };
  caml_gr_state_set(ctx);
  var body = doc.body;
  body.style.margin = "0px";
  body.appendChild(canvas);
  return 0;
}

//Provides: caml_gr_state_init
//Requires: caml_gr_state
//Requires: caml_gr_set_color,caml_gr_moveto,caml_gr_resize_window
//Requires: caml_gr_set_line_width,caml_gr_set_text_size,caml_gr_set_font
//Requires: caml_gr_set_window_title
function caml_gr_state_init() {
  caml_gr_moveto(caml_gr_state.x, caml_gr_state.y);
  caml_gr_resize_window(caml_gr_state.width, caml_gr_state.height);
  caml_gr_set_line_width(caml_gr_state.line_width);
  caml_gr_set_text_size(caml_gr_state.text_size);
  caml_gr_set_font(caml_gr_state.font);
  caml_gr_set_color(caml_gr_state.color);
  caml_gr_set_window_title(caml_gr_state.title);
  //caml_gr_resize_window might reset some canvas' properties
  caml_gr_state.context.textBaseline = "bottom";
}

//Provides: caml_gr_state_create
//Requires: caml_string_of_jsbytes
function caml_gr_state_create(canvas, w, h) {
  var context = canvas.getContext("2d");
  // the native X11 backend draws thick lines with round caps and joins
  context.lineCap = "round";
  context.lineJoin = "round";
  return {
    context: context,
    canvas: canvas,
    x: 0,
    y: 0,
    width: w,
    height: h,
    line_width: 1,
    font: caml_string_of_jsbytes("fixed"),
    text_size: 26,
    color: 0x000000,
    title: caml_string_of_jsbytes(""),
  };
}

//Provides: caml_gr_doc_of_state
function caml_gr_doc_of_state(state) {
  if (state.canvas.ownerDocument) return state.canvas.ownerDocument;
}

//Provides: caml_gr_close_graph
//Requires: caml_gr_state_get
function caml_gr_close_graph() {
  var s = caml_gr_state_get();
  s.canvas.width = 0;
  s.canvas.height = 0;
  return 0;
}

//Provides: caml_gr_set_window_title
//Requires: caml_gr_state_get
//Requires: caml_jsstring_of_string
function caml_gr_set_window_title(name) {
  var s = caml_gr_state_get();
  s.title = name;
  var jsname = caml_jsstring_of_string(name);
  if (s.set_title) s.set_title(jsname);
  return 0;
}

//Provides: caml_gr_resize_window
//Requires: caml_gr_state_get
function caml_gr_resize_window(w, h) {
  var s = caml_gr_state_get();
  s.width = w;
  s.height = h;
  if (w !== s.canvas.width) s.canvas.width = w;
  if (h !== s.canvas.height) s.canvas.height = h;
  return 0;
}

//Provides: caml_gr_clear_graph
//Requires: caml_gr_state_get
function caml_gr_clear_graph() {
  var s = caml_gr_state_get();
  s.context.clearRect(0, 0, s.canvas.width, s.canvas.height);
  return 0;
}

//Provides: caml_gr_size_x
//Requires: caml_gr_state_get
function caml_gr_size_x() {
  var s = caml_gr_state_get();
  return s.width;
}
//Provides: caml_gr_size_y
//Requires: caml_gr_state_get
function caml_gr_size_y() {
  var s = caml_gr_state_get();
  return s.height;
}

//Provides: caml_gr_set_color
//Requires: caml_gr_state_get
function caml_gr_set_color(color) {
  var s = caml_gr_state_get();
  function convert(number) {
    var str = "" + number.toString(16);
    while (str.length < 2) str = "0" + str;
    return str;
  }
  var r = (color >> 16) & 0xff,
    g = (color >> 8) & 0xff,
    b = (color >> 0) & 0xff;
  s.color = color;
  var c_str = "#" + convert(r) + convert(g) + convert(b);
  s.context.fillStyle = c_str;
  s.context.strokeStyle = c_str;
  return 0;
}
// Coordinate helpers. Graphics uses a bottom-left origin; the canvas uses a
// top-left origin, so the row of the bottom-left-origin coordinate y is
// height-1-y. Two conventions are used, shared by the JS and the wasm paths:
//   - caml_gr_y: the pixel row itself. plot, point_color, fill_rect and
//     fill_poly address whole pixels, so they use this.
//   - caml_gr_xc / caml_gr_yc: the centre of the pixel (x+0.5, row+0.5).
//     Strokes use it so a 1px line lands crisply on the pixel grid, and
//     curved fills use it so a disc/ellipse is centred on the pixel rather
//     than on the pixel corner (which would shift it half a pixel).

//Provides: caml_gr_y
function caml_gr_y(s, y) {
  return s.height - 1 - y;
}

//Provides: caml_gr_xc
function caml_gr_xc(x) {
  return x + 0.5;
}

//Provides: caml_gr_yc
//Requires: caml_gr_y
function caml_gr_yc(s, y) {
  return caml_gr_y(s, y) + 0.5;
}

//Provides: caml_gr_plot
//Requires: caml_gr_state_get, caml_gr_y
function caml_gr_plot(x, y) {
  var s = caml_gr_state_get();
  var im = s.context.createImageData(1, 1);
  var d = im.data;
  var color = s.color;
  d[0] = (color >> 16) & 0xff; //r
  (d[1] =
    (color >> 8) &
    0xff), //g
    (d[2] = (color >> 0) & 0xff); //b
  d[3] = 0xff; //a
  s.x = x;
  s.y = y;
  s.context.putImageData(im, x, caml_gr_y(s, y));
  return 0;
}

//Provides: caml_gr_point_color
//Requires: caml_gr_state_get, caml_gr_y
function caml_gr_point_color(x, y) {
  var s = caml_gr_state_get();
  var im = s.context.getImageData(x, caml_gr_y(s, y), 1, 1);
  var d = im.data;
  return (d[0] << 16) + (d[1] << 8) + d[2];
}
//Provides: caml_gr_moveto
//Requires: caml_gr_state_get
function caml_gr_moveto(x, y) {
  var s = caml_gr_state_get();
  s.x = x;
  s.y = y;
  return 0;
}

//Provides: caml_gr_current_x
//Requires: caml_gr_state_get
function caml_gr_current_x() {
  var s = caml_gr_state_get();
  return s.x;
}
//Provides: caml_gr_current_y
//Requires: caml_gr_state_get
function caml_gr_current_y() {
  var s = caml_gr_state_get();
  return s.y;
}
//Provides: caml_gr_lineto
//Requires: caml_gr_state_get, caml_gr_xc, caml_gr_yc
function caml_gr_lineto(x, y) {
  var s = caml_gr_state_get();
  s.context.beginPath();
  s.context.moveTo(caml_gr_xc(s.x), caml_gr_yc(s, s.y));
  s.context.lineTo(caml_gr_xc(x), caml_gr_yc(s, y));
  s.context.stroke();
  s.x = x;
  s.y = y;
  return 0;
}
//Provides: caml_gr_draw_rect
//Requires: caml_gr_state_get, caml_gr_xc, caml_gr_yc
function caml_gr_draw_rect(x, y, w, h) {
  var s = caml_gr_state_get();
  // explicit path rather than strokeRect: strokeRect renders its left edge
  // half a pixel off from its right edge in some browsers
  var x0 = caml_gr_xc(x);
  var y0 = caml_gr_yc(s, y);
  var x1 = caml_gr_xc(x + w);
  var y1 = caml_gr_yc(s, y + h);
  s.context.beginPath();
  s.context.moveTo(x0, y0);
  s.context.lineTo(x1, y0);
  s.context.lineTo(x1, y1);
  s.context.lineTo(x0, y1);
  // close with an explicit lineTo, not closePath(): the closePath segment is
  // anti-aliased half a pixel off, while an explicit edge stays crisp
  s.context.lineTo(x0, y0);
  s.context.stroke();
  return 0;
}

//Provides: caml_gr_arc_aux
function caml_gr_arc_aux(ctx, cx, cy, ry, rx, a1, a2) {
  while (a1 > a2) a2 += 360;
  a1 /= 180;
  a2 /= 180;
  var rot = 0,
    xPos,
    yPos,
    xPos_prev,
    yPos_prev;
  var space = 2;
  var num = (((a2 - a1) * Math.PI * ((rx + ry) / 2)) / space) | 0;
  var delta = ((a2 - a1) * Math.PI) / num;
  // negate the angle: the canvas y axis is flipped, so the OCaml angle
  // is the negative of the canvas angle
  var i = -a1 * Math.PI;
  for (var j = 0; j <= num; j++) {
    xPos =
      cx -
      rx * Math.sin(i) * Math.sin(rot * Math.PI) +
      ry * Math.cos(i) * Math.cos(rot * Math.PI);
    xPos = xPos.toFixed(2);
    yPos =
      cy +
      ry * Math.cos(i) * Math.sin(rot * Math.PI) +
      rx * Math.sin(i) * Math.cos(rot * Math.PI);
    yPos = yPos.toFixed(2);
    if (j === 0) {
      ctx.moveTo(xPos, yPos);
    } else if (xPos_prev !== xPos || yPos_prev !== yPos) {
      ctx.lineTo(xPos, yPos);
    }
    xPos_prev = xPos;
    yPos_prev = yPos;
    i -= delta; //ccw
  }
  return 0;
}

//Provides: caml_gr_draw_arc
//Requires: caml_gr_state_get, caml_gr_arc_aux, caml_gr_xc, caml_gr_yc
function caml_gr_draw_arc(x, y, rx, ry, a1, a2) {
  var s = caml_gr_state_get();
  s.context.beginPath();
  caml_gr_arc_aux(s.context, caml_gr_xc(x), caml_gr_yc(s, y), rx, ry, a1, a2);
  s.context.stroke();
  return 0;
}

//Provides: caml_gr_set_line_width
//Requires: caml_gr_state_get
function caml_gr_set_line_width(w) {
  var s = caml_gr_state_get();
  s.line_width = w;
  s.context.lineWidth = w;
  // resizing the canvas resets these to their defaults; restore them
  s.context.lineCap = "round";
  s.context.lineJoin = "round";
  return 0;
}

//Provides: caml_gr_fill_rect
//Requires: caml_gr_state_get, caml_gr_y
function caml_gr_fill_rect(x, y, w, h) {
  var s = caml_gr_state_get();
  // match the native X11 backend, which fills (w+1)x(h+1) pixels: the far
  // edges (column x+w and row y+h) are included. The bottom-left pixel is
  // (x, caml_gr_y(s, y)); fill up and to the right from there.
  s.context.fillRect(x, caml_gr_y(s, y) - h, w + 1, h + 1);
  return 0;
}
//Provides: caml_gr_fill_poly
//Requires: caml_gr_state_get, caml_gr_y
function caml_gr_fill_poly(ar) {
  var s = caml_gr_state_get();
  s.context.beginPath();
  s.context.moveTo(ar[1][1], caml_gr_y(s, ar[1][2]));
  for (var i = 2; i < ar.length; i++)
    s.context.lineTo(ar[i][1], caml_gr_y(s, ar[i][2]));
  s.context.lineTo(ar[1][1], caml_gr_y(s, ar[1][2]));
  s.context.fill();
  return 0;
}

//Provides: caml_gr_fill_arc
//Requires: caml_gr_state_get, caml_gr_arc_aux, caml_gr_xc, caml_gr_yc
function caml_gr_fill_arc(x, y, rx, ry, a1, a2) {
  var s = caml_gr_state_get();
  // centre the arc on the pixel (x, height-1-y), as native does, instead of
  // on the pixel corner (which shifts a filled ellipse/disc half a pixel)
  var cx = caml_gr_xc(x);
  var cy = caml_gr_yc(s, y);
  s.context.beginPath();
  caml_gr_arc_aux(s.context, cx, cy, rx, ry, a1, a2);
  // close through the centre so a partial arc fills a pie slice (like the
  // native X11 backend), not the circular segment a bare fill() would give
  s.context.lineTo(cx, cy);
  s.context.fill();
  return 0;
}

//Provides: caml_gr_draw_str
//Requires: caml_gr_state_get, caml_gr_y
function caml_gr_draw_str(str) {
  var s = caml_gr_state_get();
  var m = s.context.measureText(str);
  var dx = m.width;
  // the text baseline sits at the current point; it is placed one row below
  // the pixel row (the continuous bottom-left-origin coordinate), which is
  // caml_gr_y(s, s.y) + 1
  s.context.fillText(str, s.x, caml_gr_y(s, s.y) + 1);
  s.x += dx | 0;
  return 0;
}

//Provides: caml_gr_draw_char
//Requires: caml_gr_draw_str
function caml_gr_draw_char(c) {
  caml_gr_draw_str(String.fromCharCode(c));
  return 0;
}

//Provides: caml_gr_draw_string
//Requires: caml_gr_draw_str
//Requires: caml_jsstring_of_string
function caml_gr_draw_string(str) {
  caml_gr_draw_str(caml_jsstring_of_string(str));
  return 0;
}

//Provides: caml_gr_set_font
//Requires: caml_gr_state_get
//Requires: caml_jsstring_of_string
function caml_gr_set_font(f) {
  var s = caml_gr_state_get();
  s.font = f;
  s.context.font = s.text_size + "px " + caml_jsstring_of_string(s.font);
  return 0;
}

//Provides: caml_gr_set_text_size
//Requires: caml_gr_state_get
//Requires: caml_jsstring_of_string
function caml_gr_set_text_size(size) {
  var s = caml_gr_state_get();
  s.text_size = size;
  s.context.font = s.text_size + "px " + caml_jsstring_of_string(s.font);
  return 0;
}

//Provides: caml_gr_text_size
//Requires: caml_gr_state_get
//Requires: caml_jsstring_of_string
function caml_gr_text_size(txt) {
  var s = caml_gr_state_get();
  var w = s.context.measureText(caml_jsstring_of_string(txt)).width;
  return [0, w, s.text_size];
}

//Provides: caml_gr_make_image
//Requires: caml_gr_state_get
function caml_gr_make_image(arr) {
  var s = caml_gr_state_get();
  var h = arr.length - 1;
  var w = arr[1].length - 1;
  var im = s.context.createImageData(w, h);
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      var c = arr[i + 1][j + 1];
      var o = i * (w * 4) + j * 4;
      if (c === -1) {
        im.data[o + 0] = 0;
        im.data[o + 1] = 0;
        im.data[o + 2] = 0;
        im.data[o + 3] = 0;
      } else {
        im.data[o + 0] = (c >> 16) & 0xff;
        im.data[o + 1] = (c >> 8) & 0xff;
        im.data[o + 2] = (c >> 0) & 0xff;
        im.data[o + 3] = 0xff;
      }
    }
  }
  return im;
}
//Provides: caml_gr_dump_image
//Requires: caml_gr_state_get
function caml_gr_dump_image(im) {
  var data = [0];
  for (var i = 0; i < im.height; i++) {
    data[i + 1] = [0];
    for (var j = 0; j < im.width; j++) {
      var o = i * (im.width * 4) + j * 4,
        r = im.data[o + 0],
        g = im.data[o + 1],
        b = im.data[o + 2];
      data[i + 1][j + 1] = (r << 16) + (g << 8) + b;
    }
  }
  return data;
}
//Provides: caml_gr_draw_image
//Requires: caml_gr_state_get, caml_gr_y
function caml_gr_draw_image(im, x, y) {
  var s = caml_gr_state_get();
  if (!im.image) {
    var canvas = document.createElement("canvas");
    canvas.width = s.width;
    canvas.height = s.height;
    canvas.getContext("2d").putImageData(im, 0, 0);
    // a canvas is a valid drawImage source immediately, so draw it
    // directly instead of round-tripping through an Image + data URL
    // (which made the first draw asynchronous)
    im.image = canvas;
  }
  // the image's bottom row is caml_gr_y(s, y); drawImage takes the top-left
  s.context.drawImage(im.image, x, caml_gr_y(s, y) - im.height + 1);
  return 0;
}
//Provides: caml_gr_create_image
//Requires: caml_gr_state_get
function caml_gr_create_image(x, y) {
  var s = caml_gr_state_get();
  return s.context.createImageData(x, y);
}
//Provides: caml_gr_blit_image
//Requires: caml_gr_state_get, caml_gr_y
function caml_gr_blit_image(im, x, y) {
  var s = caml_gr_state_get();
  // the image's bottom row is caml_gr_y(s, y); getImageData takes the top-left
  var im2 = s.context.getImageData(
    x,
    caml_gr_y(s, y) - im.height + 1,
    im.width,
    im.height,
  );
  for (var i = 0; i < im2.data.length; i += 4) {
    im.data[i] = im2.data[i];
    im.data[i + 1] = im2.data[i + 1];
    im.data[i + 2] = im2.data[i + 2];
    im.data[i + 3] = im2.data[i + 3];
  }
  return 0;
}
//Provides: caml_gr_sigio_handler
function caml_gr_sigio_handler() {
  return 0;
}
//Provides: caml_gr_sigio_signal
function caml_gr_sigio_signal() {
  return 0;
}
//Provides: caml_gr_wait_event
//Requires: caml_failwith
function caml_gr_wait_event(_evl) {
  caml_failwith("caml_gr_wait_event not Implemented: use Graphics_js instead");
}

//Provides: caml_gr_synchronize
//Requires: caml_failwith
function caml_gr_synchronize() {
  caml_failwith("caml_gr_synchronize not Implemented");
}
//Provides: caml_gr_remember_mode
//Requires: caml_failwith
function caml_gr_remember_mode() {
  caml_failwith("caml_gr_remember_mode not Implemented");
}
//Provides: caml_gr_display_mode
//Requires: caml_failwith
function caml_gr_display_mode() {
  caml_failwith("caml_gr_display_mode not Implemented");
}

//Provides: caml_gr_window_id
//Requires: caml_failwith
function caml_gr_window_id(_a) {
  caml_failwith("caml_gr_window_id not Implemented");
}

//Provides: caml_gr_open_subwindow
//Requires: caml_failwith
function caml_gr_open_subwindow(_a, _b, _c, _d) {
  caml_failwith("caml_gr_open_subwindow not Implemented");
}

//Provides: caml_gr_close_subwindow
//Requires: caml_failwith
function caml_gr_close_subwindow(_a) {
  caml_failwith("caml_gr_close_subwindow not Implemented");
}

// ---- Wasm helpers ----
// These functions take/return plain JS values (ints, JS strings, JS objects)
// and access caml_gr_state directly. State checking is done in WAT.

//Provides: gr_state_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_state_for_wasm() {
  if (caml_gr_state) return caml_gr_state;
  return null;
}

//Provides: gr_state_create_for_wasm
//If: wasm
function gr_state_create_for_wasm(canvas, w, h) {
  var context = canvas.getContext("2d");
  context.lineCap = "round";
  context.lineJoin = "round";
  return {
    context: context,
    canvas: canvas,
    x: 0,
    y: 0,
    width: w,
    height: h,
    line_width: 1,
    font: "fixed",
    text_size: 26,
    color: 0x000000,
    title: "",
  };
}

//Provides: gr_state_init_for_wasm
//Requires: caml_gr_state
//Requires: gr_set_color_for_wasm, gr_moveto_for_wasm, gr_resize_window_for_wasm
//Requires: gr_set_line_width_for_wasm, gr_set_text_size_for_wasm
//Requires: gr_set_font_for_wasm, gr_set_window_title_for_wasm
//If: wasm
function gr_state_init_for_wasm() {
  var s = caml_gr_state;
  gr_moveto_for_wasm(s.x, s.y);
  gr_resize_window_for_wasm(s.width, s.height);
  gr_set_line_width_for_wasm(s.line_width);
  gr_set_text_size_for_wasm(s.text_size);
  gr_set_font_for_wasm(s.font);
  gr_set_color_for_wasm(s.color);
  gr_set_window_title_for_wasm(s.title);
  s.context.textBaseline = "bottom";
}

//Provides: gr_state_set_for_wasm
//Requires: caml_gr_state, gr_state_init_for_wasm
//If: wasm
function gr_state_set_for_wasm(ctx) {
  caml_gr_state = ctx;
  gr_state_init_for_wasm();
}

//Provides: gr_open_for_wasm
//Requires: gr_state_create_for_wasm, gr_state_set_for_wasm
//If: wasm
function gr_open_for_wasm(info) {
  function get(name) {
    var res = info.match("(^|,) *" + name + " *= *([a-zA-Z0-9_]+) *(,|$)");
    if (res) return res[2];
  }
  var specs = [];
  if (!(info === "")) specs.push(info);
  var target = get("target");
  if (!target) target = "";
  var status = get("status");
  if (!status) specs.push("status=1");
  var w = get("width");
  w = w ? Number.parseInt(w) : 200;
  specs.push("width=" + w);
  var h = get("height");
  h = h ? Number.parseInt(h) : 200;
  specs.push("height=" + h);
  var win = globalThis.open("about:blank", target, specs.join(","));
  if (!win) return -1;
  var doc = win.document;
  var canvas = doc.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  var ctx = gr_state_create_for_wasm(canvas, w, h);
  ctx.set_title = function (title) {
    doc.title = title;
  };
  gr_state_set_for_wasm(ctx);
  var body = doc.body;
  body.style.margin = "0px";
  body.appendChild(canvas);
  return 0;
}

//Provides: gr_close_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_close_for_wasm() {
  caml_gr_state.canvas.width = 0;
  caml_gr_state.canvas.height = 0;
}

//Provides: gr_clear_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_clear_for_wasm() {
  var s = caml_gr_state;
  s.context.clearRect(0, 0, s.canvas.width, s.canvas.height);
}

//Provides: gr_size_x_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_size_x_for_wasm() {
  return caml_gr_state.width;
}

//Provides: gr_size_y_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_size_y_for_wasm() {
  return caml_gr_state.height;
}

//Provides: gr_current_x_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_current_x_for_wasm() {
  return caml_gr_state.x;
}

//Provides: gr_current_y_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_current_y_for_wasm() {
  return caml_gr_state.y;
}

//Provides: gr_moveto_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_moveto_for_wasm(x, y) {
  caml_gr_state.x = x;
  caml_gr_state.y = y;
}

//Provides: gr_set_color_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_set_color_for_wasm(color) {
  var s = caml_gr_state;
  function convert(number) {
    var str = "" + number.toString(16);
    while (str.length < 2) str = "0" + str;
    return str;
  }
  var r = (color >> 16) & 0xff,
    g = (color >> 8) & 0xff,
    b = (color >> 0) & 0xff;
  s.color = color;
  var c_str = "#" + convert(r) + convert(g) + convert(b);
  s.context.fillStyle = c_str;
  s.context.strokeStyle = c_str;
}

//Provides: gr_plot_for_wasm
//Requires: caml_gr_state, caml_gr_y
//If: wasm
function gr_plot_for_wasm(x, y) {
  var s = caml_gr_state;
  var im = s.context.createImageData(1, 1);
  var d = im.data;
  var color = s.color;
  d[0] = (color >> 16) & 0xff;
  d[1] = (color >> 8) & 0xff;
  d[2] = (color >> 0) & 0xff;
  d[3] = 0xff;
  s.x = x;
  s.y = y;
  s.context.putImageData(im, x, caml_gr_y(s, y));
}

//Provides: gr_point_color_for_wasm
//Requires: caml_gr_state, caml_gr_y
//If: wasm
function gr_point_color_for_wasm(x, y) {
  var s = caml_gr_state;
  var im = s.context.getImageData(x, caml_gr_y(s, y), 1, 1);
  var d = im.data;
  return (d[0] << 16) + (d[1] << 8) + d[2];
}

//Provides: gr_lineto_for_wasm
//Requires: caml_gr_state, caml_gr_xc, caml_gr_yc
//If: wasm
function gr_lineto_for_wasm(x, y) {
  var s = caml_gr_state;
  s.context.beginPath();
  s.context.moveTo(caml_gr_xc(s.x), caml_gr_yc(s, s.y));
  s.context.lineTo(caml_gr_xc(x), caml_gr_yc(s, y));
  s.context.stroke();
  s.x = x;
  s.y = y;
}

//Provides: gr_draw_rect_for_wasm
//Requires: caml_gr_state, caml_gr_xc, caml_gr_yc
//If: wasm
function gr_draw_rect_for_wasm(x, y, w, h) {
  var s = caml_gr_state;
  // explicit path (see caml_gr_draw_rect): strokeRect can render its left
  // edge half a pixel off from its right edge
  var x0 = caml_gr_xc(x);
  var y0 = caml_gr_yc(s, y);
  var x1 = caml_gr_xc(x + w);
  var y1 = caml_gr_yc(s, y + h);
  s.context.beginPath();
  s.context.moveTo(x0, y0);
  s.context.lineTo(x1, y0);
  s.context.lineTo(x1, y1);
  s.context.lineTo(x0, y1);
  s.context.lineTo(x0, y0);
  s.context.stroke();
}

//Provides: gr_fill_rect_for_wasm
//Requires: caml_gr_state, caml_gr_y
//If: wasm
function gr_fill_rect_for_wasm(x, y, w, h) {
  // match the native X11 backend: fill (w+1)x(h+1) pixels (see caml_gr_fill_rect)
  var s = caml_gr_state;
  s.context.fillRect(x, caml_gr_y(s, y) - h, w + 1, h + 1);
}

//Provides: gr_draw_arc_for_wasm
//Requires: caml_gr_state, caml_gr_arc_aux, caml_gr_xc, caml_gr_yc
//If: wasm
function gr_draw_arc_for_wasm(x, y, rx, ry, a1, a2) {
  var s = caml_gr_state;
  s.context.beginPath();
  caml_gr_arc_aux(s.context, caml_gr_xc(x), caml_gr_yc(s, y), rx, ry, a1, a2);
  s.context.stroke();
}

//Provides: gr_fill_arc_for_wasm
//Requires: caml_gr_state, caml_gr_arc_aux, caml_gr_xc, caml_gr_yc
//If: wasm
function gr_fill_arc_for_wasm(x, y, rx, ry, a1, a2) {
  var s = caml_gr_state;
  var cx = caml_gr_xc(x);
  var cy = caml_gr_yc(s, y);
  s.context.beginPath();
  caml_gr_arc_aux(s.context, cx, cy, rx, ry, a1, a2);
  // pie slice (close through the centre), matching native fill_arc
  s.context.lineTo(cx, cy);
  s.context.fill();
}

//Provides: gr_set_line_width_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_set_line_width_for_wasm(w) {
  caml_gr_state.line_width = w;
  caml_gr_state.context.lineWidth = w;
  caml_gr_state.context.lineCap = "round";
  caml_gr_state.context.lineJoin = "round";
}

//Provides: gr_resize_window_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_resize_window_for_wasm(w, h) {
  var s = caml_gr_state;
  s.width = w;
  s.height = h;
  if (w !== s.canvas.width) s.canvas.width = w;
  if (h !== s.canvas.height) s.canvas.height = h;
}

//Provides: gr_draw_char_for_wasm
//Requires: gr_draw_str_for_wasm
//If: wasm
function gr_draw_char_for_wasm(c) {
  gr_draw_str_for_wasm(String.fromCharCode(c));
}

//Provides: gr_draw_str_for_wasm
//Requires: caml_gr_state, caml_gr_y
//If: wasm
function gr_draw_str_for_wasm(str) {
  var s = caml_gr_state;
  var m = s.context.measureText(str);
  var dx = m.width;
  // text baseline = current point, one row below the pixel (see caml_gr_draw_str)
  s.context.fillText(str, s.x, caml_gr_y(s, s.y) + 1);
  s.x += dx | 0;
}

//Provides: gr_set_font_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_set_font_for_wasm(f) {
  var s = caml_gr_state;
  s.font = f;
  s.context.font = s.text_size + "px " + f;
}

//Provides: gr_set_text_size_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_set_text_size_for_wasm(size) {
  var s = caml_gr_state;
  s.text_size = size;
  s.context.font = s.text_size + "px " + s.font;
}

//Provides: gr_set_window_title_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_set_window_title_for_wasm(name) {
  var s = caml_gr_state;
  s.title = name;
  if (s.set_title) s.set_title(name);
}

//Provides: gr_text_size_w_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_text_size_w_for_wasm(txt) {
  return caml_gr_state.context.measureText(txt).width | 0;
}

//Provides: gr_text_size_h_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_text_size_h_for_wasm() {
  return caml_gr_state.text_size;
}

//Provides: gr_fill_poly_for_wasm
//Requires: caml_gr_state, caml_gr_y
//If: wasm
function gr_fill_poly_for_wasm(ar, n) {
  var s = caml_gr_state;
  s.context.beginPath();
  s.context.moveTo(ar[0], caml_gr_y(s, ar[1]));
  for (var i = 1; i < n; i++)
    s.context.lineTo(ar[i * 2], caml_gr_y(s, ar[i * 2 + 1]));
  s.context.lineTo(ar[0], caml_gr_y(s, ar[1]));
  s.context.fill();
}

//Provides: gr_create_image_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_create_image_for_wasm(x, y) {
  return caml_gr_state.context.createImageData(x, y);
}

//Provides: gr_draw_image_for_wasm
//Requires: caml_gr_state, caml_gr_y
//If: wasm
function gr_draw_image_for_wasm(im, x, y) {
  var s = caml_gr_state;
  if (!im.image) {
    var canvas = document.createElement("canvas");
    canvas.width = s.width;
    canvas.height = s.height;
    canvas.getContext("2d").putImageData(im, 0, 0);
    // a canvas is a valid drawImage source immediately, so draw it
    // directly instead of round-tripping through an Image + data URL
    // (which made the first draw asynchronous)
    im.image = canvas;
  }
  // the image's bottom row is caml_gr_y(s, y); drawImage takes the top-left
  s.context.drawImage(im.image, x, caml_gr_y(s, y) - im.height + 1);
}

//Provides: gr_blit_image_for_wasm
//Requires: caml_gr_state, caml_gr_y
//If: wasm
function gr_blit_image_for_wasm(im, x, y) {
  var s = caml_gr_state;
  // the image's bottom row is caml_gr_y(s, y); getImageData takes the top-left
  var im2 = s.context.getImageData(
    x,
    caml_gr_y(s, y) - im.height + 1,
    im.width,
    im.height,
  );
  for (var i = 0; i < im2.data.length; i += 4) {
    im.data[i] = im2.data[i];
    im.data[i + 1] = im2.data[i + 1];
    im.data[i + 2] = im2.data[i + 2];
    im.data[i + 3] = im2.data[i + 3];
  }
}

//Provides: gr_make_image_for_wasm
//Requires: caml_gr_state
//If: wasm
function gr_make_image_for_wasm(pixels, w, h) {
  var s = caml_gr_state;
  var im = s.context.createImageData(w, h);
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      var c = pixels[i * w + j];
      var o = i * (w * 4) + j * 4;
      if (c === -1) {
        im.data[o + 0] = 0;
        im.data[o + 1] = 0;
        im.data[o + 2] = 0;
        im.data[o + 3] = 0;
      } else {
        im.data[o + 0] = (c >> 16) & 0xff;
        im.data[o + 1] = (c >> 8) & 0xff;
        im.data[o + 2] = (c >> 0) & 0xff;
        im.data[o + 3] = 0xff;
      }
    }
  }
  return im;
}

//Provides: gr_dump_image_width_for_wasm
//If: wasm
function gr_dump_image_width_for_wasm(im) {
  return im.width;
}

//Provides: gr_dump_image_height_for_wasm
//If: wasm
function gr_dump_image_height_for_wasm(im) {
  return im.height;
}

//Provides: gr_dump_image_pixel_for_wasm
//If: wasm
function gr_dump_image_pixel_for_wasm(im, i, j) {
  var o = i * (im.width * 4) + j * 4;
  return (im.data[o] << 16) + (im.data[o + 1] << 8) + im.data[o + 2];
}

//Provides: gr_doc_of_state_for_wasm
//If: wasm
function gr_doc_of_state_for_wasm(state) {
  if (state.canvas.ownerDocument) return state.canvas.ownerDocument;
  return null;
}

//# 1 "+hash.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

///////////// Hashtbl

//function ROTL32(x,n) { return ((x << n) | (x >>> (32-n))); }
//Provides: caml_hash_mix_int
//Requires: caml_mul
function caml_hash_mix_int(h, d) {
  d = caml_mul(d, 0xcc9e2d51 | 0);
  d = (d << 15) | (d >>> (32 - 15)); // ROTL32(d, 15);
  d = caml_mul(d, 0x1b873593);
  h ^= d;
  h = (h << 13) | (h >>> (32 - 13)); //ROTL32(h, 13);
  return (((h + (h << 2)) | 0) + (0xe6546b64 | 0)) | 0;
}

//Provides: caml_hash_mix_final
//Requires: caml_mul
function caml_hash_mix_final(h) {
  h ^= h >>> 16;
  h = caml_mul(h, 0x85ebca6b | 0);
  h ^= h >>> 13;
  h = caml_mul(h, 0xc2b2ae35 | 0);
  h ^= h >>> 16;
  return h;
}

//Provides: caml_hash_mix_float
//Requires: caml_int64_bits_of_float
//Requires: caml_hash_mix_int
//Requires: caml_int64_lo32, caml_int64_hi32
function caml_hash_mix_float(hash, v0) {
  var i64 = caml_int64_bits_of_float(v0);
  var l = caml_int64_lo32(i64);
  var h = caml_int64_hi32(i64);
  /* Normalize NaNs */
  if ((h & 0x7ff00000) === 0x7ff00000 && (l | (h & 0xfffff)) !== 0) {
    h = 0x7ff00000;
    l = 0x00000001;
  } else if (h === (0x80000000 | 0) && l === 0) {
    /* Normalize -0 into +0 */
    // This code path is not used by caml_hash because 0 and -0 look
    // like integers
    h = 0;
  }
  hash = caml_hash_mix_int(hash, l);
  hash = caml_hash_mix_int(hash, h);
  return hash;
}
//Provides: caml_hash_mix_int64
//Requires: caml_hash_mix_int
//Requires: caml_int64_lo32, caml_int64_hi32
function caml_hash_mix_int64(h, v) {
  h = caml_hash_mix_int(h, caml_int64_lo32(v));
  h = caml_hash_mix_int(h, caml_int64_hi32(v));
  return h;
}

//Provides: caml_hash_mix_jsbytes
//Requires: caml_hash_mix_int
function caml_hash_mix_jsbytes(h, s) {
  var len = s.length,
    i,
    w;
  for (i = 0; i + 4 <= len; i += 4) {
    w =
      s.charCodeAt(i) |
      (s.charCodeAt(i + 1) << 8) |
      (s.charCodeAt(i + 2) << 16) |
      (s.charCodeAt(i + 3) << 24);
    h = caml_hash_mix_int(h, w);
  }
  w = 0;
  switch (len & 3) {
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
    case 3:
      w = s.charCodeAt(i + 2) << 16;
    // falls through
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
    case 2:
      w |= s.charCodeAt(i + 1) << 8;
    // falls through
    case 1:
      w |= s.charCodeAt(i);
      h = caml_hash_mix_int(h, w);
  }
  h ^= len;
  return h;
}

//Provides: caml_hash_mix_bytes_arr
//Requires: caml_hash_mix_int
function caml_hash_mix_bytes_arr(h, s) {
  var len = s.length,
    i,
    w;
  for (i = 0; i + 4 <= len; i += 4) {
    w = s[i] | (s[i + 1] << 8) | (s[i + 2] << 16) | (s[i + 3] << 24);
    h = caml_hash_mix_int(h, w);
  }
  w = 0;
  switch (len & 3) {
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
    case 3:
      w = s[i + 2] << 16;
    // falls through
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
    case 2:
      w |= s[i + 1] << 8;
    // falls through
    case 1:
      w |= s[i];
      h = caml_hash_mix_int(h, w);
  }
  h ^= len;
  return h;
}

//Provides: caml_hash_mix_bytes
//Requires: caml_ml_bytes_content
//Requires: caml_hash_mix_jsbytes
//Requires: caml_hash_mix_bytes_arr
function caml_hash_mix_bytes(h, v) {
  var content = caml_ml_bytes_content(v);
  if (typeof content === "string") return caml_hash_mix_jsbytes(h, content);
  /* ARRAY */ else return caml_hash_mix_bytes_arr(h, content);
}

//Provides: caml_hash_mix_string
//Requires: caml_hash_mix_jsbytes, caml_jsbytes_of_string
function caml_hash_mix_string(h, v) {
  return caml_hash_mix_jsbytes(h, caml_jsbytes_of_string(v));
}

//Provides: caml_jsstring_is_bytes
function caml_jsstring_is_bytes(s) {
  // Whether every code unit fits in a byte, i.e. no code point above U+00FF.
  for (var i = 0; i < s.length; i++) if (s.charCodeAt(i) > 0xff) return false;
  return true;
}

//Provides: caml_hash_mix_jsstring
//Requires: caml_hash_mix_jsbytes, caml_hash_mix_int, caml_jsstring_is_bytes
function caml_hash_mix_jsstring(h, s) {
  // A string whose code units all fit in a byte (every ASCII string, all of
  // Latin-1, and any raw byte string) is mixed four per word, leaving its hash
  // unchanged and, for an OCaml string's bytes, matching the OCaml string hash.
  if (caml_jsstring_is_bytes(s)) return caml_hash_mix_jsbytes(h, s);
  // Genuine Unicode text: mix two 16-bit code units per word, so no information
  // is lost. Packing the code units four per word at byte offsets (as for a
  // byte string) would overlap their high bits.
  var len = s.length,
    i,
    w;
  for (i = 0; i + 2 <= len; i += 2) {
    w = s.charCodeAt(i) | (s.charCodeAt(i + 1) << 16);
    h = caml_hash_mix_int(h, w);
  }
  if (len & 1) h = caml_hash_mix_int(h, s.charCodeAt(i));
  return h ^ len;
}

//Provides: caml_hash mutable
//Requires: caml_is_ml_string, caml_is_ml_bytes
//Requires: caml_hash_mix_int, caml_hash_mix_final
//Requires: caml_hash_mix_float, caml_hash_mix_string, caml_hash_mix_bytes, caml_custom_ops
//Requires: caml_hash_mix_jsstring
//Requires: caml_is_continuation_tag
function caml_hash(count, limit, seed, obj) {
  var queue, rd, wr, sz, num, h, v, i, len;
  sz = limit;
  if (sz < 0 || sz > 256) sz = 256;
  num = count;
  h = seed;
  queue = [obj];
  rd = 0;
  wr = 1;
  while (rd < wr && num > 0) {
    v = queue[rd++];
    if (v?.caml_custom) {
      if (
        caml_custom_ops[v.caml_custom] &&
        caml_custom_ops[v.caml_custom].hash
      ) {
        var hh = caml_custom_ops[v.caml_custom].hash(v);
        h = caml_hash_mix_int(h, hh);
        num--;
      }
    } else if (Array.isArray(v) && v[0] === (v[0] | 0)) {
      switch (v[0]) {
        case 248:
          // Object
          h = caml_hash_mix_int(h, v[2]);
          num--;
          break;
        case 250:
          // Forward
          queue[--rd] = v[1];
          break;
        case 251:
          // Abstract: block contents unknown, do nothing
          break;
        case 254:
          // Double_array_tag: mix the elements directly, no header
          for (i = 1, len = v.length; i < len; i++) {
            h = caml_hash_mix_float(h, v[i]);
            num--;
            if (num <= 0) break;
          }
          break;
        default:
          if (caml_is_continuation_tag(v[0])) {
            /* All continuations hash to the same value,
             since we have no idea how to distinguish them. */
            break;
          }
          var tag = ((v.length - 1) << 10) | v[0];
          h = caml_hash_mix_int(h, tag);
          for (i = 1, len = v.length; i < len; i++) {
            if (wr >= sz) break;
            queue[wr++] = v[i];
          }
          break;
      }
    } else if (caml_is_ml_bytes(v)) {
      h = caml_hash_mix_bytes(h, v);
      num--;
    } else if (caml_is_ml_string(v)) {
      h = caml_hash_mix_string(h, v);
      num--;
    } else if (typeof v === "string") {
      h = caml_hash_mix_jsstring(h, v);
      num--;
    } else if (v === (v | 0)) {
      // Integer
      h = caml_hash_mix_int(h, v + v + 1);
      num--;
    } else if (typeof v === "number") {
      // Float
      h = caml_hash_mix_float(h, v);
      num--;
    }
  }
  h = caml_hash_mix_final(h);
  return h & 0x3fffffff;
}

//Provides: caml_hash_exn
//Requires: caml_hash
//Version: >= 5.2, < 5.3
//OxCaml
var caml_hash_exn = caml_hash;

//Provides: caml_string_hash
//Requires: caml_hash_mix_final, caml_hash_mix_string
//Version: >= 5.0
function caml_string_hash(h, v) {
  var h = caml_hash_mix_string(h, v);
  var h = caml_hash_mix_final(h);
  return h & 0x3fffffff;
}

//# 1 "+ieee_754.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: jsoo_dataview
var jsoo_dataview = new DataView(new ArrayBuffer(8));

//Provides: caml_int64_bits_of_float const
//Requires: caml_int64_create_lo_mi_hi
//Requires: jsoo_dataview
function caml_int64_bits_of_float(x) {
  jsoo_dataview.setFloat64(0, x, true);
  var lo32 = jsoo_dataview.getUint32(0, true);
  var hi32 = jsoo_dataview.getUint32(4, true);
  var lo = lo32 & 0xffffff;
  var mi = (lo32 >>> 24) | ((hi32 << 8) & 0xffffff);
  var hi = (hi32 >>> 16) & 0xffff;
  // V8 uses signaling NaNs as sentinel. So, NaNs are made quiet when
  // they are stored in an array. Make them quiet here so that we get
  // consistent results.
  if ((hi & 0x7ff8) === 0x7ff0 && (mi | lo | (hi & 0xf)) !== 0) hi |= 8;
  return caml_int64_create_lo_mi_hi(lo, mi, hi);
}

//Provides: caml_int32_bits_of_float const
//Requires: jsoo_dataview
function caml_int32_bits_of_float(x) {
  jsoo_dataview.setFloat32(0, x, true);
  return jsoo_dataview.getUint32(0, true) | 0;
}

//FP literals can be written using the hexadecimal
//notation 0x<mantissa in hex>p<exponent> from ISO C99.
//https://github.com/dankogai/js-hexfloat/blob/master/hexfloat.js
//Provides: caml_hexstring_of_float const
//Requires: caml_string_of_jsstring, caml_str_repeat
function caml_hexstring_of_float(x, prec, style) {
  if (!Number.isFinite(x)) {
    if (Number.isNaN(x)) return caml_string_of_jsstring("nan");
    return caml_string_of_jsstring(x > 0 ? "infinity" : "-infinity");
  }
  var sign = x === 0 && 1 / x === Number.NEGATIVE_INFINITY ? 1 : x >= 0 ? 0 : 1;
  if (sign) x = -x;
  var exp = 0;
  if (x === 0) {
  } else if (x < 1) {
    while (x < 1 && exp > -1022) {
      x *= 2;
      exp--;
    }
  } else {
    while (x >= 2) {
      x /= 2;
      exp++;
    }
  }
  var exp_sign = exp < 0 ? "" : "+";
  var sign_str = "";
  if (sign) sign_str = "-";
  else {
    switch (style) {
      case 43 /* '+' */:
        sign_str = "+";
        break;
      case 32 /* ' ' */:
        sign_str = " ";
        break;
      default:
        break;
    }
  }
  if (prec >= 0 && prec < 13) {
    /* If a precision is given, and is small, round mantissa accordingly */
    var cst = Math.pow(2, prec * 4);
    x = Math.round(x * cst) / cst;
  }
  var x_str = x.toString(16);
  if (prec >= 0) {
    var idx = x_str.indexOf(".");
    if (idx < 0) {
      x_str += "." + caml_str_repeat(prec, "0");
    } else {
      var size = idx + 1 + prec;
      if (x_str.length < size)
        x_str += caml_str_repeat(size - x_str.length, "0");
      else x_str = x_str.slice(0, size);
    }
  }
  return caml_string_of_jsstring(
    sign_str + "0x" + x_str + "p" + exp_sign + exp.toString(10),
  );
}

//Provides: caml_int64_float_of_bits const
//Requires: jsoo_dataview
function caml_int64_float_of_bits(x) {
  var lo = x.lo;
  var mi = x.mi;
  var hi = x.hi;
  // V8 uses signaling NaNs as sentinel. So, NaNs are made quiet when
  // they are stored in an array. Make them quiet here so that we get
  // consistent results.
  if ((hi & 0x7ff8) === 0x7ff0 && (mi | lo | (hi & 0xf)) !== 0) hi |= 8;
  jsoo_dataview.setUint32(0, lo | (mi << 24), true);
  jsoo_dataview.setUint32(4, (mi >>> 8) | (hi << 16), true);
  return jsoo_dataview.getFloat64(0, true);
}

//Provides: caml_nextafter_float const
//Requires: caml_int64_float_of_bits, caml_int64_bits_of_float, caml_int64_add, caml_int64_sub,caml_int64_of_int32
function caml_nextafter_float(x, y) {
  if (Number.isNaN(x) || Number.isNaN(y)) return Number.NaN;
  if (x === y) return y;
  if (x === 0) {
    if (y < 0) return -Math.pow(2, -1074);
    else return Math.pow(2, -1074);
  }
  var bits = caml_int64_bits_of_float(x);
  var one = caml_int64_of_int32(1);
  if (x < y === x > 0) bits = caml_int64_add(bits, one);
  else bits = caml_int64_sub(bits, one);
  return caml_int64_float_of_bits(bits);
}

//Provides: caml_trunc_float const
function caml_trunc_float(x) {
  return Math.trunc(x);
}

//Provides: caml_int32_float_of_bits const
//Requires: jsoo_dataview
function caml_int32_float_of_bits(x) {
  jsoo_dataview.setUint32(0, x, true);
  return jsoo_dataview.getFloat32(0, true);
}

//Provides: caml_classify_float const
function caml_classify_float(x) {
  if (Number.isFinite(x)) {
    if (Math.abs(x) >= 2.2250738585072014e-308) return 0;
    if (x !== 0) return 1;
    return 2;
  }
  return Number.isNaN(x) ? 4 : 3;
}
//Provides: caml_modf_float const
function caml_modf_float(x) {
  if (Number.isFinite(x)) {
    var neg = 1 / x < 0;
    x = Math.abs(x);
    var i = Math.floor(x);
    var f = x - i;
    if (neg) {
      i = -i;
      f = -f;
    }
    return [0, f, i];
  }
  if (Number.isNaN(x)) return [0, Number.NaN, Number.NaN];
  return [0, 1 / x, x];
}
//Provides: caml_ldexp_float const
function caml_ldexp_float(x, exp) {
  // musl's scalbn: scaling down goes through 2^-1022 * 2^53 so that
  // the intermediate values stay normal; the only rounding happens in
  // the final multiplication
  exp |= 0;
  if (exp > 1023) {
    exp -= 1023;
    x *= Math.pow(2, 1023);
    if (exp > 1023) {
      // in case x is subnormal
      exp -= 1023;
      x *= Math.pow(2, 1023);
      if (exp > 1023) exp = 1023;
    }
  } else if (exp < -1022) {
    exp += 1022 - 53;
    x *= Math.pow(2, -1022) * Math.pow(2, 53);
    if (exp < -1022) {
      exp += 1022 - 53;
      x *= Math.pow(2, -1022) * Math.pow(2, 53);
      if (exp < -1022) exp = -1022;
    }
  }
  x *= Math.pow(2, exp);
  return x;
}
//Provides: caml_frexp_float const
function caml_frexp_float(x) {
  if (x === 0 || !Number.isFinite(x)) return [0, x, 0];
  var neg = x < 0;
  if (neg) x = -x;
  var exp = Math.max(-1023, Math.floor(Math.log2(x)) + 1);
  x *= Math.pow(2, -exp);
  while (x < 0.5) {
    x *= 2;
    exp--;
  }
  while (x >= 1) {
    x *= 0.5;
    exp++;
  }
  if (neg) x = -x;
  return [0, x, exp];
}

//Provides: caml_float_compare const
function caml_float_compare(x, y) {
  if (x === y) return 0;
  if (x < y) return -1;
  if (x > y) return 1;
  if (!Number.isNaN(x)) return 1;
  if (!Number.isNaN(y)) return -1;
  return 0;
}

//Provides: caml_copysign_float const
function caml_copysign_float(x, y) {
  if (y === 0) y = 1 / y;
  x = Math.abs(x);
  return y < 0 ? -x : x;
}

//Provides: caml_signbit_float const
//Alias: caml_signbit
function caml_signbit_float(x) {
  if (x === 0) x = 1 / x;
  return x < 0 ? 1 : 0;
}

//Provides: caml_expm1_float const
function caml_expm1_float(x) {
  return Math.expm1(x);
}
//Provides: caml_exp2_float const
function caml_exp2_float(x) {
  return Math.pow(2, x);
}
//Provides: caml_log1p_float const
function caml_log1p_float(x) {
  return Math.log1p(x);
}
//Provides: caml_log2_float const
function caml_log2_float(x) {
  return Math.log2(x);
}
//Provides: caml_hypot_float const
function caml_hypot_float(x, y) {
  return Math.hypot(x, y);
}
//Provides: caml_log10_float const
function caml_log10_float(x) {
  return Math.log10(x);
}
//Provides: caml_cosh_float const
function caml_cosh_float(x) {
  return Math.cosh(x);
}
//Provides: caml_acosh_float const
function caml_acosh_float(x) {
  return Math.acosh(x);
}
//Provides: caml_sinh_float const
function caml_sinh_float(x) {
  return Math.sinh(x);
}
//Provides: caml_asinh_float const
function caml_asinh_float(x) {
  return Math.asinh(x);
}
//Provides: caml_tanh_float const
function caml_tanh_float(x) {
  return Math.tanh(x);
}
//Provides: caml_atanh_float const
function caml_atanh_float(x) {
  return Math.atanh(x);
}
//Provides: caml_round_float const
function caml_round_float(x) {
  if (x >= 0) {
    var y = Math.floor(x);
    return x - y >= 0.5 ? y + 1 : y;
  } else {
    var y = Math.ceil(x);
    return y - x >= 0.5 ? y - 1 : y;
  }
}
//Provides: caml_cbrt_float const
function caml_cbrt_float(x) {
  return Math.cbrt(x);
}

//Provides: caml_erf_float const
function caml_erf_float(x) {
  var a1 = 0.254829592;
  var a2 = -0.284496736;
  var a3 = 1.421413741;
  var a4 = -1.453152027;
  var a5 = 1.061405429;
  var p = 0.3275911;

  var sign = 1;
  if (x < 0) {
    sign = -1;
  }
  x = Math.abs(x);
  var t = 1.0 / (1.0 + p * x);
  var y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

//Provides: caml_erfc_float const
//Requires: caml_erf_float
function caml_erfc_float(x) {
  return 1 - caml_erf_float(x);
}

//Provides: caml_fma_float const
function caml_fma_float(x, y, z) {
  var SPLIT = Math.pow(2, 27) + 1;
  var MIN_VALUE = Math.pow(2, -1022);
  var EPSILON = Math.pow(2, -52);
  var C = 416;
  var A = Math.pow(2, +C);
  var B = Math.pow(2, -C);

  function multiply(a, b) {
    var at = SPLIT * a;
    var ahi = at - (at - a);
    var alo = a - ahi;
    var bt = SPLIT * b;
    var bhi = bt - (bt - b);
    var blo = b - bhi;
    var p = a * b;
    var e = ahi * bhi - p + ahi * blo + alo * bhi + alo * blo;
    return {
      p: p,
      e: e,
    };
  }

  function add(a, b) {
    var s = a + b;
    var v = s - a;
    var e = a - (s - v) + (b - v);
    return {
      s: s,
      e: e,
    };
  }

  function adjust(x, y) {
    return x !== 0 && y !== 0 && SPLIT * x - (SPLIT * x - x) === x
      ? x * (1 + (x < 0 ? -1 : +1) * (y < 0 ? -1 : +1) * EPSILON)
      : x;
  }

  if (x === 0 || y === 0 || !Number.isFinite(x) || !Number.isFinite(y)) {
    return x * y + z;
  }
  if (z === 0) {
    return x * y;
  }
  if (!Number.isFinite(z)) {
    return z;
  }

  var scale = 1;
  while (Math.abs(x) > A) {
    scale *= A;
    x *= B;
  }
  while (Math.abs(y) > A) {
    scale *= A;
    y *= B;
  }
  if (scale === 1 / 0) {
    return x * y * scale;
  }
  while (Math.abs(x) < B) {
    scale *= B;
    x *= A;
  }
  while (Math.abs(y) < B) {
    scale *= B;
    y *= A;
  }
  if (scale === 0) {
    return z;
  }

  var xs = x;
  var ys = y;
  var zs = z / scale;

  if (Math.abs(zs) > (Math.abs(xs * ys) * 4) / EPSILON) {
    return z;
  }
  if (Math.abs(zs) < (((Math.abs(xs * ys) * EPSILON) / 4) * EPSILON) / 4) {
    zs = (z < 0 ? -1 : +1) * MIN_VALUE;
  }

  var xy = multiply(xs, ys);
  var s = add(xy.p, zs);
  var u = add(xy.e, s.e);
  var i = add(s.s, u.s);

  var f = i.s + adjust(i.e, u.e);
  if (f === 0) {
    return f;
  }

  var fs = f * scale;
  if (Math.abs(fs) > MIN_VALUE) {
    return fs;
  }

  // It is possible that there was extra rounding for a denormalized value.
  return fs + adjust(f - fs / scale, i.e) * scale;
}

//Provides: caml_format_float const
//Requires: caml_str_repeat, caml_parse_format, caml_finish_formatting
function caml_format_float(fmt, x) {
  // Exact decimal expansion through BigInt, for precisions beyond
  // toFixed/toExponential's limit of 100 and for %f of values >= 1e21
  function decompose(x) {
    // x (finite, >= 0) is m * 2^e
    var dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, x);
    var hi = dv.getUint32(0),
      lo = dv.getUint32(4);
    var eb = (hi >>> 20) & 0x7ff;
    var m = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
    if (eb === 0) return [m, -1074];
    return [m | (1n << 52n), eb - 1075];
  }
  function exact_scaled(x, k) {
    // round_half_even(x * 10^k) as a BigInt
    var d = decompose(x);
    var num = d[0],
      den = 1n;
    if (k >= 0) num *= 10n ** BigInt(k);
    else den = 10n ** BigInt(-k);
    if (d[1] >= 0) num <<= BigInt(d[1]);
    else den <<= BigInt(-d[1]);
    var q = num / den,
      r2 = (num % den) * 2n;
    if (r2 > den || (r2 === den && q & 1n)) q += 1n;
    return q;
  }
  function exact_fixed(x, prec) {
    // toFixed, exactly
    var q = exact_scaled(x, prec).toString();
    if (prec === 0) return q;
    if (q.length <= prec) q = caml_str_repeat(prec + 1 - q.length, "0") + q;
    return q.slice(0, q.length - prec) + "." + q.slice(q.length - prec);
  }
  function exact_exponential(x, prec) {
    // toExponential, exactly
    if (x === 0)
      return (prec > 0 ? "0." + caml_str_repeat(prec, "0") : "0") + "e+0";
    var e10 = Math.floor(Math.log10(x));
    for (;;) {
      // we want round(x * 10^(prec - e10)) to have exactly prec + 1
      // digits; the estimate of e10 is off by at most one (and
      // rounding can add a digit), so adjust and retry
      var s = exact_scaled(x, prec - e10).toString();
      if (s.length === prec + 1) {
        var m = prec > 0 ? s.charAt(0) + "." + s.slice(1) : s;
        return m + "e" + (e10 < 0 ? "-" : "+") + Math.abs(e10);
      }
      e10 += s.length - (prec + 1);
    }
  }
  function toExponential(x, prec) {
    return prec > 100 ? exact_exponential(x, prec) : x.toExponential(prec);
  }
  function toFixed(x, dp) {
    if (dp > 100 || x >= 1e21) return exact_fixed(x, dp);
    return x.toFixed(dp);
  }
  var s,
    f = caml_parse_format(fmt);
  var prec = f.prec < 0 ? 6 : f.prec;
  if (x < 0 || (x === 0 && 1 / x === Number.NEGATIVE_INFINITY)) {
    f.sign = -1;
    x = -x;
  }
  if (Number.isNaN(x)) {
    s = "nan";
    f.filler = " ";
  } else if (!Number.isFinite(x)) {
    s = "inf";
    f.filler = " ";
  } else
    switch (f.conv) {
      case "e":
        var s = toExponential(x, prec);
        // exponent should be at least two digits
        var i = s.length;
        if (s.charAt(i - 3) === "e")
          s = s.slice(0, i - 1) + "0" + s.slice(i - 1);
        break;
      case "f":
        s = toFixed(x, prec);
        break;
      case "g":
        prec = prec ? prec : 1;
        s = toExponential(x, prec - 1);
        var j = s.indexOf("e");
        var exp = +s.slice(j + 1);
        if (exp < -4 || x >= 1e21 || x.toFixed(0).length > prec) {
          // remove trailing zeroes
          var i = j - 1;
          while (s.charAt(i) === "0") i--;
          if (s.charAt(i) === ".") i--;
          s = s.slice(0, i + 1) + s.slice(j);
          i = s.length;
          if (s.charAt(i - 3) === "e")
            s = s.slice(0, i - 1) + "0" + s.slice(i - 1);
          break;
        } else {
          var p = prec;
          if (exp < 0) {
            p -= exp + 1;
            s = toFixed(x, p);
          } else while (((s = toFixed(x, p)), s.length > prec + 1)) p--;
          if (p) {
            // remove trailing zeroes
            var i = s.length - 1;
            while (s.charAt(i) === "0") i--;
            if (s.charAt(i) === ".") i--;
            s = s.slice(0, i + 1);
          }
        }
        break;
    }
  return caml_finish_formatting(f, s);
}

//Provides: caml_parse_float
//Requires: caml_failwith, caml_jsbytes_of_string
function caml_parse_float(s, err_msg) {
  var res;
  var r_float = /^[ \t\n\v\f\r]*[-+]?(?:\d*\.?\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?$/;
  s = caml_jsbytes_of_string(s);
  res = +s;
  //Fast path
  if (!Number.isNaN(res) && r_float.test(s)) return res;
  s = s.replace(/_/g, "");
  res = +s;
  if (
    (!Number.isNaN(res) && r_float.test(s)) ||
    /^[ \t\n\v\f\r]*[+-]?nan$/i.test(s)
  )
    return res;
  var m =
    /^[ \t\n\v\f\r]*([+-]?)0x([0-9a-f]*)\.?([0-9a-f]*)(?:p([+-]?[0-9]+))?$/i.exec(
      s,
    );
  //          1        2             3               4
  if (m && m[2].length + m[3].length > 0) {
    var sign = m[1] === "-" ? -1 : 1;
    var mant = BigInt("0x0" + m[2] + m[3]);
    var e = (+m[4] || 0) - 4 * m[3].length;
    if (mant === 0n) return sign * 0;
    // Round [mant * 2^e] to the nearest representable double
    // (round-to-nearest, ties-to-even), exactly
    for (;;) {
      var bl = mant.toString(2).length; // bit length
      var be = bl - 1 + e; // exponent of the leading bit
      if (be > 1023) return sign * Number.POSITIVE_INFINITY;
      if (be < -1075) return sign * 0;
      // number of mantissa bits a double can hold at this magnitude
      var p = be >= -1022 ? 53 : 53 + 1022 + be;
      var shift = bl - p;
      if (shift <= 0)
        // [mant * 2^e] is representable: both operations are exact
        return sign * Number(mant) * Math.pow(2, e);
      var keep = mant >> BigInt(shift);
      var rem = mant & ((1n << BigInt(shift)) - 1n);
      var half = 1n << BigInt(shift - 1);
      if (rem > half || (rem === half && keep & 1n)) keep += 1n;
      if (keep < (p > 0 ? 1n << BigInt(p) : 1n))
        return sign * Number(keep) * Math.pow(2, e + shift);
      // the carry needs one more bit: renormalize and round again
      mant = keep;
      e += shift;
    }
  }
  if (/^[ \t\n\v\f\r]*\+?inf(inity)?$/i.test(s))
    return Number.POSITIVE_INFINITY;
  if (/^[ \t\n\v\f\r]*-inf(inity)?$/i.test(s)) return Number.NEGATIVE_INFINITY;
  caml_failwith(err_msg);
}

//Provides: caml_float_of_string (const)
//Requires: caml_parse_float
function caml_float_of_string(s) {
  return caml_parse_float(s, "float_of_string");
}

//# 1 "+float32.js"
/*
    32-bit floats are represented as javascript numbers, i.e. 64-bit floats.
    Each operation is performed in 64-bit precision and then rounded to the
    nearest 32-bit float. This is not identical to using true 32-bit operations.
    For example, if rounding an exact result to 64 bits places it halfway
    between the two nearest 32-bit numbers, rounding it again to 32 bits
    may not result in the closest 32-bit number to the exact result.

    Marshalled float32s therefore look like normal floats. This means that
    javascript programs are not be able to read float32 data marshalled
    by native programs and vice versa.
*/

//Provides: caml_float_of_float32 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_float_of_float32(x) {
  return x;
}

//Provides: caml_float32_of_float const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_float32_of_float(x) {
  return Math.fround(x);
}

//Provides: caml_float32_of_int const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_float32_of_int(x) {
  return Math.fround(x);
}

//Provides: caml_int_of_float32 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_int_of_float32(x) {
  return x | 0;
}

//Provides: caml_float32_of_bits_bytecode const
//Requires: caml_int32_float_of_bits
//Version: >= 5.2, < 5.3
//OxCaml
const caml_float32_of_bits_bytecode = caml_int32_float_of_bits;

//Provides: caml_float32_to_bits_bytecode const
//Requires: caml_int32_bits_of_float
//Version: >= 5.2, < 5.3
//OxCaml
const caml_float32_to_bits_bytecode = caml_int32_bits_of_float;

//Provides: caml_float32_of_int64_bytecode const
//Requires: caml_int64_to_float
//Version: >= 5.2, < 5.3
//OxCaml
function caml_float32_of_int64_bytecode(x) {
  return Math.fround(caml_int64_to_float(x));
}

//Provides: caml_float32_to_int64_bytecode const
//Requires: caml_int64_of_float
//Version: >= 5.2, < 5.3
//OxCaml
const caml_float32_to_int64_bytecode = caml_int64_of_float;

//Provides: caml_float32_of_string (const)
//Requires: caml_parse_float
//Version: >= 5.2, < 5.3
//OxCaml
function caml_float32_of_string(x) {
  return Math.fround(caml_parse_float(x, "float32_of_string"));
}

//Provides: caml_format_float32 const
//Requires: caml_format_float
//Version: >= 5.2, < 5.3
//OxCaml
const caml_format_float32 = caml_format_float;

//Provides: caml_float32_compare const
//Requires: caml_float_compare
//Version: >= 5.2, < 5.3
//OxCaml
const caml_float32_compare = caml_float_compare;

//Provides: caml_add_float32 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_add_float32(x, y) {
  return Math.fround(x + y);
}

//Provides: caml_sub_float32 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sub_float32(x, y) {
  return Math.fround(x - y);
}

//Provides: caml_mul_float32 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_mul_float32(x, y) {
  return Math.fround(x * y);
}

//Provides: caml_div_float32 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_div_float32(x, y) {
  return Math.fround(x / y);
}

//Provides: caml_fmod_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_fmod_float32_bytecode(x, y) {
  return Math.fround(x % y);
}

//Provides: caml_neg_float32 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_neg_float32(x) {
  return -x; // Result is exact
}

//Provides: caml_abs_float32 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_abs_float32(x) {
  return Math.abs(x); // Result is exact
}

//Provides: caml_modf_float32 const
//Requires: caml_modf_float
//Version: >= 5.2, < 5.3
//OxCaml
const caml_modf_float32 = caml_modf_float; // Result is exact

//Provides: caml_acos_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_acos_float32_bytecode(x) {
  return Math.fround(Math.acos(x));
}

//Provides: caml_asin_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_asin_float32_bytecode(x) {
  return Math.fround(Math.asin(x));
}

//Provides: caml_atan_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atan_float32_bytecode(x) {
  return Math.fround(Math.atan(x));
}

//Provides: caml_atan2_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atan2_float32_bytecode(x, y) {
  return Math.fround(Math.atan2(x, y));
}

//Provides: caml_ceil_float32_bytecode const
//Alias: caml_simd_float32_round_pos_inf_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_ceil_float32_bytecode(x) {
  return Math.fround(Math.ceil(x));
}

//Provides: caml_cos_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_cos_float32_bytecode(x) {
  return Math.fround(Math.cos(x));
}

//Provides: caml_exp_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_exp_float32_bytecode(x) {
  return Math.fround(Math.exp(x));
}

//Provides: caml_floor_float32_bytecode const
//Alias: caml_simd_float32_round_neg_inf_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_floor_float32_bytecode(x) {
  return Math.fround(Math.floor(x));
}

//Provides: caml_log_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_log_float32_bytecode(x) {
  return Math.fround(Math.log(x));
}

//Provides: caml_power_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_power_float32_bytecode(x, y) {
  return Math.fround(Math.pow(x, y));
}

//Provides: caml_sin_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sin_float32_bytecode(x) {
  return Math.fround(Math.sin(x));
}

//Provides: caml_sqrt_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sqrt_float32_bytecode(x) {
  return Math.fround(Math.sqrt(x));
}

//Provides: caml_tan_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_tan_float32_bytecode(x) {
  return Math.fround(Math.tan(x));
}

//Provides: caml_nextafter_float32_bytecode const
//Requires: caml_int32_bits_of_float, caml_int32_float_of_bits
//Version: >= 5.2, < 5.3
//OxCaml
function caml_nextafter_float32_bytecode(x, y) {
  if (Number.isNaN(x) || Number.isNaN(y)) return Number.NaN;
  if (x === y) return y;
  if (x === 0) {
    if (y < 0) return -Math.pow(2, -149);
    else return Math.pow(2, -149);
  }
  var bits = caml_int32_bits_of_float(x);
  if (x < y === x > 0) bits++;
  else bits--;
  return caml_int32_float_of_bits(bits);
}

//Provides: caml_trunc_float32_bytecode const
//Alias: caml_simd_float32_round_towards_zero_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_trunc_float32_bytecode(x) {
  return Math.fround(Math.trunc(x));
}

//Provides: caml_classify_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_classify_float32_bytecode(x) {
  if (Number.isFinite(x)) {
    if (Math.abs(x) >= 1.1754943508222875e-38) return 0;
    if (x !== 0) return 1;
    return 2;
  }
  return Number.isNaN(x) ? 4 : 3;
}

//Provides: caml_ldexp_float32_bytecode const
//Requires: caml_ldexp_float
//Version: >= 5.2, < 5.3
//OxCaml
function caml_ldexp_float32_bytecode(x, y) {
  return Math.fround(caml_ldexp_float(x, y));
}

//Provides: caml_frexp_float32 const
//Requires: caml_frexp_float
//Version: >= 5.2, < 5.3
//OxCaml
const caml_frexp_float32 = caml_frexp_float; // Result is exact

//Provides: caml_copysign_float32_bytecode const
//Requires: caml_copysign_float
//Version: >= 5.2, < 5.3
//OxCaml
const caml_copysign_float32_bytecode = caml_copysign_float; // Result is exact

//Provides: caml_signbit_float32_bytecode const
//Requires: caml_signbit_float
//Version: >= 5.2, < 5.3
//OxCaml
const caml_signbit_float32_bytecode = caml_signbit_float;

//Provides: caml_expm1_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_expm1_float32_bytecode(x) {
  return Math.fround(Math.expm1(x));
}

//Provides: caml_exp2_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_exp2_float32_bytecode(x) {
  return Math.fround(Math.pow(2, x));
}

//Provides: caml_log1p_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_log1p_float32_bytecode(x) {
  return Math.fround(Math.log1p(x));
}

//Provides: caml_log2_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_log2_float32_bytecode(x) {
  return Math.fround(Math.log2(x));
}

//Provides: caml_hypot_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_hypot_float32_bytecode(x, y) {
  return Math.fround(Math.hypot(x, y));
}

//Provides: caml_log10_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_log10_float32_bytecode(x) {
  return Math.fround(Math.log10(x));
}

//Provides: caml_cosh_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_cosh_float32_bytecode(x) {
  return Math.fround(Math.cosh(x));
}

//Provides: caml_acosh_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_acosh_float32_bytecode(x) {
  return Math.fround(Math.acosh(x));
}

//Provides: caml_sinh_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sinh_float32_bytecode(x) {
  return Math.fround(Math.sinh(x));
}

//Provides: caml_asinh_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_asinh_float32_bytecode(x) {
  return Math.fround(Math.asinh(x));
}

//Provides: caml_tanh_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_tanh_float32_bytecode(x) {
  return Math.fround(Math.tanh(x));
}

//Provides: caml_atanh_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atanh_float32_bytecode(x) {
  return Math.fround(Math.atanh(x));
}

//Provides: caml_round_float32_bytecode const
//Requires: caml_round_float
//Alias: caml_simd_float32_round_current_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_round_float32_bytecode(x) {
  return Math.fround(caml_round_float(x));
}

//Provides: caml_cbrt_float32_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_cbrt_float32_bytecode(x) {
  return Math.fround(Math.cbrt(x));
}

//Provides: caml_erf_float32_bytecode const
//Requires: caml_erf_float
//Version: >= 5.2, < 5.3
//OxCaml
function caml_erf_float32_bytecode(x) {
  return Math.fround(caml_erf_float(x));
}

//Provides: caml_erfc_float32_bytecode const
//Requires: caml_erfc_float
//Version: >= 5.2, < 5.3
//OxCaml
function caml_erfc_float32_bytecode(x) {
  return Math.fround(caml_erfc_float(x));
}

//Provides: caml_fma_float32_bytecode const
//Requires: caml_fma_float
//Version: >= 5.2, < 5.3
//OxCaml
function caml_fma_float32_bytecode(x, y, z) {
  return Math.fround(caml_fma_float(x, y, z));
}

//Provides: caml_simd_float32_min_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
// Mirrors x86 MINSS: returns y when the comparison fails (NaN or equal,
// including ±0), unlike Math.min which propagates NaN and treats -0 < +0.
function caml_simd_float32_min_bytecode(x, y) {
  return x < y ? x : y;
}

//Provides: caml_simd_float32_max_bytecode const
//Version: >= 5.2, < 5.3
//OxCaml
// Mirrors x86 MAXSS; see caml_simd_float32_min_bytecode.
function caml_simd_float32_max_bytecode(x, y) {
  return x > y ? x : y;
}

//Provides: caml_simd_cast_float32_int64_bytecode const
//Requires: caml_int64_of_float
//Version: >= 5.2, < 5.3
//OxCaml
function caml_simd_cast_float32_int64_bytecode(x) {
  return caml_int64_of_float(Math.round(x));
}

//Provides: caml_ba_uint8_getf32
//Requires: caml_ba_uint8_get32, caml_float32_of_bits_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_ba_uint8_getf32(ba, i) {
  return caml_float32_of_bits_bytecode(caml_ba_uint8_get32(ba, i));
}

//Provides: caml_ba_uint8_setf32
//Requires: caml_ba_uint8_set32, caml_float32_to_bits_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_ba_uint8_setf32(ba, i, v) {
  return caml_ba_uint8_set32(ba, i, caml_float32_to_bits_bytecode(v));
}

//Provides: caml_string_getf32
//Requires: caml_string_get32, caml_float32_of_bits_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_string_getf32(ba, i) {
  return caml_float32_of_bits_bytecode(caml_string_get32(ba, i));
}

//Provides: caml_bytes_getf32
//Requires: caml_bytes_get32, caml_float32_of_bits_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_bytes_getf32(ba, i) {
  return caml_float32_of_bits_bytecode(caml_bytes_get32(ba, i));
}

//Provides: caml_bytes_setf32
//Requires: caml_bytes_set32, caml_float32_to_bits_bytecode
//Version: >= 5.2, < 5.3
//OxCaml
function caml_bytes_setf32(ba, i, v) {
  return caml_bytes_set32(ba, i, caml_float32_to_bits_bytecode(v));
}

//# 1 "+int64.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_int64_offset
var caml_int64_offset = Math.pow(2, -24);

//Provides: MlInt64
//Requires: caml_int64_offset, caml_raise_zero_divide
class MlInt64 {
  constructor(lo, mi, hi) {
    this.lo = lo & 0xffffff;
    this.mi = mi & 0xffffff;
    this.hi = hi & 0xffff;
    this.caml_custom = "_j";
  }

  static UNSIGNED_MAX = new MlInt64(0xffffff, 0xffffff, 0xffff);
  static SIGNED_MAX = new MlInt64(0xffffff, 0xffffff, 0x7fff);
  static SIGNED_MIN = new MlInt64(0x000000, 0x000000, 0x8000);

  slice() {
    return new MlInt64(this.lo, this.mi, this.hi);
  }

  ucompare(x) {
    if (this.hi > x.hi) return 1;
    if (this.hi < x.hi) return -1;
    if (this.mi > x.mi) return 1;
    if (this.mi < x.mi) return -1;
    if (this.lo > x.lo) return 1;
    if (this.lo < x.lo) return -1;
    return 0;
  }

  compare(x) {
    var hi = this.hi << 16;
    var xhi = x.hi << 16;
    if (hi > xhi) return 1;
    if (hi < xhi) return -1;
    if (this.mi > x.mi) return 1;
    if (this.mi < x.mi) return -1;
    if (this.lo > x.lo) return 1;
    if (this.lo < x.lo) return -1;
    return 0;
  }

  neg() {
    var lo = -this.lo;
    var mi = -this.mi + (lo >> 24);
    var hi = -this.hi + (mi >> 24);
    return new MlInt64(lo, mi, hi);
  }

  add(x) {
    var lo = this.lo + x.lo;
    var mi = this.mi + x.mi + (lo >> 24);
    var hi = this.hi + x.hi + (mi >> 24);
    return new MlInt64(lo, mi, hi);
  }

  sub(x) {
    var lo = this.lo - x.lo;
    var mi = this.mi - x.mi + (lo >> 24);
    var hi = this.hi - x.hi + (mi >> 24);
    return new MlInt64(lo, mi, hi);
  }

  mul(x) {
    var lo = this.lo * x.lo;
    var mi = ((lo * caml_int64_offset) | 0) + this.mi * x.lo + this.lo * x.mi;
    var hi =
      ((mi * caml_int64_offset) | 0) +
      this.hi * x.lo +
      this.mi * x.mi +
      this.lo * x.hi;
    return new MlInt64(lo, mi, hi);
  }

  isZero() {
    return (this.lo | this.mi | this.hi) === 0;
  }

  isNeg() {
    return this.hi << 16 < 0;
  }

  and(x) {
    return new MlInt64(this.lo & x.lo, this.mi & x.mi, this.hi & x.hi);
  }

  or(x) {
    return new MlInt64(this.lo | x.lo, this.mi | x.mi, this.hi | x.hi);
  }

  xor(x) {
    return new MlInt64(this.lo ^ x.lo, this.mi ^ x.mi, this.hi ^ x.hi);
  }

  shift_left(s) {
    s = s & 63;
    if (s === 0) return this;
    if (s < 24) {
      return new MlInt64(
        this.lo << s,
        (this.mi << s) | (this.lo >> (24 - s)),
        (this.hi << s) | (this.mi >> (24 - s)),
      );
    }
    if (s < 48)
      return new MlInt64(
        0,
        this.lo << (s - 24),
        (this.mi << (s - 24)) | (this.lo >> (48 - s)),
      );
    return new MlInt64(0, 0, this.lo << (s - 48));
  }

  shift_right_unsigned(s) {
    s = s & 63;
    if (s === 0) return this;
    if (s < 24)
      return new MlInt64(
        (this.lo >> s) | (this.mi << (24 - s)),
        (this.mi >> s) | (this.hi << (24 - s)),
        this.hi >> s,
      );
    if (s < 48)
      return new MlInt64(
        (this.mi >> (s - 24)) | (this.hi << (48 - s)),
        this.hi >> (s - 24),
        0,
      );
    return new MlInt64(this.hi >> (s - 48), 0, 0);
  }

  shift_right(s) {
    s = s & 63;
    if (s === 0) return this;
    var h = (this.hi << 16) >> 16;
    if (s < 24)
      return new MlInt64(
        (this.lo >> s) | (this.mi << (24 - s)),
        (this.mi >> s) | (h << (24 - s)),
        ((this.hi << 16) >> s) >>> 16,
      );
    var sign = (this.hi << 16) >> 31;
    if (s < 48)
      return new MlInt64(
        // [h] is sign-extended: for s > 40 the sign bits reach
        // into the low limb
        (this.mi >> (s - 24)) | (h << (48 - s)),
        ((this.hi << 16) >> (s - 24)) >> 16,
        sign & 0xffff,
      );
    return new MlInt64((this.hi << 16) >> (s - 32), sign, sign);
  }

  lsl1() {
    this.hi = (this.hi << 1) | (this.mi >> 23);
    this.mi = ((this.mi << 1) | (this.lo >> 23)) & 0xffffff;
    this.lo = (this.lo << 1) & 0xffffff;
  }

  lsr1() {
    this.lo = ((this.lo >>> 1) | (this.mi << 23)) & 0xffffff;
    this.mi = ((this.mi >>> 1) | (this.hi << 23)) & 0xffffff;
    this.hi = this.hi >>> 1;
  }

  udivmod(x) {
    var offset = 0;
    var modulus = this.slice();
    var divisor = x.slice();
    var quotient = new MlInt64(0, 0, 0);
    while (modulus.ucompare(divisor) > 0) {
      offset++;
      divisor.lsl1();
    }
    while (offset >= 0) {
      offset--;
      quotient.lsl1();
      if (modulus.ucompare(divisor) >= 0) {
        quotient.lo++;
        modulus = modulus.sub(divisor);
      }
      divisor.lsr1();
    }
    return { quotient: quotient, modulus: modulus };
  }

  div(y) {
    var x = this;
    if (y.isZero()) caml_raise_zero_divide();
    var sign = x.hi ^ y.hi;
    if (x.hi & 0x8000) x = x.neg();
    if (y.hi & 0x8000) y = y.neg();
    var q = x.udivmod(y).quotient;
    if (sign & 0x8000) q = q.neg();
    return q;
  }

  mod(y) {
    var x = this;
    if (y.isZero()) caml_raise_zero_divide();
    var sign = x.hi;
    if (x.hi & 0x8000) x = x.neg();
    if (y.hi & 0x8000) y = y.neg();
    var r = x.udivmod(y).modulus;
    if (sign & 0x8000) r = r.neg();
    return r;
  }

  toInt() {
    return this.lo | (this.mi << 24);
  }

  toFloat() {
    return (
      (this.hi << 16) * Math.pow(2, 32) + this.mi * Math.pow(2, 24) + this.lo
    );
  }

  toArray() {
    return [
      this.hi >> 8,
      this.hi & 0xff,
      this.mi >> 16,
      (this.mi >> 8) & 0xff,
      this.mi & 0xff,
      this.lo >> 16,
      (this.lo >> 8) & 0xff,
      this.lo & 0xff,
    ];
  }

  lo32() {
    return this.lo | ((this.mi & 0xff) << 24);
  }

  hi32() {
    return ((this.mi >>> 8) & 0xffff) | (this.hi << 16);
  }
}

//Provides: caml_int64_ult const
function caml_int64_ult(x, y) {
  return x.ucompare(y) < 0;
}

//Provides: caml_int64_compare const
function caml_int64_compare(x, y, _total) {
  return x.compare(y);
}

//Provides: caml_int64_neg const
function caml_int64_neg(x) {
  return x.neg();
}

//Provides: caml_int64_add const
function caml_int64_add(x, y) {
  return x.add(y);
}

//Provides: caml_int64_sub const
function caml_int64_sub(x, y) {
  return x.sub(y);
}

//Provides: caml_int64_mul const
//Requires: caml_int64_offset
function caml_int64_mul(x, y) {
  return x.mul(y);
}

//Provides: caml_int64_is_zero const
function caml_int64_is_zero(x) {
  return +x.isZero();
}

//Provides: caml_int64_is_negative const
function caml_int64_is_negative(x) {
  return +x.isNeg();
}

//Provides: caml_int64_and const
function caml_int64_and(x, y) {
  return x.and(y);
}

//Provides: caml_int64_or const
function caml_int64_or(x, y) {
  return x.or(y);
}

//Provides: caml_int64_xor const
function caml_int64_xor(x, y) {
  return x.xor(y);
}

//Provides: caml_int64_shift_left const
function caml_int64_shift_left(x, s) {
  return x.shift_left(s);
}

//Provides: caml_int64_shift_right_unsigned const
function caml_int64_shift_right_unsigned(x, s) {
  return x.shift_right_unsigned(s);
}

//Provides: caml_int64_shift_right const
function caml_int64_shift_right(x, s) {
  return x.shift_right(s);
}

//Provides: caml_int64_div
function caml_int64_div(x, y) {
  return x.div(y);
}

//Provides: caml_int64_mod
function caml_int64_mod(x, y) {
  return x.mod(y);
}

//Provides: caml_int64_of_int32 const
//Requires: MlInt64
//Alias: caml_int64_of_int
//Alias: caml_int64_of_nativeint
function caml_int64_of_int32(x) {
  return new MlInt64(x & 0xffffff, (x >> 24) & 0xffffff, (x >> 31) & 0xffff);
}

//Provides: caml_int64_to_int32 const
//Alias: caml_int64_to_int
//Alias: caml_int64_to_nativeint
function caml_int64_to_int32(x) {
  return x.toInt();
}

//Provides: caml_checked_int64_to_int
//Requires: caml_int64_of_int32, caml_array_bound_error
//Version: >= 5.2, < 5.3
//OxCaml
function caml_checked_int64_to_int(x) {
  var y = x.toInt();
  if (x.compare(caml_int64_of_int32(y)) !== 0) caml_array_bound_error();
  return y;
}

//Provides: caml_array_unsafe_get_indexed_by_int64 mutable (mutable, const)
//Version: >= 5.2, < 5.3
//OxCaml
function caml_array_unsafe_get_indexed_by_int64(array, index) {
  return array[index.toInt() + 1];
}

//Provides: caml_array_unsafe_set_indexed_by_int64 (mutable, const, mutable)
//Version: >= 5.2, < 5.3
//OxCaml
function caml_array_unsafe_set_indexed_by_int64(array, index, newval) {
  array[index.toInt() + 1] = newval;
  return 0;
}

//Provides: caml_int64_to_float const
function caml_int64_to_float(x) {
  return x.toFloat();
}

//Provides: caml_int64_of_float const
//Requires: caml_int64_offset, MlInt64
function caml_int64_of_float(x) {
  if (x < 0) x = Math.ceil(x);
  return new MlInt64(
    x & 0xffffff,
    Math.floor(x * caml_int64_offset) & 0xffffff,
    Math.floor(x * caml_int64_offset * caml_int64_offset) & 0xffff,
  );
}

//Provides: caml_int64_format const
//Requires: caml_parse_format, caml_finish_formatting
//Requires: caml_int64_is_negative, caml_int64_neg
//Requires: caml_int64_of_int32, caml_int64_to_int32
//Requires: caml_int64_is_zero, caml_str_repeat
function caml_int64_format(fmt, x) {
  var f = caml_parse_format(fmt);
  if (f.signedconv && caml_int64_is_negative(x)) {
    f.sign = -1;
    x = caml_int64_neg(x);
  }
  var buffer = "";
  var wbase = caml_int64_of_int32(f.base);
  var cvtbl = "0123456789abcdef";
  do {
    var p = x.udivmod(wbase);
    x = p.quotient;
    buffer = cvtbl.charAt(caml_int64_to_int32(p.modulus)) + buffer;
  } while (!caml_int64_is_zero(x));
  if (f.prec >= 0) {
    f.filler = " ";
    var n = f.prec - buffer.length;
    if (n > 0) buffer = caml_str_repeat(n, "0") + buffer;
  }
  return caml_finish_formatting(f, buffer);
}

//Provides: caml_int64_of_string
//Requires: caml_parse_sign_and_base, caml_failwith, caml_parse_digit
//Requires: caml_int64_of_int32, caml_int64_ult
//Requires: caml_int64_add, caml_int64_mul, caml_int64_neg
//Requires: caml_ml_string_length,caml_string_unsafe_get, MlInt64
function caml_int64_of_string(s) {
  var r = caml_parse_sign_and_base(s);
  var i = r[0],
    sign = r[1],
    base = r[2],
    signedness = r[3];
  var base64 = caml_int64_of_int32(base);
  var threshold = MlInt64.UNSIGNED_MAX.udivmod(base64).quotient;
  var c = caml_string_unsafe_get(s, i);
  var d = caml_parse_digit(c);
  if (d < 0 || d >= base) caml_failwith("Int64.of_string");
  var res = caml_int64_of_int32(d);
  for (;;) {
    i++;
    c = caml_string_unsafe_get(s, i);
    if (c === 95) continue;
    d = caml_parse_digit(c);
    if (d < 0 || d >= base) break;
    /* Detect overflow in multiplication base * res */
    if (caml_int64_ult(threshold, res)) caml_failwith("Int64.of_string");
    d = caml_int64_of_int32(d);
    res = caml_int64_add(caml_int64_mul(base64, res), d);
    /* Detect overflow in addition (base * res) + d */
    if (caml_int64_ult(res, d)) caml_failwith("Int64.of_string");
  }
  if (i !== caml_ml_string_length(s)) caml_failwith("Int64.of_string");
  if (
    signedness &&
    caml_int64_ult(sign < 0 ? MlInt64.SIGNED_MIN : MlInt64.SIGNED_MAX, res)
  )
    caml_failwith("Int64.of_string");
  if (sign < 0) res = caml_int64_neg(res);
  return res;
}

//Provides: caml_int64_create_lo_mi_hi const
//Requires: MlInt64
function caml_int64_create_lo_mi_hi(lo, mi, hi) {
  return new MlInt64(lo, mi, hi);
}
//Provides: caml_int64_create_lo_hi const
//Requires: MlInt64
function caml_int64_create_lo_hi(lo, hi) {
  return new MlInt64(
    lo & 0xffffff,
    ((lo >>> 24) & 0xff) | ((hi & 0xffff) << 8),
    (hi >>> 16) & 0xffff,
  );
}
//Provides: caml_int64_lo32 const
function caml_int64_lo32(v) {
  return v.lo32();
}

//Provides: caml_int64_hi32 const
function caml_int64_hi32(v) {
  return v.hi32();
}

//Provides: caml_int64_of_bytes const
//Requires: MlInt64
function caml_int64_of_bytes(a) {
  return new MlInt64(
    (a[7] << 0) | (a[6] << 8) | (a[5] << 16),
    (a[4] << 0) | (a[3] << 8) | (a[2] << 16),
    (a[1] << 0) | (a[0] << 8),
  );
}
//Provides: caml_int64_to_bytes const
function caml_int64_to_bytes(x) {
  return x.toArray();
}

//Provides: caml_int64_hash const
function caml_int64_hash(v) {
  return v.lo32() ^ v.hi32();
}

//Provides: caml_reinterpret_unboxed_int64_as_tagged_int63
//Requires: caml_failwith
//Version: >= 5.2, < 5.3
//OxCaml
function caml_reinterpret_unboxed_int64_as_tagged_int63(_v) {
  caml_failwith(
    "caml_reinterpret_unboxed_int64_as_tagged_int63 is not supported in javascript.",
  );
}

//# 1 "+ints.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_format_int const (const, const)
//Requires: caml_parse_format, caml_finish_formatting, caml_str_repeat
//Requires: caml_string_of_jsbytes, caml_jsbytes_of_string
//Alias: caml_int32_format
//Alias: caml_nativeint_format
function caml_format_int(fmt, i) {
  if (caml_jsbytes_of_string(fmt) === "%d")
    return caml_string_of_jsbytes("" + i);
  var f = caml_parse_format(fmt);
  if (i < 0) {
    if (f.signedconv) {
      f.sign = -1;
      i = -i;
    } else i >>>= 0;
  }
  var s = i.toString(f.base);
  if (f.prec >= 0) {
    f.filler = " ";
    var n = f.prec - s.length;
    if (n > 0) s = caml_str_repeat(n, "0") + s;
  }
  return caml_finish_formatting(f, s);
}

//Provides: caml_parse_sign_and_base
//Requires: caml_string_unsafe_get, caml_ml_string_length
function caml_parse_sign_and_base(s) {
  var i = 0,
    len = caml_ml_string_length(s),
    base = 10,
    sign = 1,
    signedness = 1;
  if (len > 0) {
    switch (caml_string_unsafe_get(s, i)) {
      case 45:
        i++;
        sign = -1;
        break;
      case 43:
        i++;
        sign = 1;
        break;
    }
  }
  if (i + 1 < len && caml_string_unsafe_get(s, i) === 48)
    switch (caml_string_unsafe_get(s, i + 1)) {
      case 120:
      case 88:
        signedness = 0;
        base = 16;
        i += 2;
        break;
      case 111:
      case 79:
        signedness = 0;
        base = 8;
        i += 2;
        break;
      case 98:
      case 66:
        signedness = 0;
        base = 2;
        i += 2;
        break;
      case 117:
      case 85:
        signedness = 0;
        i += 2;
        break;
    }
  return [i, sign, base, signedness];
}

//Provides: caml_parse_digit
function caml_parse_digit(c) {
  if (c >= 48 && c <= 57) return c - 48;
  if (c >= 65 && c <= 90) return c - 55;
  if (c >= 97 && c <= 122) return c - 87;
  return -1;
}

//Provides: caml_int_of_string (const)
//Requires: caml_ml_string_length, caml_string_unsafe_get
//Requires: caml_parse_sign_and_base, caml_parse_digit, caml_failwith
//Alias: caml_int32_of_string
//Alias: caml_nativeint_of_string
function caml_int_of_string(s) {
  var r = caml_parse_sign_and_base(s);
  var i = r[0],
    sign = r[1],
    base = r[2],
    signedness = r[3];
  var len = caml_ml_string_length(s);
  var threshold = -1 >>> 0;
  var c = i < len ? caml_string_unsafe_get(s, i) : 0;
  var d = caml_parse_digit(c);
  if (d < 0 || d >= base) caml_failwith("int_of_string");
  var res = d;
  for (i++; i < len; i++) {
    c = caml_string_unsafe_get(s, i);
    if (c === 95) continue;
    d = caml_parse_digit(c);
    if (d < 0 || d >= base) break;
    res = base * res + d;
    if (res > threshold) caml_failwith("int_of_string");
  }
  if (i !== len) caml_failwith("int_of_string");
  // For base different from 10, we expect an unsigned representation,
  // hence any value of 'res' (less than 'threshold') is acceptable.
  // But we have to convert the result back to a signed integer.
  res = sign * res;
  if (signedness && (res | 0) !== res)
    /* Signed representation expected, allow -2^(nbits-1) to 2^(nbits-1) - 1 */
    caml_failwith("int_of_string");
  return res | 0;
}

//Provides: caml_parse_small_int
//Requires: caml_ml_string_length, caml_string_unsafe_get
//Requires: caml_parse_sign_and_base, caml_parse_digit, caml_failwith
//Version: >= 5.2, < 5.3
//OxCaml
function caml_parse_small_int(err_msg, width, s) {
  var r = caml_parse_sign_and_base(s);
  var i = r[0],
    sign = r[1],
    base = r[2],
    signedness = r[3];
  var len = caml_ml_string_length(s);
  var threshold = (1 << width) - 1;
  var c = i < len ? caml_string_unsafe_get(s, i) : 0;
  var d = caml_parse_digit(c);
  if (d < 0 || d >= base) caml_failwith(err_msg);
  var res = d;
  for (i++; i < len; i++) {
    c = caml_string_unsafe_get(s, i);
    if (c === 95) continue;
    d = caml_parse_digit(c);
    if (d < 0 || d >= base) break;
    res = base * res + d;
    if (res > threshold) caml_failwith(err_msg);
  }
  if (i !== len) caml_failwith(err_msg);
  // For base different from 10, we expect an unsigned representation,
  // hence any value of 'res' (less than 'threshold') is acceptable.
  // But we have to convert the result back to a signed integer.
  if (signedness) {
    threshold = 1 << (width - 1);
    if (sign >= 0) {
      if (res >= threshold) caml_failwith(err_msg);
    } else {
      if (res > threshold) caml_failwith(err_msg);
    }
  }
  res = sign * res;
  return (res << (32 - width)) >> (32 - width);
}

//Provides: caml_int8_of_string (const)
//Requires: caml_parse_small_int
//Version: >= 5.2, < 5.3
//OxCaml
function caml_int8_of_string(s) {
  return caml_parse_small_int("Int8.of_string", 8, s);
}

//Provides: caml_int16_of_string (const)
//Requires: caml_parse_small_int
//Version: >= 5.2, < 5.3
//OxCaml
function caml_int16_of_string(s) {
  return caml_parse_small_int("Int16.of_string", 16, s);
}

//Provides: caml_mul const
//Alias: caml_int32_mul
//Alias: caml_nativeint_mul
//Alias: %int_mul
function caml_mul(a, b) {
  return Math.imul(a, b);
}

//Provides: caml_div
//Requires: caml_raise_zero_divide
//Alias: caml_int32_div
//Alias: caml_nativeint_div
//Alias: %int_div
function caml_div(x, y) {
  if (y === 0) caml_raise_zero_divide();
  return (x / y) | 0;
}

//Provides: caml_mod
//Requires: caml_raise_zero_divide
//Alias: caml_int32_mod
//Alias: caml_nativeint_mod
//Alias: %int_mod
function caml_mod(x, y) {
  if (y === 0) caml_raise_zero_divide();
  return x % y;
}

//Provides: caml_bswap16 const
function caml_bswap16(x) {
  return ((x & 0x00ff) << 8) | ((x & 0xff00) >> 8);
}

//Provides: caml_int32_bswap const
//Alias: caml_nativeint_bswap
function caml_int32_bswap(x) {
  return (
    ((x & 0x000000ff) << 24) |
    ((x & 0x0000ff00) << 8) |
    ((x & 0x00ff0000) >>> 8) |
    ((x & 0xff000000) >>> 24)
  );
}
//Provides: caml_int64_bswap const
//Requires: caml_int64_to_bytes, caml_int64_of_bytes
function caml_int64_bswap(x) {
  var y = caml_int64_to_bytes(x);
  return caml_int64_of_bytes([y[7], y[6], y[5], y[4], y[3], y[2], y[1], y[0]]);
}

//# 1 "+io.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2014 Jérôme Vouillon, Hugo Heuzard
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

///////////// Io

//Provides: caml_sys_fds
var caml_sys_fds = new Array(3);

//Provides: caml_sys_close
//Requires: caml_sys_fds
function caml_sys_close(fd) {
  var x = caml_sys_fds[fd];
  if (x) {
    x.file.close(false);
    delete caml_sys_fds[fd];
  }
  return 0;
}

//Provides: MlChanid
function MlChanid(id) {
  this.id = id;
}

//Provides: caml_sys_open
//Requires: caml_raise_sys_error
//Requires: MlFakeFd_out
//Requires: resolve_fs_device
//Requires: fs_node_supported
//Requires: fs_quickjs_supported
//Requires: caml_sys_fds
//Requires: caml_sys_open_for_node
//Requires: caml_sys_open_for_quickjs
function caml_sys_open_internal(file, idx) {
  if (idx === undefined) idx = caml_sys_fds.length;
  caml_sys_fds[idx] = { file: file };
  return idx | 0;
}
function caml_sys_open(name, flags, perms) {
  var f = {};
  while (flags) {
    switch (flags[1]) {
      case 0:
        f.rdonly = 1;
        break;
      case 1:
        f.wronly = 1;
        break;
      case 2:
        // Open_append implies write access (O_WRONLY | O_APPEND in the
        // C runtime)
        f.append = 1;
        f.wronly = 1;
        break;
      case 3:
        f.create = 1;
        break;
      case 4:
        f.truncate = 1;
        break;
      case 5:
        f.excl = 1;
        break;
      case 6:
        f.binary = 1;
        break;
      case 7:
        f.text = 1;
        break;
      case 8:
        f.nonblock = 1;
        break;
    }
    flags = flags[2];
  }
  var root = resolve_fs_device(name);
  var file = root.device.open(root.rest, f, perms);
  return caml_sys_open_internal(file, undefined);
}
(function () {
  var is_node = fs_node_supported();
  var is_qjs = !is_node && fs_quickjs_supported();
  var buffered = is_node || is_qjs ? 1 : 2;
  function file(fd, flags) {
    if (is_node) return caml_sys_open_for_node(fd, flags);
    if (is_qjs) return caml_sys_open_for_quickjs(fd, flags);
    return new MlFakeFd_out(fd, flags);
  }
  caml_sys_open_internal(
    file(0, { rdonly: 1, altname: "/dev/stdin", isCharacterDevice: true }),
    0,
  );
  caml_sys_open_internal(
    file(1, { buffered: buffered, wronly: 1, isCharacterDevice: true }),
    1,
  );
  caml_sys_open_internal(
    file(2, { buffered: buffered, wronly: 1, isCharacterDevice: true }),
    2,
  );
})();

// ocaml Channels

//Provides: caml_ml_set_channel_name
//Requires: caml_ml_channel_get
function caml_ml_set_channel_name(chanid, name) {
  var chan = caml_ml_channel_get(chanid);
  chan.name = name;
  return 0;
}

//Provides: caml_ml_std_channel_id
// The channels created by the stdlib at startup for fds 0, 1 and 2
// (the runtime itself writes through them, e.g. the parser trace)
var caml_ml_std_channel_id = [];

//Provides: caml_ml_channels
//Requires: MlChanid
class caml_ml_channels_state {
  constructor() {
    this.map = new globalThis.WeakMap();
    this.opened = new globalThis.Set();
  }

  close(chanid) {
    this.opened.delete(chanid);
  }

  get(chanid) {
    return this.map.get(chanid);
  }

  set(chanid, val) {
    if (val.opened) this.opened.add(chanid);
    return this.map.set(chanid, val);
  }

  all() {
    return this.opened.values();
  }
}

var caml_ml_channels = new caml_ml_channels_state();

//Provides: caml_ml_channel_get
//Requires: caml_ml_channels
function caml_ml_channel_get(id) {
  return caml_ml_channels.get(id);
}

//Provides: caml_ml_channel_redirect
//Requires: caml_ml_channel_get, caml_ml_channels
function caml_ml_channel_redirect(captured, into) {
  var to_restore = caml_ml_channel_get(captured);
  var new_ = caml_ml_channel_get(into);
  caml_ml_channels.set(captured, new_);
  return to_restore;
}

//Provides: caml_ml_channel_restore
//Requires: caml_ml_channels
function caml_ml_channel_restore(captured, to_restore) {
  caml_ml_channels.set(captured, to_restore);
  return 0;
}

//Provides: caml_ml_out_channels_list
//Requires: caml_ml_channels
//Requires: caml_ml_channel_get
function caml_ml_out_channels_list() {
  var l = 0;
  var keys = caml_ml_channels.all();
  for (var k of keys) {
    var chan = caml_ml_channel_get(k);
    if (chan.opened && chan.out) l = [0, k, l];
  }
  return l;
}

//Provides: caml_ml_open_descriptor_out
//Requires: caml_ml_channels, caml_sys_fds
//Requires: caml_raise_sys_error
//Requires: caml_sys_open
//Requires: caml_io_buffer_size
//Requires: MlChanid, caml_ml_std_channel_id
function caml_ml_open_descriptor_out(fd) {
  var fd_desc = caml_sys_fds[fd];
  if (fd_desc === undefined)
    caml_raise_sys_error("fd " + fd + " doesn't exist");
  var file = fd_desc.file;
  // each call allocates a fresh channel, like the C runtime
  var chanid = new MlChanid(fd);
  var buffered = file.flags.buffered !== undefined ? file.flags.buffered : 1;
  var channel = {
    file: file,
    offset: file.pos(),
    fd: fd,
    opened: true,
    out: true,
    buffer_curr: 0,
    buffer: new Uint8Array(caml_io_buffer_size),
    buffered: buffered,
  };
  caml_ml_channels.set(chanid, channel);
  if (fd <= 2 && !caml_ml_std_channel_id[fd])
    caml_ml_std_channel_id[fd] = chanid;
  return chanid;
}

//Provides: caml_ml_open_descriptor_in
//Requires: caml_ml_channels, caml_sys_fds
//Requires: caml_raise_sys_error
//Requires: caml_sys_open
//Requires: caml_io_buffer_size
//Requires: MlChanid, caml_ml_std_channel_id
function caml_ml_open_descriptor_in(fd) {
  var fd_desc = caml_sys_fds[fd];
  if (fd_desc === undefined)
    caml_raise_sys_error("fd " + fd + " doesn't exist");
  var file = fd_desc.file;
  // each call allocates a fresh channel, like the C runtime
  var chanid = new MlChanid(fd);
  var refill = null;
  var channel = {
    file: file,
    offset: file.pos(),
    fd: fd,
    opened: true,
    out: false,
    buffer_curr: 0,
    buffer_max: 0,
    buffer: new Uint8Array(caml_io_buffer_size),
    refill: refill,
  };
  caml_ml_channels.set(chanid, channel);
  if (fd <= 2 && !caml_ml_std_channel_id[fd])
    caml_ml_std_channel_id[fd] = chanid;
  return chanid;
}

//Provides: caml_ml_open_descriptor_in_with_flags
//Requires: caml_ml_open_descriptor_in
//Version: >= 5.1
function caml_ml_open_descriptor_in_with_flags(fd, _flags) {
  return caml_ml_open_descriptor_in(fd);
}

//Provides: caml_ml_open_descriptor_out_with_flags
//Requires: caml_ml_open_descriptor_out
//Version: >= 5.1
function caml_ml_open_descriptor_out_with_flags(fd, _flags) {
  return caml_ml_open_descriptor_out(fd);
}

//Provides: caml_channel_descriptor
//Requires: caml_ml_channel_get
//Alias: win_filedescr_of_channel
function caml_channel_descriptor(chanid) {
  var chan = caml_ml_channel_get(chanid);
  return chan.fd;
}

//Provides: caml_ml_set_binary_mode
//Requires: caml_ml_channel_get
function caml_ml_set_binary_mode(chanid, mode) {
  var chan = caml_ml_channel_get(chanid);
  chan.file.flags.text = !mode;
  chan.file.flags.binary = mode;
  return 0;
}

//Provides: caml_ml_is_binary_mode
//Version: >= 5.2
function caml_ml_is_binary_mode(_chanid) {
  // Like the C runtime on Unix, which always reports binary mode
  // (set_binary_mode is a no-op there).
  return 1;
}

//Input from in_channel

//Provides: caml_ml_close_channel
//Requires: caml_ml_flush, caml_ml_channel_get
//Requires: caml_sys_close
//Requires: caml_ml_channels
function caml_ml_close_channel(chanid) {
  var chan = caml_ml_channel_get(chanid);
  if (chan.opened) {
    chan.opened = false;
    caml_ml_channels.close(chanid);
    caml_sys_close(chan.fd);
    chan.fd = -1;
    chan.buffer = new Uint8Array(0);
    chan.buffer_curr = 0;
    chan.buffer_max = 0;
  }
  return 0;
}

//Provides: caml_ml_channel_size
//Requires: caml_ml_channel_get
function caml_ml_channel_size(chanid) {
  var chan = caml_ml_channel_get(chanid);
  return chan.file.length() | 0;
}

//Provides: caml_ml_channel_size_64
//Requires: caml_int64_of_float,caml_ml_channel_get
function caml_ml_channel_size_64(chanid) {
  var chan = caml_ml_channel_get(chanid);
  return caml_int64_of_float(chan.file.length());
}

//Provides: caml_ml_set_channel_output
//Requires: caml_ml_channel_get
function caml_ml_set_channel_output(chanid, f) {
  var chan = caml_ml_channel_get(chanid);
  chan.output = function (s) {
    f(s);
  };
  return 0;
}

//Provides: caml_ml_set_channel_refill
//Requires: caml_ml_channel_get
function caml_ml_set_channel_refill(chanid, f) {
  caml_ml_channel_get(chanid).refill = f;
  return 0;
}

//Provides: caml_refill
//Requires: caml_ml_string_length, caml_uint8_array_of_string
//Requires: caml_raise_sys_error
function caml_refill(chan) {
  if (chan.refill != null) {
    var str = chan.refill();
    var str_a = caml_uint8_array_of_string(str);
    if (str_a.length === 0) {
      chan.refill = null;
    } else {
      if (chan.buffer.length < chan.buffer_max + str_a.length) {
        var b = new Uint8Array(chan.buffer_max + str_a.length);
        b.set(chan.buffer);
        chan.buffer = b;
      }
      chan.buffer.set(str_a, chan.buffer_max);
      chan.offset += str_a.length;
      chan.buffer_max += str_a.length;
    }
  } else {
    if (chan.fd === -1) {
      caml_raise_sys_error("Bad file descriptor");
    }
    var nread = chan.file.read(
      chan.buffer,
      chan.buffer_max,
      chan.buffer.length - chan.buffer_max,
      false,
    );
    chan.offset += nread;
    chan.buffer_max += nread;
  }
}

//Provides: caml_ml_input
//Requires: caml_ml_input_block
//Requires: caml_uint8_array_of_bytes
function caml_ml_input(chanid, b, i, l) {
  var ba = caml_uint8_array_of_bytes(b);
  return caml_ml_input_block(chanid, ba, i, l);
}

//Provides: caml_ml_input_bigarray
//Requires: caml_ml_input_block
//Requires: caml_ba_to_typed_array
//Version: >= 5.2
function caml_ml_input_bigarray(chanid, b, i, l) {
  var ba = caml_ba_to_typed_array(b);
  return caml_ml_input_block(chanid, ba, i, l);
}

//Provides: caml_ml_input_block
//Requires: caml_refill, caml_ml_channel_get
function caml_ml_input_block(chanid, ba, i, l) {
  var chan = caml_ml_channel_get(chanid);
  var n = l;
  var avail = chan.buffer_max - chan.buffer_curr;
  if (l <= avail) {
    ba.set(chan.buffer.subarray(chan.buffer_curr, chan.buffer_curr + l), i);
    chan.buffer_curr += l;
  } else if (avail > 0) {
    ba.set(chan.buffer.subarray(chan.buffer_curr, chan.buffer_curr + avail), i);
    chan.buffer_curr += avail;
    n = avail;
  } else {
    chan.buffer_curr = 0;
    chan.buffer_max = 0;
    caml_refill(chan);
    var avail = chan.buffer_max - chan.buffer_curr;
    if (n > avail) n = avail;
    ba.set(chan.buffer.subarray(chan.buffer_curr, chan.buffer_curr + n), i);
    chan.buffer_curr += n;
  }
  return n | 0;
}

//Provides: caml_input_value
//Requires: caml_marshal_data_size, caml_input_value_from_bytes, caml_create_bytes, caml_ml_channel_get, caml_bytes_of_uint8_array
//Requires: caml_refill, caml_failwith, caml_raise_end_of_file
//Requires: caml_marshal_header_size
function caml_input_value(chanid) {
  var chan = caml_ml_channel_get(chanid);
  var header = new Uint8Array(caml_marshal_header_size);
  function block(buffer, offset, n) {
    var r = 0;
    while (r < n) {
      if (chan.buffer_curr >= chan.buffer_max) {
        chan.buffer_curr = 0;
        chan.buffer_max = 0;
        caml_refill(chan);
      }
      if (chan.buffer_curr >= chan.buffer_max) break;
      buffer[offset + r] = chan.buffer[chan.buffer_curr];
      chan.buffer_curr++;
      r++;
    }
    return r;
  }
  var r = block(header, 0, caml_marshal_header_size);
  if (r === 0) caml_raise_end_of_file();
  else if (r < caml_marshal_header_size)
    caml_failwith("input_value: truncated object");
  var len = caml_marshal_data_size(caml_bytes_of_uint8_array(header), 0);
  var buf = new Uint8Array(len + caml_marshal_header_size);
  buf.set(header, 0);
  var r = block(buf, caml_marshal_header_size, len);
  if (r < len) caml_failwith("input_value: truncated object " + r + "  " + len);
  var res = caml_input_value_from_bytes(caml_bytes_of_uint8_array(buf), 0);
  return res;
}

//Provides: caml_input_value_to_outside_heap
//Requires: caml_input_value
//Version: >= 5
function caml_input_value_to_outside_heap(c) {
  return caml_input_value(c);
}

//Provides: caml_ml_input_char
//Requires: caml_raise_end_of_file, caml_array_bound_error
//Requires: caml_ml_channel_get, caml_refill
function caml_ml_input_char(chanid) {
  var chan = caml_ml_channel_get(chanid);
  if (chan.buffer_curr >= chan.buffer_max) {
    chan.buffer_curr = 0;
    chan.buffer_max = 0;
    caml_refill(chan);
  }
  if (chan.buffer_curr >= chan.buffer_max) caml_raise_end_of_file();
  var res = chan.buffer[chan.buffer_curr];
  chan.buffer_curr++;
  return res;
}

//Provides: caml_ml_input_int
//Requires: caml_ml_input_char
function caml_ml_input_int(chanid) {
  var res = 0;
  for (var i = 0; i < 4; i++) {
    res = ((res << 8) + caml_ml_input_char(chanid)) | 0;
  }
  return res | 0;
}

//Provides: caml_seek_in
//Requires: caml_raise_sys_error, caml_ml_channel_get
function caml_seek_in(chanid, pos) {
  var chan = caml_ml_channel_get(chanid);
  if (chan.refill != null) caml_raise_sys_error("Illegal seek");
  if (
    pos >= chan.offset - chan.buffer_max &&
    pos <= chan.offset &&
    chan.file.flags.binary
  ) {
    chan.buffer_curr = chan.buffer_max - (chan.offset - pos);
  } else {
    chan.file.seek(pos, 0);
    chan.offset = pos;
    chan.buffer_curr = 0;
    chan.buffer_max = 0;
  }
  return 0;
}

//Provides: caml_ml_seek_in
//Requires: caml_seek_in
function caml_ml_seek_in(chanid, pos) {
  return caml_seek_in(chanid, pos);
}

//Provides: caml_ml_seek_in_64
//Requires: caml_int64_to_float, caml_seek_in
function caml_ml_seek_in_64(chanid, pos) {
  var pos = caml_int64_to_float(pos);
  return caml_seek_in(chanid, pos);
}

//Provides: caml_pos_in
//Requires: caml_ml_channel_get
function caml_pos_in(chanid) {
  var chan = caml_ml_channel_get(chanid);
  return chan.offset - (chan.buffer_max - chan.buffer_curr);
}

//Provides: caml_ml_pos_in
//Requires: caml_pos_in
function caml_ml_pos_in(chanid) {
  return caml_pos_in(chanid) | 0;
}

//Provides: caml_ml_pos_in_64
//Requires: caml_int64_of_float, caml_pos_in
function caml_ml_pos_in_64(chanid) {
  return caml_int64_of_float(caml_pos_in(chanid));
}

//Provides: caml_ml_input_scan_line
//Requires: caml_array_bound_error
//Requires: caml_ml_channel_get, caml_refill
function caml_ml_input_scan_line(chanid) {
  var chan = caml_ml_channel_get(chanid);
  var p = chan.buffer_curr;
  do {
    if (p >= chan.buffer_max) {
      if (chan.buffer_curr > 0) {
        chan.buffer.set(chan.buffer.subarray(chan.buffer_curr), 0);
        p -= chan.buffer_curr;
        chan.buffer_max -= chan.buffer_curr;
        chan.buffer_curr = 0;
      }
      if (chan.buffer_max >= chan.buffer.length) {
        return -chan.buffer_max | 0;
      }
      var prev_max = chan.buffer_max;
      caml_refill(chan);
      if (prev_max === chan.buffer_max) {
        return -chan.buffer_max | 0;
      }
    }
  } while (chan.buffer[p++] !== 10);
  return (p - chan.buffer_curr) | 0;
}

//Provides: caml_ml_flush
//Requires: caml_ml_channel_get
//Requires: caml_sub_uint8_array_to_jsbytes
function caml_ml_flush(chanid) {
  var chan = caml_ml_channel_get(chanid);
  if (!chan.opened) return 0;
  if (!chan.buffer || chan.buffer_curr === 0) return 0;
  if (chan.output) {
    chan.output(
      caml_sub_uint8_array_to_jsbytes(chan.buffer, 0, chan.buffer_curr),
    );
  } else {
    for (var pos = 0; pos < chan.buffer_curr; ) {
      pos += chan.file.write(chan.buffer, pos, chan.buffer_curr - pos, false);
    }
  }
  chan.offset += chan.buffer_curr;
  chan.buffer_curr = 0;
  return 0;
}

//output to out_channel

//Provides: caml_ml_output_ta
//Requires: caml_ml_flush,caml_ml_bytes_length
//Requires: caml_raise_sys_error, caml_ml_channel_get
function caml_ml_output_ta(chanid, buffer, offset, len) {
  var chan = caml_ml_channel_get(chanid);
  if (!chan.opened) caml_raise_sys_error("Cannot output to a closed channel");
  buffer = buffer.subarray(offset, offset + len);
  if (chan.buffer_curr + buffer.length > chan.buffer.length) {
    var b = new Uint8Array(chan.buffer_curr + buffer.length);
    b.set(chan.buffer);
    chan.buffer = b;
  }
  switch (chan.buffered) {
    case 0: // Unbuffered
      chan.buffer.set(buffer, chan.buffer_curr);
      chan.buffer_curr += buffer.length;
      caml_ml_flush(chanid);
      break;
    case 1: // Buffered (the default)
      chan.buffer.set(buffer, chan.buffer_curr);
      chan.buffer_curr += buffer.length;
      if (chan.buffer_curr >= chan.buffer.length) caml_ml_flush(chanid);
      break;
    case 2: // Buffered (only for stdout and stderr)
      var id = buffer.lastIndexOf(10);
      if (id < 0) {
        chan.buffer.set(buffer, chan.buffer_curr);
        chan.buffer_curr += buffer.length;
        if (chan.buffer_curr >= chan.buffer.length) caml_ml_flush(chanid);
      } else {
        chan.buffer.set(buffer.subarray(0, id + 1), chan.buffer_curr);
        chan.buffer_curr += id + 1;
        caml_ml_flush(chanid);
        chan.buffer.set(buffer.subarray(id + 1), chan.buffer_curr);
        chan.buffer_curr += buffer.length - id - 1;
      }
      break;
  }
  return 0;
}

//Provides: caml_ml_output_bytes
//Requires: caml_uint8_array_of_bytes, caml_ml_output_ta
function caml_ml_output_bytes(chanid, buffer, offset, len) {
  var buffer = caml_uint8_array_of_bytes(buffer);
  return caml_ml_output_ta(chanid, buffer, offset, len);
}

//Provides: caml_ml_output_bigarray
//Requires: caml_ba_to_typed_array, caml_ml_output_ta
//Version: >= 5.2
function caml_ml_output_bigarray(chanid, buffer, offset, len) {
  var buffer = caml_ba_to_typed_array(buffer);
  return caml_ml_output_ta(chanid, buffer, offset, len);
}

//Provides: caml_ml_output
//Requires: caml_ml_output_bytes, caml_bytes_of_string
function caml_ml_output(chanid, buffer, offset, len) {
  return caml_ml_output_bytes(
    chanid,
    caml_bytes_of_string(buffer),
    offset,
    len,
  );
}

//Provides: caml_ml_output_char
//Requires: caml_ml_output
//Requires: caml_string_of_jsbytes
function caml_ml_output_char(chanid, c) {
  var s = caml_string_of_jsbytes(String.fromCharCode(c));
  caml_ml_output(chanid, s, 0, 1);
  return 0;
}

//Provides: caml_output_value
//Requires: caml_output_value_to_string, caml_ml_output,caml_ml_string_length
function caml_output_value(chanid, v, flags) {
  var s = caml_output_value_to_string(v, flags);
  caml_ml_output(chanid, s, 0, caml_ml_string_length(s));
  return 0;
}

//Provides: caml_seek_out
//Requires: caml_ml_channel_get, caml_ml_flush
function caml_seek_out(chanid, pos) {
  caml_ml_flush(chanid);
  var chan = caml_ml_channel_get(chanid);
  chan.file.seek(pos, 0);
  chan.offset = pos;
  return 0;
}

//Provides: caml_ml_seek_out
//Requires: caml_seek_out
function caml_ml_seek_out(chanid, pos) {
  return caml_seek_out(chanid, pos);
}
//Provides: caml_ml_seek_out_64
//Requires: caml_int64_to_float, caml_seek_out
function caml_ml_seek_out_64(chanid, pos) {
  var pos = caml_int64_to_float(pos);
  return caml_seek_out(chanid, pos);
}

//Provides: caml_pos_out
//Requires: caml_ml_channel_get, caml_ml_flush
function caml_pos_out(chanid) {
  var chan = caml_ml_channel_get(chanid);
  return chan.offset + chan.buffer_curr;
}

//Provides: caml_ml_pos_out
//Requires: caml_pos_out
function caml_ml_pos_out(chanid) {
  return caml_pos_out(chanid) | 0;
}

//Provides: caml_ml_pos_out_64
//Requires: caml_int64_of_float, caml_pos_out
function caml_ml_pos_out_64(chanid) {
  return caml_int64_of_float(caml_pos_out(chanid));
}

//Provides: caml_ml_output_int
//Requires: caml_ml_output_ta
function caml_ml_output_int(chanid, i) {
  var arr = [(i >> 24) & 0xff, (i >> 16) & 0xff, (i >> 8) & 0xff, i & 0xff];
  caml_ml_output_ta(chanid, new Uint8Array(arr), 0, 4);
  return 0;
}

//Provides: caml_ml_is_buffered
//Requires: caml_ml_channel_get
function caml_ml_is_buffered(chanid) {
  return caml_ml_channel_get(chanid).buffered ? 1 : 0;
}

//Provides: caml_ml_set_buffered
//Requires: caml_ml_channel_get, caml_ml_flush
function caml_ml_set_buffered(chanid, v) {
  caml_ml_channel_get(chanid).buffered = v;
  if (!v) caml_ml_flush(chanid);
  return 0;
}

//# 1 "+jslib.js"
// Js_of_ocaml library
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

///////////// Jslib

//Provides: caml_js_pure_expr const
//Requires: caml_callback
function caml_js_pure_expr(f) {
  return caml_callback(f, [0]);
}

//Provides: caml_js_set (mutable, const, mutable)
function caml_js_set(o, f, v) {
  o[f] = v;
  return 0;
}
//Provides: caml_js_get (mutable, const)
function caml_js_get(o, f) {
  return o[f];
}
//Provides: caml_js_delete (mutable, const)
function caml_js_delete(o, f) {
  delete o[f];
  return 0;
}

//Provides: caml_js_instanceof (const, const)
function caml_js_instanceof(o, c) {
  return o instanceof c ? 1 : 0;
}

//Provides: caml_js_typeof (const)
function caml_js_typeof(o) {
  return typeof o;
}

//Provides:caml_trampoline
function caml_trampoline(res) {
  var c = 1;
  while (res?.joo_tramp) {
    res = res.joo_tramp.apply(null, res.joo_args);
    c++;
  }
  return res;
}

//Provides:caml_trampoline_return
function caml_trampoline_return(f, args, direct) {
  return { joo_tramp: f, joo_args: args, joo_direct: direct };
}

//Provides:caml_stack_depth
//If: effects
var caml_stack_depth = 0;

//Provides:caml_stack_check_depth
//If: effects
//Requires:caml_stack_depth
function caml_stack_check_depth() {
  return --caml_stack_depth > 0;
}

//Provides: caml_direct_trampoline
//If: effects
//If: doubletranslate
//Requires: caml_stack_depth
// Entry trampoline for the direct version of a cps_needed mutually
// recursive function under --effects=double-translation. Sets up a stack
// budget, runs the inner direct body, then loops on caml_trampoline_return
// bounce objects until a plain value comes back. Mirrors the CPS-side
// trampoline (see caml_callback / caml_resume): each iteration starts with
// a fresh stack budget and dispatches the bounce target directly (the
// joo_tramp is always the inner direct closure of an SCC member, never a
// paired wrapper, so plain apply is correct).
function caml_direct_trampoline(f, args) {
  var saved = caml_stack_depth;
  try {
    caml_stack_depth = 40;
    var res = f.apply(null, args);
    while (res?.joo_tramp) {
      caml_stack_depth = 40;
      res = res.joo_tramp.apply(null, res.joo_args);
    }
    return res;
  } finally {
    caml_stack_depth = saved;
  }
}

//Provides: caml_callback
//If: !effects
//Requires:caml_call_gen
var caml_callback = caml_call_gen;

//Provides: caml_callback
//If: effects
//If: !doubletranslate
//Requires: caml_stack_depth, caml_call_gen, caml_wrap_exception
//Requires: caml_current_stack
//Alias: caml_cps_trampoline
function caml_callback(f, args) {
  var saved_stack_depth = caml_stack_depth;
  var saved_current_stack = caml_current_stack;
  try {
    caml_current_stack = { k: 0, x: 0, h: 0, e: 0 };
    var res = {
      joo_tramp: f,
      joo_args: args.concat(function (x) {
        return x;
      }),
    };
    do {
      caml_stack_depth = 40;
      try {
        res = caml_call_gen(res.joo_tramp, res.joo_args);
      } catch (e) {
        /* Handle exception coming from JavaScript or from the runtime. */
        if (!caml_current_stack.x) throw e;
        var handler = caml_current_stack.x.h;
        caml_current_stack.x = caml_current_stack.x.t;
        res = { joo_tramp: handler, joo_args: [caml_wrap_exception(e)] };
      }
    } while (res?.joo_args);
  } finally {
    caml_stack_depth = saved_stack_depth;
    caml_current_stack = saved_current_stack;
  }
  return res;
}

//Provides: caml_callback
//If: effects
//If: doubletranslate
//Requires: caml_call_gen
var caml_callback = caml_call_gen;

//Provides: caml_is_js
function caml_is_js() {
  return 1;
}

//Provides: caml_jsoo_flags_use_js_string
function caml_jsoo_flags_use_js_string(_unit) {
  return FLAG("use-js-string");
}

//Provides: caml_jsoo_flags_effects
//Requires: caml_string_of_jsstring
function caml_jsoo_flags_effects(_unit) {
  return caml_string_of_jsstring(CONFIG("effects"));
}

//Provides: caml_jsoo_build_config
//Requires: caml_string_of_jsstring
function caml_jsoo_build_config(_unit) {
  return caml_string_of_jsstring(BUILD_CONFIG());
}

//Provides: caml_wrap_exception const (mutable)
//Requires: caml_global_data,caml_string_of_jsstring,caml_named_value
function caml_wrap_exception(e) {
  if (FLAG("excwrap")) {
    if (Array.isArray(e)) return e;
    var exn;
    //Stack_overflow: chrome, safari
    if (
      globalThis.RangeError &&
      e instanceof globalThis.RangeError &&
      e.message?.match(/maximum call stack/i)
    )
      exn = caml_global_data["predef:Stack_overflow"];
    //Stack_overflow: firefox
    else if (
      globalThis.InternalError &&
      e instanceof globalThis.InternalError &&
      e.message?.match(/too much recursion/i)
    )
      exn = caml_global_data["predef:Stack_overflow"];
    //Wrap Error in Js.Error exception
    else if (e instanceof globalThis.Error && caml_named_value("jsError"))
      exn = [0, caml_named_value("jsError"), e];
    //fallback: wrapped in Failure
    else
      exn = [
        0,
        caml_global_data["predef:Failure"],
        caml_string_of_jsstring(String(e)),
      ];
    // We already have an error at hand, let's use it.
    if (e instanceof globalThis.Error) exn.js_error = e;
    return exn;
  } else return e;
}

//Provides: caml_maybe_attach_backtrace
//Requires: caml_exn_with_js_backtrace
//Requires: caml_record_backtrace_env_flag
//Requires: caml_record_backtrace_runtime_flag
function caml_maybe_attach_backtrace(exn, force) {
  // Backtraces are very expensive, we only enable them when explicitly requested
  // at compile-time (--enable with-js-error) or at startup with OCAMLRUNPARAM=b=1.
  // Libraries such as Base unconditionally enable backtraces (programmatically) but
  // it's way to slow. Here, we force the end-user to opt-in to backtraces.
  if (caml_record_backtrace_env_flag && caml_record_backtrace_runtime_flag)
    return caml_exn_with_js_backtrace(exn, force);
  else return exn;
}

// Experimental
//Provides: caml_exn_with_js_backtrace
//Requires: caml_global_data
function caml_exn_with_js_backtrace(exn, force) {
  //never reraise for constant exn
  if (!exn.js_error || force || exn[0] === 248)
    exn.js_error = new globalThis.Error("Js exception containing backtrace");
  return exn;
}

//Provides: caml_js_error_option_of_exception
function caml_js_error_option_of_exception(exn) {
  if (exn.js_error) {
    return [0, exn.js_error];
  }
  return 0;
}

//Provides: caml_throw_js_exception
function caml_throw_js_exception(exn) {
  throw exn;
}

//Provides: caml_js_from_bool const (const)
function caml_js_from_bool(x) {
  return !!x;
}
//Provides: caml_js_to_bool const (const)
function caml_js_to_bool(x) {
  return +x;
}
//Provides: caml_js_from_float const (const)
//Alias: caml_js_from_int32
//Alias: caml_js_from_nativeint
function caml_js_from_float(x) {
  return x;
}
//Provides: caml_js_to_float const (const)
function caml_js_to_float(x) {
  return x;
}
//Provides: caml_js_to_int32 const (const)
//Alias: caml_js_to_nativeint
function caml_js_to_int32(x) {
  return x | 0;
}

//Provides: caml_js_from_array mutable (shallow)
function caml_js_from_array(a) {
  return a.slice(1);
}
//Provides: caml_js_to_array mutable (shallow)
function caml_js_to_array(a) {
  var len = a.length;
  var b = new Array(len + 1);
  b[0] = 0;
  for (var i = 0; i < len; i++) b[i + 1] = a[i];
  return b;
}

//Provides: caml_list_of_js_array const (mutable)
function caml_list_of_js_array(a) {
  var l = 0;
  for (var i = a.length - 1; i >= 0; i--) {
    var e = a[i];
    l = [0, e, l];
  }
  return l;
}

//Provides: caml_list_to_js_array const (mutable)
function caml_list_to_js_array(l) {
  var a = [];
  for (; l !== 0; l = l[2]) {
    a.push(l[1]);
  }
  return a;
}

//Provides: caml_js_var mutable
//Requires: caml_jsstring_of_string
function caml_js_var(x) {
  var x = caml_jsstring_of_string(x);
  //Checks that x has the form ident[.ident]*
  if (!x.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*(\.[a-zA-Z_$][a-zA-Z_$0-9]*)*$/)) {
    console.error(
      'caml_js_var: "' +
        x +
        '" is not a valid JavaScript variable. continuing ..',
    );
    //console.error("Js.Unsafe.eval_string")
  }
  // biome-ignore lint/security/noGlobalEval: ..
  return eval?.(x);
}
//Provides: caml_js_call (const, mutable, shallow)
//Requires: caml_js_from_array
function caml_js_call(f, o, args) {
  return f.apply(o, caml_js_from_array(args));
}
//Provides: caml_js_fun_call (const, shallow)
//Requires: caml_js_from_array
function caml_js_fun_call(f, a) {
  switch (a.length) {
    case 1:
      return f();
    case 2:
      return f(a[1]);
    case 3:
      return f(a[1], a[2]);
    case 4:
      return f(a[1], a[2], a[3]);
    case 5:
      return f(a[1], a[2], a[3], a[4]);
    case 6:
      return f(a[1], a[2], a[3], a[4], a[5]);
    case 7:
      return f(a[1], a[2], a[3], a[4], a[5], a[6]);
    case 8:
      return f(a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
  }
  return f.apply(null, caml_js_from_array(a));
}
//Provides: caml_js_meth_call (mutable, const, shallow)
//Requires: caml_jsstring_of_string
//Requires: caml_js_from_array
function caml_js_meth_call(o, f, args) {
  return o[caml_jsstring_of_string(f)].apply(o, caml_js_from_array(args));
}
//Provides: caml_js_new (const, shallow)
//Requires: caml_js_from_array
function caml_js_new(c, a) {
  switch (a.length) {
    case 1:
      return new c();
    case 2:
      return new c(a[1]);
    case 3:
      return new c(a[1], a[2]);
    case 4:
      return new c(a[1], a[2], a[3]);
    case 5:
      return new c(a[1], a[2], a[3], a[4]);
    case 6:
      return new c(a[1], a[2], a[3], a[4], a[5]);
    case 7:
      return new c(a[1], a[2], a[3], a[4], a[5], a[6]);
    case 8:
      return new c(a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
  }
  function F() {
    return c.apply(this, caml_js_from_array(a));
  }
  F.prototype = c.prototype;
  return new F();
}
//Provides: caml_ojs_new_arr (const, shallow)
//Requires: caml_js_from_array
function caml_ojs_new_arr(c, a) {
  switch (a.length) {
    case 0:
      return new c();
    case 1:
      return new c(a[0]);
    case 2:
      return new c(a[0], a[1]);
    case 3:
      return new c(a[0], a[1], a[2]);
    case 4:
      return new c(a[0], a[1], a[2], a[3]);
    case 5:
      return new c(a[0], a[1], a[2], a[3], a[4]);
    case 6:
      return new c(a[0], a[1], a[2], a[3], a[4], a[5]);
    case 7:
      return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
  }
  function F() {
    return c.apply(this, a);
  }
  F.prototype = c.prototype;
  return new F();
}
//Provides: caml_js_wrap_callback const (const)
//Requires: caml_callback
function caml_js_wrap_callback(f) {
  return function (...args) {
    if (args.length === 0) {
      args = [undefined];
    }
    var res = caml_callback(f, args);
    return res instanceof Function ? caml_js_wrap_callback(res) : res;
  };
}

//Provides: caml_js_wrap_callback_arguments
//Requires: caml_callback
function caml_js_wrap_callback_arguments(f) {
  return function (...args) {
    return caml_callback(f, [args]);
  };
}
//Provides: caml_js_wrap_callback_strict const
//Requires: caml_callback
function caml_js_wrap_callback_strict(arity, f) {
  return function (...args) {
    args.length = arity;
    return caml_callback(f, args);
  };
}
//Provides: caml_js_wrap_callback_unsafe const (const)
//Requires: caml_callback, caml_js_function_arity
function caml_js_wrap_callback_unsafe(f) {
  return function (...args) {
    var len = caml_js_function_arity(f);
    args.length = len;
    return caml_callback(f, args);
  };
}
//Provides: caml_js_wrap_meth_callback const (const)
//Requires: caml_callback, caml_js_wrap_callback
function caml_js_wrap_meth_callback(f) {
  return function (...args) {
    args.unshift(this);
    var res = caml_callback(f, args);
    return res instanceof Function ? caml_js_wrap_callback(res) : res;
  };
}
//Provides: caml_js_wrap_meth_callback_arguments const (const)
//Requires: caml_callback
function caml_js_wrap_meth_callback_arguments(f) {
  return function (...args) {
    return caml_callback(f, [this, args]);
  };
}
//Provides: caml_js_wrap_meth_callback_strict const
//Requires: caml_callback
function caml_js_wrap_meth_callback_strict(arity, f) {
  return function (...args) {
    args.length = arity;
    args.unshift(this);
    return caml_callback(f, args);
  };
}
//Provides: caml_js_wrap_meth_callback_unsafe const (const)
//Requires: caml_callback, caml_js_function_arity
function caml_js_wrap_meth_callback_unsafe(f) {
  return function (...args) {
    var len = caml_js_function_arity(f);
    args.unshift(this);
    args.length = len;
    return caml_callback(f, args);
  };
}

//Provides: caml_js_function_arity
//If: !effects
function caml_js_function_arity(f) {
  return f.l >= 0 ? f.l : (f.l = f.length);
}

//Provides: caml_js_function_arity
//If: effects
//If: doubletranslate
function caml_js_function_arity(f) {
  return f.l >= 0 ? f.l : (f.l = f.length);
}

//Provides: caml_js_function_arity
//If: effects
//If: !doubletranslate
function caml_js_function_arity(f) {
  // Functions have an additional continuation parameter. This should
  // not be visible when calling them from JavaScript
  return (f.l >= 0 ? f.l : (f.l = f.length)) - 1;
}

//Provides: caml_js_equals mutable (const, const)
function caml_js_equals(x, y) {
  // biome-ignore lint/suspicious/noDoubleEquals: ..
  return +(x == y);
}

//Provides: caml_js_strict_equals mutable (const, const)
function caml_js_strict_equals(x, y) {
  return +(x === y);
}

//Provides: caml_js_eval_string (const)
//Requires: caml_jsstring_of_string
function caml_js_eval_string(s) {
  // Uses an indirect eval through the optional chaining operator.
  // (see https://mdn.dev/docs/Web/JavaScript/Reference/Global_Objects/eval)
  // This is faster and avoid variable captures.
  // Also prepends `"use strict"` directive since this is not inherited
  // from the enclosing function with an indirect eval.
  // biome-ignore lint/security/noGlobalEval: ..
  return eval?.('"use strict";' + caml_jsstring_of_string(s));
}

//Provides: caml_js_expr (const)
//Requires: caml_jsstring_of_string
function caml_js_expr(s) {
  console.error("caml_js_expr: fallback to runtime evaluation\n");
  // We add parentheses to avoid the ambiguity between expressions
  // and statements. This means that we accept invalid inputs like
  // "a)(b", but this is unlikely to be an issue in practice.
  // biome-ignore lint/security/noGlobalEval: ..
  return eval?.('"use strict";(' + caml_jsstring_of_string(s) + ")");
}

//Provides: caml_pure_js_expr const (const)
//Requires: caml_jsstring_of_string
function caml_pure_js_expr(s) {
  console.error("caml_pure_js_expr: fallback to runtime evaluation\n");
  // biome-ignore lint/security/noGlobalEval: ..
  return eval?.('"use strict";(' + caml_jsstring_of_string(s) + ")");
}

//Provides: caml_js_object (object_literal)
//Requires: caml_jsstring_of_string
function caml_js_object(a) {
  var o = {};
  for (var i = 1; i < a.length; i++) {
    var p = a[i];
    o[caml_jsstring_of_string(p[1])] = p[2];
  }
  return o;
}

//# 1 "+jslib_js_of_ocaml.js"
// Js_of_ocaml library
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

///////////// Jslib: code specific to Js_of_ocaml

//Provides: caml_js_html_entities
function caml_js_html_entities(s) {
  var entity = /^&#?[0-9a-zA-Z]+;$/;
  if (s.match(entity)) {
    var str,
      temp = document.createElement("p");
    temp.innerHTML = s;
    str = temp.textContent || temp.innerText;
    temp = null;
    return str;
  } else {
    return null;
  }
}

//Provides: caml_js_get_console const
function caml_js_get_console() {
  var c = console;
  var m = [
    "log",
    "debug",
    "info",
    "warn",
    "error",
    "assert",
    "dir",
    "dirxml",
    "trace",
    "group",
    "groupCollapsed",
    "groupEnd",
    "time",
    "timeEnd",
  ];
  function f() {}
  for (var i = 0; i < m.length; i++) if (!c[m[i]]) c[m[i]] = f;
  return c;
}

//Provides: caml_xmlhttprequest_create
//Requires: caml_failwith
//Weakdef
function caml_xmlhttprequest_create(_unit) {
  if (typeof XMLHttpRequest === "undefined") {
    caml_failwith("XMLHttpRequest is not available");
  }
  try {
    return new XMLHttpRequest();
  } catch {
    caml_failwith("Failed to create XMLHttpRequest");
  }
}

//Provides: caml_js_error_of_exception
function caml_js_error_of_exception(exn) {
  if (exn.js_error) {
    return exn.js_error;
  }
  return null;
}

//# 1 "+lexing.js"
/***********************************************************************/
/*                                                                     */
/*                           Objective Caml                            */
/*                                                                     */
/*            Xavier Leroy, projet Cristal, INRIA Rocquencourt         */
/*                                                                     */
/*  Copyright 1996 Institut National de Recherche en Informatique et   */
/*  en Automatique.  All rights reserved.  This file is distributed    */
/*  under the terms of the GNU Lesser General Public License, with     */
/*  the special exception on linking described in file ../LICENSE.     */
/*                                                                     */
/***********************************************************************/

/* $Id: lexing.c 6045 2004-01-01 16:42:43Z doligez $ */

/* The table-driven automaton for lexers generated by camllex. */

//Provides: caml_lex_array
//Requires: caml_jsbytes_of_string
function caml_lex_array(s) {
  s = caml_jsbytes_of_string(s);
  var l = s.length / 2;
  var a = new Array(l);
  for (var i = 0; i < l; i++)
    a[i] = ((s.charCodeAt(2 * i) | (s.charCodeAt(2 * i + 1) << 8)) << 16) >> 16;
  return a;
}

//Provides: caml_lex_engine
//Requires: caml_failwith, caml_lex_array
//Requires: caml_bytes_unsafe_get
function caml_lex_engine(tbl, start_state, lexbuf) {
  var lex_buffer = 2;
  var lex_buffer_len = 3;
  var lex_start_pos = 5;
  var lex_curr_pos = 6;
  var lex_last_pos = 7;
  var lex_last_action = 8;
  var lex_eof_reached = 9;
  var lex_base = 1;
  var lex_backtrk = 2;
  var lex_default = 3;
  var lex_trans = 4;
  var lex_check = 5;

  if (!tbl.lex_default) {
    tbl.lex_base = caml_lex_array(tbl[lex_base]);
    tbl.lex_backtrk = caml_lex_array(tbl[lex_backtrk]);
    tbl.lex_check = caml_lex_array(tbl[lex_check]);
    tbl.lex_trans = caml_lex_array(tbl[lex_trans]);
    tbl.lex_default = caml_lex_array(tbl[lex_default]);
  }

  var c,
    state = start_state;

  var buffer = lexbuf[lex_buffer];

  if (state >= 0) {
    /* First entry */
    lexbuf[lex_last_pos] = lexbuf[lex_start_pos] = lexbuf[lex_curr_pos];
    lexbuf[lex_last_action] = -1;
  } else {
    /* Reentry after refill */
    state = -state - 1;
  }
  for (;;) {
    /* Lookup base address or action number for current state */
    var base = tbl.lex_base[state];
    if (base < 0) return -base - 1;
    /* See if it's a backtrack point */
    var backtrk = tbl.lex_backtrk[state];
    if (backtrk >= 0) {
      lexbuf[lex_last_pos] = lexbuf[lex_curr_pos];
      lexbuf[lex_last_action] = backtrk;
    }
    /* See if we need a refill */
    if (lexbuf[lex_curr_pos] >= lexbuf[lex_buffer_len]) {
      if (lexbuf[lex_eof_reached] === 0) return -state - 1;
      else c = 256;
    } else {
      /* Read next input char */
      c = caml_bytes_unsafe_get(buffer, lexbuf[lex_curr_pos]);
      lexbuf[lex_curr_pos]++;
    }
    /* Determine next state */
    if (tbl.lex_check[base + c] === state) state = tbl.lex_trans[base + c];
    else state = tbl.lex_default[state];
    /* If no transition on this char, return to last backtrack point */
    if (state < 0) {
      lexbuf[lex_curr_pos] = lexbuf[lex_last_pos];
      if (lexbuf[lex_last_action] === -1) caml_failwith("lexing: empty token");
      else return lexbuf[lex_last_action];
    } else {
      /* Erase the EOF condition only if the EOF pseudo-character was
         consumed by the automaton (i.e. there was no backtrack above)
      */
      if (c === 256) lexbuf[lex_eof_reached] = 0;
    }
  }
}

/***********************************************/
/* New lexer engine, with memory of positions  */
/***********************************************/

//Provides: caml_new_lex_engine
//Requires: caml_failwith, caml_lex_array
//Requires: caml_jsbytes_of_string
//Requires: caml_bytes_unsafe_get
function caml_lex_run_mem(s, i, mem, curr_pos) {
  for (;;) {
    var dst = s.charCodeAt(i);
    i++;
    if (dst === 0xff) return;
    var src = s.charCodeAt(i);
    i++;
    if (src === 0xff) mem[dst + 1] = curr_pos;
    else mem[dst + 1] = mem[src + 1];
  }
}

function caml_lex_run_tag(s, i, mem) {
  for (;;) {
    var dst = s.charCodeAt(i);
    i++;
    if (dst === 0xff) return;
    var src = s.charCodeAt(i);
    i++;
    if (src === 0xff) mem[dst + 1] = -1;
    else mem[dst + 1] = mem[src + 1];
  }
}

function caml_new_lex_engine(tbl, start_state, lexbuf) {
  var lex_buffer = 2;
  var lex_buffer_len = 3;
  var lex_start_pos = 5;
  var lex_curr_pos = 6;
  var lex_last_pos = 7;
  var lex_last_action = 8;
  var lex_eof_reached = 9;
  var lex_mem = 10;
  var lex_base = 1;
  var lex_backtrk = 2;
  var lex_default = 3;
  var lex_trans = 4;
  var lex_check = 5;
  var lex_base_code = 6;
  var lex_backtrk_code = 7;
  var lex_default_code = 8;
  var lex_trans_code = 9;
  var lex_check_code = 10;
  var lex_code = 11;

  if (!tbl.lex_default) {
    tbl.lex_base = caml_lex_array(tbl[lex_base]);
    tbl.lex_backtrk = caml_lex_array(tbl[lex_backtrk]);
    tbl.lex_check = caml_lex_array(tbl[lex_check]);
    tbl.lex_trans = caml_lex_array(tbl[lex_trans]);
    tbl.lex_default = caml_lex_array(tbl[lex_default]);
  }
  if (!tbl.lex_default_code) {
    tbl.lex_base_code = caml_lex_array(tbl[lex_base_code]);
    tbl.lex_backtrk_code = caml_lex_array(tbl[lex_backtrk_code]);
    tbl.lex_check_code = caml_lex_array(tbl[lex_check_code]);
    tbl.lex_trans_code = caml_lex_array(tbl[lex_trans_code]);
    tbl.lex_default_code = caml_lex_array(tbl[lex_default_code]);
  }
  if (tbl.lex_code == null)
    tbl.lex_code = caml_jsbytes_of_string(tbl[lex_code]);

  var c,
    state = start_state;

  var buffer = lexbuf[lex_buffer];

  if (state >= 0) {
    /* First entry */
    lexbuf[lex_last_pos] = lexbuf[lex_start_pos] = lexbuf[lex_curr_pos];
    lexbuf[lex_last_action] = -1;
  } else {
    /* Reentry after refill */
    state = -state - 1;
  }
  for (;;) {
    /* Lookup base address or action number for current state */
    var base = tbl.lex_base[state];
    if (base < 0) {
      var pc_off = tbl.lex_base_code[state];
      caml_lex_run_tag(tbl.lex_code, pc_off, lexbuf[lex_mem]);
      return -base - 1;
    }
    /* See if it's a backtrack point */
    var backtrk = tbl.lex_backtrk[state];
    if (backtrk >= 0) {
      var pc_off = tbl.lex_backtrk_code[state];
      caml_lex_run_tag(tbl.lex_code, pc_off, lexbuf[lex_mem]);
      lexbuf[lex_last_pos] = lexbuf[lex_curr_pos];
      lexbuf[lex_last_action] = backtrk;
    }
    /* See if we need a refill */
    if (lexbuf[lex_curr_pos] >= lexbuf[lex_buffer_len]) {
      if (lexbuf[lex_eof_reached] === 0) return -state - 1;
      else c = 256;
    } else {
      /* Read next input char */
      c = caml_bytes_unsafe_get(buffer, lexbuf[lex_curr_pos]);
      lexbuf[lex_curr_pos]++;
    }
    /* Determine next state */
    var pstate = state;
    if (tbl.lex_check[base + c] === state) state = tbl.lex_trans[base + c];
    else state = tbl.lex_default[state];
    /* If no transition on this char, return to last backtrack point */
    if (state < 0) {
      lexbuf[lex_curr_pos] = lexbuf[lex_last_pos];
      if (lexbuf[lex_last_action] === -1) caml_failwith("lexing: empty token");
      else return lexbuf[lex_last_action];
    } else {
      /* If some transition, get and perform memory moves */
      var base_code = tbl.lex_base_code[pstate],
        pc_off;
      if (tbl.lex_check_code[base_code + c] === pstate)
        pc_off = tbl.lex_trans_code[base_code + c];
      else pc_off = tbl.lex_default_code[pstate];
      if (pc_off > 0)
        caml_lex_run_mem(
          tbl.lex_code,
          pc_off,
          lexbuf[lex_mem],
          lexbuf[lex_curr_pos],
        );
      /* Erase the EOF condition only if the EOF pseudo-character was
         consumed by the automaton (i.e. there was no backtrack above)
      */
      if (c === 256) lexbuf[lex_eof_reached] = 0;
    }
  }
}

//# 1 "+marshal.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_marshal_constants
var caml_marshal_constants = {
  PREFIX_SMALL_BLOCK: 0x80,
  PREFIX_SMALL_INT: 0x40,
  PREFIX_SMALL_STRING: 0x20,
  CODE_INT8: 0x00,
  CODE_INT16: 0x01,
  CODE_INT32: 0x02,
  CODE_INT64: 0x03,
  CODE_SHARED8: 0x04,
  CODE_SHARED16: 0x05,
  CODE_SHARED32: 0x06,
  CODE_BLOCK32: 0x08,
  CODE_BLOCK64: 0x13,
  CODE_STRING8: 0x09,
  CODE_STRING32: 0x0a,
  CODE_DOUBLE_BIG: 0x0b,
  CODE_DOUBLE_LITTLE: 0x0c,
  CODE_DOUBLE_ARRAY8_BIG: 0x0d,
  CODE_DOUBLE_ARRAY8_LITTLE: 0x0e,
  CODE_DOUBLE_ARRAY32_BIG: 0x0f,
  CODE_DOUBLE_ARRAY32_LITTLE: 0x07,
  CODE_CODEPOINTER: 0x10,
  CODE_INFIXPOINTER: 0x11,
  CODE_CUSTOM: 0x12,
  CODE_CUSTOM_LEN: 0x18,
  CODE_CUSTOM_FIXED: 0x19,
  CODE_NULL: 0x1f,
};

//Provides: UInt8ArrayReader
//Requires: caml_string_of_uint8_array
class UInt8ArrayReader {
  constructor(s, i) {
    this.s = s;
    this.i = i;
  }

  read8u() {
    return this.s[this.i++];
  }

  read8s() {
    return (this.s[this.i++] << 24) >> 24;
  }

  read16u() {
    var s = this.s,
      i = this.i;
    this.i = i + 2;
    return (s[i] << 8) | s[i + 1];
  }

  read16s() {
    var s = this.s,
      i = this.i;
    this.i = i + 2;
    return ((s[i] << 24) >> 16) | s[i + 1];
  }

  read32u() {
    var s = this.s,
      i = this.i;
    this.i = i + 4;
    return ((s[i] << 24) | (s[i + 1] << 16) | (s[i + 2] << 8) | s[i + 3]) >>> 0;
  }

  read32s() {
    var s = this.s,
      i = this.i;
    this.i = i + 4;
    return (s[i] << 24) | (s[i + 1] << 16) | (s[i + 2] << 8) | s[i + 3];
  }

  readstr(len) {
    var i = this.i;
    this.i = i + len;
    return caml_string_of_uint8_array(this.s.subarray(i, i + len));
  }

  readuint8array(len) {
    var i = this.i;
    this.i = i + len;
    return this.s.subarray(i, i + len);
  }
}

//Provides: JsStringReader
//Requires: caml_string_of_jsbytes
class JsStringReader {
  constructor(s, i) {
    this.s = s;
    this.i = i;
  }

  read8u() {
    return this.s.charCodeAt(this.i++);
  }

  read8s() {
    return (this.s.charCodeAt(this.i++) << 24) >> 24;
  }

  read16u() {
    var s = this.s,
      i = this.i;
    this.i = i + 2;
    return (s.charCodeAt(i) << 8) | s.charCodeAt(i + 1);
  }

  read16s() {
    var s = this.s,
      i = this.i;
    this.i = i + 2;
    return ((s.charCodeAt(i) << 24) >> 16) | s.charCodeAt(i + 1);
  }

  read32u() {
    var s = this.s,
      i = this.i;
    this.i = i + 4;
    return (
      ((s.charCodeAt(i) << 24) |
        (s.charCodeAt(i + 1) << 16) |
        (s.charCodeAt(i + 2) << 8) |
        s.charCodeAt(i + 3)) >>>
      0
    );
  }

  read32s() {
    var s = this.s,
      i = this.i;
    this.i = i + 4;
    return (
      (s.charCodeAt(i) << 24) |
      (s.charCodeAt(i + 1) << 16) |
      (s.charCodeAt(i + 2) << 8) |
      s.charCodeAt(i + 3)
    );
  }

  readstr(len) {
    var i = this.i;
    this.i = i + len;
    return caml_string_of_jsbytes(this.s.slice(i, i + len));
  }

  readuint8array(len) {
    var b = new Uint8Array(len);
    var s = this.s;
    var i = this.i;
    for (var j = 0; j < len; j++) {
      b[j] = s.charCodeAt(i + j);
    }
    this.i = i + len;
    return b;
  }
}

//Provides: caml_float_of_bytes
//Requires: caml_int64_float_of_bits, caml_int64_of_bytes
function caml_float_of_bytes(a) {
  return caml_int64_float_of_bits(caml_int64_of_bytes(a));
}

//Provides: caml_input_value_from_bytes mutable
//Requires: JsStringReader, UInt8ArrayReader
//Requires: caml_input_value_from_reader
//Requires: caml_ml_bytes_content
function caml_input_value_from_bytes(s, ofs) {
  var c = caml_ml_bytes_content(s);
  var ofs = typeof ofs === "number" ? ofs : ofs[0];
  var reader =
    c instanceof Uint8Array
      ? new UInt8ArrayReader(c, ofs)
      : new JsStringReader(c, ofs);
  return caml_input_value_from_reader(reader);
}

//Provides: caml_int64_unmarshal
//Requires: caml_int64_of_bytes
function caml_int64_unmarshal(reader, size) {
  var t = new Array(8);
  for (var j = 0; j < 8; j++) t[j] = reader.read8u();
  size[0] = 8;
  return caml_int64_of_bytes(t);
}

//Provides: caml_int64_marshal
//Requires: caml_int64_to_bytes
function caml_int64_marshal(writer, v, sizes) {
  var b = caml_int64_to_bytes(v);
  for (var i = 0; i < 8; i++) writer.write(8, b[i]);
  sizes[0] = 8;
  sizes[1] = 8;
}

//Provides: caml_int32_unmarshal
function caml_int32_unmarshal(reader, size) {
  size[0] = 4;
  return reader.read32s();
}

//Provides: caml_nativeint_unmarshal
//Requires: caml_failwith
function caml_nativeint_unmarshal(reader, size) {
  switch (reader.read8u()) {
    case 1:
      size[0] = 4;
      return reader.read32s();
    case 2:
      caml_failwith("input_value: native integer value too large");
      break;
    default:
      caml_failwith("input_value: ill-formed native integer");
  }
}

//Provides: caml_custom_ops
//Requires: caml_int64_unmarshal, caml_int64_marshal, caml_int64_compare, caml_int64_hash
//Requires: caml_int32_unmarshal, caml_nativeint_unmarshal
//Requires: caml_ba_serialize, caml_ba_deserialize, caml_ba_compare, caml_ba_hash
var caml_custom_ops = {
  _j: {
    deserialize: caml_int64_unmarshal,
    serialize: caml_int64_marshal,
    fixed_length: 8,
    compare: caml_int64_compare,
    hash: caml_int64_hash,
  },
  _i: {
    deserialize: caml_int32_unmarshal,
    fixed_length: 4,
  },
  _n: {
    deserialize: caml_nativeint_unmarshal,
    fixed_length: 4,
  },
  _bigarray: {
    deserialize: function (reader, sz) {
      return caml_ba_deserialize(reader, sz, "_bigarray");
    },
    serialize: caml_ba_serialize,
    compare: caml_ba_compare,
    hash: caml_ba_hash,
  },
  _bigarr02: {
    deserialize: function (reader, sz) {
      return caml_ba_deserialize(reader, sz, "_bigarr02");
    },
    serialize: caml_ba_serialize,
    compare: caml_ba_compare,
    hash: caml_ba_hash,
  },
};

//Provides: caml_input_value_from_reader mutable
//Requires: caml_failwith
//Requires: caml_float_of_bytes, caml_custom_ops
//Requires: UInt8ArrayReader
//Requires: caml_decompress_input
//Requires: caml_set_oo_id
function caml_input_value_from_reader(reader) {
  function readvlq(overflow) {
    var c = reader.read8u();
    var n = c & 0x7f;
    while ((c & 0x80) !== 0) {
      c = reader.read8u();
      var n7 = n << 7;
      if (n !== n7 >> 7) overflow[0] = true;
      n = n7 | (c & 0x7f);
    }
    return n;
  }
  var old_pos = reader.i;
  var magic = reader.read32u();
  switch (magic) {
    case 0x8495a6be /* Intext_magic_number_small */:
      var header_len = 20;
      var compressed = 0;
      var data_len = reader.read32u();
      var uncompressed_data_len = data_len;
      var num_objects = reader.read32u();
      var _size_32 = reader.read32u();
      var _size_64 = reader.read32u();
      break;
    case 0x8495a6bd /* Intext_magic_number_compressed */:
      var header_len = reader.read8u() & 0x3f;
      var compressed = 1;
      var overflow = [false];
      var data_len = readvlq(overflow);
      var uncompressed_data_len = readvlq(overflow);
      var num_objects = readvlq(overflow);
      var _size_32 = readvlq(overflow);
      var _size_64 = readvlq(overflow);
      if (overflow[0]) {
        caml_failwith(
          "caml_input_value_from_reader: object too large to be read back on this platform",
        );
      }
      break;
    case 0x8495a6bf /* Intext_magic_number_big */:
      caml_failwith(
        "caml_input_value_from_reader: object too large to be read back on a 32-bit platform",
      );
      break;
    default:
      caml_failwith("caml_input_value_from_reader: bad object");
      break;
  }
  if (header_len !== reader.i - old_pos) {
    caml_failwith("caml_input_value_from_reader: invalid header");
  }
  var stack = [];
  var objects = [];
  var intern_obj_table = num_objects > 0 ? [] : null;
  var obj_counter = 0;
  function intern_rec(reader) {
    var code = reader.read8u();
    if (code >= 0x40 /*cst.PREFIX_SMALL_INT*/) {
      if (code >= 0x80 /*cst.PREFIX_SMALL_BLOCK*/) {
        var tag = code & 0xf;
        var size = (code >> 4) & 0x7;
        var v = [tag];
        if (size === 0) return v;
        if (intern_obj_table) intern_obj_table[obj_counter++] = v;
        if (tag === 248) objects.push(v);
        stack.push(v, size);
        return v;
      } else return code & 0x3f;
    } else {
      if (code >= 0x20 /*cst.PREFIX_SMALL_STRING */) {
        var len = code & 0x1f;
        var v = reader.readstr(len);
        if (intern_obj_table) intern_obj_table[obj_counter++] = v;
        return v;
      } else {
        switch (code) {
          case 0x00: //cst.CODE_INT8:
            return reader.read8s();
          case 0x01: //cst.CODE_INT16:
            return reader.read16s();
          case 0x02: //cst.CODE_INT32:
            return reader.read32s();
          case 0x03: //cst.CODE_INT64:
            caml_failwith("input_value: integer too large");
            break;
          case 0x04: //cst.CODE_SHARED8:
            var offset = reader.read8u();
            if (compressed === 0) offset = obj_counter - offset;
            return intern_obj_table[offset];
          case 0x05: //cst.CODE_SHARED16:
            var offset = reader.read16u();
            if (compressed === 0) offset = obj_counter - offset;
            return intern_obj_table[offset];
          case 0x06: //cst.CODE_SHARED32:
            var offset = reader.read32u();
            if (compressed === 0) offset = obj_counter - offset;
            return intern_obj_table[offset];
          case 0x08: //cst.CODE_BLOCK32:
            var header = reader.read32u();
            var tag = header & 0xff;
            // unsigned: bit 31 of the header is set for sizes >= 2^21
            var size = header >>> 10;
            var v = [tag];
            if (size === 0) return v;
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            if (tag === 248) objects.push(v);
            stack.push(v, size);
            return v;
          case 0x13: //cst.CODE_BLOCK64:
            caml_failwith("input_value: data block too large");
            break;
          case 0x09: //cst.CODE_STRING8:
            var len = reader.read8u();
            var v = reader.readstr(len);
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            return v;
          case 0x0a: //cst.CODE_STRING32:
            var len = reader.read32u();
            var v = reader.readstr(len);
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            return v;
          case 0x0c: //cst.CODE_DOUBLE_LITTLE:
            var t = new Array(8);
            for (var i = 0; i < 8; i++) t[7 - i] = reader.read8u();
            var v = caml_float_of_bytes(t);
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            return v;
          case 0x0b: //cst.CODE_DOUBLE_BIG:
            var t = new Array(8);
            for (var i = 0; i < 8; i++) t[i] = reader.read8u();
            var v = caml_float_of_bytes(t);
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            return v;
          case 0x0e: //cst.CODE_DOUBLE_ARRAY8_LITTLE:
            var len = reader.read8u();
            var v = new Array(len + 1);
            v[0] = 254;
            var t = new Array(8);
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            for (var i = 1; i <= len; i++) {
              for (var j = 0; j < 8; j++) t[7 - j] = reader.read8u();
              v[i] = caml_float_of_bytes(t);
            }
            return v;
          case 0x0d: //cst.CODE_DOUBLE_ARRAY8_BIG:
            var len = reader.read8u();
            var v = new Array(len + 1);
            v[0] = 254;
            var t = new Array(8);
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            for (var i = 1; i <= len; i++) {
              for (var j = 0; j < 8; j++) t[j] = reader.read8u();
              v[i] = caml_float_of_bytes(t);
            }
            return v;
          case 0x07: //cst.CODE_DOUBLE_ARRAY32_LITTLE:
            var len = reader.read32u();
            var v = new Array(len + 1);
            v[0] = 254;
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            var t = new Array(8);
            for (var i = 1; i <= len; i++) {
              for (var j = 0; j < 8; j++) t[7 - j] = reader.read8u();
              v[i] = caml_float_of_bytes(t);
            }
            return v;
          case 0x0f: //cst.CODE_DOUBLE_ARRAY32_BIG:
            var len = reader.read32u();
            var v = new Array(len + 1);
            v[0] = 254;
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            var t = new Array(8);
            for (var i = 1; i <= len; i++) {
              for (var j = 0; j < 8; j++) t[j] = reader.read8u();
              v[i] = caml_float_of_bytes(t);
            }
            return v;
          case 0x10: //cst.CODE_CODEPOINTER:
          case 0x11: //cst.CODE_INFIXPOINTER:
            caml_failwith("input_value: code pointer");
            break;
          case 0x12: //cst.CODE_CUSTOM:
          case 0x18: //cst.CODE_CUSTOM_LEN:
          case 0x19: //cst.CODE_CUSTOM_FIXED:
            var c,
              s = "";
            while ((c = reader.read8u()) !== 0) s += String.fromCharCode(c);
            var ops = caml_custom_ops[s];
            var expected_size;
            if (!ops)
              caml_failwith("input_value: unknown custom block identifier");
            switch (code) {
              case 0x12: // cst.CODE_CUSTOM (deprecated)
                break;
              case 0x19: // cst.CODE_CUSTOM_FIXED
                if (!ops.fixed_length)
                  caml_failwith(
                    "input_value: expected a fixed-size custom block",
                  );
                expected_size = ops.fixed_length;
                break;
              case 0x18: // cst.CODE_CUSTOM_LEN
                expected_size = reader.read32u();
                // Skip size64
                reader.read32s();
                reader.read32s();
                break;
            }
            var size = [0];
            var v = ops.deserialize(reader, size);
            if (expected_size !== undefined) {
              if (expected_size !== size[0])
                caml_failwith(
                  "input_value: incorrect length of serialized custom block",
                );
            }
            if (intern_obj_table) intern_obj_table[obj_counter++] = v;
            return v;
          case 0x1f: //cst.CODE_NULL:
            return null;
          default:
            caml_failwith("input_value: ill-formed message");
        }
      }
    }
  }
  if (compressed) {
    if (caml_decompress_input) {
      var data = reader.readuint8array(data_len);
      var res = new Uint8Array(uncompressed_data_len);
      var res = caml_decompress_input(data, res);
      var reader = new UInt8ArrayReader(res, 0);
    } else {
      caml_failwith("input_value: compressed object, cannot decompress");
    }
  }
  var res = intern_rec(reader);
  while (stack.length > 0) {
    var size = stack.pop();
    var v = stack.pop();
    var d = v.length;
    if (d < size) stack.push(v, size);
    v[d] = intern_rec(reader);
  }
  while (objects.length > 0) {
    var x = objects.pop();
    if (x[2] >= 0) caml_set_oo_id(x);
  }
  return res;
}

//Provides: caml_marshal_header_size
//Version: < 5.1.0
var caml_marshal_header_size = 20;

//Provides: caml_marshal_header_size
//Version: >= 5.1.0
var caml_marshal_header_size = 16;

//Provides: caml_marshal_data_size mutable
//Requires: caml_failwith, caml_bytes_unsafe_get
//Requires: caml_uint8_array_of_bytes
//Requires: UInt8ArrayReader
//Requires: caml_marshal_header_size
function caml_marshal_data_size(s, ofs) {
  var r = new UInt8ArrayReader(caml_uint8_array_of_bytes(s), ofs);
  function readvlq(overflow) {
    var c = r.read8u();
    var n = c & 0x7f;
    while ((c & 0x80) !== 0) {
      c = r.read8u();
      var n7 = n << 7;
      if (n !== n7 >> 7) overflow[0] = true;
      n = n7 | (c & 0x7f);
    }
    return n;
  }

  switch (r.read32u()) {
    case 0x8495a6be /* Intext_magic_number_small */:
      var header_len = 20;
      var data_len = r.read32u();
      break;
    case 0x8495a6bd /* Intext_magic_number_compressed */:
      var header_len = r.read8u() & 0x3f;
      var overflow = [false];
      var data_len = readvlq(overflow);
      if (overflow[0]) {
        caml_failwith(
          "Marshal.data_size: object too large to be read back on this platform",
        );
      }
      break;
    case 0x8495a6bf /* Intext_magic_number_big */:
      caml_failwith(
        "Marshal.data_size: object too large to be read back on a 32-bit platform",
      );
      break;
    default:
      caml_failwith("Marshal.data_size: bad object");
      break;
  }
  return header_len - caml_marshal_header_size + data_len;
}

//Provides: MlObjectTable
class MlObjectTable {
  constructor() {
    this.objs = [];
    this.lookup = new globalThis.Map();
  }

  store(v) {
    this.lookup.set(v, this.objs.length);
    this.objs.push(v);
  }

  recall(v) {
    var i = this.lookup.get(v);
    return i === undefined
      ? undefined
      : this.objs.length - i; /* index is relative */
  }
}

//Provides: caml_output_val
//Requires: caml_int64_to_bytes, caml_failwith
//Requires: caml_int64_bits_of_float
//Requires: caml_is_ml_bytes, caml_ml_bytes_length, caml_bytes_unsafe_get
//Requires: caml_is_ml_string, caml_ml_string_length, caml_string_unsafe_get
//Requires: MlObjectTable, caml_list_to_js_array, caml_custom_ops
//Requires: caml_invalid_argument,caml_string_of_jsbytes, caml_is_continuation_tag
var caml_output_val = (function () {
  class Writer {
    constructor() {
      this.chunk = [];
      this.chunk_idx = 20;
      this.block_len = 0;
      this.obj_counter = 0;
      this.size_32 = 0;
      this.size_64 = 0;
    }

    write(size, value) {
      for (var i = size - 8; i >= 0; i -= 8)
        this.chunk[this.chunk_idx++] = (value >> i) & 0xff;
    }

    write_at(pos, size, value) {
      for (var i = size - 8; i >= 0; i -= 8)
        this.chunk[pos++] = (value >> i) & 0xff;
    }

    write_code(size, code, value) {
      this.chunk[this.chunk_idx++] = code;
      for (var i = size - 8; i >= 0; i -= 8)
        this.chunk[this.chunk_idx++] = (value >> i) & 0xff;
    }

    write_shared(offset) {
      if (offset < 1 << 8)
        this.write_code(8, 0x04 /*cst.CODE_SHARED8*/, offset);
      else if (offset < 1 << 16)
        this.write_code(16, 0x05 /*cst.CODE_SHARED16*/, offset);
      else this.write_code(32, 0x06 /*cst.CODE_SHARED32*/, offset);
    }

    pos() {
      return this.chunk_idx;
    }

    finalize() {
      this.block_len = this.chunk_idx - 20;
      this.chunk_idx = 0;
      this.write(32, 0x8495a6be);
      this.write(32, this.block_len);
      this.write(32, this.obj_counter);
      this.write(32, this.size_32);
      this.write(32, this.size_64);
      return this.chunk;
    }
  }
  return function (v, flags) {
    flags = caml_list_to_js_array(flags);

    var no_sharing = flags.indexOf(0 /*Marshal.No_sharing*/) !== -1,
      closures = flags.indexOf(1 /*Marshal.Closures*/) !== -1;
    /* Marshal.Compat_32 is redundant since integers are 32-bit anyway */

    if (closures)
      console.warn(
        "in caml_output_val: flag Marshal.Closures is not supported.",
      );

    var writer = new Writer();
    var stack = [];
    var intern_obj_table = no_sharing ? null : new MlObjectTable();

    function memo(v) {
      if (no_sharing) return false;
      var existing_offset = intern_obj_table.recall(v);
      if (existing_offset) {
        writer.write_shared(existing_offset);
        return true;
      } else {
        intern_obj_table.store(v);
        return false;
      }
    }

    function extern_rec(v) {
      if (v === null) {
        writer.write(8, 0x1f /*cst.CODE_NULL*/);
      } else if (v.caml_custom) {
        if (memo(v)) return;
        var name = v.caml_custom;
        var ops = caml_custom_ops[name];
        var sz_32_64 = [0, 0];
        if (!ops.serialize)
          caml_invalid_argument("output_value: abstract value (Custom)");
        if (ops.fixed_length === undefined) {
          writer.write(8, 0x18 /*cst.CODE_CUSTOM_LEN*/);
          for (var i = 0; i < name.length; i++)
            writer.write(8, name.charCodeAt(i));
          writer.write(8, 0);
          var header_pos = writer.pos();
          for (var i = 0; i < 12; i++) {
            writer.write(8, 0);
          }
          ops.serialize(writer, v, sz_32_64);
          writer.write_at(header_pos, 32, sz_32_64[0]);
          writer.write_at(header_pos + 4, 32, 0); // zero
          writer.write_at(header_pos + 8, 32, sz_32_64[1]);
        } else {
          writer.write(8, 0x19 /*cst.CODE_CUSTOM_FIXED*/);
          for (var i = 0; i < name.length; i++)
            writer.write(8, name.charCodeAt(i));
          writer.write(8, 0);
          ops.serialize(writer, v, sz_32_64);
          if (ops.fixed_length !== sz_32_64[0])
            caml_failwith(
              "output_value: incorrect fixed sizes specified by " + name,
            );
        }
        writer.size_32 += 2 + ((sz_32_64[0] + 3) >> 2);
        writer.size_64 += 2 + ((sz_32_64[1] + 7) >> 3);
      } else if (Array.isArray(v) && v[0] === 254) {
        // float array (Double_array_tag): emit a CODE_DOUBLE_ARRAY
        // block (raw doubles) like the native runtime, so other
        // runtimes can read it
        if (memo(v)) return;
        var nfloats = v.length - 1;
        if (nfloats < 0x100)
          writer.write_code(8, 0x0e /*cst.CODE_DOUBLE_ARRAY8_LITTLE*/, nfloats);
        else
          writer.write_code(
            32,
            0x07 /*cst.CODE_DOUBLE_ARRAY32_LITTLE*/,
            nfloats,
          );
        for (var i = 1; i <= nfloats; i++) {
          var t = caml_int64_to_bytes(caml_int64_bits_of_float(v[i]));
          for (var j = 0; j < 8; j++) writer.write(8, t[7 - j]);
        }
        writer.size_32 += 1 + nfloats * 2;
        writer.size_64 += 1 + nfloats;
      } else if (Array.isArray(v) && v[0] === (v[0] | 0)) {
        if (v[0] === 251) {
          caml_failwith("output_value: abstract value (Abstract)");
        }
        if (caml_is_continuation_tag(v[0]))
          caml_invalid_argument("output_value: continuation value");
        if (v.length > 1 && memo(v)) return;
        if (v[0] < 16 && v.length - 1 < 8)
          writer.write(
            8,
            0x80 /*cst.PREFIX_SMALL_BLOCK*/ + v[0] + ((v.length - 1) << 4),
          );
        else {
          if (v.length - 1 >= 0x400000 /* 2^22 */)
            caml_failwith(
              "output_value: array cannot be read back on 32-bit platform",
            );
          writer.write_code(
            32,
            0x08 /*cst.CODE_BLOCK32*/,
            ((v.length - 1) << 10) | v[0],
          );
        }
        writer.size_32 += v.length;
        writer.size_64 += v.length;
        if (v.length > 1) stack.push(v, 1);
      } else if (caml_is_ml_bytes(v)) {
        if (!caml_is_ml_bytes(caml_string_of_jsbytes(""))) {
          caml_failwith(
            "output_value: [Bytes.t] cannot safely be marshaled with [--enable use-js-string]",
          );
        }
        if (memo(v)) return;
        var len = caml_ml_bytes_length(v);
        if (len < 0x20) writer.write(8, 0x20 /*cst.PREFIX_SMALL_STRING*/ + len);
        else if (len < 0x100)
          writer.write_code(8, 0x09 /*cst.CODE_STRING8*/, len);
        else writer.write_code(32, 0x0a /*cst.CODE_STRING32*/, len);
        for (var i = 0; i < len; i++)
          writer.write(8, caml_bytes_unsafe_get(v, i));
        writer.size_32 += 1 + (((len + 4) / 4) | 0);
        writer.size_64 += 1 + (((len + 8) / 8) | 0);
      } else if (caml_is_ml_string(v)) {
        if (memo(v)) return;
        var len = caml_ml_string_length(v);
        if (len < 0x20) writer.write(8, 0x20 /*cst.PREFIX_SMALL_STRING*/ + len);
        else if (len < 0x100)
          writer.write_code(8, 0x09 /*cst.CODE_STRING8*/, len);
        else writer.write_code(32, 0x0a /*cst.CODE_STRING32*/, len);
        for (var i = 0; i < len; i++)
          writer.write(8, caml_string_unsafe_get(v, i));
        writer.size_32 += 1 + (((len + 4) / 4) | 0);
        writer.size_64 += 1 + (((len + 8) / 8) | 0);
      } else {
        if (v !== (v | 0)) {
          var type_of_v = typeof v;
          if (type_of_v !== "number")
            caml_failwith("output_value: abstract value (" + type_of_v + ")");
          // If a float happens to be an integer it is serialized as an integer
          // (Js_of_ocaml cannot tell whether the type of an integer number is
          // float or integer.) This can result in unexpected crashes when
          // unmarshalling using the standard runtime.
          if (memo(v)) return;
          var t = caml_int64_to_bytes(caml_int64_bits_of_float(v));
          writer.write(8, 0x0c /*cst.CODE_DOUBLE_LITTLE*/);
          for (var i = 0; i < 8; i++) {
            writer.write(8, t[7 - i]);
          }
          writer.size_32 += 3;
          writer.size_64 += 2;
        } else if (v >= 0 && v < 0x40) {
          writer.write(8, 0x40 /*cst.PREFIX_SMALL_INT*/ + v);
        } else {
          if (v >= -(1 << 7) && v < 1 << 7)
            writer.write_code(8, 0x00 /*cst.CODE_INT8*/, v);
          else if (v >= -(1 << 15) && v < 1 << 15)
            writer.write_code(16, 0x01 /*cst.CODE_INT16*/, v);
          else writer.write_code(32, 0x02 /*cst.CODE_INT32*/, v);
        }
      }
    }
    extern_rec(v);
    while (stack.length > 0) {
      var i = stack.pop();
      var v = stack.pop();
      if (i + 1 < v.length) stack.push(v, i + 1);
      extern_rec(v[i]);
    }
    if (intern_obj_table) writer.obj_counter = intern_obj_table.objs.length;
    writer.finalize();
    return new Uint8Array(writer.chunk);
  };
})();

//Provides: caml_output_value_to_string mutable
//Requires: caml_output_val, caml_string_of_uint8_array
function caml_output_value_to_string(v, flags) {
  return caml_string_of_uint8_array(caml_output_val(v, flags));
}

//Provides: caml_output_value_to_bytes mutable
//Requires: caml_output_val, caml_bytes_of_uint8_array
function caml_output_value_to_bytes(v, flags) {
  return caml_bytes_of_uint8_array(caml_output_val(v, flags));
}

//Provides: caml_output_value_to_buffer
//Requires: caml_output_val, caml_failwith, caml_blit_bytes, caml_bytes_of_uint8_array
function caml_output_value_to_buffer(s, ofs, len, v, flags) {
  var t = caml_output_val(v, flags);
  if (t.length > len) caml_failwith("Marshal.to_buffer: buffer overflow");
  caml_blit_bytes(caml_bytes_of_uint8_array(t), 0, s, ofs, t.length);
  // Return the number of bytes written, like the native runtime.
  return t.length;
}

//# 1 "+md5.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_md5_chan
//Requires: caml_string_of_uint8_array
//Requires: caml_raise_end_of_file, caml_ml_input_block
//Requires: caml_MD5Init, caml_MD5Update, caml_MD5Final
function caml_md5_chan(chanid, toread) {
  var ctx = caml_MD5Init();
  var buffer = new Uint8Array(4096);
  if (toread < 0) {
    while (true) {
      var read = caml_ml_input_block(chanid, buffer, 0, buffer.length);
      if (read === 0) break;
      caml_MD5Update(ctx, buffer.subarray(0, read), read);
    }
  } else {
    while (toread > 0) {
      var read = caml_ml_input_block(
        chanid,
        buffer,
        0,
        toread > buffer.length ? buffer.length : toread,
      );
      if (read === 0) caml_raise_end_of_file();
      caml_MD5Update(ctx, buffer.subarray(0, read), read);
      toread -= read;
    }
  }
  return caml_string_of_uint8_array(caml_MD5Final(ctx));
}

//Provides: caml_md5_string
//Requires: caml_bytes_of_string, caml_md5_bytes
function caml_md5_string(s, ofs, len) {
  return caml_md5_bytes(caml_bytes_of_string(s), ofs, len);
}

//Provides: caml_MD5Transform
var caml_MD5Transform = (function () {
  function add(x, y) {
    return (x + y) | 0;
  }
  function xx(q, a, b, x, s, t) {
    a = add(add(a, q), add(x, t));
    return add((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a, b, c, d, x, s, t) {
    return xx((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return xx((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return xx(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return xx(c ^ (b | ~d), a, b, x, s, t);
  }

  return function (w, buffer) {
    var a = w[0],
      b = w[1],
      c = w[2],
      d = w[3];

    a = ff(a, b, c, d, buffer[0], 7, 0xd76aa478);
    d = ff(d, a, b, c, buffer[1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, buffer[2], 17, 0x242070db);
    b = ff(b, c, d, a, buffer[3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, buffer[4], 7, 0xf57c0faf);
    d = ff(d, a, b, c, buffer[5], 12, 0x4787c62a);
    c = ff(c, d, a, b, buffer[6], 17, 0xa8304613);
    b = ff(b, c, d, a, buffer[7], 22, 0xfd469501);
    a = ff(a, b, c, d, buffer[8], 7, 0x698098d8);
    d = ff(d, a, b, c, buffer[9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, buffer[10], 17, 0xffff5bb1);
    b = ff(b, c, d, a, buffer[11], 22, 0x895cd7be);
    a = ff(a, b, c, d, buffer[12], 7, 0x6b901122);
    d = ff(d, a, b, c, buffer[13], 12, 0xfd987193);
    c = ff(c, d, a, b, buffer[14], 17, 0xa679438e);
    b = ff(b, c, d, a, buffer[15], 22, 0x49b40821);

    a = gg(a, b, c, d, buffer[1], 5, 0xf61e2562);
    d = gg(d, a, b, c, buffer[6], 9, 0xc040b340);
    c = gg(c, d, a, b, buffer[11], 14, 0x265e5a51);
    b = gg(b, c, d, a, buffer[0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, buffer[5], 5, 0xd62f105d);
    d = gg(d, a, b, c, buffer[10], 9, 0x02441453);
    c = gg(c, d, a, b, buffer[15], 14, 0xd8a1e681);
    b = gg(b, c, d, a, buffer[4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, buffer[9], 5, 0x21e1cde6);
    d = gg(d, a, b, c, buffer[14], 9, 0xc33707d6);
    c = gg(c, d, a, b, buffer[3], 14, 0xf4d50d87);
    b = gg(b, c, d, a, buffer[8], 20, 0x455a14ed);
    a = gg(a, b, c, d, buffer[13], 5, 0xa9e3e905);
    d = gg(d, a, b, c, buffer[2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, buffer[7], 14, 0x676f02d9);
    b = gg(b, c, d, a, buffer[12], 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, buffer[5], 4, 0xfffa3942);
    d = hh(d, a, b, c, buffer[8], 11, 0x8771f681);
    c = hh(c, d, a, b, buffer[11], 16, 0x6d9d6122);
    b = hh(b, c, d, a, buffer[14], 23, 0xfde5380c);
    a = hh(a, b, c, d, buffer[1], 4, 0xa4beea44);
    d = hh(d, a, b, c, buffer[4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, buffer[7], 16, 0xf6bb4b60);
    b = hh(b, c, d, a, buffer[10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, buffer[13], 4, 0x289b7ec6);
    d = hh(d, a, b, c, buffer[0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, buffer[3], 16, 0xd4ef3085);
    b = hh(b, c, d, a, buffer[6], 23, 0x04881d05);
    a = hh(a, b, c, d, buffer[9], 4, 0xd9d4d039);
    d = hh(d, a, b, c, buffer[12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, buffer[15], 16, 0x1fa27cf8);
    b = hh(b, c, d, a, buffer[2], 23, 0xc4ac5665);

    a = ii(a, b, c, d, buffer[0], 6, 0xf4292244);
    d = ii(d, a, b, c, buffer[7], 10, 0x432aff97);
    c = ii(c, d, a, b, buffer[14], 15, 0xab9423a7);
    b = ii(b, c, d, a, buffer[5], 21, 0xfc93a039);
    a = ii(a, b, c, d, buffer[12], 6, 0x655b59c3);
    d = ii(d, a, b, c, buffer[3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, buffer[10], 15, 0xffeff47d);
    b = ii(b, c, d, a, buffer[1], 21, 0x85845dd1);
    a = ii(a, b, c, d, buffer[8], 6, 0x6fa87e4f);
    d = ii(d, a, b, c, buffer[15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, buffer[6], 15, 0xa3014314);
    b = ii(b, c, d, a, buffer[13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, buffer[4], 6, 0xf7537e82);
    d = ii(d, a, b, c, buffer[11], 10, 0xbd3af235);
    c = ii(c, d, a, b, buffer[2], 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, buffer[9], 21, 0xeb86d391);

    w[0] = add(a, w[0]);
    w[1] = add(b, w[1]);
    w[2] = add(c, w[2]);
    w[3] = add(d, w[3]);
  };
})();

//Provides: caml_MD5Init
function caml_MD5Init() {
  var buffer = new ArrayBuffer(64);
  var b32 = new Uint32Array(buffer);
  var b8 = new Uint8Array(buffer);
  return {
    len: 0,
    w: new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]),
    b32: b32,
    b8: b8,
  };
}

//Provides: caml_MD5Update
//Requires: caml_MD5Transform
function caml_MD5Update(ctx, input, input_len) {
  var in_buf = ctx.len & 0x3f;
  var input_pos = 0;
  ctx.len += input_len;
  if (in_buf) {
    var missing = 64 - in_buf;
    if (input_len < missing) {
      ctx.b8.set(input.subarray(0, input_len), in_buf);
      return;
    }
    ctx.b8.set(input.subarray(0, missing), in_buf);
    caml_MD5Transform(ctx.w, ctx.b32);
    input_len -= missing;
    input_pos += missing;
  }
  while (input_len >= 64) {
    ctx.b8.set(input.subarray(input_pos, input_pos + 64), 0);
    caml_MD5Transform(ctx.w, ctx.b32);
    input_len -= 64;
    input_pos += 64;
  }
  if (input_len)
    ctx.b8.set(input.subarray(input_pos, input_pos + input_len), 0);
}

//Provides: caml_MD5Final
//Requires: caml_MD5Transform
function caml_MD5Final(ctx) {
  var in_buf = ctx.len & 0x3f;
  ctx.b8[in_buf] = 0x80;
  in_buf++;
  if (in_buf > 56) {
    for (var j = in_buf; j < 64; j++) {
      ctx.b8[j] = 0;
    }
    caml_MD5Transform(ctx.w, ctx.b32);
    for (var j = 0; j < 56; j++) {
      ctx.b8[j] = 0;
    }
  } else {
    for (var j = in_buf; j < 56; j++) {
      ctx.b8[j] = 0;
    }
  }
  ctx.b32[14] = ctx.len << 3;
  // high word of the 64-bit bit length: compute by division so the
  // length is not truncated to 32 bits (wrong for inputs >= 2 GiB)
  ctx.b32[15] = (ctx.len / 0x20000000) | 0;
  caml_MD5Transform(ctx.w, ctx.b32);
  var t = new Uint8Array(16);
  for (var i = 0; i < 4; i++)
    for (var j = 0; j < 4; j++) t[i * 4 + j] = (ctx.w[i] >> (8 * j)) & 0xff;
  return t;
}

//Provides: caml_md5_bytes
//Requires: caml_uint8_array_of_bytes, caml_string_of_uint8_array
//Requires: caml_MD5Init, caml_MD5Update, caml_MD5Final
function caml_md5_bytes(s, ofs, len) {
  var ctx = caml_MD5Init();
  var a = caml_uint8_array_of_bytes(s);
  caml_MD5Update(ctx, a.subarray(ofs, ofs + len), len);
  return caml_string_of_uint8_array(caml_MD5Final(ctx));
}

//# 1 "+mlBytes.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010-2014 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

// An OCaml string is an object with three fields:
// - tag 't'
// - length 'l'
// - contents 'c'
//
// The contents of the string can be either a JavaScript array or
// a JavaScript string. The length of this string can be less than the
// length of the OCaml string. In this case, remaining bytes are
// assumed to be zeroes. Arrays are mutable but consumes more memory
// than strings. A common pattern is to start from an empty string and
// progressively fill it from the start. Partial strings makes it
// possible to implement this efficiently.
//
// When converting to and from UTF-16, we keep track of whether the
// string is composed only of ASCII characters (in which case, no
// conversion needs to be performed) or not.
//
// The string tag can thus take the following values:
//   full string     BYTE | UNKNOWN:      0
//                   BYTE | ASCII:        9
//                   BYTE | NOT_ASCII:    8
//   string prefix   PARTIAL:             2
//   array           ARRAY:               4
//
// One can use bit masking to discriminate these different cases:
//   known_encoding(x) = x&8
//   is_ascii(x) =       x&1
//   kind(x) =           x&6

//Provides: caml_str_repeat
function caml_str_repeat(n, s) {
  return s.repeat(n);
}

//Provides: caml_subarray_to_jsbytes
//Weakdef
// Pre ECMAScript 5, [apply] would not support array-like object.
// In such setup, Typed_array would be implemented as polyfill, and [f.apply] would
// fail here. Mark the primitive as Weakdef, so that people can override it easily.
function caml_subarray_to_jsbytes(a, i, len) {
  var f = String.fromCharCode;
  if (i === 0 && len <= 4096 && len === a.length) return f.apply(null, a);
  var s = "";
  for (; 0 < len; i += 1024, len -= 1024)
    s += f.apply(null, a.slice(i, i + Math.min(len, 1024)));
  return s;
}

//Provides: caml_sub_uint8_array_to_jsbytes
//Weakdef
// Pre ECMAScript 5, [apply] would not support array-like object.
// In such setup, Typed_array would be implemented as polyfill, and [f.apply] would
// fail here. Mark the primitive as Weakdef, so that people can override it easily.
function caml_sub_uint8_array_to_jsbytes(a, i, len) {
  var f = String.fromCharCode;
  if (i === 0 && len <= 4096 && len === a.length) return f.apply(null, a);
  var s = "";
  for (; 0 < len; i += 1024, len -= 1024)
    s += f.apply(null, a.subarray(i, i + Math.min(len, 1024)));
  return s;
}

//Provides: jsoo_is_ascii
function jsoo_is_ascii(s) {
  // The regular expression gets better at around this point for all browsers
  if (s.length < 24) {
    // Spidermonkey gets much slower when s.length >= 24 (on 64 bit archs)
    for (var i = 0; i < s.length; i++) if (s.charCodeAt(i) > 127) return false;
    return true;
  }
  // biome-ignore lint/suspicious/noControlCharactersInRegex: expected
  else return !/[^\x00-\x7f]/.test(s);
}

//Provides: caml_bytes_unsafe_get mutable
function caml_bytes_unsafe_get(s, i) {
  switch (s.t & 6) {
    case 0 /* BYTES */:
      return s.c.charCodeAt(i);
    case 2 /* PARTIAL */:
      if (i >= s.c.length) return 0;
      return s.c.charCodeAt(i);
    case 4 /* ARRAY */:
      return s.c[i];
  }
}

//Provides: caml_bytes_unsafe_set
//Requires: caml_convert_bytes_to_array
function caml_bytes_unsafe_set(s, i, c) {
  // The OCaml compiler uses Char.unsafe_chr on integers larger than 255!
  c &= 0xff;
  if (s.t !== 4 /* ARRAY */) {
    if (i === s.c.length) {
      s.c += String.fromCharCode(c);
      if (i + 1 === s.l) s.t = 0; /*BYTES | UNKNOWN*/
      return 0;
    }
    caml_convert_bytes_to_array(s);
  }
  s.c[i] = c;
  return 0;
}

//Provides: caml_string_bound_error
//Requires: caml_invalid_argument
function caml_string_bound_error() {
  caml_invalid_argument("index out of bounds");
}

//Provides: caml_bytes_bound_error
//Requires: caml_invalid_argument
function caml_bytes_bound_error() {
  caml_invalid_argument("index out of bounds");
}

//Provides: caml_string_get
//Requires: caml_string_bound_error, caml_string_unsafe_get
//Requires: caml_ml_string_length
function caml_string_get(s, i) {
  if (i >>> 0 >= caml_ml_string_length(s)) caml_string_bound_error();
  return caml_string_unsafe_get(s, i);
}

//Provides: caml_string_get16
//Requires: caml_string_unsafe_get, caml_string_bound_error
//Requires: caml_ml_string_length
function caml_string_get16(s, i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 1) caml_string_bound_error();
  var b1 = caml_string_unsafe_get(s, i),
    b2 = caml_string_unsafe_get(s, i + 1);
  return (b2 << 8) | b1;
}

//Provides: caml_bytes_get16
//Requires: caml_bytes_unsafe_get, caml_bytes_bound_error
function caml_bytes_get16(s, i) {
  if (i >>> 0 >= s.l - 1) caml_bytes_bound_error();
  var b1 = caml_bytes_unsafe_get(s, i),
    b2 = caml_bytes_unsafe_get(s, i + 1);
  return (b2 << 8) | b1;
}

//Provides: caml_string_get32
//Requires: caml_string_unsafe_get, caml_string_bound_error
//Requires: caml_ml_string_length
function caml_string_get32(s, i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 3) caml_string_bound_error();
  var b1 = caml_string_unsafe_get(s, i),
    b2 = caml_string_unsafe_get(s, i + 1),
    b3 = caml_string_unsafe_get(s, i + 2),
    b4 = caml_string_unsafe_get(s, i + 3);
  return (b4 << 24) | (b3 << 16) | (b2 << 8) | b1;
}

//Provides: caml_bytes_get32
//Requires: caml_bytes_unsafe_get, caml_bytes_bound_error
function caml_bytes_get32(s, i) {
  if (i >>> 0 >= s.l - 3) caml_bytes_bound_error();
  var b1 = caml_bytes_unsafe_get(s, i),
    b2 = caml_bytes_unsafe_get(s, i + 1),
    b3 = caml_bytes_unsafe_get(s, i + 2),
    b4 = caml_bytes_unsafe_get(s, i + 3);
  return (b4 << 24) | (b3 << 16) | (b2 << 8) | b1;
}

//Provides: caml_string_get64
//Requires: caml_string_unsafe_get, caml_string_bound_error
//Requires: caml_int64_of_bytes
//Requires: caml_ml_string_length
function caml_string_get64(s, i) {
  if (i >>> 0 >= caml_ml_string_length(s) - 7) caml_string_bound_error();
  var a = new Array(8);
  for (var j = 0; j < 8; j++) {
    a[7 - j] = caml_string_unsafe_get(s, i + j);
  }
  return caml_int64_of_bytes(a);
}

//Provides: caml_bytes_get64
//Requires: caml_bytes_unsafe_get, caml_bytes_bound_error
//Requires: caml_int64_of_bytes
function caml_bytes_get64(s, i) {
  if (i >>> 0 >= s.l - 7) caml_bytes_bound_error();
  var a = new Array(8);
  for (var j = 0; j < 8; j++) {
    a[7 - j] = caml_bytes_unsafe_get(s, i + j);
  }
  return caml_int64_of_bytes(a);
}

//Provides: caml_bytes_get
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_get
function caml_bytes_get(s, i) {
  if (i >>> 0 >= s.l) caml_bytes_bound_error();
  return caml_bytes_unsafe_get(s, i);
}

//Provides: caml_string_set
//Requires: caml_failwith
//If: js-string
function caml_string_set(_s, _i, _c) {
  caml_failwith("caml_string_set");
}

//Provides: caml_string_set
//Requires: caml_string_unsafe_set, caml_string_bound_error
//If: !js-string
function caml_string_set(s, i, c) {
  if (i >>> 0 >= s.l) caml_string_bound_error();
  return caml_string_unsafe_set(s, i, c);
}

//Provides: caml_bytes_set16
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_set
function caml_bytes_set16(s, i, i16) {
  if (i >>> 0 >= s.l - 1) caml_bytes_bound_error();
  var b2 = 0xff & (i16 >> 8),
    b1 = 0xff & i16;
  caml_bytes_unsafe_set(s, i + 0, b1);
  caml_bytes_unsafe_set(s, i + 1, b2);
  return 0;
}

//Provides: caml_bytes_set32
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_set
function caml_bytes_set32(s, i, i32) {
  if (i >>> 0 >= s.l - 3) caml_bytes_bound_error();
  var b4 = 0xff & (i32 >> 24),
    b3 = 0xff & (i32 >> 16),
    b2 = 0xff & (i32 >> 8),
    b1 = 0xff & i32;
  caml_bytes_unsafe_set(s, i + 0, b1);
  caml_bytes_unsafe_set(s, i + 1, b2);
  caml_bytes_unsafe_set(s, i + 2, b3);
  caml_bytes_unsafe_set(s, i + 3, b4);
  return 0;
}

//Provides: caml_bytes_set64
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_set
//Requires: caml_int64_to_bytes
function caml_bytes_set64(s, i, i64) {
  if (i >>> 0 >= s.l - 7) caml_bytes_bound_error();
  var a = caml_int64_to_bytes(i64);
  for (var j = 0; j < 8; j++) {
    caml_bytes_unsafe_set(s, i + 7 - j, a[j]);
  }
  return 0;
}

//Provides: caml_bytes_set
//Requires: caml_bytes_bound_error, caml_bytes_unsafe_set
function caml_bytes_set(s, i, c) {
  if (i >>> 0 >= s.l) caml_bytes_bound_error();
  return caml_bytes_unsafe_set(s, i, c);
}

//Provides: jsoo_text_encoder_fallback
// Small UTF-8 encoder used when the host doesn't provide TextEncoder
// (e.g. QuickJS). WHATWG-compatible: lone UTF-16 surrogates become the
// UTF-8 encoding of U+FFFD.
var jsoo_text_encoder_fallback = {
  encode: (s) => {
    var len = s.length;
    var n = 0;
    for (var i = 0; i < len; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) n += 1;
      else if (c < 0x800) n += 2;
      else if (c < 0xd800 || c >= 0xe000) n += 3;
      else if (c < 0xdc00 && i + 1 < len) {
        var c2 = s.charCodeAt(i + 1);
        if (c2 >= 0xdc00 && c2 < 0xe000) {
          n += 4;
          i++;
        } else n += 3; /* lone high surrogate -> U+FFFD */
      } else n += 3; /* lone low surrogate or trailing high -> U+FFFD */
    }
    var bytes = new Uint8Array(n);
    var j = 0;
    for (var i = 0; i < len; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) {
        bytes[j++] = c;
      } else if (c < 0x800) {
        bytes[j++] = 0xc0 | (c >> 6);
        bytes[j++] = 0x80 | (c & 0x3f);
      } else if (c < 0xd800 || c >= 0xe000) {
        bytes[j++] = 0xe0 | (c >> 12);
        bytes[j++] = 0x80 | ((c >> 6) & 0x3f);
        bytes[j++] = 0x80 | (c & 0x3f);
      } else if (c < 0xdc00 && i + 1 < len) {
        var c2 = s.charCodeAt(i + 1);
        if (c2 >= 0xdc00 && c2 < 0xe000) {
          var cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
          bytes[j++] = 0xf0 | (cp >> 18);
          bytes[j++] = 0x80 | ((cp >> 12) & 0x3f);
          bytes[j++] = 0x80 | ((cp >> 6) & 0x3f);
          bytes[j++] = 0x80 | (cp & 0x3f);
          i++;
        } else {
          /* lone high surrogate */
          bytes[j++] = 0xef;
          bytes[j++] = 0xbf;
          bytes[j++] = 0xbd;
        }
      } else {
        /* lone low surrogate or trailing high surrogate */
        bytes[j++] = 0xef;
        bytes[j++] = 0xbf;
        bytes[j++] = 0xbd;
      }
    }
    return bytes;
  },
};

//Provides: jsoo_text_encoder
//Requires: jsoo_text_encoder_fallback
var jsoo_text_encoder =
  typeof TextEncoder !== "undefined"
    ? new TextEncoder()
    : jsoo_text_encoder_fallback;

//Provides: jsoo_text_decoder_fallback
// Small UTF-8 decoder used when the host doesn't provide TextDecoder
// (e.g. QuickJS). Default-only (utf-8, fatal=false) and implements the
// WHATWG substitution-of-maximal-subpart rule: an invalid sequence is
// replaced by a single U+FFFD that consumes the longest prefix that
// could have started a valid sequence (1 byte if no valid prefix).
var jsoo_text_decoder_fallback = {
  decode: (a) => {
    var len = a.length;
    var s = "";
    var i = 0;
    var REPL = 0xfffd;
    var cont = (b) => (b & 0xc0) === 0x80;
    while (i < len) {
      var b1 = a[i++];
      var cp;
      if (b1 < 0x80) {
        cp = b1;
      } else if (b1 < 0xc2 || b1 > 0xf4) {
        // 0x80..0xbf: stray continuation; 0xc0/0xc1: overlong;
        // 0xf5..0xff: out of Unicode range. None start a sequence.
        cp = REPL;
      } else if (b1 < 0xe0) {
        if (i < len && cont(a[i])) cp = ((b1 & 0x1f) << 6) | (a[i++] & 0x3f);
        else cp = REPL;
      } else if (b1 < 0xf0) {
        // Reject UTF-16 surrogates and non-shortest encodings.
        var lo = b1 === 0xe0 ? 0xa0 : 0x80;
        var hi = b1 === 0xed ? 0x9f : 0xbf;
        var b2 = i < len ? a[i] : -1;
        if (b2 < lo || b2 > hi) cp = REPL;
        else if (i + 1 < len && cont(a[i + 1])) {
          cp = ((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (a[i + 1] & 0x3f);
          i += 2;
        } else {
          /* valid 2-byte prefix, but third byte missing or invalid */
          cp = REPL;
          i += 1;
        }
      } else {
        var lo = b1 === 0xf0 ? 0x90 : 0x80;
        var hi = b1 === 0xf4 ? 0x8f : 0xbf;
        var b2 = i < len ? a[i] : -1;
        if (b2 < lo || b2 > hi) cp = REPL;
        else if (i + 1 < len && cont(a[i + 1])) {
          if (i + 2 < len && cont(a[i + 2])) {
            cp =
              ((b1 & 0x07) << 18) |
              ((b2 & 0x3f) << 12) |
              ((a[i + 1] & 0x3f) << 6) |
              (a[i + 2] & 0x3f);
            i += 3;
          } else {
            /* valid 3-byte prefix, fourth byte missing or invalid */
            cp = REPL;
            i += 2;
          }
        } else {
          /* valid 2-byte prefix, third byte missing or invalid */
          cp = REPL;
          i += 1;
        }
      }
      if (cp <= 0xffff) s += String.fromCharCode(cp);
      else {
        cp -= 0x10000;
        s += String.fromCharCode(0xd800 | (cp >> 10), 0xdc00 | (cp & 0x3ff));
      }
    }
    return s;
  },
};

//Provides: jsoo_text_decoder
//Requires: jsoo_text_decoder_fallback
var jsoo_text_decoder =
  typeof TextDecoder !== "undefined"
    ? new TextDecoder()
    : jsoo_text_decoder_fallback;

//Provides: caml_bytes_of_utf16_jsstring
//Requires: MlBytes, jsoo_text_encoder
//Requires: jsoo_is_ascii
function caml_bytes_of_utf16_jsstring(s) {
  if (jsoo_is_ascii(s)) {
    return new MlBytes(9, s, s.length);
  } else {
    var a = jsoo_text_encoder.encode(s);
    return new MlBytes(4, a, a.length);
  }
}

//Provides: MlBytes
//Requires: caml_convert_string_to_bytes, jsoo_is_ascii
//Requires: caml_uint8_array_of_bytes
//Requires: jsoo_text_decoder
class MlBytes {
  constructor(tag, contents, length) {
    this.t = tag;
    this.c = contents;
    this.l = length;
  }

  toString() {
    switch (this.t) {
      case 9: /*BYTES | ASCII*/
      case 8 /*BYTES | NOT_ASCII*/:
        return this.c;
      case 4: /* ARRAY */
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
      case 2 /* PARTIAL */:
        caml_convert_string_to_bytes(this);
      // falls through
      case 0 /*BYTES | UNKNOWN*/:
        if (jsoo_is_ascii(this.c)) this.t = 9; /*BYTES | ASCII*/
        else this.t = 8; /*BYTES | NOT_ASCII*/
        return this.c;
    }
  }

  toUtf16() {
    if (this.t === 9) return this.c;
    var a = caml_uint8_array_of_bytes(this);
    return jsoo_text_decoder.decode(a);
  }

  slice() {
    var content = this.t === 4 ? this.c.slice() : this.c;
    return new MlBytes(this.t, content, this.l);
  }
}

//Provides: caml_convert_string_to_bytes
//Requires: caml_str_repeat, caml_sub_uint8_array_to_jsbytes
function caml_convert_string_to_bytes(s) {
  /* Assumes not BYTES */
  if (s.t === 2 /* PARTIAL */) s.c += caml_str_repeat(s.l - s.c.length, "\0");
  else s.c = caml_sub_uint8_array_to_jsbytes(s.c, 0, s.c.length);
  s.t = 0; /*BYTES | UNKNOWN*/
}

//Provides: caml_convert_bytes_to_array
function caml_convert_bytes_to_array(s) {
  /* Assumes not ARRAY */
  var a = new Uint8Array(s.l);
  var b = s.c,
    l = b.length,
    i = 0;
  for (; i < l; i++) a[i] = b.charCodeAt(i);
  for (l = s.l; i < l; i++) a[i] = 0;
  s.c = a;
  s.t = 4; /* ARRAY */
  return a;
}

//Provides: caml_uint8_array_of_bytes mutable
//Requires: caml_convert_bytes_to_array
function caml_uint8_array_of_bytes(s) {
  if (s.t !== 4 /* ARRAY */) caml_convert_bytes_to_array(s);
  return s.c;
}

//Provides: caml_uint8_array_of_string mutable
//Requires: caml_ml_string_length, caml_string_unsafe_get
function caml_uint8_array_of_string(s) {
  var l = caml_ml_string_length(s);
  var a = new Uint8Array(l);
  var i = 0;
  for (; i < l; i++) a[i] = caml_string_unsafe_get(s, i);
  return a;
}

//Provides: caml_create_string const
//Requires: MlBytes, caml_invalid_argument
//If: !js-string
function caml_create_string(len) {
  if (len < 0) caml_invalid_argument("String.create");
  return new MlBytes(len ? 2 : 9, "", len);
}

//Provides: caml_create_string const
//Requires: caml_invalid_argument
//If: js-string
function caml_create_string(_len) {
  caml_invalid_argument("String.create");
}

//Provides: caml_create_bytes const
//Requires: MlBytes,caml_invalid_argument
//Alias: caml_create_local_bytes
function caml_create_bytes(len) {
  if (len < 0) caml_invalid_argument("Bytes.create");
  return new MlBytes(len ? 2 : 9, "", len);
}

//Provides: caml_string_of_array
//Requires: caml_subarray_to_jsbytes, caml_string_of_jsbytes
function caml_string_of_array(a) {
  return caml_string_of_jsbytes(caml_subarray_to_jsbytes(a, 0, a.length));
}

//Provides: caml_string_of_uint8_array
//Requires: caml_sub_uint8_array_to_jsbytes
//If: js-string
function caml_string_of_uint8_array(a) {
  return caml_sub_uint8_array_to_jsbytes(a, 0, a.length);
}

//Provides: caml_string_of_uint8_array
//Requires: caml_bytes_of_uint8_array
//If: !js-string
function caml_string_of_uint8_array(a) {
  return caml_bytes_of_uint8_array(a.slice());
}

//Provides: caml_bytes_of_array
//Requires: MlBytes
function caml_bytes_of_array(a) {
  if (!(a instanceof Uint8Array)) {
    a = new Uint8Array(a);
  }
  return new MlBytes(4, a, a.length);
}

//Provides: caml_bytes_of_uint8_array
//Requires: MlBytes
function caml_bytes_of_uint8_array(a) {
  return new MlBytes(4, a, a.length);
}

//Provides: caml_bytes_compare mutable
//Requires: caml_convert_string_to_bytes
function caml_bytes_compare(s1, s2) {
  s1.t & 6 && caml_convert_string_to_bytes(s1);
  s2.t & 6 && caml_convert_string_to_bytes(s2);
  return s1.c < s2.c ? -1 : s1.c > s2.c ? 1 : 0;
}

//Provides: caml_bytes_equal mutable (const, const)
//Requires: caml_convert_string_to_bytes
function caml_bytes_equal(s1, s2) {
  if (s1 === s2) return 1;
  s1.t & 6 && caml_convert_string_to_bytes(s1);
  s2.t & 6 && caml_convert_string_to_bytes(s2);
  return s1.c === s2.c ? 1 : 0;
}

//Provides: caml_string_notequal mutable (const, const)
//Requires: caml_string_equal
function caml_string_notequal(s1, s2) {
  return 1 - caml_string_equal(s1, s2);
}

//Provides: caml_bytes_notequal mutable (const, const)
//Requires: caml_bytes_equal
function caml_bytes_notequal(s1, s2) {
  return 1 - caml_bytes_equal(s1, s2);
}

//Provides: caml_bytes_lessequal mutable
//Requires: caml_convert_string_to_bytes
function caml_bytes_lessequal(s1, s2) {
  s1.t & 6 && caml_convert_string_to_bytes(s1);
  s2.t & 6 && caml_convert_string_to_bytes(s2);
  return s1.c <= s2.c ? 1 : 0;
}

//Provides: caml_bytes_lessthan mutable
//Requires: caml_convert_string_to_bytes
function caml_bytes_lessthan(s1, s2) {
  s1.t & 6 && caml_convert_string_to_bytes(s1);
  s2.t & 6 && caml_convert_string_to_bytes(s2);
  return s1.c < s2.c ? 1 : 0;
}

//Provides: caml_string_greaterequal
//Requires: caml_string_lessequal
function caml_string_greaterequal(s1, s2) {
  return caml_string_lessequal(s2, s1);
}
//Provides: caml_bytes_greaterequal
//Requires: caml_bytes_lessequal
function caml_bytes_greaterequal(s1, s2) {
  return caml_bytes_lessequal(s2, s1);
}

//Provides: caml_string_greaterthan
//Requires: caml_string_lessthan
function caml_string_greaterthan(s1, s2) {
  return caml_string_lessthan(s2, s1);
}

//Provides: caml_bytes_greaterthan
//Requires: caml_bytes_lessthan
function caml_bytes_greaterthan(s1, s2) {
  return caml_bytes_lessthan(s2, s1);
}

//Provides: caml_fill_bytes
//Requires: caml_str_repeat, caml_convert_bytes_to_array
//Alias: caml_fill_string
function caml_fill_bytes(s, i, l, c) {
  if (l > 0) {
    if (i === 0 && (l >= s.l || (s.t === 2 /* PARTIAL */ && l >= s.c.length))) {
      if (c === 0) {
        s.c = "";
        s.t = 2; /* PARTIAL */
      } else {
        s.c = caml_str_repeat(l, String.fromCharCode(c));
        s.t = l === s.l ? 0 /* BYTES | UNKNOWN */ : 2; /* PARTIAL */
      }
    } else {
      if (s.t !== 4 /* ARRAY */) caml_convert_bytes_to_array(s);
      for (l += i; i < l; i++) s.c[i] = c;
    }
  }
  return 0;
}

//Provides: caml_blit_bytes
//Requires: caml_sub_uint8_array_to_jsbytes, caml_convert_bytes_to_array
function caml_blit_bytes(s1, i1, s2, i2, len) {
  if (len === 0) return 0;
  if (
    i2 === 0 &&
    (len >= s2.l || (s2.t === 2 /* PARTIAL */ && len >= s2.c.length))
  ) {
    s2.c =
      s1.t === 4 /* ARRAY */
        ? caml_sub_uint8_array_to_jsbytes(s1.c, i1, len)
        : i1 === 0 && s1.c.length === len
          ? s1.c
          : s1.c.slice(i1, i1 + len);
    s2.t = s2.c.length === s2.l ? 0 /* BYTES | UNKNOWN */ : 2; /* PARTIAL */
  } else if (s2.t === 2 /* PARTIAL */ && i2 === s2.c.length) {
    s2.c +=
      s1.t === 4 /* ARRAY */
        ? caml_sub_uint8_array_to_jsbytes(s1.c, i1, len)
        : i1 === 0 && s1.c.length === len
          ? s1.c
          : s1.c.slice(i1, i1 + len);
    s2.t = s2.c.length === s2.l ? 0 /* BYTES | UNKNOWN */ : 2; /* PARTIAL */
  } else {
    if (s2.t !== 4 /* ARRAY */) caml_convert_bytes_to_array(s2);
    var c1 = s1.c,
      c2 = s2.c;
    if (s1.t === 4 /* ARRAY */) {
      if (i2 <= i1) {
        for (var i = 0; i < len; i++) c2[i2 + i] = c1[i1 + i];
      } else {
        for (var i = len - 1; i >= 0; i--) c2[i2 + i] = c1[i1 + i];
      }
    } else {
      var l = Math.min(len, c1.length - i1);
      for (var i = 0; i < l; i++) c2[i2 + i] = c1.charCodeAt(i1 + i);
      for (; i < len; i++) c2[i2 + i] = 0;
    }
  }
  return 0;
}

//Provides: caml_blit_string
//Requires: caml_blit_bytes, caml_bytes_of_string
function caml_blit_string(a, b, c, d, e) {
  caml_blit_bytes(caml_bytes_of_string(a), b, c, d, e);
  return 0;
}

//Provides: caml_ml_bytes_length const
function caml_ml_bytes_length(s) {
  return s.l;
}

//Provides: caml_string_concat const
//If: js-string
function caml_string_concat(a, b) {
  return a + b;
}

//Provides: caml_string_concat const
//Requires: caml_convert_string_to_bytes, MlBytes
//If: !js-string
function caml_string_concat(s1, s2) {
  s1.t & 6 && caml_convert_string_to_bytes(s1);
  s2.t & 6 && caml_convert_string_to_bytes(s2);
  return new MlBytes(0, s1.c + s2.c, s1.l + s2.l);
}

//Provides: caml_string_unsafe_get const
//If: js-string
function caml_string_unsafe_get(s, i) {
  return s.charCodeAt(i);
}

//Provides: caml_ml_string_length const
//If: js-string
function caml_ml_string_length(s) {
  return s.length;
}

//Provides: caml_string_compare const
//If: js-string
function caml_string_compare(s1, s2) {
  return s1 < s2 ? -1 : s1 > s2 ? 1 : 0;
}

//Provides: caml_string_equal const
//If: js-string
function caml_string_equal(s1, s2) {
  if (s1 === s2) return 1;
  return 0;
}

//Provides: caml_string_lessequal const
//If: js-string
function caml_string_lessequal(s1, s2) {
  return s1 <= s2 ? 1 : 0;
}

//Provides: caml_string_lessthan const
//If: js-string
function caml_string_lessthan(s1, s2) {
  return s1 < s2 ? 1 : 0;
}

//Provides: caml_string_of_bytes
//Requires: caml_convert_string_to_bytes, caml_string_of_jsbytes
//If: js-string
function caml_string_of_bytes(s) {
  s.t & 6 && caml_convert_string_to_bytes(s);
  return caml_string_of_jsbytes(s.c);
}

//Provides: caml_bytes_of_string const
//Requires: caml_bytes_of_jsbytes, caml_jsbytes_of_string
//If: js-string
function caml_bytes_of_string(s) {
  return caml_bytes_of_jsbytes(caml_jsbytes_of_string(s));
}

//Provides: caml_string_of_jsbytes const
//If: js-string
function caml_string_of_jsbytes(x) {
  return x;
}

//Provides: caml_jsbytes_of_string const
//If: js-string
function caml_jsbytes_of_string(x) {
  return x;
}

//Provides: jsoo_text_decoder_buff
var jsoo_text_decoder_buff = new ArrayBuffer(1024);

//Provides: caml_jsstring_of_string const
//Requires: jsoo_is_ascii
//Requires: jsoo_text_decoder
//Requires: jsoo_text_decoder_buff
//If: js-string
function caml_jsstring_of_string(s) {
  if (jsoo_is_ascii(s)) return s;
  var a =
    s.length <= jsoo_text_decoder_buff.byteLength
      ? new Uint8Array(jsoo_text_decoder_buff, 0, s.length)
      : new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) {
    a[i] = s.charCodeAt(i);
  }
  return jsoo_text_decoder.decode(a);
}

//Provides: caml_string_of_jsstring const
//Requires: caml_string_of_array
//Requires: jsoo_text_encoder
//Requires: jsoo_is_ascii, caml_string_of_jsbytes
//If: js-string
function caml_string_of_jsstring(s) {
  if (jsoo_is_ascii(s)) return caml_string_of_jsbytes(s);
  var a = jsoo_text_encoder.encode(s);
  return caml_string_of_array(a);
}

//Provides: caml_bytes_of_jsbytes const
//Requires: MlBytes
function caml_bytes_of_jsbytes(s) {
  return new MlBytes(0, s, s.length);
}

// The section below should be used when use-js-string=false

//Provides: caml_string_unsafe_get const
//Requires: caml_bytes_unsafe_get
//If: !js-string
function caml_string_unsafe_get(s, i) {
  return caml_bytes_unsafe_get(s, i);
}

//Provides: caml_string_unsafe_set
//Requires: caml_bytes_unsafe_set
//If: !js-string
function caml_string_unsafe_set(s, i, c) {
  return caml_bytes_unsafe_set(s, i, c);
}

//Provides: caml_ml_string_length const
//Requires: caml_ml_bytes_length
//If: !js-string
function caml_ml_string_length(s) {
  return caml_ml_bytes_length(s);
}

//Provides: caml_string_compare
//Requires: caml_bytes_compare
//If: !js-string
function caml_string_compare(s1, s2) {
  return caml_bytes_compare(s1, s2);
}

//Provides: caml_string_equal
//Requires: caml_bytes_equal
//If: !js-string
function caml_string_equal(s1, s2) {
  return caml_bytes_equal(s1, s2);
}

//Provides: caml_string_lessequal
//Requires: caml_bytes_lessequal
//If: !js-string
function caml_string_lessequal(s1, s2) {
  return caml_bytes_lessequal(s1, s2);
}

//Provides: caml_string_lessthan
//Requires: caml_bytes_lessthan
//If: !js-string
function caml_string_lessthan(s1, s2) {
  return caml_bytes_lessthan(s1, s2);
}

//Provides: caml_string_of_bytes
//If: !js-string
function caml_string_of_bytes(s) {
  return s;
}

//Provides: caml_bytes_of_string const
//If: !js-string
function caml_bytes_of_string(s) {
  return s;
}

//Provides: caml_string_of_jsbytes const
//Requires: caml_bytes_of_jsbytes
//If: !js-string
function caml_string_of_jsbytes(s) {
  return caml_bytes_of_jsbytes(s);
}

//Provides: caml_jsbytes_of_string const
//Requires: caml_convert_string_to_bytes
//If: !js-string
function caml_jsbytes_of_string(s) {
  s.t & 6 && caml_convert_string_to_bytes(s);
  return s.c;
}

//Provides: caml_jsstring_of_string mutable (const)
//If: !js-string
function caml_jsstring_of_string(s) {
  return s.toUtf16();
}

//Provides: caml_string_of_jsstring
//Requires: caml_bytes_of_utf16_jsstring
//If: !js-string
function caml_string_of_jsstring(s) {
  return caml_bytes_of_utf16_jsstring(s);
}

//Provides: caml_is_ml_bytes
//Requires: MlBytes
function caml_is_ml_bytes(s) {
  return s instanceof MlBytes;
}

//Provides: caml_ml_bytes_content
//Requires: MlBytes, caml_convert_string_to_bytes
//Returns a (full) string of bytes or an array
function caml_ml_bytes_content(s) {
  switch (s.t & 6) {
    case 2 /* PARTIAL */:
      caml_convert_string_to_bytes(s);
      return s.c;
    default: /* BYTES or ARRAY */
      return s.c;
  }
}

//Provides: caml_is_ml_string
//If: js-string
function caml_is_ml_string(s) {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: expected
  return typeof s === "string" && !/[^\x00-\xff]/.test(s);
}

//Provides: caml_is_ml_string
//Requires: caml_is_ml_bytes
//If: !js-string
function caml_is_ml_string(s) {
  return caml_is_ml_bytes(s);
}

// The functions below are deprecated

//Provides: caml_js_to_byte_string const
//Requires: caml_string_of_jsbytes
//Deprecated: Use [caml_string_of_jsbytes] instead
function caml_js_to_byte_string(s) {
  return caml_string_of_jsbytes(s);
}

//Provides: caml_js_from_string mutable (const)
//Requires: caml_jsstring_of_string
//Deprecated: Use [caml_jsstring_of_string] instead
function caml_js_from_string(s) {
  return caml_jsstring_of_string(s);
}

//Provides: caml_to_js_string mutable (const)
//Requires: caml_jsstring_of_string
//Deprecated: Use [caml_jsstring_of_string] instead
function caml_to_js_string(s) {
  return caml_jsstring_of_string(s);
}

//Provides: caml_js_to_string const
//Requires: caml_string_of_jsstring
//Deprecated: Use [caml_string_of_jsstring] instead
function caml_js_to_string(s) {
  return caml_string_of_jsstring(s);
}

//Provides: caml_array_of_string
//Requires: caml_uint8_array_of_string
//Deprecated: Use [caml_uint8_array_of_string] instead
function caml_array_of_string(x) {
  return caml_uint8_array_of_string(x);
}

//Provides: caml_array_of_bytes
//Requires: caml_uint8_array_of_bytes
//Deprecated: Use [caml_uint8_array_of_bytes] instead
function caml_array_of_bytes(x) {
  return caml_uint8_array_of_bytes(x);
}

//Provides: caml_new_string
//Requires: caml_string_of_jsbytes
//Deprecated: Use [caml_string_of_jsbytes] instead
function caml_new_string(s) {
  return caml_string_of_jsbytes(s);
}

//# 1 "+nat.js"
//Provides: initialize_nat
//Requires: caml_custom_ops
//Requires: serialize_nat, deserialize_nat, caml_hash_nat
function initialize_nat() {
  caml_custom_ops._nat = {
    deserialize: deserialize_nat,
    serialize: serialize_nat,
    hash: caml_hash_nat,
  };
}

//Provides: MlNat
class MlNat {
  constructor(x) {
    this.data = new Int32Array(x);
    // For num < 1.5
    // length_nat isn't external, so we have to make the Obj.size
    // work out right.
    // We add +2 to the array length:
    // - +1 for the tag
    // - +1 for the custom_ops slot
    this.length = this.data.length + 2;
    this.caml_custom = "_nat";
  }
}

//Provides: caml_hash_nat
//Requires: caml_hash_mix_int, num_digits_nat
function caml_hash_nat(x) {
  var len = num_digits_nat(x, 0, x.data.length);
  var h = 0;
  for (var i = 0; i < len; i++) {
    h = caml_hash_mix_int(h, x.data[i]);
  }
  return h;
}

//Provides: length_nat
function length_nat(x) {
  return x.data.length;
}

//Provides: nat_of_array
//Requires: MlNat
function nat_of_array(l) {
  return new MlNat(l);
}

//Provides: create_nat
//Requires: MlNat
function create_nat(size) {
  var arr = new MlNat(size);
  for (var i = 0; i < size; i++) {
    arr.data[i] = -1;
  }
  return arr;
}

//Provides: set_to_zero_nat
function set_to_zero_nat(nat, ofs, len) {
  for (var i = 0; i < len; i++) {
    nat.data[ofs + i] = 0;
  }
  return 0;
}

//Provides: blit_nat
function blit_nat(nat1, ofs1, nat2, ofs2, len) {
  for (var i = 0; i < len; i++) {
    nat1.data[ofs1 + i] = nat2.data[ofs2 + i];
  }
  return 0;
}

//Provides: set_digit_nat
function set_digit_nat(nat, ofs, digit) {
  nat.data[ofs] = digit;
  return 0;
}

//Provides: nth_digit_nat
function nth_digit_nat(nat, ofs) {
  return nat.data[ofs];
}

//Provides: set_digit_nat_native
function set_digit_nat_native(nat, ofs, digit) {
  nat.data[ofs] = digit;
  return 0;
}

//Provides: nth_digit_nat_native
function nth_digit_nat_native(nat, ofs) {
  return nat.data[ofs];
}

//Provides: num_digits_nat
function num_digits_nat(nat, ofs, len) {
  for (var i = len - 1; i >= 0; i--) {
    if (nat.data[ofs + i] !== 0) return i + 1;
  }
  return 1; // 0 counts as 1 digit
}

//Provides: num_leading_zero_bits_in_digit
function num_leading_zero_bits_in_digit(nat, ofs) {
  var a = nat.data[ofs];
  var b = 0;
  if (a & 0xffff0000) {
    b += 16;
    a >>>= 16;
  }
  if (a & 0xff00) {
    b += 8;
    a >>>= 8;
  }
  if (a & 0xf0) {
    b += 4;
    a >>>= 4;
  }
  if (a & 12) {
    b += 2;
    a >>>= 2;
  }
  if (a & 2) {
    b += 1;
    a >>>= 1;
  }
  if (a & 1) {
    b += 1;
  }
  return 32 - b;
}

//Provides: is_digit_int
function is_digit_int(nat, ofs) {
  if (nat.data[ofs] >= 0) return 1;
  return 0;
}

//Provides: is_digit_zero
function is_digit_zero(nat, ofs) {
  if (nat.data[ofs] === 0) return 1;
  return 0;
}

//Provides: is_digit_normalized
function is_digit_normalized(_nat, _ofs) {
  return 1;
}

//Provides: is_digit_odd
function is_digit_odd(nat, ofs) {
  if (nat.data[ofs] & 1) return 1;
  return 0;
}

//Provides: incr_nat
function incr_nat(nat, ofs, len, carry_in) {
  var carry = carry_in;
  for (var i = 0; i < len; i++) {
    var x = (nat.data[ofs + i] >>> 0) + carry;
    nat.data[ofs + i] = x | 0;
    if (x === x >>> 0) {
      carry = 0;
      break;
    } else {
      carry = 1;
    }
  }
  return carry;
}

// len1 >= len2
//Provides: add_nat
//Requires: incr_nat
function add_nat(nat1, ofs1, len1, nat2, ofs2, len2, carry_in) {
  var carry = carry_in;
  for (var i = 0; i < len2; i++) {
    var x = (nat1.data[ofs1 + i] >>> 0) + (nat2.data[ofs2 + i] >>> 0) + carry;
    nat1.data[ofs1 + i] = x;
    if (x === x >>> 0) {
      carry = 0;
    } else {
      carry = 1;
    }
  }
  return incr_nat(nat1, ofs1 + len2, len1 - len2, carry);
}

//Provides: complement_nat
function complement_nat(nat, ofs, len) {
  for (var i = 0; i < len; i++) {
    nat.data[ofs + i] = (-1 >>> 0) - (nat.data[ofs + i] >>> 0);
  }
}

// ocaml flips carry_in
//Provides: decr_nat
function decr_nat(nat, ofs, len, carry_in) {
  var borrow = carry_in === 1 ? 0 : 1;
  for (var i = 0; i < len; i++) {
    var x = (nat.data[ofs + i] >>> 0) - borrow;
    nat.data[ofs + i] = x;
    if (x >= 0) {
      borrow = 0;
      break;
    } else {
      borrow = 1;
    }
  }
  return borrow === 1 ? 0 : 1;
}

// ocaml flips carry_in
// len1 >= len2
//Provides: sub_nat
//Requires: decr_nat
function sub_nat(nat1, ofs1, len1, nat2, ofs2, len2, carry_in) {
  var borrow = carry_in === 1 ? 0 : 1;
  for (var i = 0; i < len2; i++) {
    var x = (nat1.data[ofs1 + i] >>> 0) - (nat2.data[ofs2 + i] >>> 0) - borrow;
    nat1.data[ofs1 + i] = x;
    if (x >= 0) {
      borrow = 0;
    } else {
      borrow = 1;
    }
  }
  return decr_nat(nat1, ofs1 + len2, len1 - len2, borrow === 1 ? 0 : 1);
}

// nat1 += nat2 * nat3[ofs3]
// len1 >= len2
//Provides: mult_digit_nat
//Requires: add_nat, nat_of_array
function mult_digit_nat(nat1, ofs1, len1, nat2, ofs2, len2, nat3, ofs3) {
  var carry = 0;
  var a = nat3.data[ofs3] >>> 0;
  for (var i = 0; i < len2; i++) {
    var x1 =
      (nat1.data[ofs1 + i] >>> 0) +
      (nat2.data[ofs2 + i] >>> 0) * (a & 0x0000ffff) +
      carry;
    var x2 = (nat2.data[ofs2 + i] >>> 0) * (a >>> 16);
    carry = Math.floor(x2 / 65536);
    var x3 = x1 + (x2 % 65536) * 65536;
    nat1.data[ofs1 + i] = x3;
    carry += Math.floor(x3 / 4294967296);
  }

  if (len2 < len1 && carry) {
    return add_nat(
      nat1,
      ofs1 + len2,
      len1 - len2,
      nat_of_array([carry]),
      0,
      1,
      0,
    );
  } else {
    return carry;
  }
}

// nat1 += nat2 * nat3
// len1 >= len2 + len3.
//Provides: mult_nat
//Requires: mult_digit_nat
function mult_nat(nat1, ofs1, len1, nat2, ofs2, len2, nat3, ofs3, len3) {
  var carry = 0;
  for (var i = 0; i < len3; i++) {
    carry += mult_digit_nat(
      nat1,
      ofs1 + i,
      len1 - i,
      nat2,
      ofs2,
      len2,
      nat3,
      ofs3 + i,
    );
  }
  return carry;
}

// nat1 = 2 * nat1 + nat2 * nat2
// len1 >= 2 * len2
//Provides: square_nat
//Requires: mult_nat, add_nat
function square_nat(nat1, ofs1, len1, nat2, ofs2, len2) {
  var carry = 0;
  carry += add_nat(nat1, ofs1, len1, nat1, ofs1, len1, 0);
  carry += mult_nat(nat1, ofs1, len1, nat2, ofs2, len2, nat2, ofs2, len2);
  return carry;
}

// 0 <= shift < 32
//Provides: shift_left_nat
function shift_left_nat(nat1, ofs1, len1, nat2, ofs2, nbits) {
  if (nbits === 0) {
    nat2.data[ofs2] = 0;
    return 0;
  }
  var wrap = 0;
  for (var i = 0; i < len1; i++) {
    var a = nat1.data[ofs1 + i] >>> 0;
    nat1.data[ofs1 + i] = (a << nbits) | wrap;
    wrap = a >>> (32 - nbits);
  }
  nat2.data[ofs2] = wrap;
  return 0;
}

// Assuming c > a, returns [quotient, remainder] of (a<<32 + b)/c
//Provides: div_helper
function div_helper(a, b, c) {
  var x = a * 65536 + (b >>> 16);
  var y = Math.floor(x / c) * 65536;
  var z = (x % c) * 65536;
  var w = z + (b & 0x0000ffff);
  return [y + Math.floor(w / c), w % c];
}

// nat1[ofs1+len] < nat2[ofs2]
//Provides: div_digit_nat
//Requires: div_helper
function div_digit_nat(natq, ofsq, natr, ofsr, nat1, ofs1, len, nat2, ofs2) {
  var rem = nat1.data[ofs1 + len - 1] >>> 0;
  // natq[ofsq+len-1] is guaranteed to be zero (due to the MSD requirement),
  // and should not be written to.
  for (var i = len - 2; i >= 0; i--) {
    var x = div_helper(rem, nat1.data[ofs1 + i] >>> 0, nat2.data[ofs2] >>> 0);
    natq.data[ofsq + i] = x[0];
    rem = x[1];
  }
  natr.data[ofsr] = rem;
  return 0;
}

// nat1[nat2:] := nat1 / nat2
// nat1[:nat2] := nat1 % nat2
// len1 > len2, nat2[ofs2+len2-1] > nat1[ofs1+len1-1]
//Provides: div_nat
//Requires: div_digit_nat, div_helper, num_leading_zero_bits_in_digit, shift_left_nat, shift_right_nat, create_nat, set_to_zero_nat, mult_digit_nat, sub_nat, compare_nat, nat_of_array
function div_nat(nat1, ofs1, len1, nat2, ofs2, len2) {
  if (len2 === 1) {
    div_digit_nat(nat1, ofs1 + 1, nat1, ofs1, nat1, ofs1, len1, nat2, ofs2);
    return 0;
  }

  var s = num_leading_zero_bits_in_digit(nat2, ofs2 + len2 - 1);
  shift_left_nat(nat2, ofs2, len2, nat_of_array([0]), 0, s);
  shift_left_nat(nat1, ofs1, len1, nat_of_array([0]), 0, s);

  var d = (nat2.data[ofs2 + len2 - 1] >>> 0) + 1;
  var a = create_nat(len2 + 1);
  for (var i = len1 - 1; i >= len2; i--) {
    // Decent lower bound on quo
    var quo =
      d === 4294967296
        ? nat1.data[ofs1 + i] >>> 0
        : div_helper(
            nat1.data[ofs1 + i] >>> 0,
            nat1.data[ofs1 + i - 1] >>> 0,
            d,
          )[0];
    set_to_zero_nat(a, 0, len2 + 1);
    mult_digit_nat(a, 0, len2 + 1, nat2, ofs2, len2, nat_of_array([quo]), 0);
    sub_nat(nat1, ofs1 + i - len2, len2 + 1, a, 0, len2 + 1, 1);

    while (
      nat1.data[ofs1 + i] !== 0 ||
      compare_nat(nat1, ofs1 + i - len2, len2, nat2, ofs2, len2) >= 0
    ) {
      quo = quo + 1;
      sub_nat(nat1, ofs1 + i - len2, len2 + 1, nat2, ofs2, len2, 1);
    }

    nat1.data[ofs1 + i] = quo;
  }

  shift_right_nat(nat1, ofs1, len2, nat_of_array([0]), 0, s); // shift remainder
  shift_right_nat(nat2, ofs2, len2, nat_of_array([0]), 0, s); // restore
  return 0;
}

// 0 <= shift < 32
//Provides: shift_right_nat
function shift_right_nat(nat1, ofs1, len1, nat2, ofs2, nbits) {
  if (nbits === 0) {
    nat2.data[ofs2] = 0;
    return 0;
  }
  var wrap = 0;
  for (var i = len1 - 1; i >= 0; i--) {
    var a = nat1.data[ofs1 + i] >>> 0;
    nat1.data[ofs1 + i] = (a >>> nbits) | wrap;
    wrap = a << (32 - nbits);
  }
  nat2.data[ofs2] = wrap;
  return 0;
}

//Provides: compare_digits_nat
function compare_digits_nat(nat1, ofs1, nat2, ofs2) {
  if (nat1.data[ofs1] > nat2.data[ofs2]) return 1;
  if (nat1.data[ofs1] < nat2.data[ofs2]) return -1;
  return 0;
}

//Provides: compare_nat
//Requires: num_digits_nat
function compare_nat(nat1, ofs1, len1, nat2, ofs2, len2) {
  var a = num_digits_nat(nat1, ofs1, len1);
  var b = num_digits_nat(nat2, ofs2, len2);
  if (a > b) return 1;
  if (a < b) return -1;
  // iterate over the common significant length, not len1: the digits
  // above it are zero, and reading them would go outside nat2's
  // subrange when len1 !== len2
  for (var i = a - 1; i >= 0; i--) {
    if (nat1.data[ofs1 + i] >>> 0 > nat2.data[ofs2 + i] >>> 0) return 1;
    if (nat1.data[ofs1 + i] >>> 0 < nat2.data[ofs2 + i] >>> 0) return -1;
  }
  return 0;
}

//Provides: land_digit_nat
function land_digit_nat(nat1, ofs1, nat2, ofs2) {
  nat1.data[ofs1] &= nat2.data[ofs2];
  return 0;
}

//Provides: lor_digit_nat
function lor_digit_nat(nat1, ofs1, nat2, ofs2) {
  nat1.data[ofs1] |= nat2.data[ofs2];
  return 0;
}

//Provides: lxor_digit_nat
function lxor_digit_nat(nat1, ofs1, nat2, ofs2) {
  nat1.data[ofs1] ^= nat2.data[ofs2];
  return 0;
}

//Provides: serialize_nat
function serialize_nat(writer, nat, sz) {
  var len = nat.data.length;
  writer.write(32, len);
  for (var i = 0; i < len; i++) {
    writer.write(32, nat.data[i]);
  }
  sz[0] = len * 4;
  sz[1] = len * 8;
}

//Provides: deserialize_nat
//Requires: MlNat
function deserialize_nat(reader, sz) {
  var len = reader.read32s();
  var nat = new MlNat(len);
  for (var i = 0; i < len; i++) {
    nat.data[i] = reader.read32s();
  }
  sz[0] = len * 4;
  return nat;
}

//# 1 "+obj.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_update_dummy
function caml_update_dummy(x, y) {
  if (y.fun) {
    x.fun = y.fun;
    return 0;
  }
  if (typeof y === "function") {
    x.fun = y;
    return 0;
  }
  var i = y.length;
  while (i--) x[i] = y[i];
  return 0;
}

//Provides: caml_alloc_dummy_infix
//Requires: caml_call_gen
//Version: < 5.4
function caml_alloc_dummy_infix() {
  return function f(x) {
    return caml_call_gen(f.fun, [x]);
  };
}

//Provides: caml_alloc_dummy_lazy
//Version: >= 5.4
function caml_alloc_dummy_lazy(_unit) {
  return [0, 0];
}

//Provides: caml_update_dummy_lazy
//Requires: caml_obj_tag
//Requires: caml_update_dummy
//Version: >= 5.4
function caml_update_dummy_lazy(dummy, newval) {
  switch (caml_obj_tag(newval)) {
    case 246: // Lazy
    case 244: // Forcing
    case 250: // Forward
      caml_update_dummy(dummy, newval);
      break;
    default:
      dummy[1] = newval;
      dummy[0] = 250;
      break;
  }
  return 0;
}

//Provides: caml_obj_is_stack
//Version: >= 5.2, < 5.3
//OxCaml
function caml_obj_is_stack(_x) {
  return 0;
}

//Provides: caml_succ_scannable_prefix_len
//Version: >= 5.2, < 5.3
//OxCaml
function caml_succ_scannable_prefix_len(_x) {
  return 0;
}

//Provides: caml_obj_uniquely_reachable_words
//Requires: caml_failwith
//Version: >= 5.2, < 5.3
//OxCaml
function caml_obj_uniquely_reachable_words(_x) {
  caml_failwith("Obj.uniquely_reachable_words is not available in javascript.");
}

//Provides: caml_obj_tag
//Requires: caml_is_ml_bytes, caml_is_ml_string
function caml_obj_tag(x) {
  if (x === null) return 1010;
  else if (Array.isArray(x) && x[0] === x[0] >>> 0) return x[0];
  else if (caml_is_ml_bytes(x)) return 252;
  else if (caml_is_ml_string(x)) return 252;
  else if (x instanceof Function || typeof x === "function") return 247;
  else if (x?.caml_custom) return 255;
  else return 1000;
}

//Provides: caml_obj_set_tag (mutable, const)
//Version: < 5.0
function caml_obj_set_tag(x, tag) {
  x[0] = tag;
  return 0;
}
//Provides: caml_obj_block const (const,const)
function caml_obj_block(tag, size) {
  // TODO: fail for value that are not represented as an array
  var o = new Array(size + 1);
  o[0] = tag;
  for (var i = 1; i <= size; i++) o[i] = 0;
  return o;
}

//Provides: caml_obj_with_tag
function caml_obj_with_tag(tag, x) {
  var l = x.length;
  var a = new Array(l);
  a[0] = tag;
  for (var i = 1; i < l; i++) a[i] = x[i];
  return a;
}

//Provides: caml_obj_dup mutable (mutable)
function caml_obj_dup(x) {
  if (x === null) return null;
  return typeof x === "number" ? x : x.slice();
}

//Provides: caml_obj_truncate (mutable, const)
//Requires: caml_invalid_argument
//Version: < 5.0
function caml_obj_truncate(x, s) {
  if (s <= 0 || s + 1 > x.length) caml_invalid_argument("Obj.truncate");
  if (x.length !== s + 1) x.length = s + 1;
  return 0;
}

//Provides: caml_obj_make_forward
//Version: < 5.0
function caml_obj_make_forward(b, v) {
  b[0] = 250;
  b[1] = v;
  return 0;
}

//Provides: caml_obj_compare_and_swap
//Version: >= 5.0
function caml_obj_compare_and_swap(x, i, old, n) {
  if (x[i + 1] === old) {
    x[i + 1] = n;
    return 1;
  }
  return 0;
}

//Provides: caml_obj_is_shared
//Version: >= 5.0
function caml_obj_is_shared(_x) {
  return 1;
}

//Provides: caml_lazy_make_forward const (mutable)
function caml_lazy_make_forward(v) {
  return [250, v];
}

//Provides: caml_method_cache
var caml_method_cache = [];

//Provides: caml_oo_cache_id const
//Requires: caml_method_cache
function caml_oo_cache_id() {
  var cacheid = caml_method_cache.length;
  caml_method_cache[cacheid] = 0;
  return cacheid;
}

///////////// CamlinternalOO
//Provides: caml_get_cached_method const
//Requires: caml_method_cache
function caml_get_cached_method(obj, tag, cacheid) {
  var meths = obj[1];
  var ofs = caml_method_cache[cacheid];
  if (meths[ofs + 4] === tag) {
    return meths[ofs + 3];
  }
  var li = 3,
    hi = meths[1] * 2 + 1,
    mi;
  while (li < hi) {
    mi = ((li + hi) >> 1) | 1;
    if (tag < meths[mi + 1]) hi = mi - 2;
    else li = mi;
  }
  caml_method_cache[cacheid] = li - 3;
  return meths[li];
}

//Provides: caml_get_public_method const
function caml_get_public_method(obj, tag) {
  var meths = obj[1];
  var li = 3,
    hi = meths[1] * 2 + 1,
    mi;
  while (li < hi) {
    mi = ((li + hi) >> 1) | 1;
    if (tag < meths[mi + 1]) hi = mi - 2;
    else li = mi;
  }
  /* return 0 if tag is not there */
  return tag === meths[li + 1] ? meths[li] : 0;
}

//Provides: caml_oo_last_id
var caml_oo_last_id = 0;

//Provides: caml_set_oo_id
//Requires: caml_oo_last_id
function caml_set_oo_id(b) {
  b[2] = caml_oo_last_id++;
  return b;
}

//Provides: caml_fresh_oo_id const
//Requires: caml_oo_last_id
function caml_fresh_oo_id() {
  return caml_oo_last_id++;
}

//Provides: caml_obj_raw_field
function caml_obj_raw_field(o, i) {
  return o[i + 1];
}

//Provides: caml_obj_set_raw_field
function caml_obj_set_raw_field(o, i, v) {
  return (o[i + 1] = v);
}

//Provides: caml_obj_reachable_words
function caml_obj_reachable_words(_o) {
  return 0;
}

//Provides: caml_obj_add_offset
//Requires: caml_failwith
function caml_obj_add_offset(_v, _offset) {
  caml_failwith("Obj.add_offset is not supported");
}

//Provides: caml_obj_update_tag
//Version: >= 5.0
function caml_obj_update_tag(b, o, n) {
  if (b[0] === o) {
    b[0] = n;
    return 1;
  }
  return 0;
}

//Provides: caml_lazy_update_to_forcing
//Requires: caml_obj_update_tag
//Version: >= 5.0
function caml_lazy_update_to_forcing(o) {
  if (
    Array.isArray(o) &&
    o[0] === o[0] >>> 0 &&
    caml_obj_update_tag(o, 246, 244)
  ) {
    return 0;
  } else {
    return 1;
  }
}

//Provides: caml_lazy_update_to_forward
//Requires: caml_obj_update_tag
//Version: >= 5.0
function caml_lazy_update_to_forward(o) {
  caml_obj_update_tag(o, 244, 250);
  return 0; // unit
}

//Provides: caml_lazy_reset_to_lazy
//Requires: caml_obj_update_tag
//Version: >= 5.0
function caml_lazy_reset_to_lazy(o) {
  caml_obj_update_tag(o, 244, 246);
  return 0;
}

//Provides: caml_lazy_read_result
//Requires: caml_obj_tag
//Version: >= 5.0
function caml_lazy_read_result(o) {
  return caml_obj_tag(o) === 250 ? o[1] : o;
}

//Provides: caml_is_continuation_tag
//Version: < 5
function caml_is_continuation_tag(_t) {
  return 0;
}

//Provides: caml_is_continuation_tag
//Version: >= 5
function caml_is_continuation_tag(t) {
  return t === 245 ? 1 : 0;
}

//Provides: caml_custom_identifier
//Requires: caml_string_of_jsstring
function caml_custom_identifier(o) {
  return caml_string_of_jsstring(o.caml_custom || "");
}

//Provides: caml_ml_gc_ramp_up
//Requires: caml_callback
//Version: >= 5.4
function caml_ml_gc_ramp_up(f) {
  var a = caml_callback(f, [0]);
  var suspended = 0;
  return [0, a, suspended];
}

//Provides: caml_ml_gc_ramp_down
//Version: >= 5.4
function caml_ml_gc_ramp_down(_suspended_collection_work) {
  return 0;
}

//Provides: caml_int_as_pointer
//Requires: caml_failwith
//Version: >= 5.2, < 5.3
//OxCaml
function caml_int_as_pointer(i) {
  // Special-case null pointers for [or_null].
  if (i === 0) return null;
  caml_failwith("%int_as_pointer is not supported in javascript.");
}

//# 1 "+parsing.js"
/***********************************************************************/
/*                                                                     */
/*                           Objective Caml                            */
/*                                                                     */
/*            Xavier Leroy, projet Cristal, INRIA Rocquencourt         */
/*                                                                     */
/*  Copyright 1996 Institut National de Recherche en Informatique et   */
/*  en Automatique.  All rights reserved.  This file is distributed    */
/*  under the terms of the GNU Lesser General Public License, with     */
/*  the special exception on linking described in file ../LICENSE.     */
/*                                                                     */
/***********************************************************************/

/* $Id: parsing.c 8983 2008-08-06 09:38:25Z xleroy $ */

/* The PDA automaton for parsers generated by camlyacc */

/* The pushdown automata */

//Provides: caml_parser_trace
var caml_parser_trace = 0;

//Provides: caml_parse_engine
//Requires: caml_lex_array, caml_parser_trace,caml_jsstring_of_string
//Requires: caml_ml_output, caml_ml_string_length, caml_string_of_jsbytes
//Requires: caml_jsbytes_of_string, MlBytes
//Requires: caml_ml_std_channel_id
function caml_parse_engine(tables, env, cmd, arg) {
  var ERRCODE = 256;

  //var START = 0;
  //var TOKEN_READ = 1;
  //var STACKS_GROWN_1 = 2;
  //var STACKS_GROWN_2 = 3;
  //var SEMANTIC_ACTION_COMPUTED = 4;
  //var ERROR_DETECTED = 5;
  var loop = 6;
  var testshift = 7;
  var shift = 8;
  var shift_recover = 9;
  var reduce = 10;

  var READ_TOKEN = 0;
  var RAISE_PARSE_ERROR = 1;
  var GROW_STACKS_1 = 2;
  var GROW_STACKS_2 = 3;
  var COMPUTE_SEMANTIC_ACTION = 4;
  var CALL_ERROR_FUNCTION = 5;

  var env_s_stack = 1;
  var env_v_stack = 2;
  var env_symb_start_stack = 3;
  var env_symb_end_stack = 4;
  var env_stacksize = 5;
  var env_stackbase = 6;
  var env_curr_char = 7;
  var env_lval = 8;
  var env_symb_start = 9;
  var env_symb_end = 10;
  var env_asp = 11;
  var env_rule_len = 12;
  var env_rule_number = 13;
  var env_sp = 14;
  var env_state = 15;
  var env_errflag = 16;

  // var _tbl_actions = 1;
  var tbl_transl_const = 2;
  var tbl_transl_block = 3;
  var tbl_lhs = 4;
  var tbl_len = 5;
  var tbl_defred = 6;
  var tbl_dgoto = 7;
  var tbl_sindex = 8;
  var tbl_rindex = 9;
  var tbl_gindex = 10;
  var tbl_tablesize = 11;
  var tbl_table = 12;
  var tbl_check = 13;
  // var _tbl_error_function = 14;
  var tbl_names_const = 15;
  var tbl_names_block = 16;

  function log(x) {
    var s = caml_string_of_jsbytes(x + "\n");
    caml_ml_output(caml_ml_std_channel_id[2], s, 0, caml_ml_string_length(s));
  }

  function token_name(names, number) {
    var str = caml_jsstring_of_string(names);
    if (str[0] === "\x00") return "<unknown token>";
    return str.split("\x00")[number];
  }

  function print_token(state, tok) {
    var token, kind;
    if (Array.isArray(tok)) {
      token = token_name(tables[tbl_names_block], tok[0]);
      if (typeof tok[1] === "number") kind = "" + tok[1];
      else if (typeof tok[1] === "string") kind = tok[1];
      else if (tok[1] instanceof MlBytes) kind = caml_jsbytes_of_string(tok[1]);
      else kind = "_";
      log("State " + state + ": read token " + token + "(" + kind + ")");
    } else {
      token = token_name(tables[tbl_names_const], tok);
      log("State " + state + ": read token " + token);
    }
  }

  if (!tables.dgoto) {
    tables.defred = caml_lex_array(tables[tbl_defred]);
    tables.sindex = caml_lex_array(tables[tbl_sindex]);
    tables.check = caml_lex_array(tables[tbl_check]);
    tables.rindex = caml_lex_array(tables[tbl_rindex]);
    tables.table = caml_lex_array(tables[tbl_table]);
    tables.len = caml_lex_array(tables[tbl_len]);
    tables.lhs = caml_lex_array(tables[tbl_lhs]);
    tables.gindex = caml_lex_array(tables[tbl_gindex]);
    tables.dgoto = caml_lex_array(tables[tbl_dgoto]);
  }

  var res = 0,
    n,
    n1,
    n2,
    state1;

  // RESTORE
  var sp = env[env_sp];
  var state = env[env_state];
  var errflag = env[env_errflag];

  the_loop: for (;;) {
    switch (cmd) {
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
      case 0: //START:
        state = 0;
        errflag = 0;
      // falls through

      case 6: //loop:
        n = tables.defred[state];
        if (n !== 0) {
          cmd = reduce;
          continue the_loop;
        }
        if (env[env_curr_char] >= 0) {
          cmd = testshift;
          continue the_loop;
        }
        res = READ_TOKEN;
        break the_loop;
      /* The ML code calls the lexer and updates */
      /* symb_start and symb_end */
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
      case 1: //TOKEN_READ:
        if (Array.isArray(arg)) {
          env[env_curr_char] = tables[tbl_transl_block][arg[0] + 1];
          env[env_lval] = arg[1];
        } else {
          env[env_curr_char] = tables[tbl_transl_const][arg + 1];
          env[env_lval] = 0;
        }
        if (caml_parser_trace) print_token(state, arg);
      // falls through

      // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
      case 7: //testshift:
        n1 = tables.sindex[state];
        n2 = n1 + env[env_curr_char];
        if (
          n1 !== 0 &&
          n2 >= 0 &&
          n2 <= tables[tbl_tablesize] &&
          tables.check[n2] === env[env_curr_char]
        ) {
          cmd = shift;
          continue the_loop;
        }
        n1 = tables.rindex[state];
        n2 = n1 + env[env_curr_char];
        if (
          n1 !== 0 &&
          n2 >= 0 &&
          n2 <= tables[tbl_tablesize] &&
          tables.check[n2] === env[env_curr_char]
        ) {
          n = tables.table[n2];
          cmd = reduce;
          continue the_loop;
        }
        if (errflag <= 0) {
          res = CALL_ERROR_FUNCTION;
          break the_loop;
        }
      // falls through
      /* The ML code calls the error function */
      case 5: //ERROR_DETECTED:
        if (errflag < 3) {
          errflag = 3;
          for (;;) {
            state1 = env[env_s_stack][sp + 1];
            n1 = tables.sindex[state1];
            n2 = n1 + ERRCODE;
            if (
              n1 !== 0 &&
              n2 >= 0 &&
              n2 <= tables[tbl_tablesize] &&
              tables.check[n2] === ERRCODE
            ) {
              if (caml_parser_trace) log("Recovering in state " + state1);
              cmd = shift_recover;
              continue the_loop;
            } else {
              if (caml_parser_trace) log("Discarding state " + state1);
              if (sp <= env[env_stackbase]) {
                if (caml_parser_trace) log("No more states to discard");
                return RAISE_PARSE_ERROR;
              }
              /* The ML code raises Parse_error */
              sp--;
            }
          }
        } else {
          if (env[env_curr_char] === 0)
            return RAISE_PARSE_ERROR; /* The ML code raises Parse_error */
          if (caml_parser_trace) log("Discarding last token read");
          env[env_curr_char] = -1;
          cmd = loop;
          continue the_loop;
        }
      // Unreachable
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
      case 8: //shift:
        env[env_curr_char] = -1;
        if (errflag > 0) errflag--;
      // falls through
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
      case 9: //shift_recover:
        if (caml_parser_trace)
          log("State " + state + ": shift to state " + tables.table[n2]);
        state = tables.table[n2];
        sp++;
        if (sp >= env[env_stacksize]) {
          res = GROW_STACKS_1;
          break the_loop;
        }
      // falls through
      /* The ML code resizes the stacks */
      case 2: //STACKS_GROWN_1:
        env[env_s_stack][sp + 1] = state;
        env[env_v_stack][sp + 1] = env[env_lval];
        env[env_symb_start_stack][sp + 1] = env[env_symb_start];
        env[env_symb_end_stack][sp + 1] = env[env_symb_end];
        cmd = loop;
        continue the_loop;

      // biome-ignore lint/suspicious/noFallthroughSwitchClause: falls through
      case 10: //reduce:
        if (caml_parser_trace) log("State " + state + ": reduce by rule " + n);
        var m = tables.len[n];
        env[env_asp] = sp;
        env[env_rule_number] = n;
        env[env_rule_len] = m;
        sp = sp - m + 1;
        m = tables.lhs[n];
        state1 = env[env_s_stack][sp];
        n1 = tables.gindex[m];
        n2 = n1 + state1;
        if (
          n1 !== 0 &&
          n2 >= 0 &&
          n2 <= tables[tbl_tablesize] &&
          tables.check[n2] === state1
        )
          state = tables.table[n2];
        else state = tables.dgoto[m];
        if (sp >= env[env_stacksize]) {
          res = GROW_STACKS_2;
          break the_loop;
        }
      // falls through
      /* The ML code resizes the stacks */
      case 3: //STACKS_GROWN_2:
        res = COMPUTE_SEMANTIC_ACTION;
        break the_loop;
      /* The ML code calls the semantic action */
      case 4: //SEMANTIC_ACTION_COMPUTED:
        env[env_s_stack][sp + 1] = state;
        env[env_v_stack][sp + 1] = arg;
        var asp = env[env_asp];
        env[env_symb_end_stack][sp + 1] = env[env_symb_end_stack][asp + 1];
        if (sp > asp) {
          /* This is an epsilon production. Take symb_start equal to symb_end. */
          env[env_symb_start_stack][sp + 1] = env[env_symb_end_stack][asp + 1];
        }
        cmd = loop;
        continue the_loop;
      /* Should not happen */
      default:
        return RAISE_PARSE_ERROR;
    }
  }
  // SAVE
  env[env_sp] = sp;
  env[env_state] = state;
  env[env_errflag] = errflag;
  return res;
}

//Provides: caml_set_parser_trace
//Requires: caml_parser_trace
function caml_set_parser_trace(bool) {
  var oldflag = caml_parser_trace;
  caml_parser_trace = bool;
  return oldflag;
}

//# 1 "+promise.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

// Helpers for the [Js_of_ocaml.Promise] binding.
//
// The JS Promise constructor automatically follows any thenable returned
// from a handler or passed to [Promise.resolve]. To preserve type safety
// for ['a Promise.t Promise.t] we wrap thenable values in a dedicated
// container before resolving and unwrap them on the way back. Non-thenable
// values pass through untouched, which avoids per-call allocation in the
// common case and lets foreign promises (handed in via [Promise.of_any])
// flow through transparently.

//Provides: caml_jsoo_promise_wrapper
function caml_jsoo_promise_wrapper(x) {
  this.wrapped = x;
}

//Provides: caml_jsoo_promise_wrap
//Requires: caml_jsoo_promise_wrapper
function caml_jsoo_promise_wrap(x) {
  return x != null && typeof x.then === "function"
    ? new caml_jsoo_promise_wrapper(x)
    : x;
}

//Provides: caml_jsoo_promise_unwrap
//Requires: caml_jsoo_promise_wrapper
function caml_jsoo_promise_unwrap(x) {
  return x instanceof caml_jsoo_promise_wrapper ? x.wrapped : x;
}

//# 1 "+stdlib.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

//Provides: caml_call_gen (const, shallow)
//If: !effects
//Weakdef
function caml_call_gen(f, args) {
  var n = f.l >= 0 ? f.l : (f.l = f.length);
  var argsLen = args.length;
  var d = n - argsLen;
  if (d === 0) return f(...args);
  else if (d < 0) {
    var g = f(...args.slice(0, n));
    if (typeof g !== "function") return g;
    return caml_call_gen(g, args.slice(n));
  } else {
    switch (d) {
      case 1: {
        var g = function (x) {
          var nargs = new Array(argsLen + 1);
          for (var i = 0; i < argsLen; i++) nargs[i] = args[i];
          nargs[argsLen] = x;
          return f(...nargs);
        };
        break;
      }
      case 2: {
        var g = function (x, y) {
          var nargs = new Array(argsLen + 2);
          for (var i = 0; i < argsLen; i++) nargs[i] = args[i];
          nargs[argsLen] = x;
          nargs[argsLen + 1] = y;
          return f(...nargs);
        };
        break;
      }
      default: {
        var g = function (...extra_args) {
          if (extra_args.length === 0) extra_args = [undefined];
          return caml_call_gen(f, args.concat(extra_args));
        };
      }
    }
    g.l = d;
    return g;
  }
}

//Provides: caml_call_gen (const, shallow)
//If: effects
//If: !doubletranslate
//Weakdef
function caml_call_gen(f, args) {
  var n = f.l >= 0 ? f.l : (f.l = f.length);
  var argsLen = args.length;
  var d = n - argsLen;
  if (d === 0) {
    return f(...args);
  } else if (d < 0) {
    var rest = args.slice(n - 1);
    var k = args[argsLen - 1];
    args = args.slice(0, n);
    args[n - 1] = function (g) {
      if (typeof g !== "function") return k(g);
      var args = rest.slice();
      args[args.length - 1] = k;
      return caml_call_gen(g, args);
    };
    return f(...args);
  } else {
    argsLen--;
    var k = args[argsLen];
    switch (d) {
      case 1: {
        var g = function (x, y) {
          var nargs = new Array(argsLen + 2);
          for (var i = 0; i < argsLen; i++) nargs[i] = args[i];
          nargs[argsLen] = x;
          nargs[argsLen + 1] = y;
          return f(...nargs);
        };
        break;
      }
      case 2: {
        var g = function (x, y, z) {
          var nargs = new Array(argsLen + 3);
          for (var i = 0; i < argsLen; i++) nargs[i] = args[i];
          nargs[argsLen] = x;
          nargs[argsLen + 1] = y;
          nargs[argsLen + 2] = z;
          return f(...nargs);
        };
        break;
      }
      default: {
        args.length = argsLen;
        var g = function (...extra_args) {
          if (extra_args.length === 0) extra_args = [undefined];
          return caml_call_gen(f, args.concat(extra_args));
        };
      }
    }
    g.l = d + 1;
    return k(g);
  }
}

//Provides: caml_call_gen_cps
//Requires: caml_call_gen
//If: effects
//If: !doubletranslate
//Weakdef
var caml_call_gen_cps = caml_call_gen;

//Provides: caml_call_gen_tuple (const, shallow)
//Requires: caml_cps_closure
//If: effects
//If: doubletranslate
//Weakdef
var caml_call_gen_tuple = (function () {
  function caml_call_gen_direct(f, args) {
    var n = f.l >= 0 ? f.l : (f.l = f.length);
    var argsLen = args.length;
    var d = n - argsLen;
    if (d === 0) {
      return f.apply(null, args);
    } else if (d < 0) {
      var g = f(...args.slice(0, n));
      if (typeof g !== "function") return g;
      return caml_call_gen_direct(g, args.slice(n));
    } else {
      // FIXME: Restore the optimization of handling specially d = 1 or 2
      var args_ = args.slice();
      args_.length = argsLen;
      var ret = caml_cps_closure(
        function (...extra_args) {
          if (extra_args.length === 0) extra_args = [undefined];
          return caml_call_gen_direct(f, args.concat(extra_args));
        },
        function (...extra_args) {
          if (extra_args.length === 0) extra_args = [undefined];
          return caml_call_gen_cps(f, args_.concat(extra_args));
        },
      );
      ret.l = d;
      ret.cps.l = d + 1;
      return ret;
    }
  }
  function caml_call_gen_cps(f, args) {
    if (!f.cps) {
      var k = args.pop();
      return k(caml_call_gen_direct(f, args));
    }
    var n = f.cps.l >= 0 ? f.cps.l : (f.cps.l = f.cps.length);
    var argsLen = args.length;
    var d = n - argsLen;
    if (d === 0) {
      return f.cps.apply(null, args);
    } else if (d < 0) {
      var rest = args.slice(n - 1);
      var k = args[argsLen - 1];
      args = args.slice(0, n);
      args[n - 1] = function (g) {
        var args = rest.slice();
        args[args.length - 1] = k;
        return caml_call_gen_cps(g, args);
      };
      return f.cps.apply(null, args);
    } else {
      argsLen--;
      var args_ = args.slice();
      args_.length = argsLen;
      var cont = caml_cps_closure(
        function (...extra_args) {
          if (extra_args.length === 0) extra_args = [undefined];
          return caml_call_gen_direct(f, args_.concat(extra_args));
        },
        function (...extra_args) {
          if (extra_args.length === 0) extra_args = [undefined];
          return caml_call_gen_cps(f, args_.concat(extra_args));
        },
      );
      var k = args[argsLen];
      cont.l = d;
      cont.cps.l = d + 1;
      return k(cont);
    }
  }
  return [caml_call_gen_direct, caml_call_gen_cps];
})();

//Provides: caml_call_gen
//Requires: caml_call_gen_tuple
//If: effects
//If: doubletranslate
//Weakdef
var caml_call_gen = caml_call_gen_tuple[0];

//Provides: caml_call_gen_cps
//Requires: caml_call_gen_tuple
//If: effects
//If: doubletranslate
//Weakdef
var caml_call_gen_cps = caml_call_gen_tuple[1];

//Provides: caml_named_values
var caml_named_values = {};

//Provides: caml_register_named_value (const,mutable)
//Requires: caml_named_values, caml_jsbytes_of_string
function caml_register_named_value(nm, v) {
  caml_named_values[caml_jsbytes_of_string(nm)] = v;
  return 0;
}

//Provides: caml_named_value
//Requires: caml_named_values
function caml_named_value(nm) {
  return caml_named_values[nm];
}

//Provides: caml_global_data
var caml_global_data = [0];

//Provides: caml_link_info
var caml_link_info = {};

//Provides: caml_set_link_info
//Requires: caml_link_info
function caml_set_link_info(info) {
  caml_link_info.sections = info[1];
  caml_link_info.symbols = info[2];
  caml_link_info.prim_count = info[3];
  caml_link_info.aliases = info[4];
}

//Provides: caml_build_symbols
//Requires: caml_jsstring_of_string
function caml_build_symbols(symb) {
  var r = {};
  var max = -1;
  if (symb) {
    for (var i = 1; i < symb.length; i++) {
      var gn = symb[i][1];
      var is_predef = gn[0];
      var name = caml_jsstring_of_string(gn[1]);
      var idx = symb[i][2];
      max = Math.max(max, idx);
      r[is_predef ? "predef:" + name : name] = idx;
    }
  }
  r.next_idx = max + 1;
  return r;
}

//Provides: jsoo_toplevel_reloc
var jsoo_toplevel_reloc;

//Provides: caml_register_global_by_index (shallow, const)
//Requires: caml_global_data
function caml_register_global_by_index(v, idx) {
  caml_global_data[idx + 1] = v;
}

//Provides: caml_register_global (shallow, const)
//Requires: caml_global_data, caml_callback, caml_build_symbols
//Requires: caml_link_info
//Requires: jsoo_toplevel_reloc
function caml_register_global(v, name) {
  if (jsoo_toplevel_reloc) {
    var n = caml_callback(jsoo_toplevel_reloc, [[0, name]]);
    caml_global_data[n + 1] = v;
  } else if (caml_link_info.symbols) {
    if (!caml_link_info.symidx) {
      caml_link_info.symidx = caml_build_symbols(caml_link_info.symbols);
    }
    var nid = caml_link_info.symidx[name];
    if (nid === undefined) {
      // The unit is unknown, this can happen when dynlinking a precompiled js,
      // let's allocate a fresh idx.
      nid = caml_link_info.symidx.next_idx++;
      caml_link_info.symidx[name] = nid;
    }
    caml_global_data[nid + 1] = v;
  }
  caml_global_data[name] = v;
}

//Provides: caml_register_global_predef (shallow, const)
//Requires: caml_global_data, caml_callback, caml_build_symbols
//Requires: caml_link_info
//Requires: jsoo_toplevel_reloc
function caml_register_global_predef(v, name) {
  var key = "predef:" + name;
  if (jsoo_toplevel_reloc) {
    var n = caml_callback(jsoo_toplevel_reloc, [[1, name]]);
    caml_global_data[n + 1] = v;
  } else if (caml_link_info.symbols) {
    if (!caml_link_info.symidx) {
      caml_link_info.symidx = caml_build_symbols(caml_link_info.symbols);
    }
    var nid = caml_link_info.symidx[key];
    if (nid === undefined) {
      nid = caml_link_info.symidx.next_idx++;
      caml_link_info.symidx[key] = nid;
    }
    caml_global_data[nid + 1] = v;
  }
  caml_global_data[key] = v;
}

//Provides: caml_get_global (mutable)
//Requires: caml_global_data
function caml_get_global(name) {
  return caml_global_data[name];
}

//Provides: caml_get_global_predef (mutable)
//Requires: caml_global_data
function caml_get_global_predef(name) {
  return caml_global_data["predef:" + name];
}

//Provides: caml_get_global_data mutable
//Requires: caml_global_data
function caml_get_global_data(_unit) {
  return caml_global_data;
}

//Provides: caml_is_printable const (const)
function caml_is_printable(c) {
  return +(c > 31 && c < 127);
}

//Provides: caml_maybe_print_stats
function caml_maybe_print_stats(_unit) {
  return 0;
}

//Provides: caml_with_async_exns
//Requires: caml_callback
//Version: >= 5.2, < 5.3
//OxCaml
function caml_with_async_exns(body_callback) {
  return caml_callback(body_callback, [0]);
}

//# 1 "+sys.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

///////////// Sys

//Provides: caml_raise_sys_error (const)
//Requires: caml_raise_with_arg, caml_global_data, caml_string_of_jsstring
function caml_raise_sys_error(msg) {
  caml_raise_with_arg(
    caml_global_data["predef:Sys_error"],
    caml_string_of_jsstring(msg),
  );
}

//Provides: caml_sys_exit
//Requires: caml_invalid_argument
//Alias: caml_unix_exit
//Alias: unix_exit
function caml_sys_exit(code) {
  if (globalThis.quit) globalThis.quit(code);
  //nodejs
  if (globalThis.process?.exit) globalThis.process.exit(code);
  //QuickJS (with --std)
  if (globalThis.std?.exit) globalThis.std.exit(code);
  caml_invalid_argument("Function 'exit' not implemented");
}

//Provides: caml_is_special_exception
function caml_is_special_exception(exn) {
  switch (exn[2]) {
    case -8: // Match_failure
    case -11: // Assert_failure
    case -12: // Undefined_recursive_module
      return 1;
    default:
      return 0;
  }
}

//Provides: caml_format_exception
//Requires: MlBytes, caml_is_special_exception
function caml_format_exception(exn) {
  var r = "";
  if (exn[0] === 0) {
    r += exn[1][1];
    if (
      exn.length === 3 &&
      exn[2][0] === 0 &&
      caml_is_special_exception(exn[1])
    ) {
      var bucket = exn[2];
      var start = 1;
    } else {
      var start = 2;
      var bucket = exn;
    }
    r += "(";
    for (var i = start; i < bucket.length; i++) {
      if (i > start) r += ", ";
      var v = bucket[i];
      if (typeof v === "number") r += v.toString();
      else if (v instanceof MlBytes) {
        r += '"' + v.toString() + '"';
      } else if (typeof v === "string") {
        r += '"' + v.toString() + '"';
      } else r += "_";
    }
    r += ")";
  } else if (exn[0] === 248) {
    r += exn[1];
  }
  return r;
}

//Provides: caml_fatal_uncaught_exception
//Requires: caml_named_value, caml_format_exception, caml_callback
function caml_fatal_uncaught_exception(err) {
  if (Array.isArray(err) && (err[0] === 0 || err[0] === 248)) {
    var handler = caml_named_value("Printexc.handle_uncaught_exception");
    if (handler) caml_callback(handler, [err, false]);
    else {
      var msg = caml_format_exception(err);
      var at_exit = caml_named_value("Pervasives.do_at_exit");
      if (at_exit) caml_callback(at_exit, [0]);
      console.error("Fatal error: exception " + msg);
      if (err.js_error) throw err.js_error;
    }
  } else {
    throw err;
  }
}

//Provides: jsoo_static_env
var jsoo_static_env = {};

//Provides: caml_set_static_env
//Requires: jsoo_static_env
function caml_set_static_env(k, v) {
  jsoo_static_env[k] = v;
  return 0;
}

//Provides: jsoo_sys_getenv (const)
//Requires: jsoo_static_env
function jsoo_sys_getenv(n) {
  if (Object.hasOwn(jsoo_static_env, n)) return jsoo_static_env[n];
  var process = globalThis.process;
  //nodejs env
  if (process?.env && Object.hasOwn(process.env, n)) return process.env[n];
  //QuickJS: no `process`, but the host environment is reachable via `std`.
  var std = globalThis.std;
  if (std && typeof std.getenviron === "function") {
    var v = std.getenviron()[n];
    if (v !== undefined) return v;
  }
  if (globalThis.jsoo_env && typeof globalThis.jsoo_env[n] === "string") {
    return globalThis.jsoo_env[n];
  }
}

//Provides: caml_sys_getenv (const)
//Requires: caml_raise_not_found
//Requires: caml_string_of_jsstring
//Requires: caml_jsstring_of_string
//Requires: jsoo_sys_getenv
function caml_sys_getenv(name) {
  var r = jsoo_sys_getenv(caml_jsstring_of_string(name));
  if (r === undefined) caml_raise_not_found();
  return caml_string_of_jsstring(r);
}

//Provides: caml_sys_getenv_opt (const)
//Requires: caml_string_of_jsstring
//Requires: caml_jsstring_of_string
//Requires: jsoo_sys_getenv
//Version: >= 5.4
function caml_sys_getenv_opt(name) {
  var r = jsoo_sys_getenv(caml_jsstring_of_string(name));
  if (r === undefined) return 0;
  return [0, caml_string_of_jsstring(r)];
}

//Provides: caml_sys_getenv_opt (const)
//Requires: caml_string_of_jsstring
//Requires: caml_jsstring_of_string
//Requires: jsoo_sys_getenv
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sys_getenv_opt(name) {
  var r = jsoo_sys_getenv(caml_jsstring_of_string(name));
  if (r === undefined) return 0;
  return [0, caml_string_of_jsstring(r)];
}

//Provides: caml_sys_unsafe_getenv
//Requires: caml_sys_getenv
function caml_sys_unsafe_getenv(name) {
  return caml_sys_getenv(name);
}

//Provides: caml_argv
//Requires: caml_string_of_jsstring
var caml_argv = (function () {
  var process = globalThis.process;
  var main = "a.out";
  var args = [];

  if (process?.argv?.length > 1) {
    var argv = process.argv;
    //nodejs
    main = argv[1];
    args = argv.slice(2);
  } else if (
    Array.isArray(globalThis.scriptArgs) &&
    globalThis.scriptArgs.length > 0
  ) {
    //QuickJS: scriptArgs is [script, ...userArgs]
    main = globalThis.scriptArgs[0];
    args = globalThis.scriptArgs.slice(1);
  }

  var p = caml_string_of_jsstring(main);
  var args2 = [0, p];
  for (var i = 0; i < args.length; i++)
    args2.push(caml_string_of_jsstring(args[i]));
  return args2;
})();

//Provides: caml_executable_name
//Requires: caml_argv
var caml_executable_name = caml_argv[1];

//Provides: caml_sys_get_argv
//Requires: caml_argv
function caml_sys_get_argv(_unit) {
  return [0, caml_argv[1], caml_argv];
}

//Provides: caml_sys_argv
//Requires: caml_argv
function caml_sys_argv(_unit) {
  return caml_argv;
}

//Provides: caml_sys_modify_argv
//Requires: caml_argv
function caml_sys_modify_argv(arg) {
  caml_argv = arg;
  return 0;
}

//Provides: caml_sys_executable_name const
//Requires: caml_executable_name
function caml_sys_executable_name(_unit) {
  return caml_executable_name;
}

//Provides: caml_sys_system_command
//Requires: caml_jsstring_of_string
function caml_sys_system_command(cmd) {
  var cmd = caml_jsstring_of_string(cmd);
  if (typeof require !== "undefined") {
    var child_process = require("node:child_process");
    if (child_process?.execSync)
      try {
        child_process.execSync(cmd, { stdio: "inherit" });
        return 0;
      } catch (e) {
        // execSync throws on non-zero exit; e.status is the exit code,
        // or e.signal is set when the child was killed by a signal
        if (typeof e.status === "number") return e.status;
        if (e.signal) return 1;
        return 127;
      }
  }
  // QuickJS: spawn `sh -c <cmd>` via os.exec. With block:true the
  // returned wait status is the exit code on normal exit, or
  // 128+signum on signal -- the same shape POSIX system(3) gives us.
  if (typeof globalThis.os?.exec === "function") {
    try {
      return globalThis.os.exec(["sh", "-c", cmd], { block: true }) | 0;
    } catch (_e) {
      return 127;
    }
  }
  return 127;
}

//Provides: caml_sys_system_command
//Requires: caml_jsstring_of_string
//If: browser
function caml_sys_system_command(_cmd) {
  return 127;
}

//Provides: caml_sys_time mutable
var caml_initial_time = Date.now() * 0.001;
function caml_sys_time() {
  var now = Date.now();
  return now * 0.001 - caml_initial_time;
}

//Provides: caml_sys_time_include_children
//Requires: caml_sys_time
function caml_sys_time_include_children(_b) {
  return caml_sys_time();
}

//Provides: caml_sys_random_seed mutable
//The function needs to return an array since OCaml 4.0...
function caml_sys_random_seed() {
  if (globalThis.crypto) {
    if (globalThis.crypto.getRandomValues) {
      var a = globalThis.crypto.getRandomValues(new Int32Array(4));
      return [0, a[0], a[1], a[2], a[3]];
    } else if (globalThis.crypto.randomBytes) {
      var a = new Int32Array(globalThis.crypto.randomBytes(16).buffer);
      return [0, a[0], a[1], a[2], a[3]];
    }
  }
  var now = Date.now();
  var x = now ^ (0xffffffff * Math.random());
  return [0, x];
}

//Provides: caml_sys_const_big_endian const
function caml_sys_const_big_endian() {
  return 0;
}

//Provides: caml_sys_const_word_size const
function caml_sys_const_word_size() {
  return 32;
}

//Provides: caml_sys_const_int_size const
function caml_sys_const_int_size() {
  return 32;
}

//Provides: caml_sys_const_max_wosize const
// max_int / 4 so that the following does not overflow
//let max_string_length = word_size / 8 * max_array_length - 1;;
function caml_sys_const_max_wosize() {
  return (0x7fffffff / 4) | 0;
}

//Provides: caml_sys_const_ostype_unix const
//Requires: os_type
function caml_sys_const_ostype_unix() {
  return os_type === "Unix" ? 1 : 0;
}
//Provides: caml_sys_const_ostype_win32 const
//Requires: os_type
function caml_sys_const_ostype_win32() {
  return os_type === "Win32" ? 1 : 0;
}
//Provides: caml_sys_const_ostype_cygwin const
//Requires: os_type
function caml_sys_const_ostype_cygwin() {
  return os_type === "Cygwin" ? 1 : 0;
}

//Provides: caml_sys_const_backend_type const
//Requires: caml_string_of_jsbytes
function caml_sys_const_backend_type() {
  return [0, caml_string_of_jsbytes("js_of_ocaml")];
}

//Provides: os_type
//Requires: jsoo_is_win32
var os_type = jsoo_is_win32 ? "Win32" : "Unix";

//Provides: caml_sys_get_config const
//Requires: caml_string_of_jsbytes, os_type
function caml_sys_get_config() {
  return [0, caml_string_of_jsbytes(os_type), 32, 0];
}

//Provides: caml_sys_isatty
//Requires: caml_ml_channel_get
function caml_sys_isatty(chan) {
  var info = caml_ml_channel_get(chan);
  if (info?.file && typeof info.file.isatty === "function")
    return info.file.isatty();
  return 0;
}

//Provides: caml_sys_const_runtime5 const
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sys_const_runtime5(_unit) {
  return 1;
}

//Provides: arch
//Version: >= 5.2, < 5.3
//OxCaml
var arch = globalThis.process?.arch === "arm64" ? "arm64" : "amd64";

//Provides: caml_sys_const_arch_amd64 const
//Requires: arch
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sys_const_arch_amd64(_unit) {
  return arch === "amd64" ? 1 : 0;
}

//Provides: caml_sys_const_arch_arm64 const
//Requires: arch
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sys_const_arch_arm64(_unit) {
  return arch === "arm64" ? 1 : 0;
}

//Provides: caml_is_boot_compiler
//Version: >= 5.2, < 5.3
//OxCaml
function caml_is_boot_compiler(_unit) {
  return 0;
}

//Provides: caml_runtime_variant
//Requires: caml_string_of_jsbytes
function caml_runtime_variant(_unit) {
  return caml_string_of_jsbytes("");
}
//Provides: caml_runtime_parameters
//Requires: caml_string_of_jsbytes
function caml_runtime_parameters(_unit) {
  return caml_string_of_jsbytes("");
}

//Provides: caml_install_signal_handler const
function caml_install_signal_handler() {
  return 0;
}

//Provides: caml_runtime_warnings
var caml_runtime_warnings = 0;

//Provides: caml_ml_enable_runtime_warnings
//Requires: caml_runtime_warnings
function caml_ml_enable_runtime_warnings(bool) {
  caml_runtime_warnings = bool;
  return 0;
}

//Provides: caml_ml_runtime_warnings_enabled
//Requires: caml_runtime_warnings
function caml_ml_runtime_warnings_enabled(_unit) {
  return caml_runtime_warnings;
}

//Provides: caml_sys_const_naked_pointers_checked const (const)
function caml_sys_const_naked_pointers_checked(_unit) {
  return 0;
}

//Provides: caml_xdg_defaults
//Version: >= 5.2
function caml_xdg_defaults(_unit) {
  return 0; // empty list
}

//Provides: caml_sys_is_regular_file
//Requires: resolve_fs_device
//Version: >= 5.1
function caml_sys_is_regular_file(name) {
  var root = resolve_fs_device(name);
  return root.device.isFile(root.rest);
}

//Provides: caml_io_buffer_size
var caml_io_buffer_size = 65536;

//Provides: caml_sys_io_buffer_size
//Requires: caml_io_buffer_size
//Version: >= 5.4
function caml_sys_io_buffer_size(_unit) {
  return caml_io_buffer_size;
}

//Provides: caml_sys_io_buffer_size
//Requires: caml_io_buffer_size
//Version: >= 5.2, < 5.3
//OxCaml
function caml_sys_io_buffer_size(_unit) {
  return caml_io_buffer_size;
}

//Provides: caml_sys_temp_dir_name
//Requires: os_type
//Requires: caml_string_of_jsstring
//Version: >= 5.4
function caml_sys_temp_dir_name(_unit) {
  if (os_type === "Win32") {
    return caml_string_of_jsstring(require("node:os").tmpdir());
  } else {
    return caml_string_of_jsstring("");
  }
}

//Provides: caml_sys_temp_dir_name
//Requires: caml_string_of_jsstring
//Version: >= 5.4
//If: browser
function caml_sys_temp_dir_name(_unit) {
  return caml_string_of_jsstring("");
}

//Provides: caml_sys_convert_signal_number
//Version: >= 5.4
function caml_sys_convert_signal_number(signo) {
  return signo;
}

//Provides: caml_sys_rev_convert_signal_number
//Version: >= 5.4
function caml_sys_rev_convert_signal_number(signo) {
  return signo;
}

//Provides: caml_sys_proc_self_exe const
//Version: >= 5.5
function caml_sys_proc_self_exe(_unit) {
  return 0;
}

//Provides: caml_sys_get_stdlib_dirs
//Version: >= 5.5
function caml_sys_get_stdlib_dirs(stdlib_default) {
  return [0, stdlib_default, 0];
}

//Provides: caml_sys_const_standard_library_default const
//Requires: caml_string_of_jsstring
//Version: >= 5.5
function caml_sys_const_standard_library_default(_unit) {
  return caml_string_of_jsstring("/static/cmis/");
}

//Always
//Requires: caml_fatal_uncaught_exception
//If: !wasm
function caml_setup_uncaught_exception_handler() {
  var process = globalThis.process;
  if (process?.on) {
    process.on("uncaughtException", function (err, origin) {
      caml_fatal_uncaught_exception(err);
      process.exit(2);
    });
  } else if (globalThis.addEventListener) {
    globalThis.addEventListener("error", function (event) {
      if (event.error) {
        caml_fatal_uncaught_exception(event.error);
      }
    });
  }
}
caml_setup_uncaught_exception_handler();

//# 1 "+str.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2020 - Hugo Heuzard
// Copyright (C) 2020 - Shachar Itzhaky
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

// Based on https://github.com/ocaml/ocaml/blob/4.07/otherlibs/str/strstubs.c
// Copied from https://github.com/jscoq/jscoq/blob/v8.11/coq-js/js_stub/str.js

//Provides: re_match
//Requires: caml_jsbytes_of_string, caml_js_from_array, caml_uint8_array_of_string
//Requires: caml_string_get

var re_match = (function () {
  var re_word_letters = [
    0x00, 0x00, 0x00, 0x00 /* 0x00-0x1F: none */, 0x00, 0x00, 0xff,
    0x03 /* 0x20-0x3F: digits 0-9 */, 0xfe, 0xff, 0xff,
    0x87 /* 0x40-0x5F: A to Z, _ */, 0xfe, 0xff, 0xff,
    0x07 /* 0x60-0x7F: a to z */, 0x00, 0x00, 0x00, 0x00 /* 0x80-0x9F: none */,
    0x00, 0x00, 0x00, 0x00 /* 0xA0-0xBF: none */, 0xff, 0xff, 0x7f,
    0xff /* 0xC0-0xDF: Latin-1 accented uppercase */, 0xff, 0xff, 0x7f,
    0xff /* 0xE0-0xFF: Latin-1 accented lowercase */,
  ];

  var opcodes = {
    CHAR: 0,
    CHARNORM: 1,
    STRING: 2,
    STRINGNORM: 3,
    CHARCLASS: 4,
    BOL: 5,
    EOL: 6,
    WORDBOUNDARY: 7,
    BEGGROUP: 8,
    ENDGROUP: 9,
    REFGROUP: 10,
    ACCEPT: 11,
    SIMPLEOPT: 12,
    SIMPLESTAR: 13,
    SIMPLEPLUS: 14,
    GOTO: 15,
    PUSHBACK: 16,
    SETMARK: 17,
    CHECKPROGRESS: 18,
  };

  function is_word_letter(c) {
    return (re_word_letters[c >> 3] >> (c & 7)) & 1;
  }

  function in_bitset(s, i) {
    return (caml_string_get(s, i >> 3) >> (i & 7)) & 1;
  }

  function re_match_impl(re, s, pos, partial) {
    var prog = caml_js_from_array(re[1]),
      cpool = caml_js_from_array(re[2]),
      normtable = caml_jsbytes_of_string(re[3]),
      numgroups = re[4] | 0,
      numregisters = re[5] | 0;

    var s = caml_uint8_array_of_string(s);

    var pc = 0,
      quit = false,
      stack = [],
      groups = new Array(numgroups),
      re_register = new Array(numregisters);

    for (var i = 0; i < groups.length; i++) {
      groups[i] = { start: -1, end: -1 };
    }
    groups[0].start = pos;

    var backtrack = function () {
      while (stack.length) {
        var item = stack.pop();
        if (item.undo) {
          item.undo.obj[item.undo.prop] = item.undo.value;
        } else if (item.pos) {
          pc = item.pos.pc;
          pos = item.pos.txt;
          return;
        }
      }
      quit = true;
    };

    var push = function (item) {
      stack.push(item);
    };

    var accept = function () {
      groups[0].end = pos;
      var result = new Array(1 + groups.length * 2);
      result[0] = 0; // tag
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i];
        if (g.start < 0 || g.end < 0) {
          g.start = g.end = -1;
        }
        result[2 * i + 1] = g.start;
        result[2 * i + 1 + 1] = g.end;
      }
      return result;
    };

    var prefix_match = function () {
      if (partial) return accept();
      else backtrack();
    };

    /* Main DFA interpreter loop */
    while (!quit) {
      var op = prog[pc] & 0xff,
        sarg = prog[pc] >> 8,
        // uarg is used as a constant-pool / group / register index and
        // as a character code, all non-negative; it must not be masked
        // to 8 bits or large pools index the wrong slot
        uarg = sarg,
        c = s[pos],
        group;

      pc++;

      switch (op) {
        case opcodes.CHAR:
          if (pos === s.length) {
            prefix_match();
            break;
          }
          if (c === uarg) pos++;
          else backtrack();
          break;
        case opcodes.CHARNORM:
          if (pos === s.length) {
            prefix_match();
            break;
          }
          if (normtable.charCodeAt(c) === uarg) pos++;
          else backtrack();
          break;
        case opcodes.STRING:
          for (
            var arg = caml_jsbytes_of_string(cpool[uarg]), i = 0;
            i < arg.length;
            i++
          ) {
            if (pos === s.length) {
              prefix_match();
              break;
            }
            if (c === arg.charCodeAt(i)) c = s[++pos];
            else {
              backtrack();
              break;
            }
          }
          break;
        case opcodes.STRINGNORM:
          for (
            var arg = caml_jsbytes_of_string(cpool[uarg]), i = 0;
            i < arg.length;
            i++
          ) {
            if (pos === s.length) {
              prefix_match();
              break;
            }
            if (normtable.charCodeAt(c) === arg.charCodeAt(i)) c = s[++pos];
            else {
              backtrack();
              break;
            }
          }
          break;
        case opcodes.CHARCLASS:
          if (pos === s.length) {
            prefix_match();
            break;
          }
          if (in_bitset(cpool[uarg], c)) pos++;
          else backtrack();
          break;
        case opcodes.BOL:
          if (pos > 0 && s[pos - 1] !== 10 /* \n */) {
            backtrack();
          }
          break;
        case opcodes.EOL:
          if (pos < s.length && s[pos] !== 10 /* \n */) {
            backtrack();
          }
          break;
        case opcodes.WORDBOUNDARY:
          if (pos === 0) {
            if (pos === s.length) {
              prefix_match();
              break;
            }
            if (is_word_letter(s[0])) break;
            backtrack();
          } else if (pos === s.length) {
            if (is_word_letter(s[pos - 1])) break;
            backtrack();
          } else {
            if (is_word_letter(s[pos - 1]) !== is_word_letter(s[pos])) break;
            backtrack();
          }
          break;
        case opcodes.BEGGROUP:
          group = groups[uarg];
          push({ undo: { obj: group, prop: "start", value: group.start } });
          group.start = pos;
          break;
        case opcodes.ENDGROUP:
          group = groups[uarg];
          push({ undo: { obj: group, prop: "end", value: group.end } });
          group.end = pos;
          break;
        case opcodes.REFGROUP:
          group = groups[uarg];
          if (group.start < 0 || group.end < 0) {
            backtrack();
            break;
          }
          for (var i = group.start; i < group.end; i++) {
            if (pos === s.length) {
              prefix_match();
              break;
            }
            if (s[i] !== s[pos]) {
              backtrack();
              break;
            }
            pos++;
          }
          break;
        case opcodes.SIMPLEOPT:
          if (pos < s.length && in_bitset(cpool[uarg], c)) pos++;
          break;
        case opcodes.SIMPLESTAR:
          while (pos < s.length && in_bitset(cpool[uarg], c)) c = s[++pos];
          break;
        case opcodes.SIMPLEPLUS:
          if (pos === s.length) {
            prefix_match();
            break;
          }
          if (in_bitset(cpool[uarg], c)) {
            do {
              c = s[++pos];
            } while (pos < s.length && in_bitset(cpool[uarg], c));
          } else backtrack();
          break;
        case opcodes.ACCEPT:
          return accept();
        case opcodes.GOTO:
          pc = pc + sarg;
          break;
        case opcodes.PUSHBACK:
          push({ pos: { pc: pc + sarg, txt: pos } });
          break;
        case opcodes.SETMARK:
          push({
            undo: { obj: re_register, prop: uarg, value: re_register[uarg] },
          });
          re_register[uarg] = pos;
          break;
        case opcodes.CHECKPROGRESS:
          if (re_register[uarg] === pos) backtrack();
          break;
        default:
          throw new Error("Invalid bytecode");
      }
    }
    return 0;
  }

  return re_match_impl;
})();

//Provides: re_search_forward
//Requires: re_match, caml_ml_string_length, caml_invalid_argument
//Requires: caml_string_get
function re_search_forward(re, s, pos) {
  if (pos < 0 || pos > caml_ml_string_length(s))
    caml_invalid_argument("Str.search_forward");
  var startchars = re[6] | 0;
  var len = caml_ml_string_length(s);
  if (startchars >= 0) {
    startchars = re[2][startchars + 1];
    do {
      while (
        pos < len &&
        caml_string_get(startchars, caml_string_get(s, pos)) === 0
      )
        pos++;
      var res = re_match(re, s, pos, 0);
      if (res) return res;
      pos++;
    } while (pos <= len);
  } else {
    do {
      var res = re_match(re, s, pos, 0);
      if (res) return res;
      pos++;
    } while (pos <= len);
  }
  return [0]; /* [||] : int array */
}

//Provides: re_search_backward
//Requires: re_match, caml_ml_string_length, caml_invalid_argument
//Requires: caml_string_get
function re_search_backward(re, s, pos) {
  if (pos < 0 || pos > caml_ml_string_length(s))
    caml_invalid_argument("Str.search_backward");
  var startchars = re[6] | 0;
  if (startchars >= 0) {
    startchars = re[2][startchars + 1];
    var len = caml_ml_string_length(s);
    do {
      while (
        pos > 0 &&
        pos < len &&
        caml_string_get(startchars, caml_string_get(s, pos)) === 0
      )
        pos--;
      var res = re_match(re, s, pos, 0);
      if (res) return res;
      pos--;
    } while (pos >= 0);
  } else {
    do {
      var res = re_match(re, s, pos, 0);
      if (res) return res;
      pos--;
    } while (pos >= 0);
  }
  return [0]; /* [||] : int array */
}

//Provides: re_string_match
//Requires: re_match, caml_ml_string_length, caml_invalid_argument
function re_string_match(re, s, pos) {
  if (pos < 0 || pos > caml_ml_string_length(s))
    caml_invalid_argument("Str.string_match");
  var res = re_match(re, s, pos, 0);
  if (res) return res;
  else return [0];
}

//Provides: re_partial_match
//Requires: re_match, caml_ml_string_length, caml_invalid_argument
function re_partial_match(re, s, pos) {
  if (pos < 0 || pos > caml_ml_string_length(s))
    caml_invalid_argument("Str.partial_match");
  var res = re_match(re, s, pos, 1);
  if (res) return res;
  else return [0];
}

//Provides: re_replacement_text
//Requires: caml_jsbytes_of_string, caml_string_of_jsbytes
//Requires: caml_array_get
//Requires: caml_failwith
// external re_replacement_text: string -> int array -> string -> string
function re_replacement_text(repl, groups, orig) {
  var repl = caml_jsbytes_of_string(repl);
  var len = repl.length;
  var orig = caml_jsbytes_of_string(orig);
  var res = ""; //result
  var n = 0; // current position
  var cur; //current char
  var start, end, c;
  while (n < len) {
    cur = repl.charAt(n++);
    if (cur !== "\\") {
      res += cur;
    } else {
      if (n === len) caml_failwith("Str.replace: illegal backslash sequence");
      cur = repl.charAt(n++);
      switch (cur) {
        case "\\":
          res += cur;
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          c = +cur;
          if (c * 2 >= groups.length - 1)
            caml_failwith("Str.replace: reference to unmatched group");
          start = caml_array_get(groups, c * 2);
          end = caml_array_get(groups, c * 2 + 1);
          if (start === -1)
            caml_failwith("Str.replace: reference to unmatched group");
          res += orig.slice(start, end);
          break;
        default:
          res += "\\" + cur;
      }
    }
  }
  return caml_string_of_jsbytes(res);
}

//# 1 "+unix.js"
//Provides: caml_unix_gettimeofday
//Alias: unix_gettimeofday
function caml_unix_gettimeofday() {
  return Date.now() / 1000;
}

//Provides: caml_unix_time
//Requires: caml_unix_gettimeofday
//Alias: unix_time
function caml_unix_time() {
  return Math.floor(caml_unix_gettimeofday());
}

//Provides: caml_unix_times
//Requires: caml_failwith
//Alias: unix_times
function caml_unix_times() {
  if (globalThis.process?.cpuUsage) {
    var t = globalThis.process.cpuUsage();
    return BLOCK(0, t.user / 1e6, t.system / 1e6, 0, 0);
  } else if (globalThis.performance?.now) {
    return BLOCK(0, globalThis.performance.now() / 1000, 0, 0, 0);
  } else {
    caml_failwith("caml_unix_times: not implemented");
  }
}

//Provides: caml_unix_gmtime
//Alias: unix_gmtime
function caml_unix_gmtime(t) {
  var d = new Date(t * 1000);
  var d_num = d.getTime();
  var januaryfirst = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).getTime();
  var doy = Math.floor((d_num - januaryfirst) / 86400000);
  return BLOCK(
    0,
    d.getUTCSeconds(),
    d.getUTCMinutes(),
    d.getUTCHours(),
    d.getUTCDate(),
    d.getUTCMonth(),
    d.getUTCFullYear() - 1900,
    d.getUTCDay(),
    doy,
    false | 0 /* for UTC daylight savings time is false */,
  );
}

//Provides: caml_unix_localtime
//Alias: unix_localtime
function caml_unix_localtime(t) {
  var d = new Date(t * 1000);
  // tm_yday is the distance in days to January 1; compute it in UTC so
  // that the one-hour DST shift of wall-clock arithmetic does not apply
  var doy = Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
      Date.UTC(d.getFullYear(), 0, 1)) /
      86400000,
  );
  var jan = new Date(d.getFullYear(), 0, 1);
  var jul = new Date(d.getFullYear(), 6, 1);
  var stdTimezoneOffset = Math.max(
    jan.getTimezoneOffset(),
    jul.getTimezoneOffset(),
  );
  var isdst = d.getTimezoneOffset() < stdTimezoneOffset;
  // Europe/Dublin uses "negative DST": the IANA database marks winter
  // (GMT) as the daylight deviation from its summer standard (IST), so the
  // native runtime reports tm_isdst inverted from the offset heuristic.
  // The offsets alone cannot distinguish it from Europe/London, so match
  // it by name (guarded to the GMT/+1 signature to avoid the Intl lookup
  // for every other zone).
  if (
    stdTimezoneOffset === 0 &&
    jan.getTimezoneOffset() !== jul.getTimezoneOffset() &&
    globalThis.Intl?.DateTimeFormat?.().resolvedOptions().timeZone ===
      "Europe/Dublin"
  )
    isdst = !isdst;
  return BLOCK(
    0,
    d.getSeconds(),
    d.getMinutes(),
    d.getHours(),
    d.getDate(),
    d.getMonth(),
    d.getFullYear() - 1900,
    d.getDay(),
    doy,
    isdst | 0 /* daylight savings time  field. */,
  );
}

//Provides: caml_unix_mktime
//Requires: caml_unix_localtime
//Alias: unix_mktime
function caml_unix_mktime(tm) {
  var d = new Date(tm[6] + 1900, tm[5], tm[4], tm[3], tm[2], tm[1]).getTime();
  var t = Math.floor(d / 1000);
  var tm2 = caml_unix_localtime(t);
  return BLOCK(0, t, tm2);
}
//Provides: caml_unix_startup const
//Alias: win_startup
function caml_unix_startup() {}

//Provides: caml_unix_cleanup const
//Alias: win_cleanup
function caml_unix_cleanup() {}

//Provides: caml_unix_filedescr_of_fd const
//Alias: win_handle_fd
function caml_unix_filedescr_of_fd(x) {
  return x;
}

//Provides: caml_unix_isatty
//Requires: caml_unix_lookup_file
//Alias: unix_isatty
function caml_unix_isatty(fd) {
  var file = caml_unix_lookup_file(fd);
  if (!file.isatty) return 0;
  return file.isatty();
}

//Provides: caml_unix_isatty
//Alias: unix_isatty
//If: browser
function caml_unix_isatty(_fileDescriptor) {
  return 0;
}

//Provides: unix_error
var unix_error = [
  /* ===Unix.error===
   *
   * This array is in order of the variant in OCaml
   */
  "E2BIG",
  "EACCES",
  "EAGAIN",
  "EBADF",
  "EBUSY",
  "ECHILD",
  "EDEADLK",
  "EDOM",
  "EEXIST",
  "EFAULT",
  "EFBIG",
  "EINTR",
  "EINVAL",
  "EIO",
  "EISDIR",
  "EMFILE",
  "EMLINK",
  "ENAMETOOLONG",
  "ENFILE",
  "ENODEV",
  "ENOENT",
  "ENOEXEC",
  "ENOLCK",
  "ENOMEM",
  "ENOSPC",
  "ENOSYS",
  "ENOTDIR",
  "ENOTEMPTY",
  "ENOTTY",
  "ENXIO",
  "EPERM",
  "EPIPE",
  "ERANGE",
  "EROFS",
  "ESPIPE",
  "ESRCH",
  "EXDEV",
  "EWOULDBLOCK",
  "EINPROGRESS",
  "EALREADY",
  "ENOTSOCK",
  "EDESTADDRREQ",
  "EMSGSIZE",
  "EPROTOTYPE",
  "ENOPROTOOPT",
  "EPROTONOSUPPORT",
  "ESOCKTNOSUPPORT",
  "EOPNOTSUPP",
  "EPFNOSUPPORT",
  "EAFNOSUPPORT",
  "EADDRINUSE",
  "EADDRNOTAVAIL",
  "ENETDOWN",
  "ENETUNREACH",
  "ENETRESET",
  "ECONNABORTED",
  "ECONNRESET",
  "ENOBUFS",
  "EISCONN",
  "ENOTCONN",
  "ESHUTDOWN",
  "ETOOMANYREFS",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "EHOSTDOWN",
  "EHOSTUNREACH",
  "ELOOP",
  "EOVERFLOW",
];

//Provides: make_unix_err_args
//Requires: unix_error, caml_string_of_jsstring
function make_unix_err_args(code, syscall, path, errno) {
  var variant = unix_error.indexOf(code);
  if (variant < 0) {
    // Default if undefined
    if (errno == null) {
      errno = -9999;
    }
    // If none of the above variants, fallback to EUNKNOWNERR(int)
    // errno is expected to be positive
    variant = BLOCK(0, -errno);
  }
  var args = [
    variant,
    caml_string_of_jsstring(syscall || ""),
    caml_string_of_jsstring(path || ""),
  ];
  return args;
}

//Provides: caml_strerror
//Requires: unix_error
function caml_strerror(errno) {
  if (typeof require === "undefined") {
    const code = unix_error[errno];
    return code || "Unknown error " + errno;
  }
  const util = require("node:util");
  if (errno >= 0) {
    const code = unix_error[errno];
    // no Iterator.prototype.find: it requires node >= 22
    for (const e of util.getSystemErrorMap())
      if (e[1][0] === code) return e[1][1];
    // not every code is in libuv's error map
    return code || "Unknown error " + errno;
  } else {
    return util.getSystemErrorMessage(errno);
  }
}

//Provides: caml_strerror
//Requires: unix_error
//If: browser
function caml_strerror(errno) {
  const code = unix_error[errno];
  return code || "Unknown error " + errno;
}

//Provides: unix_error_message
//Alias: caml_unix_error_message
//Requires: caml_strerror, caml_string_of_jsstring
function unix_error_message(err) {
  const errno = typeof err === "number" ? err : -err[1];
  return caml_string_of_jsstring(caml_strerror(errno));
}

//Provides: caml_unix_chdir
//Requires: caml_sys_chdir
//Alias: unix_chdir
function caml_unix_chdir(dir) {
  return caml_sys_chdir(dir, /* raise Unix_error */ true);
}

//Provides: caml_unix_stat
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_stat
function caml_unix_stat(name) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.stat) {
    caml_failwith("caml_unix_stat: not implemented");
  }
  return root.device.stat(
    root.rest,
    /* large */ false,
    /* raise Unix_error */ true,
  );
}

//Provides: caml_unix_stat_64
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_stat_64
function caml_unix_stat_64(name) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.stat) {
    caml_failwith("caml_unix_stat_64: not implemented");
  }
  return root.device.stat(
    root.rest,
    /* large */ true,
    /* raise Unix_error */ true,
  );
}

//Provides: caml_unix_lstat
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_lstat
function caml_unix_lstat(name) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.lstat) {
    caml_failwith("caml_unix_lstat: not implemented");
  }
  return root.device.lstat(
    root.rest,
    /* large */ false,
    /* raise Unix_error */ true,
  );
}

//Provides: caml_unix_lstat_64
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_lstat_64
function caml_unix_lstat_64(name) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.lstat) {
    caml_failwith("caml_unix_lstat_64: not implemented");
  }
  return root.device.lstat(
    root.rest,
    /* large */ true,
    /* raise Unix_error */ true,
  );
}

//Provides: caml_unix_chmod
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_chmod
function caml_unix_chmod(name, perms) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.chmod) {
    caml_failwith("caml_unix_chmod: not implemented");
  }
  return root.device.chmod(root.rest, perms, /* raise Unix_error */ 1);
}

//Provides: caml_unix_rename
//Requires: caml_failwith, resolve_fs_device
//Requires: caml_raise_system_error
//Alias: unix_rename
function caml_unix_rename(o, n) {
  var o_root = resolve_fs_device(o, /* raise Unix_error */ 1);
  var n_root = resolve_fs_device(n, /* raise Unix_error */ 1);
  if (o_root.device !== n_root.device)
    caml_raise_system_error(/* raise Unix_error */ 1, "EXDEV", "rename");
  if (!o_root.device.rename) caml_failwith("caml_sys_rename: not implemented");
  o_root.device.rename(o_root.rest, n_root.rest, /* raise Unix_error */ true);
}

//Provides: caml_unix_mkdir
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_mkdir
function caml_unix_mkdir(name, perm) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.mkdir) {
    caml_failwith("caml_unix_mkdir: not implemented");
  }
  return root.device.mkdir(root.rest, perm, /* raise Unix_error */ true);
}

//Provides: caml_unix_rmdir
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_rmdir
function caml_unix_rmdir(name) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.rmdir) {
    caml_failwith("caml_unix_rmdir: not implemented");
  }
  return root.device.rmdir(root.rest, /* raise Unix_error */ true);
}

//Provides: caml_unix_link
//Requires: resolve_fs_device, caml_failwith, caml_raise_system_error
//Alias: unix_link
function caml_unix_link(follow, src, dst) {
  var src_root = resolve_fs_device(src, /* raise Unix_error */ 1);
  var dst_root = resolve_fs_device(dst, /* raise Unix_error */ 1);
  if (!src_root.device.link) {
    caml_failwith("caml_unix_link: not implemented");
  }
  // We can't control whether a 'src' symlink is followed or not.
  // So we fail when 'follow' is set, as documented in the Unix module.
  if (typeof follow !== "number")
    caml_raise_system_error(/* raise Unix_error */ 1, "ENOSYS", "link");
  if (src_root.device !== dst_root.device)
    caml_raise_system_error(/* raise Unix_error */ 1, "EXDEV", "link");
  return src_root.device.link(
    src_root.rest,
    dst_root.rest,
    /* raise Unix_error */ true,
  );
}

//Provides: caml_unix_symlink
//Requires: resolve_fs_device, caml_failwith, caml_jsstring_of_string
//Alias: unix_symlink
function caml_unix_symlink(to_dir, src, dst) {
  var dst_root = resolve_fs_device(dst, /* raise Unix_error */ 1);
  if (!dst_root.device.symlink) {
    caml_failwith("caml_unix_symlink: not implemented");
  }
  return dst_root.device.symlink(
    to_dir,
    caml_jsstring_of_string(src),
    dst_root.rest,
    /* raise Unix_error */ true,
  );
}

//Provides: caml_unix_readlink
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_readlink
function caml_unix_readlink(name) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.readlink) {
    caml_failwith("caml_unix_readlink: not implemented");
  }
  return root.device.readlink(root.rest, /* raise Unix_error */ true);
}

//Provides: caml_unix_unlink
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_unlink
function caml_unix_unlink(name) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.unlink) {
    caml_failwith("caml_unix_unlink: not implemented");
  }
  root.device.unlink(root.rest, /* raise Unix_error */ true);
  return 0;
}

//Provides: caml_unix_utimes
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_utimes
function caml_unix_utimes(name, atime, mtime) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.utimes) {
    caml_failwith("caml_unix_utimes: not implemented");
  }
  root.device.utimes(root.rest, atime, mtime, /* raise Unix_error */ true);
  return 0;
}

//Provides: caml_unix_truncate
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_truncate
function caml_unix_truncate(name, len) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.truncate) {
    caml_failwith("caml_unix_truncate: not implemented");
  }
  root.device.truncate(root.rest, len, /* raise Unix_error */ true);
  return 0;
}

//Provides: caml_unix_truncate_64
//Requires: resolve_fs_device, caml_failwith, caml_int64_to_float
//Alias: unix_truncate_64
function caml_unix_truncate_64(name, len) {
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.truncate) {
    caml_failwith("caml_unix_truncate_64: not implemented");
  }
  root.device.truncate(
    root.rest,
    caml_int64_to_float(len),
    /* raise Unix_error */ true,
  );
  return 0;
}

//Provides: caml_unix_access
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_access
function caml_unix_access(name, flags) {
  var f = {};
  while (flags) {
    switch (flags[1]) {
      case 0:
        f.r = 1;
        break;
      case 1:
        f.w = 1;
        break;
      case 2:
        f.x = 1;
        break;
      case 3:
        f.f = 1;
        break;
    }
    flags = flags[2];
  }
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  if (!root.device.access) {
    caml_failwith("caml_unix_access: not implemented");
  }
  root.device.access(root.rest, f, /* raise Unix_error */ true);
  return 0;
}

//Provides: caml_unix_open
//Requires: resolve_fs_device, caml_sys_fds
//Alias: unix_open
function caml_unix_open(name, flags, perms) {
  var f = {};
  while (flags) {
    switch (flags[1]) {
      case 0:
        f.rdonly = 1;
        break;
      case 1:
        f.wronly = 1;
        break;
      case 2:
        f.rdwr = 1;
        break;
      case 3:
        f.nonblock = 1;
        break;
      case 4:
        f.append = 1;
        break;
      case 5:
        f.create = 1;
        break;
      case 6:
        f.truncate = 1;
        break;
      case 7:
        f.excl = 1;
        break;
      case 8:
        f.noctty = 1;
        break;
      case 9:
        f.dsync = 1;
        break;
      case 10:
        f.sync = 1;
        break;
    }
    flags = flags[2];
  }
  var root = resolve_fs_device(name, /* raise Unix_error */ 1);
  var file = root.device.open(root.rest, f, perms, /* raise Unix_error */ true);
  var idx = caml_sys_fds.length;
  caml_sys_fds[idx] = { file: file };
  return idx | 0;
}

//Provides: caml_unix_lookup_file
//Requires: caml_sys_fds, caml_raise_system_error
function caml_unix_lookup_file(fd, cmd) {
  var fd_desc = caml_sys_fds[fd];
  if (fd_desc === undefined)
    caml_raise_system_error(/* raise Unix_error */ 1, "EBADF", cmd);
  return fd_desc.file;
}

//Provides: caml_unix_fstat
//Alias: unix_fstat
//Requires: caml_unix_lookup_file, caml_failwith
function caml_unix_fstat(fd) {
  var file = caml_unix_lookup_file(fd, "fstat");
  if (!file.stat) {
    caml_failwith("caml_unix_fstat: not implemented");
  }
  return file.stat(/* large */ false);
}

//Provides: caml_unix_fstat_64
//Alias: unix_fstat_64
//Requires: caml_unix_lookup_file, caml_failwith
function caml_unix_fstat_64(fd) {
  var file = caml_unix_lookup_file(fd, "fstat");
  if (!file.stat) {
    caml_failwith("caml_unix_fstat64: not implemented");
  }
  return file.stat(/* large */ true);
}

//Provides: caml_unix_fchmod
//Alias: unix_fchmod
//Requires: caml_unix_lookup_file, caml_failwith
function caml_unix_fchmod(fd, perms) {
  var file = caml_unix_lookup_file(fd, "fchmod");
  if (!file.chmod) {
    caml_failwith("caml_unix_fchmod: not implemented");
  }
  return file.chmod(perms);
}

//Provides: caml_unix_fsync
//Alias: unix_fsync
//Requires: caml_unix_lookup_file, caml_failwith
function caml_unix_fsync(fd) {
  var file = caml_unix_lookup_file(fd, "fsync");
  if (!file.sync) {
    caml_failwith("caml_unix_fsync: not implemented");
  }
  return file.sync();
}

//Provides: caml_unix_write
//Alias: unix_write
//Requires: caml_unix_lookup_file, caml_uint8_array_of_bytes
function caml_unix_write(fd, buf, pos, len) {
  var file = caml_unix_lookup_file(fd, "write");
  var a = caml_uint8_array_of_bytes(buf);
  var written = 0;
  while (len > 0) {
    var n = file.write(a, pos, len, /* raise unix_error */ 1);
    written += n;
    pos += n;
    len -= n;
  }
  return written;
}

//Provides: caml_unix_single_write
//Alias: unix_single_write
//Requires: caml_unix_lookup_file, caml_uint8_array_of_bytes
function caml_unix_single_write(fd, buf, pos, len) {
  var file = caml_unix_lookup_file(fd, "write");
  if (len === 0) return 0;
  return file.write(
    caml_uint8_array_of_bytes(buf),
    pos,
    len,
    /* raise unix_error */ 1,
  );
}

//Provides: caml_unix_write_bigarray
//Requires: caml_ba_to_typed_array, caml_unix_lookup_file
//Version: >= 5.2
function caml_unix_write_bigarray(fd, buf, pos, len) {
  var a = caml_ba_to_typed_array(buf);
  var file = caml_unix_lookup_file(fd, "write");
  var written = 0;
  while (len > 0) {
    var n = file.write(a, pos, len, /* raise unix_error */ 1);
    written += n;
    pos += n;
    len -= n;
  }
  return written;
}

//Provides: caml_unix_read
//Alias: unix_read
//Requires: caml_unix_lookup_file, caml_uint8_array_of_bytes
function caml_unix_read(fd, buf, pos, len) {
  var file = caml_unix_lookup_file(fd, "read");
  return file.read(
    caml_uint8_array_of_bytes(buf),
    pos,
    len,
    /* raise unix_error */ 1,
  );
}

//Provides: caml_unix_read_bigarray
//Alias: unix_read_bigarray
//Requires: caml_ba_to_typed_array, caml_unix_lookup_file
//Version: >= 5.2
function caml_unix_read_bigarray(fd, buf, pos, len) {
  var a = caml_ba_to_typed_array(buf);
  var file = caml_unix_lookup_file(fd, "read");
  return file.read(a, pos, len, /* raise unix_error */ 1);
}

//Provides: caml_unix_lseek
//Alias: unix_lseek
//Requires: caml_unix_lookup_file
function caml_unix_lseek(fd, len, whence) {
  var file = caml_unix_lookup_file(fd, "lseek");
  return file.seek(len, whence, /* raise unix_error */ 1);
}

//Provides: caml_unix_lseek_64
//Alias: unix_lseek_64
//Requires: caml_unix_lookup_file, caml_int64_to_float
function caml_unix_lseek_64(fd, len, whence) {
  var file = caml_unix_lookup_file(fd, "lseek");
  return file.seek(caml_int64_to_float(len), whence, /* raise unix_error */ 1);
}

//Provides: caml_unix_ftruncate
//Alias: unix_ftruncate
//Requires: caml_unix_lookup_file, caml_failwith
function caml_unix_ftruncate(fd, len) {
  var file = caml_unix_lookup_file(fd, "ftruncate");
  if (!file.truncate) {
    caml_failwith("caml_unix_ftruncate: not implemented");
  }
  file.truncate(len, /* raise unix_error */ 1);
  return 0;
}

//Provides: caml_unix_ftruncate_64
//Alias: unix_ftruncate_64
//Requires: caml_unix_lookup_file, caml_failwith, caml_int64_to_float
function caml_unix_ftruncate_64(fd, len) {
  var file = caml_unix_lookup_file(fd, "ftruncate");
  if (!file.truncate) {
    caml_failwith("caml_unix_ftruncate_64: not implemented");
  }
  file.truncate(caml_int64_to_float(len), /* raise unix_error */ 1);
  return 0;
}

//Provides: caml_unix_close
//Alias: unix_close
//Requires: caml_unix_lookup_file, caml_sys_fds
function caml_unix_close(fd) {
  var file = caml_unix_lookup_file(fd, "close");
  file.close(/* raise unix_error */ 1);
  delete caml_sys_fds[fd];
  return 0;
}

//Provides: caml_unix_inchannel_of_filedescr
//Alias: unix_inchannel_of_filedescr
//Alias: win_inchannel_of_filedescr
//Requires: caml_unix_lookup_file, caml_ml_open_descriptor_in
function caml_unix_inchannel_of_filedescr(fd) {
  var file = caml_unix_lookup_file(fd, "in_channel_of_descr");
  file.check_stream_semantics("in_channel_of_descr");
  return caml_ml_open_descriptor_in(fd);
}

//Provides: caml_unix_outchannel_of_filedescr
//Alias: unix_outchannel_of_filedescr
//Alias: win_outchannel_of_filedescr
//Requires: caml_unix_lookup_file, caml_ml_open_descriptor_out
function caml_unix_outchannel_of_filedescr(fd) {
  var file = caml_unix_lookup_file(fd, "out_channel_of_descr");
  file.check_stream_semantics("out_channel_of_descr");
  return caml_ml_open_descriptor_out(fd);
}

//Provides: caml_unix_getuid
//Alias: unix_getuid
function caml_unix_getuid(_unit) {
  if (globalThis.process?.getuid) {
    return globalThis.process.getuid();
  }
  return 1;
}

//Provides: caml_unix_geteuid
//Alias: unix_geteuid
function caml_unix_geteuid(_unit) {
  if (globalThis.process?.geteuid) {
    return globalThis.process.geteuid();
  }
  return 1;
}

//Provides: caml_unix_getgid
//Alias: unix_getgid
function caml_unix_getgid(_unit) {
  if (globalThis.process?.getgid) {
    return globalThis.process.getgid();
  }
  return 1;
}

//Provides: caml_unix_getegid
//Alias: unix_getegid
function caml_unix_getegid(_unit) {
  if (globalThis.process?.getegid) {
    return globalThis.process.getegid();
  }
  return 1;
}

//Provides: caml_unix_getpwnam
//Requires: caml_raise_not_found
//Alias: unix_getpwnam
//Alias: caml_unix_getpwuid
//Alias: unix_getpwuid
//Alias: caml_unix_getgrnam
//Alias: unix_getgrnam
//Alias: caml_unix_getgrgid
//Alias: unix_getgrgid
function caml_unix_getpwnam(_unit) {
  caml_raise_not_found();
}

//Provides: caml_unix_has_symlink
//Requires: fs_node_supported
//Alias: unix_has_symlink
function caml_unix_has_symlink(_unit) {
  return fs_node_supported() ? 1 : 0;
}

//Provides: caml_unix_opendir
//Requires: resolve_fs_device, caml_failwith
//Alias: unix_opendir
function caml_unix_opendir(path) {
  var root = resolve_fs_device(path, /* raise Unix_error */ 1);
  if (!root.device.opendir) {
    caml_failwith("caml_unix_opendir: not implemented");
  }
  var dir_handle = root.device.opendir(root.rest, /* raise Unix_error */ true);
  // node's Dir.readSync does not report "." and ".."; native readdir does
  return { pointer: dir_handle, path: path, dots: [".", ".."] };
}

//Provides: caml_unix_readdir
//Requires: caml_raise_end_of_file
//Requires: caml_string_of_jsstring
//Requires: caml_raise_system_error
//Alias: unix_readdir
function caml_unix_readdir(dir_handle) {
  var entry;
  if (dir_handle.dots && dir_handle.dots.length > 0)
    return caml_string_of_jsstring(dir_handle.dots.shift());
  try {
    entry = dir_handle.pointer.readSync();
  } catch (e) {
    caml_raise_system_error(/* raise Unix_error */ 1, "EBADF", "readdir");
  }
  if (entry === null) {
    caml_raise_end_of_file();
  } else {
    return caml_string_of_jsstring(entry.name);
  }
}

//Provides: caml_unix_closedir
//Requires: caml_raise_system_error
//Alias: unix_closedir
function caml_unix_closedir(dir_handle) {
  // drop the synthesized "." / ".." so readdir on a closed handle fails
  dir_handle.dots = null;
  try {
    dir_handle.pointer.closeSync();
  } catch (e) {
    caml_raise_system_error(/* raise Unix_error */ 1, "EBADF", "closedir");
  }
}

//Provides: caml_unix_rewinddir
//Requires: caml_unix_closedir, caml_unix_opendir
//Alias: unix_rewinddir
function caml_unix_rewinddir(dir_handle) {
  caml_unix_closedir(dir_handle);
  var new_dir_handle = caml_unix_opendir(dir_handle.path);
  dir_handle.pointer = new_dir_handle.pointer;
  dir_handle.dots = new_dir_handle.dots;
  return 0;
}

//Provides: caml_unix_findfirst
//Requires: caml_jsstring_of_string, caml_string_of_jsstring
//Requires: caml_unix_opendir, caml_unix_readdir
//Alias: win_findfirst
function caml_unix_findfirst(path) {
  // The Windows code adds this glob to the path, so we need to remove it
  var path_js = caml_jsstring_of_string(path);
  path_js = path_js.replace(/(^|[\\/])\*\.\*$/, "");
  path = caml_string_of_jsstring(path_js);
  // *.* is now stripped
  var dir_handle = caml_unix_opendir(path);
  var first_entry = caml_unix_readdir(dir_handle);
  // The Windows bindings type dir_handle as an `int` but it's not in JS
  return [0, first_entry, dir_handle];
}

//Provides: caml_unix_findnext
//Requires: caml_unix_readdir
//Alias: win_findnext
function caml_unix_findnext(dir_handle) {
  return caml_unix_readdir(dir_handle);
}

//Provides: caml_unix_findclose
//Requires: caml_unix_closedir
//Alias: win_findclose
function caml_unix_findclose(dir_handle) {
  return caml_unix_closedir(dir_handle);
}

//Provides: caml_unix_inet_addr_of_string const
//Alias: unix_inet_addr_of_string
function caml_unix_inet_addr_of_string() {
  return 0;
}

//Provides: caml_raise_system_error
//Requires: caml_raise_with_args, make_unix_err_args, caml_named_value
//Requires: caml_raise_sys_error
function caml_raise_system_error(raise_unix, code, cmd, msg, path) {
  var unix_error = caml_named_value("Unix.Unix_error");
  if (raise_unix && unix_error)
    caml_raise_with_args(unix_error, make_unix_err_args(code, cmd, path));
  else {
    var msg = code + ": " + msg + ", " + cmd;
    if (path !== undefined) msg += " '" + path + "'";
    caml_raise_sys_error(msg);
  }
}

//# 1 "+weak.js"
// Js_of_ocaml runtime support
// http://www.ocsigen.org/js_of_ocaml/
// Copyright (C) 2010 Jérôme Vouillon
// Laboratoire PPS - CNRS Université Paris Diderot
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, with linking exception;
// either version 2.1 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

// Weak API

//Provides: caml_ephe_key_offset
var caml_ephe_key_offset = 3;

//Provides: caml_ephe_data_offset
var caml_ephe_data_offset = 2;

//Provides: caml_ephe_none
var caml_ephe_none = { caml_ephe_none: 0 };

//Provides: caml_ephe_set_key
//Requires: caml_ephe_key_offset
//Requires: caml_ephe_get_data
//Requires: caml_ephe_set_data_opt
function caml_ephe_set_key(x, i, v) {
  var old = caml_ephe_get_data(x);
  if (globalThis.WeakRef && v instanceof Object) v = new globalThis.WeakRef(v);
  x[caml_ephe_key_offset + i] = v;
  caml_ephe_set_data_opt(x, old);
  return 0;
}

//Provides: caml_ephe_unset_key
//Requires: caml_ephe_key_offset
//Requires: caml_ephe_get_data
//Requires: caml_ephe_set_data_opt
//Requires: caml_ephe_none
function caml_ephe_unset_key(x, i) {
  var old = caml_ephe_get_data(x);
  x[caml_ephe_key_offset + i] = caml_ephe_none;
  caml_ephe_set_data_opt(x, old);
  return 0;
}

//Provides: caml_ephe_create
//Requires: caml_weak_create
function caml_ephe_create(n) {
  return caml_weak_create(n);
}

//Provides: caml_weak_create
//Requires: caml_ephe_key_offset
//Requires: caml_ephe_none
function caml_weak_create(n) {
  var alen = caml_ephe_key_offset + n;
  var x = new Array(alen);
  x[0] = 251;
  x[1] = "caml_ephe_list_head";
  for (var i = 2; i < alen; i++) {
    x[i] = caml_ephe_none;
  }
  return x;
}

//Provides: caml_weak_set
//Requires: caml_ephe_set_key, caml_ephe_unset_key
function caml_weak_set(x, i, v) {
  if (v === 0) caml_ephe_unset_key(x, i);
  else caml_ephe_set_key(x, i, v[1]);
  return 0;
}
//Provides: caml_ephe_get_key
//Requires: caml_ephe_key_offset, caml_ephe_data_offset
//Requires: caml_ephe_none
//Alias: caml_weak_get

function caml_ephe_get_key(x, i) {
  var weak = x[caml_ephe_key_offset + i];
  if (weak === caml_ephe_none) return 0;
  if (globalThis.WeakRef && weak instanceof globalThis.WeakRef) {
    weak = weak.deref();
    if (weak === undefined) {
      x[caml_ephe_key_offset + i] = caml_ephe_none;
      x[caml_ephe_data_offset] = caml_ephe_none;
      return 0;
    }
  }
  return [0, weak];
}
//Provides: caml_ephe_get_key_copy
//Requires: caml_ephe_get_key,caml_ephe_key_offset
//Requires: caml_obj_dup, caml_is_ml_bytes
//Alias: caml_weak_get_copy
function caml_ephe_get_key_copy(x, i) {
  var y = caml_ephe_get_key(x, i);
  if (y === 0) return y;
  var z = y[1];
  if (Array.isArray(z) || caml_is_ml_bytes(z)) return [0, caml_obj_dup(z)];
  return y;
}

//Provides: caml_ephe_check_key mutable
//Requires: caml_ephe_key_offset, caml_ephe_data_offset
//Requires: caml_ephe_none
//Alias: caml_weak_check
function caml_ephe_check_key(x, i) {
  var weak = x[caml_ephe_key_offset + i];
  if (weak === caml_ephe_none) return 0;
  if (globalThis.WeakRef && weak instanceof globalThis.WeakRef) {
    weak = weak.deref();
    if (weak === undefined) {
      x[caml_ephe_key_offset + i] = caml_ephe_none;
      x[caml_ephe_data_offset] = caml_ephe_none;
      return 0;
    }
  }
  return 1;
}

//Provides: caml_ephe_blit_key
//Requires: caml_array_blit
//Requires: caml_ephe_key_offset
//Requires: caml_ephe_get_data
//Requires: caml_ephe_set_data_opt
//Alias: caml_weak_blit
function caml_ephe_blit_key(a1, i1, a2, i2, len) {
  // The data is stored wrapped in WeakMaps keyed on the (live) keys, so
  // fetch the destination's data before changing its keys and store it
  // back afterwards.
  var old = caml_ephe_get_data(a2);
  // minus one because caml_array_blit works on ocaml array
  caml_array_blit(
    a1,
    caml_ephe_key_offset + i1 - 1,
    a2,
    caml_ephe_key_offset + i2 - 1,
    len,
  );
  caml_ephe_set_data_opt(a2, old);
  return 0;
}

//Provides: caml_ephe_blit_data
//Requires: caml_ephe_get_data, caml_ephe_set_data_opt
function caml_ephe_blit_data(src, dst) {
  var old = caml_ephe_get_data(src);
  caml_ephe_set_data_opt(dst, old);
  return 0;
}

//Provides: caml_ephe_get_data
//Requires: caml_ephe_data_offset, caml_ephe_key_offset
//Requires: caml_ephe_none
function caml_ephe_get_data(x) {
  var data = x[caml_ephe_data_offset];
  if (data === caml_ephe_none) return 0;
  for (var i = caml_ephe_key_offset; i < x.length; i++) {
    var k = x[i];
    if (globalThis.WeakRef && k instanceof globalThis.WeakRef) {
      var d = k.deref();
      if (d === undefined) {
        x[i] = caml_ephe_none;
        x[caml_ephe_data_offset] = caml_ephe_none;
        return 0;
      }
      if (globalThis.WeakMap) {
        data = data.get(d);
        if (data === undefined) {
          x[caml_ephe_data_offset] = caml_ephe_none;
          return 0;
        }
      }
    }
  }
  return [0, data];
}

//Provides: caml_ephe_get_data_copy
//Requires: caml_ephe_get_data
//Requires: caml_obj_dup, caml_is_ml_bytes
function caml_ephe_get_data_copy(x) {
  var r = caml_ephe_get_data(x);
  if (r === 0) return 0;
  var z = r[1];
  if (Array.isArray(z) || caml_is_ml_bytes(z)) return [0, caml_obj_dup(z)];
  return r;
}

//Provides: caml_ephe_set_data
//Requires: caml_ephe_data_offset, caml_ephe_key_offset
//Requires: caml_ephe_none
function caml_ephe_set_data(x, data) {
  for (var i = x.length - 1; i >= caml_ephe_key_offset; i--) {
    var k = x[i];
    if (globalThis.WeakRef && k instanceof globalThis.WeakRef) {
      var d = k.deref();
      if (d === undefined) {
        x[i] = caml_ephe_none;
        continue;
      }
      if (globalThis.WeakMap) {
        // Key the map on the key object itself (not the WeakRef
        // wrapper, which the ephemeron strongly holds): the data must
        // be reachable only while the key is, so that key <-> data
        // cycles can be collected.
        data = new globalThis.WeakMap().set(d, data);
      }
    }
  }
  x[caml_ephe_data_offset] = data;
  return 0;
}

//Provides: caml_ephe_set_data_opt
//Requires: caml_ephe_set_data
//Requires: caml_ephe_unset_data
function caml_ephe_set_data_opt(x, data_opt) {
  if (data_opt === 0) caml_ephe_unset_data(x);
  else caml_ephe_set_data(x, data_opt[1]);
  return 0;
}

//Provides: caml_ephe_unset_data
//Requires: caml_ephe_data_offset
//Requires: caml_ephe_none
function caml_ephe_unset_data(x) {
  x[caml_ephe_data_offset] = caml_ephe_none;
  return 0;
}

//Provides: caml_ephe_check_data
//Requires: caml_ephe_get_data
function caml_ephe_check_data(x) {
  var data = caml_ephe_get_data(x);
  if (data === 0) return 0;
  else return 1;
}

//# 1 "+domain.js"
//Provides: caml_domain_dls
//Version: >= 5
var caml_domain_dls = [0];

//Provides: caml_domain_dls_set
//Requires: caml_domain_dls
//Version: >= 5
function caml_domain_dls_set(a) {
  caml_domain_dls = a;
  return 0;
}

//Provides: caml_domain_dls_compare_and_set
//Requires: caml_domain_dls
//Version: >= 5.2
function caml_domain_dls_compare_and_set(old, n) {
  if (caml_domain_dls !== old) return 0;
  caml_domain_dls = n;
  return 1;
}

//Provides: caml_domain_dls_get
//Requires: caml_domain_dls
//Version: >= 5
function caml_domain_dls_get(_unit) {
  return caml_domain_dls;
}

//Provides: caml_domain_tls
//Version: >= 5.2, < 5.3
//OxCaml
var caml_domain_tls = [0];

//Provides: caml_domain_tls_set
//Requires: caml_domain_tls
//Version: >= 5.2, < 5.3
//OxCaml
function caml_domain_tls_set(a) {
  caml_domain_tls = a;
  return 0;
}

//Provides: caml_domain_tls_get
//Requires: caml_domain_tls
//Version: >= 5.2, < 5.3
//OxCaml
function caml_domain_tls_get(_unit) {
  return caml_domain_tls;
}

//Provides: caml_atomic_load
//Version: >= 5
function caml_atomic_load(ref) {
  return ref[1];
}

//Provides: caml_atomic_load_field
//Version: >= 5.4
function caml_atomic_load_field(b, i) {
  return b[i + 1];
}

//Provides: caml_atomic_cas
//Version: >= 5
function caml_atomic_cas(ref, o, n) {
  if (ref[1] === o) {
    ref[1] = n;
    return 1;
  }
  return 0;
}

//Provides: caml_atomic_cas_field
//Version: >= 5.4
function caml_atomic_cas_field(b, i, o, n) {
  if (b[i + 1] === o) {
    b[i + 1] = n;
    return 1;
  }
  return 0;
}

//Provides: caml_atomic_compare_exchange
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_compare_exchange(ref, o, n) {
  var old = ref[1];
  if (old === o) ref[1] = n;
  return old;
}

//Provides: caml_atomic_fetch_add
//Version: >= 5
function caml_atomic_fetch_add(ref, i) {
  var old = ref[1];
  ref[1] += i;
  return old;
}

//Provides: caml_atomic_fetch_add_field
//Version: >= 5.4
function caml_atomic_fetch_add_field(b, i, n) {
  var old = b[i + 1];
  b[i + 1] += n;
  return old;
}

//Provides: caml_atomic_add
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_add(ref, i) {
  ref[1] += i;
  return 0;
}

//Provides: caml_atomic_sub
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_sub(ref, i) {
  ref[1] -= i;
  return 0;
}

//Provides: caml_atomic_land
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_land(ref, i) {
  ref[1] &= i;
  return 0;
}

//Provides: caml_atomic_lor
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_lor(ref, i) {
  ref[1] |= i;
  return 0;
}

//Provides: caml_atomic_lxor
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_lxor(ref, i) {
  ref[1] ^= i;
  return 0;
}

//Provides: caml_atomic_exchange
//Version: >= 5
function caml_atomic_exchange(ref, v) {
  var r = ref[1];
  ref[1] = v;
  return r;
}

//Provides: caml_atomic_exchange_field
//Version: >= 5.4
function caml_atomic_exchange_field(b, i, v) {
  var r = b[i + 1];
  b[i + 1] = v;
  return r;
}

//Provides: caml_atomic_set
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_set(ref, v) {
  ref[1] = v;
  return 0;
}

//Provides: caml_atomic_make_contended
//Version: >= 5.2
function caml_atomic_make_contended(a) {
  return [0, a];
}

//Provides: caml_ml_domain_unique_token
//Version: >= 5.0, < 5.2
var caml_ml_domain_unique_token_ = [0];
function caml_ml_domain_unique_token(_unit) {
  return caml_ml_domain_unique_token_;
}

//Provides: caml_recommended_domain_count
//Version: >= 5
function caml_recommended_domain_count(_unit) {
  return 1;
}

//Provides: caml_ml_domain_index
//Requires: caml_domain_id
//Version: >= 5.03
function caml_ml_domain_index(_unit) {
  return caml_domain_id;
}

//Provides: caml_ml_domain_index
//Requires: caml_domain_id
//Version: >= 5.2, < 5.3
//OxCaml
function caml_ml_domain_index(_unit) {
  return caml_domain_id;
}

//Provides: caml_domain_id
//Version: >= 5
var caml_domain_id = 0;

//Provides: caml_domain_spawn
//Requires: caml_ml_mutex_unlock
//Requires: caml_domain_id
//Requires: caml_callback
//Requires: caml_wrap_exception, caml_get_exception_raw_backtrace
//Version: >= 5.5
var caml_domain_latest_idx = 1;
function caml_domain_spawn(f, term_sync) {
  var id = caml_domain_latest_idx++;
  var old = caml_domain_id;
  caml_domain_id = id;
  var result;
  try {
    // term_sync.state = Finished (Ok res)
    result = [0, [0, caml_callback(f, [0])]];
  } catch (e) {
    // term_sync.state = Finished (Error (exn, backtrace))
    var exn = caml_wrap_exception(e);
    result = [0, [1, [0, exn, caml_get_exception_raw_backtrace(0)]]];
  }
  caml_domain_id = old;
  caml_ml_mutex_unlock(term_sync[2]);
  term_sync[1] = result;
  return id;
}

//Provides: caml_domain_spawn
//Requires: caml_ml_mutex_unlock
//Requires: caml_domain_id
//Requires: caml_callback
//Requires: caml_wrap_exception
//Version: >= 5.2, < 5.5
var caml_domain_latest_idx = 1;
function caml_domain_spawn(f, term_sync) {
  var id = caml_domain_latest_idx++;
  var old = caml_domain_id;
  caml_domain_id = id;
  var result;
  try {
    // term_sync.state = Finished (Ok res)
    result = [0, [0, caml_callback(f, [0])]];
  } catch (e) {
    // term_sync.state = Finished (Error exn)
    var exn = caml_wrap_exception(e);
    result = [0, [1, exn]];
  }
  caml_domain_id = old;
  caml_ml_mutex_unlock(term_sync[2]);
  term_sync[1] = result;
  return id;
}

//Provides: caml_domain_spawn
//Requires: caml_ml_mutex_unlock
//Requires: caml_domain_id
//Requires: caml_callback
//Version: >= 5.0, < 5.2
var caml_domain_latest_idx = 1;
function caml_domain_spawn(f, mutex) {
  var id = caml_domain_latest_idx++;
  var old = caml_domain_id;
  caml_domain_id = id;
  try {
    caml_callback(f, [0]);
  } finally {
    caml_domain_id = old;
    caml_ml_mutex_unlock(mutex);
  }
  return id;
}

//Provides: caml_ml_domain_id
//Requires: caml_domain_id
//Version: >= 5.0
function caml_ml_domain_id(_unit) {
  return caml_domain_id;
}

//Provides: caml_ml_domain_cpu_relax
//Version: >= 5
function caml_ml_domain_cpu_relax(_unit) {
  return 0;
}

//Provides: caml_domain_count const
//Version: >= 5.5
function caml_domain_count(_unit) {
  return 1;
}

//Provides: caml_atomic_load_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_load_field(ref, field) {
  return ref[field + 1];
}

//Provides: caml_atomic_add_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_add_field(ref, field, i) {
  ref[field + 1] += i;
  return 0;
}

//Provides: caml_atomic_fetch_add_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_fetch_add_field(ref, field, i) {
  var old = ref[field + 1];
  ref[field + 1] += i;
  return old;
}

//Provides: caml_atomic_cas_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_cas_field(ref, field, o, n) {
  if (ref[field + 1] === o) {
    ref[field + 1] = n;
    return 1;
  }
  return 0;
}

//Provides: caml_atomic_compare_exchange_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_compare_exchange_field(ref, field, o, n) {
  var old = ref[field + 1];
  if (old === o) {
    ref[field + 1] = n;
  }
  return old;
}

//Provides: caml_atomic_set_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_set_field(ref, field, v) {
  ref[field + 1] = v;
  return 0;
}

//Provides: caml_atomic_exchange_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_exchange_field(ref, field, v) {
  var old = ref[field + 1];
  ref[field + 1] = v;
  return old;
}

//Provides: caml_atomic_sub_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_sub_field(ref, field, i) {
  ref[field + 1] -= i;
  return 0;
}

//Provides: caml_atomic_land_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_land_field(ref, field, i) {
  ref[field + 1] &= i;
  return 0;
}

//Provides: caml_atomic_lor_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_lor_field(ref, field, i) {
  ref[field + 1] |= i;
  return 0;
}

//Provides: caml_atomic_lxor_field
//Version: >= 5.2, < 5.3
//OxCaml
function caml_atomic_lxor_field(ref, field, i) {
  ref[field + 1] ^= i;
  return 0;
}

//# 1 "+prng.js"
//Provides: caml_lxm_M
//Requires: caml_int64_of_string
//Requires: caml_string_of_jsstring
//Version: >= 5
var caml_lxm_M = caml_int64_of_string(
  caml_string_of_jsstring("0xd1342543de82ef95"),
);

//Provides: caml_lxm_daba
//Requires: caml_int64_of_string
//Requires: caml_string_of_jsstring
//Version: >= 5
var caml_lxm_daba = caml_int64_of_string(
  caml_string_of_jsstring("0xdaba0b6eb09322e3"),
);

//Provides: caml_lxm_next mutable
//Requires: caml_int64_shift_left
//Requires: caml_int64_shift_right_unsigned
//Requires: caml_int64_or
//Requires: caml_int64_xor
//Requires: caml_int64_add
//Requires: caml_int64_mul
//Requires: caml_ba_get_1
//Requires: caml_ba_set_1
//Requires: caml_lxm_M
//Requires: caml_lxm_daba
//Version: >= 5
function caml_lxm_next(v) {
  function shift_l(x, k) {
    return caml_int64_shift_left(x, k);
  }
  function shift_r(x, k) {
    return caml_int64_shift_right_unsigned(x, k);
  }
  function or(a, b) {
    return caml_int64_or(a, b);
  }
  function xor(a, b) {
    return caml_int64_xor(a, b);
  }
  function add(a, b) {
    return caml_int64_add(a, b);
  }
  function mul(a, b) {
    return caml_int64_mul(a, b);
  }
  function rotl(x, k) {
    return or(shift_l(x, k), shift_r(x, 64 - k));
  }
  function get(a, i) {
    return caml_ba_get_1(a, i);
  }
  function set(a, i, x) {
    return caml_ba_set_1(a, i, x);
  }
  var M = caml_lxm_M;
  var daba = caml_lxm_daba;
  var z, q0, q1;
  var st = v;
  var a = get(st, 0);
  var s = get(st, 1);
  var x0 = get(st, 2);
  var x1 = get(st, 3);
  /* Combining operation */
  z = add(s, x0);
  /* Mixing function */
  z = mul(xor(z, shift_r(z, 32)), daba);
  z = mul(xor(z, shift_r(z, 32)), daba);
  z = xor(z, shift_r(z, 32));
  /* LCG update */
  set(st, 1, add(mul(s, M), a));
  /* XBG update */
  var q0 = x0;
  var q1 = x1;
  q1 = xor(q1, q0);
  q0 = rotl(q0, 24);
  q0 = xor(xor(q0, q1), shift_l(q1, 16));
  q1 = rotl(q1, 37);
  set(st, 2, q0);
  set(st, 3, q1);
  /* Return result */
  return z;
}

//# 1 "+sync.js"
//Provides: MlMutex
class MlMutex {
  constructor() {
    this.locked = false;
  }
}

//Provides: caml_ml_mutex_new
//Requires: MlMutex
function caml_ml_mutex_new(_unit) {
  return new MlMutex();
}

//Provides: caml_ml_mutex_lock
//Requires: caml_failwith
function caml_ml_mutex_lock(t) {
  if (t.locked) caml_failwith("Mutex.lock: mutex already locked. Cannot wait.");
  else t.locked = true;
  return 0;
}

//Provides: caml_ml_mutex_try_lock
function caml_ml_mutex_try_lock(t) {
  if (!t.locked) {
    t.locked = true;
    return 1;
  }
  return 0;
}

//Provides: caml_ml_mutex_unlock
function caml_ml_mutex_unlock(t) {
  t.locked = false;
  return 0;
}

//# 1 "+effect.js"
/*
To deal with effects, the execution context is intuitively composed of
a stack of fibers. Each fiber has a current low-level continuation
(one-argument JavaScript function), a stack of exception handlers and
a triple of handlers, which are invoked when the fiber terminates
(either with a value or an exception) or when an effect is performed.
The low-level continuation of the topmost fiber (which is currently
executing) is passed from function to function as an additional
argument. Its stack of exception handlers is stored in
[caml_current_stack.x].
Exception handlers are pushed into this stack
when entering a [try ... with ...] and popped on exit.
Handlers are stored in [caml_current_stack.h]
and the remaining fibers are stored in [caml_current_stack.e].
To install an effect handler, we push a new fiber into the execution context.

We have basically the following type for reified continuations (type
[continuation] in module [Effect] of the standard library):

  type ('a, 'b) continuation = ('a, 'b) stack ref

  and (_, _) stack =
      Cons : ('b -> unit) *             (* low-level continuation *)
             (exn -> unit) list *       (* exception handlers *)
             ('b, 'c) handler *
             ('a, 'b) stack
             -> ('a, 'c) stack
    | Empty : ('a, 'a) stack

  and ('a,'b) handler =   (* As in module Effect from the standard library *)
    { retc: 'a -> 'b;
      exnc: exn -> 'b;
      effc: 'c.'c Effect.t -> (('c,'b) continuation -> 'b) option }

Continuations are one-shot. A continuation [ref Empty] has already
been resumed.

A continuation is basically composed of a list of fibers, which each
has its low-level continuation, its stack of exception handlers and a
triple of handlers to deal with when the fiber terminates or an
effect is performed. When resuming a continuation, the innermost fiber
is resumed first.

The handlers are CPS-transformed functions: they actually take an
additional parameter which is the current low-level continuation.
*/

//Provides: caml_current_stack
//If: effects
// This has the shape {k, x, h, e} where
// - h is a triple of handlers (see effect.ml)
// - k is the low level continuation
// - x is the exception stack
// - e is the fiber stack of the parent fiber.
var caml_current_stack = { k: 0, x: 0, h: 0, e: 0 };

//Provides: caml_push_trap
//Requires: caml_current_stack
//If: effects
function caml_push_trap(handler) {
  caml_current_stack.x = { h: handler, t: caml_current_stack.x };
}

//Provides: caml_pop_trap
//Requires: caml_current_stack
//If: effects
function caml_pop_trap() {
  if (!caml_current_stack.x)
    return function (x) {
      throw x;
    };
  var h = caml_current_stack.x.h;
  caml_current_stack.x = caml_current_stack.x.t;
  return h;
}

//Provides: caml_raise_unhandled
//Requires: caml_make_unhandled_effect_exn
//If: effects
//Version: >= 5.0
function caml_raise_unhandled(eff) {
  var exn = caml_make_unhandled_effect_exn(eff);
  throw exn;
}

//Provides:caml_resume_stack
//Requires: caml_named_value, caml_raise_constant
//Requires: caml_pop_fiber, caml_current_stack
//If: effects
//Version: >= 5.0
function caml_resume_stack(stack, last, k) {
  if (!stack)
    caml_raise_constant(
      caml_named_value("Effect.Continuation_already_resumed"),
    );
  if (last === 0) {
    last = stack;
    // Pre OCaml 5.2, last was not populated.
    while (last.e !== 0) last = last.e;
  }
  caml_current_stack.k = k;
  last.e = caml_current_stack;
  caml_current_stack = stack;
  return stack.k;
}

//Provides: caml_pop_fiber
//Requires: caml_current_stack
//If: effects
//Version: >= 5.0
function caml_pop_fiber() {
  // Move to the parent fiber, returning the parent's low-level continuation
  var c = caml_current_stack.e;
  caml_current_stack.e = 0;
  caml_current_stack = c;
  return c.k;
}

//Provides: caml_make_unhandled_effect_exn
//Requires: caml_named_value, caml_string_of_jsbytes, caml_fresh_oo_id
//If: effects
//Version: >= 5.0
function caml_make_unhandled_effect_exn(eff) {
  var exn = caml_named_value("Effect.Unhandled");
  if (exn) exn = [0, exn, eff];
  else {
    exn = [
      248,
      caml_string_of_jsbytes("Effect.Unhandled"),
      caml_fresh_oo_id(0),
    ];
  }
  return exn;
}

//Provides: caml_perform_effect
//Requires: caml_pop_fiber, caml_stack_check_depth, caml_trampoline_return
//Requires: caml_make_unhandled_effect_exn, caml_current_stack
//Requires: caml_get_cps_fun
//If: effects
//Version: >= 5.0
function caml_perform_effect(eff, k0) {
  if (caml_current_stack.e === 0) {
    var exn = caml_make_unhandled_effect_exn(eff);
    throw exn;
  }
  // Get current effect handler
  var handler = caml_current_stack.h[3];
  var last_fiber = caml_current_stack;
  last_fiber.k = k0;
  var cont = [245 /*continuation*/, last_fiber, last_fiber];
  // Move to parent fiber and execute the effect handler there
  // The handler is defined in Stdlib.Effect, so we know that the arity matches
  var k1 = caml_pop_fiber();
  return caml_stack_check_depth()
    ? caml_get_cps_fun(handler)(eff, cont, last_fiber, k1)
    : caml_trampoline_return(handler, [eff, cont, last_fiber, k1]);
}

//Provides: caml_reperform_effect
//Requires: caml_pop_fiber, caml_stack_check_depth, caml_trampoline_return
//Requires: caml_make_unhandled_effect_exn, caml_current_stack
//Requires: caml_resume_stack, caml_continuation_use_noexc
//Requires: caml_get_cps_fun
//If: effects
//Version: >= 5.0
function caml_reperform_effect(eff, cont, last, k0) {
  if (caml_current_stack.e === 0) {
    var exn = caml_make_unhandled_effect_exn(eff);
    var stack = caml_continuation_use_noexc(cont);
    caml_resume_stack(stack, last, k0);
    throw exn;
  }
  // Get current effect handler
  var handler = caml_current_stack.h[3];
  var last_fiber = caml_current_stack;
  last_fiber.k = k0;
  last.e = last_fiber;
  cont[2] = last_fiber;
  // Move to parent fiber and execute the effect handler there
  // The handler is defined in Stdlib.Effect, so we know that the arity matches
  var k1 = caml_pop_fiber();
  return caml_stack_check_depth()
    ? caml_get_cps_fun(handler)(eff, cont, last_fiber, k1)
    : caml_trampoline_return(handler, [eff, cont, last_fiber, k1]);
}

//Provides: caml_get_cps_fun
//If: effects
//If: !doubletranslate
function caml_get_cps_fun(f) {
  return f;
}

//Provides: caml_get_cps_fun
//If: effects
//If: doubletranslate
function caml_get_cps_fun(f) {
  // This function is only used to get the effect handler. If the
  // effect handler has no CPS function, we know that we can directly
  // call the direct version instead.
  return f.cps ? f.cps : f;
}

//Provides: caml_alloc_stack
//Requires: caml_pop_fiber, caml_call_gen, caml_stack_check_depth, caml_trampoline_return
//Requires: caml_call_gen_cps, caml_current_stack
//If: effects
//Version: >= 5.0
function caml_alloc_stack_call(f, x) {
  var args = [x, caml_pop_fiber()];
  return caml_stack_check_depth()
    ? caml_call_gen_cps(f, args)
    : caml_trampoline_return(f, args, 0);
}
function caml_alloc_stack_hval(x) {
  // Call [hv] in the parent fiber
  var f = caml_current_stack.h[1];
  return caml_alloc_stack_call(f, x);
}
function caml_alloc_stack_hexn(e) {
  // Call [hx] in the parent fiber
  var f = caml_current_stack.h[2];
  return caml_alloc_stack_call(f, e);
}
function caml_alloc_stack(hv, hx, hf) {
  var handlers = [0, hv, hx, hf];
  return {
    k: caml_alloc_stack_hval,
    x: { h: caml_alloc_stack_hexn, t: 0 },
    h: handlers,
    e: 0,
  };
}

//Provides: caml_alloc_stack
//If: !effects
//Version: >= 5.0
function caml_alloc_stack(_hv, _hx, _hf) {
  return 0;
}

//Provides: caml_continuation_use_noexc
//Version: >= 5.0
function caml_continuation_use_noexc(cont) {
  var stack = cont[1];
  cont[1] = 0;
  return stack;
}

//Provides: caml_continuation_use_and_update_handler_noexc
//Requires: caml_continuation_use_noexc
//Version: >= 5.0
function caml_continuation_use_and_update_handler_noexc(
  cont,
  hval,
  hexn,
  heff,
) {
  var stack = caml_continuation_use_noexc(cont);
  if (stack === 0) return stack;
  var last = cont[2];
  last.h[1] = hval;
  last.h[2] = hexn;
  last.h[3] = heff;
  return stack;
}

//Provides: caml_continuation_update_handler_noexc
//Version: >= 5.2, < 5.3
//OxCaml
function caml_continuation_update_handler_noexc(cont, hval, hexn, heff) {
  var stack = cont[1];
  if (stack === 0) return cont;
  var last = cont[2];
  last.h[1] = hval;
  last.h[2] = hexn;
  last.h[3] = heff;
  return cont;
}

//Provides: caml_get_continuation_callstack
//Version: >= 5.0
function caml_get_continuation_callstack() {
  return [0];
}

//Provides: caml_ml_condition_new
//Version: >= 5.0
function caml_ml_condition_new(_unit) {
  return { condition: 1 };
}

//Provides: caml_ml_condition_wait
//Version: >= 5.0
function caml_ml_condition_wait(_t, _mutext) {
  return 0;
}

//Provides: caml_ml_condition_broadcast
//Version: >= 5.0
function caml_ml_condition_broadcast(_t) {
  return 0;
}

//Provides: caml_ml_condition_signal
//Version: >= 5.0
function caml_ml_condition_signal(_t) {
  return 0;
}

//Provides: jsoo_effect_not_supported
//Requires: caml_failwith
//If: !effects
//Version: >= 5.0
function jsoo_effect_not_supported() {
  caml_failwith("Effect handlers are not supported");
}

//Provides: caml_resume
//Requires:caml_stack_depth, caml_call_gen_cps, caml_current_stack, caml_wrap_exception, caml_resume_stack
//If: effects
//If: doubletranslate
//Version: >= 5.0
function caml_resume(f, arg, stack, last) {
  var saved_stack_depth = caml_stack_depth;
  var saved_current_stack = caml_current_stack;
  try {
    caml_current_stack = { k: 0, x: 0, h: 0, e: 0 };
    var k = caml_resume_stack(stack, last, function (x) {
      return x;
    });
    /* Note: f is not an ordinary function but a (direct-style, CPS) closure pair */
    var res = { joo_tramp: f, joo_args: [arg, k], joo_direct: 0 };
    do {
      /* Avoids trampolining too often while still avoiding stack overflow. See
         [caml_callback]. */
      caml_stack_depth = 40;
      try {
        res = res.joo_direct
          ? res.joo_tramp.apply(null, res.joo_args)
          : caml_call_gen_cps(res.joo_tramp, res.joo_args);
      } catch (e) {
        /* Handle exception coming from JavaScript or from the runtime. */
        if (!caml_current_stack.x) throw e;
        var handler = caml_current_stack.x.h;
        caml_current_stack.x = caml_current_stack.x.t;
        res = {
          joo_tramp: handler,
          joo_args: [caml_wrap_exception(e)],
          joo_direct: 1,
        };
      }
    } while (res?.joo_args);
    return res;
  } finally {
    caml_stack_depth = saved_stack_depth;
    caml_current_stack = saved_current_stack;
  }
}

//Provides: caml_cps_closure
//If: effects
//If: doubletranslate
function caml_cps_closure(direct_f, cps_f) {
  direct_f.cps = cps_f;
  return direct_f;
}

//Provides: caml_assume_no_perform
//Requires: caml_callback
//If: effects
//If: !doubletranslate
function caml_assume_no_perform(f) {
  return caml_callback(f, [0]);
}

//# 1 "+zstd.js"
//Provides: zstd_decompress
//Version: >= 5.1
var zstd_decompress = (function () {
  // aliases for shorter compressed code (most minifers don't do this)
  var ab = ArrayBuffer,
    u8 = Uint8Array,
    u16 = Uint16Array,
    i16 = Int16Array,
    i32 = Int32Array;
  var slc = function (v, s, e) {
    if (u8.prototype.slice) return u8.prototype.slice.call(v, s, e);
    if (s == null || s < 0) s = 0;
    if (e == null || e > v.length) e = v.length;
    var n = new u8(e - s);
    n.set(v.subarray(s, e));
    return n;
  };
  var fill = function (v, n, s, e) {
    if (u8.prototype.fill) return u8.prototype.fill.call(v, n, s, e);
    if (s == null || s < 0) s = 0;
    if (e == null || e > v.length) e = v.length;
    for (; s < e; ++s) v[s] = n;
    return v;
  };
  var cpw = function (v, t, s, e) {
    if (u8.prototype.copyWithin)
      return u8.prototype.copyWithin.call(v, t, s, e);
    if (s == null || s < 0) s = 0;
    if (e == null || e > v.length) e = v.length;
    while (s < e) {
      v[t++] = v[s++];
    }
  };
  /**
   * Codes for errors generated within this library
   */
  // error codes
  var ec = [
    "invalid zstd data",
    "window size too large (>2046MB)",
    "invalid block type",
    "FSE accuracy too high",
    "match distance too far back",
    "unexpected EOF",
  ];
  var err = function (ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (!nt) throw e;
    return e;
  };
  var rb = function (d, b, n) {
    var i = 0,
      o = 0;
    for (; i < n; ++i) o |= d[b++] << (i << 3);
    return o;
  };
  var b4 = function (d, b) {
    return (d[b] | (d[b + 1] << 8) | (d[b + 2] << 16) | (d[b + 3] << 24)) >>> 0;
  };
  // read Zstandard frame header
  var rzfh = function (dat, w) {
    var n3 = dat[0] | (dat[1] << 8) | (dat[2] << 16);
    if (n3 === 0x2fb528 && dat[3] === 253) {
      // Zstandard
      var flg = dat[4];
      //    single segment       checksum             dict flag     frame content flag
      var ss = (flg >> 5) & 1,
        cc = (flg >> 2) & 1,
        df = flg & 3,
        fcf = flg >> 6;
      if (flg & 8) err(0);
      // byte
      var bt = 6 - ss;
      // dict bytes
      var db = df === 3 ? 4 : df;
      // dictionary id
      var di = rb(dat, bt, db);
      bt += db;
      // frame size bytes
      var fsb = fcf ? 1 << fcf : ss;
      // frame source size
      var fss = rb(dat, bt, fsb) + (fcf === 1 && 256);
      // window size
      var ws = fss;
      if (!ss) {
        // window descriptor
        var wb = 1 << (10 + (dat[5] >> 3));
        ws = wb + (wb >> 3) * (dat[5] & 7);
      }
      if (ws > 2145386496) err(1);
      var buf = new u8((w === 1 ? fss || ws : w ? 0 : ws) + 12);
      (buf[0] = 1), (buf[4] = 4), (buf[8] = 8);
      return {
        b: bt + fsb,
        y: 0,
        l: 0,
        d: di,
        w: w && w !== 1 ? w : buf.subarray(12),
        e: ws,
        o: new i32(buf.buffer, 0, 3),
        u: fss,
        c: cc,
        m: Math.min(131072, ws),
      };
    } else if (((n3 >> 4) | (dat[3] << 20)) === 0x184d2a5) {
      // skippable
      return b4(dat, 4) + 8;
    }
    err(0);
  };
  // most significant bit for nonzero
  var msb = function (val) {
    var bits = 0;
    for (; 1 << bits <= val; ++bits);
    return bits - 1;
  };
  // read finite state entropy
  var rfse = function (dat, bt, mal) {
    // table pos
    var tpos = (bt << 3) + 4;
    // accuracy log
    var al = (dat[bt] & 15) + 5;
    if (al > mal) err(3);
    // size
    var sz = 1 << al;
    // probabilities symbols  repeat   index   high threshold
    var probs = sz,
      sym = -1,
      re = -1,
      i = -1,
      ht = sz;
    // optimization: single allocation is much faster
    var buf = new ab(512 + (sz << 2));
    var freq = new i16(buf, 0, 256);
    // same view as freq
    var dstate = new u16(buf, 0, 256);
    var nstate = new u16(buf, 512, sz);
    var bb1 = 512 + (sz << 1);
    var syms = new u8(buf, bb1, sz);
    var nbits = new u8(buf, bb1 + sz);
    while (sym < 255 && probs > 0) {
      var bits = msb(probs + 1);
      var cbt = tpos >> 3;
      // mask
      var msk = (1 << (bits + 1)) - 1;
      var val =
        ((dat[cbt] | (dat[cbt + 1] << 8) | (dat[cbt + 2] << 16)) >>
          (tpos & 7)) &
        msk;
      // mask (1 fewer bit)
      var msk1fb = (1 << bits) - 1;
      // max small value
      var msv = msk - probs - 1;
      // small value
      var sval = val & msk1fb;
      if (sval < msv) (tpos += bits), (val = sval);
      else {
        tpos += bits + 1;
        if (val > msk1fb) val -= msv;
      }
      freq[++sym] = --val;
      if (val === -1) {
        probs += val;
        syms[--ht] = sym;
      } else probs -= val;
      if (!val) {
        do {
          // repeat byte
          var rbt = tpos >> 3;
          re = ((dat[rbt] | (dat[rbt + 1] << 8)) >> (tpos & 7)) & 3;
          tpos += 2;
          sym += re;
        } while (re === 3);
      }
    }
    if (sym > 255 || probs) err(0);
    var sympos = 0;
    // sym step (coprime with sz - formula from zstd source)
    var sstep = (sz >> 1) + (sz >> 3) + 3;
    // sym mask
    var smask = sz - 1;
    for (var s = 0; s <= sym; ++s) {
      var sf = freq[s];
      if (sf < 1) {
        dstate[s] = -sf;
        continue;
      }
      // This is split into two loops in zstd to avoid branching, but as JS is higher-level that is unnecessary
      for (i = 0; i < sf; ++i) {
        syms[sympos] = s;
        do {
          sympos = (sympos + sstep) & smask;
        } while (sympos >= ht);
      }
    }
    // After spreading symbols, should be zero again
    if (sympos) err(0);
    for (i = 0; i < sz; ++i) {
      // next state
      var ns = dstate[syms[i]]++;
      // num bits
      var nb = (nbits[i] = al - msb(ns));
      nstate[i] = (ns << nb) - sz;
    }
    return [
      (tpos + 7) >> 3,
      {
        b: al,
        s: syms,
        n: nbits,
        t: nstate,
      },
    ];
  };
  // read huffman
  var rhu = function (dat, bt) {
    //  index  weight count
    var i = 0,
      wc = -1;
    //    buffer             header byte
    var buf = new u8(292),
      hb = dat[bt];
    // huffman weights
    var hw = buf.subarray(0, 256);
    // rank count
    var rc = buf.subarray(256, 268);
    // rank index
    var ri = new u16(buf.buffer, 268);
    // NOTE: at this point bt is 1 less than expected
    if (hb < 128) {
      // end byte, fse decode table
      var _a = rfse(dat, bt + 1, 6),
        ebt = _a[0],
        fdt = _a[1];
      bt += hb;
      var epos = ebt << 3;
      // last byte
      var lb = dat[bt];
      if (!lb) err(0);
      //  state1   state2   state1 bits   state2 bits
      var st1 = 0,
        st2 = 0,
        btr1 = fdt.b,
        btr2 = btr1;
      // fse pos
      // pre-increment to account for original deficit of 1
      var fpos = (++bt << 3) - 8 + msb(lb);
      for (;;) {
        fpos -= btr1;
        if (fpos < epos) break;
        var cbt = fpos >> 3;
        st1 +=
          ((dat[cbt] | (dat[cbt + 1] << 8)) >> (fpos & 7)) & ((1 << btr1) - 1);
        hw[++wc] = fdt.s[st1];
        fpos -= btr2;
        if (fpos < epos) break;
        cbt = fpos >> 3;
        st2 +=
          ((dat[cbt] | (dat[cbt + 1] << 8)) >> (fpos & 7)) & ((1 << btr2) - 1);
        hw[++wc] = fdt.s[st2];
        btr1 = fdt.n[st1];
        st1 = fdt.t[st1];
        btr2 = fdt.n[st2];
        st2 = fdt.t[st2];
      }
      if (++wc > 255) err(0);
    } else {
      wc = hb - 127;
      for (; i < wc; i += 2) {
        var byte = dat[++bt];
        hw[i] = byte >> 4;
        hw[i + 1] = byte & 15;
      }
      ++bt;
    }
    // weight exponential sum
    var wes = 0;
    for (i = 0; i < wc; ++i) {
      var wt = hw[i];
      // bits must be at most 11, same as weight
      if (wt > 11) err(0);
      wes += wt && 1 << (wt - 1);
    }
    // max bits
    var mb = msb(wes) + 1;
    // table size
    var ts = 1 << mb;
    // remaining sum
    var rem = ts - wes;
    // must be power of 2
    if (rem & (rem - 1)) err(0);
    hw[wc++] = msb(rem) + 1;
    for (i = 0; i < wc; ++i) {
      var wt = hw[i];
      ++rc[(hw[i] = wt && mb + 1 - wt)];
    }
    // huf buf
    var hbuf = new u8(ts << 1);
    //    symbols                      num bits
    var syms = hbuf.subarray(0, ts),
      nb = hbuf.subarray(ts);
    ri[mb] = 0;
    for (i = mb; i > 0; --i) {
      var pv = ri[i];
      fill(nb, i, pv, (ri[i - 1] = pv + rc[i] * (1 << (mb - i))));
    }
    if (ri[0] !== ts) err(0);
    for (i = 0; i < wc; ++i) {
      var bits = hw[i];
      if (bits) {
        var code = ri[bits];
        fill(syms, i, code, (ri[bits] = code + (1 << (mb - bits))));
      }
    }
    return [
      bt,
      {
        n: nb,
        b: mb,
        s: syms,
      },
    ];
  };
  // Tables generated using this:
  // https://gist.github.com/101arrowz/a979452d4355992cbf8f257cbffc9edd
  // default literal length table
  var dllt = /*#__PURE__*/ rfse(
    /*#__PURE__*/ new u8([
      81, 16, 99, 140, 49, 198, 24, 99, 12, 33, 196, 24, 99, 102, 102, 134, 70,
      146, 4,
    ]),
    0,
    6,
  )[1];
  // default match length table
  var dmlt = /*#__PURE__*/ rfse(
    /*#__PURE__*/ new u8([
      33, 20, 196, 24, 99, 140, 33, 132, 16, 66, 8, 33, 132, 16, 66, 8, 33, 68,
      68, 68, 68, 68, 68, 68, 68, 36, 9,
    ]),
    0,
    6,
  )[1];
  // default offset code table
  var doct = /*#__PURE__ */ rfse(
    /*#__PURE__*/ new u8([32, 132, 16, 66, 102, 70, 68, 68, 68, 68, 36, 73, 2]),
    0,
    5,
  )[1];
  // bits to baseline
  var b2bl = function (b, s) {
    var len = b.length,
      bl = new i32(len);
    for (var i = 0; i < len; ++i) {
      bl[i] = s;
      s += 1 << b[i];
    }
    return bl;
  };
  // literal length bits
  var llb = /*#__PURE__ */ new u8(
    /*#__PURE__ */ new i32([
      0, 0, 0, 0, 16843009, 50528770, 134678020, 202050057, 269422093,
    ]).buffer,
    0,
    36,
  );
  // literal length baseline
  var llbl = /*#__PURE__ */ b2bl(llb, 0);
  // match length bits
  var mlb = /*#__PURE__ */ new u8(
    /*#__PURE__ */ new i32([
      0, 0, 0, 0, 0, 0, 0, 0, 16843009, 50528770, 117769220, 185207048,
      252579084, 16,
    ]).buffer,
    0,
    53,
  );
  // match length baseline
  var mlbl = /*#__PURE__ */ b2bl(mlb, 3);
  // decode huffman stream
  var dhu = function (dat, out, hu) {
    var len = dat.length,
      ss = out.length,
      lb = dat[len - 1],
      msk = (1 << hu.b) - 1,
      eb = -hu.b;
    if (!lb) err(0);
    var st = 0,
      btr = hu.b,
      pos = (len << 3) - 8 + msb(lb) - btr,
      i = -1;
    while (pos > eb && i < ss) {
      var cbt = pos >> 3;
      var val =
        (dat[cbt] | (dat[cbt + 1] << 8) | (dat[cbt + 2] << 16)) >> (pos & 7);
      st = ((st << btr) | val) & msk;
      out[++i] = hu.s[st];
      pos -= btr = hu.n[st];
    }
    if (pos !== eb || i + 1 !== ss) err(0);
  };
  // decode huffman stream 4x
  // TODO: use workers to parallelize
  var dhu4 = function (dat, out, hu) {
    var bt = 6;
    var ss = out.length,
      sz1 = (ss + 3) >> 2,
      sz2 = sz1 << 1,
      sz3 = sz1 + sz2;
    dhu(
      dat.subarray(bt, (bt += dat[0] | (dat[1] << 8))),
      out.subarray(0, sz1),
      hu,
    );
    dhu(
      dat.subarray(bt, (bt += dat[2] | (dat[3] << 8))),
      out.subarray(sz1, sz2),
      hu,
    );
    dhu(
      dat.subarray(bt, (bt += dat[4] | (dat[5] << 8))),
      out.subarray(sz2, sz3),
      hu,
    );
    dhu(dat.subarray(bt), out.subarray(sz3), hu);
  };
  // read Zstandard block
  var rzb = function (dat, st, out) {
    var _a;
    var bt = st.b;
    //    byte 0        block type
    var b0 = dat[bt],
      btype = (b0 >> 1) & 3;
    st.l = b0 & 1;
    var sz = (b0 >> 3) | (dat[bt + 1] << 5) | (dat[bt + 2] << 13);
    // end byte for block
    var ebt = (bt += 3) + sz;
    if (btype === 1) {
      if (bt >= dat.length) return;
      st.b = bt + 1;
      if (out) {
        fill(out, dat[bt], st.y, (st.y += sz));
        return out;
      }
      return fill(new u8(sz), dat[bt]);
    }
    if (ebt > dat.length) return;
    if (btype === 0) {
      st.b = ebt;
      if (out) {
        out.set(dat.subarray(bt, ebt), st.y);
        st.y += sz;
        return out;
      }
      return slc(dat, bt, ebt);
    }
    if (btype === 2) {
      //    byte 3        lit btype     size format
      var b3 = dat[bt],
        lbt = b3 & 3,
        sf = (b3 >> 2) & 3;
      // lit src size  lit cmp sz 4 streams
      var lss = b3 >> 4,
        lcs = 0,
        s4 = 0;
      if (lbt < 2) {
        if (sf & 1) lss |= (dat[++bt] << 4) | (sf & 2 && dat[++bt] << 12);
        else lss = b3 >> 3;
      } else {
        s4 = sf;
        if (sf < 2)
          (lss |= (dat[++bt] & 63) << 4),
            (lcs = (dat[bt] >> 6) | (dat[++bt] << 2));
        else if (sf === 2)
          (lss |= (dat[++bt] << 4) | ((dat[++bt] & 3) << 12)),
            (lcs = (dat[bt] >> 2) | (dat[++bt] << 6));
        else
          (lss |= (dat[++bt] << 4) | ((dat[++bt] & 63) << 12)),
            (lcs = (dat[bt] >> 6) | (dat[++bt] << 2) | (dat[++bt] << 10));
      }
      ++bt;
      // add literals to end - can never overlap with backreferences because unused literals always appended
      var buf = out ? out.subarray(st.y, st.y + st.m) : new u8(st.m);
      // starting point for literals
      var spl = buf.length - lss;
      if (lbt === 0) buf.set(dat.subarray(bt, (bt += lss)), spl);
      else if (lbt === 1) fill(buf, dat[bt++], spl);
      else {
        // huffman table
        var hu = st.h;
        if (lbt === 2) {
          var hud = rhu(dat, bt);
          // subtract description length
          lcs += bt - (bt = hud[0]);
          st.h = hu = hud[1];
        } else if (!hu) err(0);
        (s4 ? dhu4 : dhu)(dat.subarray(bt, (bt += lcs)), buf.subarray(spl), hu);
      }
      // num sequences
      var ns = dat[bt++];
      if (ns) {
        if (ns === 255) ns = (dat[bt++] | (dat[bt++] << 8)) + 0x7f00;
        else if (ns > 127) ns = ((ns - 128) << 8) | dat[bt++];
        // symbol compression modes
        var scm = dat[bt++];
        if (scm & 3) err(0);
        var dts = [dmlt, doct, dllt];
        for (var i = 2; i > -1; --i) {
          var md = (scm >> ((i << 1) + 2)) & 3;
          if (md === 1) {
            // rle buf
            var rbuf = new u8([0, 0, dat[bt++]]);
            dts[i] = {
              s: rbuf.subarray(2, 3),
              n: rbuf.subarray(0, 1),
              t: new u16(rbuf.buffer, 0, 1),
              b: 0,
            };
          } else if (md === 2) {
            // accuracy log 8 for offsets, 9 for others
            (_a = rfse(dat, bt, 9 - (i & 1))), (bt = _a[0]), (dts[i] = _a[1]);
          } else if (md === 3) {
            if (!st.t) err(0);
            dts[i] = st.t[i];
          }
        }
        var _b = (st.t = dts),
          mlt = _b[0],
          oct = _b[1],
          llt = _b[2];
        var lb = dat[ebt - 1];
        if (!lb) err(0);
        var spos = (ebt << 3) - 8 + msb(lb) - llt.b,
          cbt = spos >> 3,
          oubt = 0;
        var lst =
          ((dat[cbt] | (dat[cbt + 1] << 8)) >> (spos & 7)) & ((1 << llt.b) - 1);
        cbt = (spos -= oct.b) >> 3;
        var ost =
          ((dat[cbt] | (dat[cbt + 1] << 8)) >> (spos & 7)) & ((1 << oct.b) - 1);
        cbt = (spos -= mlt.b) >> 3;
        var mst =
          ((dat[cbt] | (dat[cbt + 1] << 8)) >> (spos & 7)) & ((1 << mlt.b) - 1);
        for (++ns; --ns; ) {
          var llc = llt.s[lst];
          var lbtr = llt.n[lst];
          var mlc = mlt.s[mst];
          var mbtr = mlt.n[mst];
          var ofc = oct.s[ost];
          var obtr = oct.n[ost];
          cbt = (spos -= ofc) >> 3;
          var ofp = 1 << ofc;
          var off =
            ofp +
            (((dat[cbt] |
              (dat[cbt + 1] << 8) |
              (dat[cbt + 2] << 16) |
              (dat[cbt + 3] << 24)) >>>
              (spos & 7)) &
              (ofp - 1));
          cbt = (spos -= mlb[mlc]) >> 3;
          var ml =
            mlbl[mlc] +
            (((dat[cbt] | (dat[cbt + 1] << 8) | (dat[cbt + 2] << 16)) >>
              (spos & 7)) &
              ((1 << mlb[mlc]) - 1));
          cbt = (spos -= llb[llc]) >> 3;
          var ll =
            llbl[llc] +
            (((dat[cbt] | (dat[cbt + 1] << 8) | (dat[cbt + 2] << 16)) >>
              (spos & 7)) &
              ((1 << llb[llc]) - 1));
          cbt = (spos -= lbtr) >> 3;
          lst =
            llt.t[lst] +
            (((dat[cbt] | (dat[cbt + 1] << 8)) >> (spos & 7)) &
              ((1 << lbtr) - 1));
          cbt = (spos -= mbtr) >> 3;
          mst =
            mlt.t[mst] +
            (((dat[cbt] | (dat[cbt + 1] << 8)) >> (spos & 7)) &
              ((1 << mbtr) - 1));
          cbt = (spos -= obtr) >> 3;
          ost =
            oct.t[ost] +
            (((dat[cbt] | (dat[cbt + 1] << 8)) >> (spos & 7)) &
              ((1 << obtr) - 1));
          if (off > 3) {
            st.o[2] = st.o[1];
            st.o[1] = st.o[0];
            st.o[0] = off -= 3;
          } else {
            var idx = off - (ll !== 0);
            if (idx) {
              off = idx === 3 ? st.o[0] - 1 : st.o[idx];
              if (idx > 1) st.o[2] = st.o[1];
              st.o[1] = st.o[0];
              st.o[0] = off;
            } else off = st.o[0];
          }
          for (var i = 0; i < ll; ++i) {
            buf[oubt + i] = buf[spl + i];
          }
          (oubt += ll), (spl += ll);
          var stin = oubt - off;
          if (stin < 0) {
            var len = -stin;
            var bs = st.e + stin;
            if (len > ml) len = ml;
            for (var i = 0; i < len; ++i) {
              buf[oubt + i] = st.w[bs + i];
            }
            (oubt += len), (ml -= len), (stin = 0);
          }
          for (var i = 0; i < ml; ++i) {
            buf[oubt + i] = buf[stin + i];
          }
          oubt += ml;
        }
        if (oubt !== spl) {
          while (spl < buf.length) {
            buf[oubt++] = buf[spl++];
          }
        } else oubt = buf.length;
        if (out) st.y += oubt;
        else buf = slc(buf, 0, oubt);
      } else {
        if (out) {
          st.y += lss;
          if (spl) {
            for (var i = 0; i < lss; ++i) {
              buf[i] = buf[spl + i];
            }
          }
        } else if (spl) buf = slc(buf, spl);
      }
      st.b = ebt;
      return buf;
    }
    err(2);
  };
  // concat
  var cct = function (bufs, ol) {
    if (bufs.length === 1) return bufs[0];
    var buf = new u8(ol);
    for (var i = 0, b = 0; i < bufs.length; ++i) {
      var chk = bufs[i];
      buf.set(chk, b);
      b += chk.length;
    }
    return buf;
  };
  /**
   * Decompresses Zstandard data
   * @param dat The input data
   * @param buf The output buffer. If unspecified, the function will allocate
   *            exactly enough memory to fit the decompressed data. If your
   *            data has multiple frames and you know the output size, specifying
   *            it will yield better performance.
   * @returns The decompressed data
   */
  return function decompress(dat, buf) {
    var bt = 0,
      bufs = [],
      nb = +!buf,
      ol = 0;
    while (dat.length) {
      var st = rzfh(dat, nb || buf);
      if (typeof st === "object") {
        if (nb) {
          buf = null;
          if (st.w.length === st.u) {
            bufs.push((buf = st.w));
            ol += st.u;
          }
        } else {
          bufs.push(buf);
          st.e = 0;
        }
        while (!st.l) {
          var blk = rzb(dat, st, buf);
          if (!blk) err(5);
          if (buf) st.e = st.y;
          else {
            bufs.push(blk);
            ol += blk.length;
            cpw(st.w, 0, blk.length);
            st.w.set(blk, st.w.length - blk.length);
          }
        }
        bt = st.b + st.c * 4;
      } else bt = st;
      dat = dat.subarray(bt);
    }
    return cct(bufs, ol);
  };
})();

//Provides: caml_decompress_input
//Version: < 5.1.0
var caml_decompress_input = null;

//Provides: caml_decompress_input
//Version: >= 5.1.0
//Version: < 5.1.1
//Requires: zstd_decompress
var caml_decompress_input = zstd_decompress;

//Provides: caml_decompress_input
//Version: >= 5.1.1
//Version: < 5.2.0
var caml_decompress_input = null;

//Provides: caml_decompress_input
//Version: >= 5.2
//Requires: zstd_decompress
var caml_decompress_input = zstd_decompress;

//Provides: caml_zstd_initialize
//Requires: caml_decompress_input
//Requires: zstd_decompress
//Version: >= 5.1.1
function caml_zstd_initialize(_unit) {
  caml_decompress_input = zstd_decompress;
  return 1;
}

//# 1 "+runtime_events.js"
//Provides: caml_custom_event_index
//Version: >= 5.1
var caml_custom_event_index = 0;

//Provides: caml_runtime_events_user_register
//Requires: caml_custom_event_index
//Version: >= 5.1
function caml_runtime_events_user_register(event_name, event_tag, event_type) {
  caml_custom_event_index += 1;
  return [0, caml_custom_event_index, event_name, event_type, event_tag];
}

//Provides: caml_runtime_events_user_write
//Version: >= 5.1
function caml_runtime_events_user_write(_event, _event_content) {
  return 0;
}

//Provides: caml_runtime_events_user_resolve
//Version: >= 5.0
function caml_runtime_events_user_resolve() {
  return 0;
}

//Provides: caml_ml_runtime_events_start
//Version: >= 5.2
function caml_ml_runtime_events_start() {
  return 0;
}

//Provides: caml_runtime_events_start
//Version: >= 5.0, < 5.2
function caml_runtime_events_start() {
  return 0;
}

//Provides: caml_ml_runtime_events_pause
//Version: >= 5.2
function caml_ml_runtime_events_pause() {
  return 0;
}

//Provides: caml_runtime_events_pause
//Version: >= 5.0, < 5.2
function caml_runtime_events_pause() {
  return 0;
}

//Provides: caml_ml_runtime_events_are_active
//Version: >= 5.2
function caml_ml_runtime_events_are_active() {
  return 0;
}

//Provides: caml_runtime_events_resume
//Version: >=5.0, < 5.2
function caml_runtime_events_resume() {
  return 0;
}

//Provides: caml_ml_runtime_events_resume
//Version: >= 5.2
function caml_ml_runtime_events_resume() {
  return 0;
}

//Provides: caml_ml_runtime_events_create_cursor
//Version: >= 5.0
function caml_ml_runtime_events_create_cursor(_target) {
  return {};
}

//Provides: caml_ml_runtime_events_free_cursor
//Version: >= 5.0
function caml_ml_runtime_events_free_cursor(_cursor) {
  return 0;
}

//Provides: caml_ml_runtime_events_read_poll
//Version: >= 5.0
function caml_ml_runtime_events_read_poll(_cursor, _callbacks, _num) {
  return 0;
}

//Provides: caml_ml_runtime_events_path const
//Version: >= 5.2
//Since 5.3 in OCaml mainstream, but also available in OxCaml
function caml_ml_runtime_events_path(_unit) {
  return 0;
}

//# 1 "+blake2.js"
//Provides: blake2b
//Version: >= 5.2
var blake2b = (function () {
  // Blake2B in pure Javascript
  // Adapted from the reference implementation in RFC7693
  // Ported to Javascript by DC - https://github.com/dcposch

  // 64-bit unsigned addition
  // Sets v[a,a+1] += v[b,b+1]
  // v should be a Uint32Array
  function ADD64AA(v, a, b) {
    const o0 = v[a] + v[b];
    let o1 = v[a + 1] + v[b + 1];
    if (o0 >= 0x100000000) {
      o1++;
    }
    v[a] = o0;
    v[a + 1] = o1;
  }

  // 64-bit unsigned addition
  // Sets v[a,a+1] += b
  // b0 is the low 32 bits of b, b1 represents the high 32 bits
  function ADD64AC(v, a, b0, b1) {
    let o0 = v[a] + b0;
    if (b0 < 0) {
      o0 += 0x100000000;
    }
    let o1 = v[a + 1] + b1;
    if (o0 >= 0x100000000) {
      o1++;
    }
    v[a] = o0;
    v[a + 1] = o1;
  }

  // Little-endian byte access
  function B2B_GET32(arr, i) {
    return arr[i] ^ (arr[i + 1] << 8) ^ (arr[i + 2] << 16) ^ (arr[i + 3] << 24);
  }

  // G Mixing function
  // The ROTRs are inlined for speed
  function B2B_G(a, b, c, d, ix, iy) {
    const x0 = m[ix];
    const x1 = m[ix + 1];
    const y0 = m[iy];
    const y1 = m[iy + 1];

    ADD64AA(v, a, b); // v[a,a+1] += v[b,b+1] ... in JS we must store a uint64 as two uint32s
    ADD64AC(v, a, x0, x1); // v[a, a+1] += x ... x0 is the low 32 bits of x, x1 is the high 32 bits

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
    let xor0 = v[d] ^ v[a];
    let xor1 = v[d + 1] ^ v[a + 1];
    v[d] = xor1;
    v[d + 1] = xor0;

    ADD64AA(v, c, d);

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
    xor0 = v[b] ^ v[c];
    xor1 = v[b + 1] ^ v[c + 1];
    v[b] = (xor0 >>> 24) ^ (xor1 << 8);
    v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);

    ADD64AA(v, a, b);
    ADD64AC(v, a, y0, y1);

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
    xor0 = v[d] ^ v[a];
    xor1 = v[d + 1] ^ v[a + 1];
    v[d] = (xor0 >>> 16) ^ (xor1 << 16);
    v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);

    ADD64AA(v, c, d);

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
    xor0 = v[b] ^ v[c];
    xor1 = v[b + 1] ^ v[c + 1];
    v[b] = (xor1 >>> 31) ^ (xor0 << 1);
    v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
  }

  // Initialization Vector
  const BLAKE2B_IV32 = new Uint32Array([
    0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85, 0xfe94f82b, 0x3c6ef372,
    0x5f1d36f1, 0xa54ff53a, 0xade682d1, 0x510e527f, 0x2b3e6c1f, 0x9b05688c,
    0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19,
  ]);

  const SIGMA8 = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15,
    13, 6, 1, 12, 0, 2, 11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6,
    7, 1, 9, 4, 7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5,
    7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13, 2, 12, 6, 10, 0, 11, 8, 3, 4,
    13, 7, 5, 15, 14, 1, 9, 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8,
    11, 13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10, 6, 15, 14, 9, 11,
    3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5, 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14,
    3, 12, 13, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10,
    4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  ];

  // These are offsets into a uint64 buffer.
  // Multiply them all by 2 to make them offsets into a uint32 buffer,
  // because this is Javascript and we don't have uint64s
  const SIGMA82 = new Uint8Array(
    SIGMA8.map(function (x) {
      return x * 2;
    }),
  );

  // Compression function. 'last' flag indicates last block.
  // Note we're representing 16 uint64s as 32 uint32s
  const v = new Uint32Array(32);
  const m = new Uint32Array(32);
  function blake2bCompress(ctx, last) {
    let i = 0;

    // init work variables
    for (i = 0; i < 16; i++) {
      v[i] = ctx.h[i];
      v[i + 16] = BLAKE2B_IV32[i];
    }

    // low 64 bits of offset
    v[24] = v[24] ^ ctx.t;
    v[25] = v[25] ^ (ctx.t / 0x100000000);
    // high 64 bits not supported, offset may not be higher than 2**53-1

    // last block flag set ?
    if (last) {
      v[28] = ~v[28];
      v[29] = ~v[29];
    }

    // get little-endian words
    for (i = 0; i < 32; i++) {
      m[i] = B2B_GET32(ctx.b, 4 * i);
    }

    // twelve rounds of mixing
    // uncomment the DebugPrint calls to log the computation
    // and match the RFC sample documentation
    for (i = 0; i < 12; i++) {
      B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
      B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
      B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
      B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
      B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
      B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
      B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
      B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
    }

    for (i = 0; i < 16; i++) {
      ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16];
    }
  }

  // reusable parameterBlock
  const parameterBlock = new Uint8Array([
    0,
    0,
    0,
    0, //  0: outlen, keylen, fanout, depth
    0,
    0,
    0,
    0, //  4: leaf length, sequential mode
    0,
    0,
    0,
    0, //  8: node offset
    0,
    0,
    0,
    0, // 12: node offset
    0,
    0,
    0,
    0, // 16: node depth, inner length, rfu
    0,
    0,
    0,
    0, // 20: rfu
    0,
    0,
    0,
    0, // 24: rfu
    0,
    0,
    0,
    0, // 28: rfu
    0,
    0,
    0,
    0, // 32: salt
    0,
    0,
    0,
    0, // 36: salt
    0,
    0,
    0,
    0, // 40: salt
    0,
    0,
    0,
    0, // 44: salt
    0,
    0,
    0,
    0, // 48: personal
    0,
    0,
    0,
    0, // 52: personal
    0,
    0,
    0,
    0, // 56: personal
    0,
    0,
    0,
    0, // 60: personal
  ]);

  // Creates a BLAKE2b hashing context
  // Requires an output length between 1 and 64 bytes
  // Takes an optional Uint8Array key
  function blake2bInit(outlen, key) {
    if (outlen === 0 || outlen > 64) {
      throw new Error("Illegal output length, expected 0 < length <= 64");
    }
    if (key.length > 64) {
      throw new Error("Illegal key, expected Uint8Array with 0 < length <= 64");
    }

    // state, 'param block'
    const ctx = {
      b: new Uint8Array(128),
      h: new Uint32Array(16),
      t: 0, // input count
      c: 0, // pointer within buffer
      outlen: outlen, // output length in bytes
    };

    // initialize parameterBlock before usage
    parameterBlock.fill(0);
    parameterBlock[0] = outlen;
    parameterBlock[1] = key.length;
    parameterBlock[2] = 1; // fanout
    parameterBlock[3] = 1; // depth

    // initialize hash state
    for (let i = 0; i < 16; i++) {
      ctx.h[i] = BLAKE2B_IV32[i] ^ B2B_GET32(parameterBlock, i * 4);
    }

    if (key.length > 0) {
      blake2bUpdate(ctx, key);
      // at the end
      ctx.c = 128;
    }

    return ctx;
  }

  // Updates a BLAKE2b streaming hash
  // Requires hash context and Uint8Array (byte array)
  function blake2bUpdate(ctx, input) {
    for (let i = 0; i < input.length; i++) {
      if (ctx.c === 128) {
        // buffer full ?
        ctx.t += ctx.c; // add counters
        blake2bCompress(ctx, false); // compress (not last)
        ctx.c = 0; // counter to zero
      }
      ctx.b[ctx.c++] = input[i];
    }
  }

  // Completes a BLAKE2b streaming hash
  // Returns a Uint8Array containing the message digest
  function blake2bFinal(ctx) {
    ctx.t += ctx.c; // mark last block offset

    while (ctx.c < 128) {
      // fill up with zeros
      ctx.b[ctx.c++] = 0;
    }
    blake2bCompress(ctx, true); // final block flag = 1

    // little endian convert and store
    const out = new Uint8Array(ctx.outlen);
    for (let i = 0; i < ctx.outlen; i++) {
      out[i] = ctx.h[i >> 2] >> (8 * (i & 3));
    }
    return out;
  }
  return { Init: blake2bInit, Update: blake2bUpdate, Final: blake2bFinal };
})();

//Provides: caml_blake2_create
//Requires: caml_uint8_array_of_string
//Requires: blake2b
//Version: >= 5.2
function caml_blake2_create(hashlen, key) {
  key = caml_uint8_array_of_string(key);
  if (key.length > 64) {
    key = key.subarray(0, 64);
  }
  return blake2b.Init(hashlen, key);
}

//Provides: caml_blake2_final
//Requires: caml_string_of_uint8_array
//Requires: blake2b
//Version: >= 5.2
function caml_blake2_final(ctx, _hashlen) {
  // ctx.outlen === hashlen
  var r = blake2b.Final(ctx);
  return caml_string_of_uint8_array(r);
}

//Provides: caml_blake2_update
//Requires: blake2b
//Requires: caml_uint8_array_of_string
//Version: >= 5.2, < 5.3
function caml_blake2_update(ctx, buf, ofs, len) {
  var input = caml_uint8_array_of_string(buf);
  input = input.subarray(ofs, ofs + len);
  blake2b.Update(ctx, input);
  return 0;
}

//Provides: caml_blake2_update
//Requires: blake2b
//Requires: caml_uint8_array_of_bytes
//Version: >= 5.3
function caml_blake2_update(ctx, buf, ofs, len) {
  var input = caml_uint8_array_of_bytes(buf);
  input = input.subarray(ofs, ofs + len);
  blake2b.Update(ctx, input);
  return 0;
}

//Provides: caml_blake2_string
//Requires: caml_blake2_create
//Requires: caml_blake2_update
//Requires: caml_blake2_final
//Version: >= 5.2, < 5.3
function caml_blake2_string(hashlen, key, buf, ofs, len) {
  var ctx = caml_blake2_create(hashlen, key);
  caml_blake2_update(ctx, buf, ofs, len);
  return caml_blake2_final(ctx, hashlen);
}

//Provides: caml_blake2_string
//Requires: caml_blake2_create
//Requires: caml_blake2_update
//Requires: caml_blake2_final
//Requires: caml_bytes_of_string
//Version: >= 5.3
function caml_blake2_string(hashlen, key, buf_str, ofs, len) {
  var ctx = caml_blake2_create(hashlen, key);
  var buf = caml_bytes_of_string(buf_str);
  caml_blake2_update(ctx, buf, ofs, len);
  return caml_blake2_final(ctx, hashlen);
}

//Provides: caml_blake2_bytes
//Requires: caml_blake2_create
//Requires: caml_blake2_update
//Requires: caml_blake2_final
//Version: >= 5.3
function caml_blake2_bytes(hashlen, key, buf, ofs, len) {
  var ctx = caml_blake2_create(hashlen, key);
  caml_blake2_update(ctx, buf, ofs, len);
  return caml_blake2_final(ctx, hashlen);
}

