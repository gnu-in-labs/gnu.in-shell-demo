// MascotReactive.qml — the cxx-qt path (Q6).
//
// Same scene as MascotView.qml, but `state`, `size`, `tolerance` are real
// Q_PROPERTY bindings: assign and forget. The animator drives `tick()`.

import QtQuick
import blob.in.qml 0.4

Item {
    width: 320; height: 320
    property string shellState: "idle"

    Mascot {
        id: face
        size: 96
        tolerance: 0.4
        state: parent.shellState
        onCooled: console.log("mascot cold — host can throttle")
    }

    // 60 Hz timer drives tick(); skip frames when cold.
    Timer {
        interval: 16; running: !face.cold || face.state !== "veille"
        repeat: true
        onTriggered: face.tick(0.016)
    }

    // Demo: cycle states every 2 s.
    Timer {
        interval: 2000; running: true; repeat: true
        property int i: 0
        onTriggered: {
            const seq = ["idle", "listening", "transmit", "veille"]
            parent.shellState = seq[i++ % seq.length]
        }
    }
}
