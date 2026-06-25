// blobin_bloom_item.cpp — render-only shim for the BubbleBloom recipe.
//
// Mirrors blobin_item.cpp: tick the Rust handle, upload the flat mesh. Shares
// the vertex attribute set and material with the mascot item (declared in
// blobin_item.cpp); bubble/thread colours ride in the per-vertex rgba, so the
// material runs with neutral params.

#include "blobin_bloom_item.h"
#include "blobin_material.h"

#include <QSGGeometry>
#include <QSGGeometryNode>
#include <QQuickWindow>
#include <functional>
#include <cstring>

namespace blobin {

// Declared in blobin_item.cpp (shared attribute set, mesh upload, frame clock).
const QSGGeometry::AttributeSet& blobAttributes();
QSGGeometryNode* uploadBlobMesh(QSGGeometryNode* node,
                                rust::Slice<const FfiVertex> verts,
                                rust::Slice<const uint16_t> idx);
void wireFrameClock(QQuickItem* item, std::function<void()> onFrame);

BloomItem::BloomItem(QQuickItem* parent)
    : QQuickItem(parent),
      m_bloom(bloom_new(static_cast<uint32_t>(m_leaves), 2.2f, 0.32f, 0.036f)) {
    setFlag(ItemHasContents, true);
    m_clock.start();
    wireFrameClock(this, [this] { onFrame(); });
}

BloomItem::~BloomItem() = default;

void BloomItem::setOpen(bool o) {
    if (o == m_open) return;
    m_open = o;
    if (o) m_bloom->bloom_open(); else m_bloom->bloom_close();
    emit openChanged();
    update();
}

void BloomItem::setLeaves(int n) {
    n = qBound(1, n, 12);
    if (n == m_leaves) return;
    m_leaves = n;
    // Rebuild the handle with the new leaf count; preserve open state.
    m_bloom = bloom_new(static_cast<uint32_t>(n), 2.2f, 0.32f, 0.036f);
    m_sizeDirty = true;
    if (m_open) m_bloom->bloom_open();
    emit leavesChanged();
    update();
}

void BloomItem::geometryChange(const QRectF& n, const QRectF& o) {
    QQuickItem::geometryChange(n, o);
    m_sizeDirty = true;
    update();
}

void BloomItem::onFrame() {
    const float dpr = window() ? float(window()->effectiveDevicePixelRatio()) : 1.0f;
    if (m_sizeDirty) {
        const float halfMin = float(qMin(width(), height())) * 0.5f;
        m_bloom->bloom_set_size(halfMin * dpr);
        m_sizeDirty = false;
    }
    const float dt = float(m_clock.restart()) / 1000.0f;
    if (m_bloom->bloom_tick(qMin(dt, 0.1f))) {
        update();
    }
}

QSGNode* BloomItem::updatePaintNode(QSGNode* oldNode, UpdatePaintNodeData*) {
    auto* node = uploadBlobMesh(static_cast<QSGGeometryNode*>(oldNode),
                                m_bloom->bloom_vertices(), m_bloom->bloom_indices());
    if (!node) {
        delete oldNode;
        return nullptr;
    }
    return node;
}

} // namespace blobin
