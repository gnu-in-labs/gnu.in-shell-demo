// build.rs — drives cxx-qt's QML module emission. The generated headers land
// in OUT_DIR and the matching QML plugin is registered under URI `blob.in.qml`
// so QML can `import blob.in.qml 0.4`.

use cxx_qt_build::{CxxQtBuilder, QmlModule};

fn main() {
    CxxQtBuilder::new()
        .qml_module(QmlModule {
            uri: "blob.in.qml",
            rust_files: &["src/mascot.rs", "src/bloom.rs"],
            qml_files: &[],
            ..Default::default()
        })
        .build();
}
