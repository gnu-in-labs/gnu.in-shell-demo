import QtQuick
import blob.in 0.4

// BloomView — harness for the BubbleBloom radial recipe (M.12 ★ R.04).
// Right-click anywhere to bloom the ring at the cursor; click again to close.
// In the shell this is driven by ContextMenuService for the tray/notif menus.

Item {
    id: root
    implicitWidth: 360
    implicitHeight: 360

    BloomItem {
        id: bloom
        anchors.fill: parent
        leaves: 6
        open: false

        TapHandler {
            acceptedButtons: Qt.LeftButton | Qt.RightButton
            onTapped: bloom.open = !bloom.open
        }
    }
}
