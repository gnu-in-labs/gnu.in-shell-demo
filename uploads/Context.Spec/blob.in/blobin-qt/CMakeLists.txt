cmake_minimum_required(VERSION 3.21)

project(blobin-qt LANGUAGES CXX)

# blob.in — Qt shim. The "second mini-engine" (plan §6): it only renders.
# All shape/animation logic lives in the Rust crate blobin-core, reached via
# the cxx bridge. Target: this whole shim stays under ~300 LoC.

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 6.6 REQUIRED COMPONENTS Quick Qml Gui)

qt_standard_project_setup(REQUIRES 6.6)

# ── Rust core via Corrosion (cargo → CMake) ───────────────────────────────
# Corrosion imports the staticlib + the cxx-generated C++ glue.
include(FetchContent)
FetchContent_Declare(
  Corrosion
  GIT_REPOSITORY https://github.com/corrosion-rs/corrosion.git
  GIT_TAG v0.5
)
FetchContent_MakeAvailable(Corrosion)

corrosion_import_crate(MANIFEST_PATH ../blobin-core/Cargo.toml)

# The cxx bridge header/source generated from src/ffi.rs.
corrosion_add_cxxbridge(blobin_ffi
  CRATE blobin-core
  FILES ffi.rs
)

# ── Qt QML plugin ─────────────────────────────────────────────────────────
qt_add_qml_module(blobinqt
  URI blob.in
  VERSION 0.4
  PLUGIN_TARGET blobinqt
  SOURCES
    src/blobin_item.h
    src/blobin_item.cpp
    src/blobin_material.h
    src/blobin_material.cpp
    src/blobin_bloom_item.h
    src/blobin_bloom_item.cpp
  QML_FILES
    qml/MascotView.qml
    qml/BloomView.qml
  RESOURCES
    shaders/blob.vert.qsb
    shaders/blob.frag.qsb
)

target_link_libraries(blobinqt
  PRIVATE
    Qt6::Quick
    Qt6::Qml
    Qt6::Gui
    blobin_ffi          # cxx bridge
    blobin-core         # Rust staticlib
)

# Compile the RHI shaders (.vert/.frag → .qsb) at build time.
qt6_add_shaders(blobinqt "blobin_shaders"
  PREFIX "/blob.in"
  FILES
    shaders/blob.vert
    shaders/blob.frag
)
