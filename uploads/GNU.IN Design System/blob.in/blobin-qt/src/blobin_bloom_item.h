// blobin_bloom_item.h — QQuickItem for the BubbleBloom radial recipe (M.12).
//
// Same shape as BlobInItem: owns a Rust BloomHandle, ticks it off the render
// loop, and copies the flat mesh into a QSGGeometryNode in updatePaintNode().
// No logic — the bloom (hub, leaves, springs, threads) is all computed in
// blobin-core::bloom. Bubble/thread colours are baked per-vertex by Rust, so
// this reuses BlobInMaterial with neutral params (vertex colour drives all).

#pragma once

#include <QQuickItem>
#include <QElapsedTimer>
#include <rust/cxx.h>
#include "blobin-core/src/ffi.rs.h"

namespace blobin {

class BloomItem : public QQuickItem {
    Q_OBJECT
    QML_ELEMENT
    Q_PROPERTY(bool open READ isOpen WRITE setOpen NOTIFY openChanged)
    Q_PROPERTY(int leaves READ leaves WRITE setLeaves NOTIFY leavesChanged)

public:
    explicit BloomItem(QQuickItem* parent = nullptr);
    ~BloomItem() override;

    bool isOpen() const { return m_open; }
    void setOpen(bool o);

    int leaves() const { return m_leaves; }
    void setLeaves(int n);

signals:
    void openChanged();
    void leavesChanged();

protected:
    QSGNode* updatePaintNode(QSGNode* old, UpdatePaintNodeData*) override;
    void geometryChange(const QRectF& n, const QRectF& o) override;

private slots:
    void onFrame();

private:
    rust::Box<BloomHandle> m_bloom;
    QElapsedTimer m_clock;
    bool m_open = false;
    int m_leaves = 6;
    bool m_sizeDirty = true;
};

} // namespace blobin
