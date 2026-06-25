// blobin_item.cpp — render-only QQuickItem shim.
//
// The hot path is updatePaintNode(): ask Rust to tick, and if it reports a
// repaint, copy the flat vertex/index buffers straight into a QSGGeometry.
// `FfiVertex` is layout-identical to QSGGeometry's (pos2, uv2, rgba4) custom
// attribute set, so the copy is a memcpy, not a per-vertex loop.

#include "blobin_item.h"
#include "blobin_material.h"

#include <QSGGeometry>
#include <QSGGeometryNode>
#include <QQuickWindow>
#include <functional>

namespace blobin {

// Wire a per-frame tick off the render loop: when the item joins a window,
// connect `onFrame` to beforeSynchronizing (DirectConnection, render thread)
// and make the window transparent. External linkage — shared by both items.
void wireFrameClock(QQuickItem* item, std::function<void()> onFrame) {
    QObject::connect(item, &QQuickItem::windowChanged, item,
        [item, cb = std::move(onFrame)](QQuickWindow* w) {
            if (!w) return;
            QObject::connect(w, &QQuickWindow::beforeSynchronizing, item, cb,
                             Qt::DirectConnection);
            w->setColor(Qt::transparent);
        });
}

// Custom attribute set matching FfiVertex: vec2 pos, vec2 uv, vec4 rgba.
// External linkage — shared with blobin_bloom_item.cpp.
const QSGGeometry::AttributeSet& blobAttributes() {
    static QSGGeometry::Attribute attrs[] = {
        QSGGeometry::Attribute::createWithAttributeType(
            0, 2, QSGGeometry::FloatType, QSGGeometry::PositionAttribute),
        QSGGeometry::Attribute::createWithAttributeType(
            1, 2, QSGGeometry::FloatType, QSGGeometry::TexCoordAttribute),
        QSGGeometry::Attribute::createWithAttributeType(
            2, 4, QSGGeometry::FloatType, QSGGeometry::ColorAttribute),
    };
    static QSGGeometry::AttributeSet set = { 3, sizeof(float) * 8, attrs };
    return set;
}

static FfiState toFfi(BlobInItem::State s) {
    switch (s) {
        case BlobInItem::State::Listening: return FfiState::Listening;
        case BlobInItem::State::Transmit:  return FfiState::Transmit;
        case BlobInItem::State::Veille:    return FfiState::Veille;
        default:                           return FfiState::Idle;
    }
}

BlobInItem::BlobInItem(QQuickItem* parent)
    : QQuickItem(parent), m_engine(engine_new()) {
    setFlag(ItemHasContents, true);
    m_clock.start();
    wireFrameClock(this, [this] { onFrame(); });
}

BlobInItem::~BlobInItem() = default;

void BlobInItem::setState(State s) {
    if (s == m_state) return;
    m_state = s;
    m_engine->set_state(toFfi(s));
    emit stateChanged();
    update();
}

void BlobInItem::setTolerance(qreal t) {
    if (qFuzzyCompare(t, m_tolerance)) return;
    m_tolerance = t;
    m_engine->set_tolerance(static_cast<float>(t));
    emit toleranceChanged();
    update();
}

void BlobInItem::geometryChange(const QRectF& n, const QRectF& o) {
    QQuickItem::geometryChange(n, o);
    m_sizeDirty = true;
    update();
}

void BlobInItem::onFrame() {
    const float dpr = window() ? float(window()->effectiveDevicePixelRatio()) : 1.0f;
    if (m_sizeDirty) {
        // Logical blob space is ~unit-radius; fit it to the item's half-extent.
        const float halfMin = float(qMin(width(), height())) * 0.5f;
        m_engine->set_size(halfMin * dpr);
        m_sizeDirty = false;
    }
    const float dt = float(m_clock.restart()) / 1000.0f;
    // tick() returns true iff the mesh changed → only then schedule a repaint.
    if (m_engine->tick(qMin(dt, 0.1f))) {
        update();
    }
    // When the mascot is fully settled the engine reports "cold": we stop
    // requesting frames until the next state change re-arms onFrame via update().
}

// Shared mesh upload: (re)build the geometry node and memcpy the flat Rust
// buffers in. External linkage — used by both BlobInItem and BloomItem so the
// hot path lives in exactly one place. Returns the node (created if null), or
// nullptr when the mesh is empty (caller deletes the old node).
QSGGeometryNode* uploadBlobMesh(QSGGeometryNode* node,
                                rust::Slice<const FfiVertex> verts,
                                rust::Slice<const uint16_t> idx) {
    if (verts.empty() || idx.empty()) return nullptr;
    if (!node) {
        node = new QSGGeometryNode();
        auto* geom = new QSGGeometry(blobAttributes(),
                                     int(verts.size()), int(idx.size()),
                                     QSGGeometry::UnsignedShortType);
        geom->setDrawingMode(QSGGeometry::DrawTriangles);
        node->setGeometry(geom);
        node->setFlag(QSGNode::OwnsGeometry);
        node->setMaterial(new BlobInMaterial());
        node->setFlag(QSGNode::OwnsMaterial);
    }
    QSGGeometry* geom = node->geometry();
    geom->allocate(int(verts.size()), int(idx.size()));
    // memcpy: FfiVertex layout == geometry vertex layout (8 floats).
    std::memcpy(geom->vertexData(), verts.data(), verts.size() * sizeof(FfiVertex));
    std::memcpy(geom->indexDataAsUShort(), idx.data(), idx.size() * sizeof(uint16_t));
    node->markDirty(QSGNode::DirtyGeometry);
    return node;
}

QSGNode* BlobInItem::updatePaintNode(QSGNode* oldNode, UpdatePaintNodeData*) {
    auto* node = uploadBlobMesh(static_cast<QSGGeometryNode*>(oldNode),
                                m_engine->vertices(), m_engine->indices());
    if (!node) {
        delete oldNode;
        return nullptr;
    }
    // Mascot-only: push material params (gradient / noise / opacity).
    auto* mat = static_cast<BlobInMaterial*>(node->material());
    mat->setParams(m_engine->material());
    node->markDirty(QSGNode::DirtyMaterial);
    return node;
}

} // namespace blobin
