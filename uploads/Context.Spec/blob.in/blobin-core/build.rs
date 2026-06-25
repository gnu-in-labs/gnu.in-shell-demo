// build.rs — compile the cxx bridge glue.
//
// Emits the C++ side of `src/ffi.rs` so blobin-qt can #include
// "blobin-core/src/ffi.rs.h" and link the generated translation unit.

fn main() {
    cxx_build::bridge("src/ffi.rs")
        .flag_if_supported("-std=c++17")
        .compile("blobin-core-ffi");

    println!("cargo:rerun-if-changed=src/ffi.rs");
}
