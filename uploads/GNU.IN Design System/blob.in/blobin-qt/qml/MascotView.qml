import QtQuick
import blob.in 0.4

// MascotView — minimal harness. Drop into the shell, bind `state` to the
// assistant status, and the Rust engine drives the rest. The tweaks-panel
// can bind `tolerance` live (the cxx-qt reactive surface, Q6).

Item {
    id: root
    implicitWidth: 160
    implicitHeight: 184

    property int status: 0   // 0 idle · 1 listening · 2 transmit · 3 veille

    BlobInItem {
        id: mascot
        anchors.fill: parent
        tolerance: 0.02
        state: switch (root.status) {
               case 1: return BlobInItem.State.Listening
               case 2: return BlobInItem.State.Transmit
               case 3: return BlobInItem.State.Veille
               default: return BlobInItem.State.Idle
               }

        // Demo: cycle states on click (the shell wires real signals instead).
        TapHandler {
            onTapped: root.status = (root.status + 1) % 4
        }

        Behavior on opacity { NumberAnimation { duration: 240 } }
    }
}
