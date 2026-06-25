// blobin_material.cpp — uniform plumbing for the blob shader.

#include "blobin_material.h"
#include <QSGMaterialShader>
#include <cstring>

namespace blobin {

// Shader that reads the UBO laid out to mirror material::MaterialParams.
class BlobInShader : public QSGMaterialShader {
public:
    BlobInShader() {
        setShaderFileName(VertexStage, QStringLiteral(":/blob.in/shaders/blob.vert.qsb"));
        setShaderFileName(FragmentStage, QStringLiteral(":/blob.in/shaders/blob.frag.qsb"));
    }

    bool updateUniformData(RenderState& state,
                           QSGMaterial* newMat, QSGMaterial*) override {
        bool changed = false;
        QByteArray* buf = state.uniformData();
        // Layout (std140): mat4 qt_Matrix (64) | float qt_Opacity (4) | pad |
        //                  vec4 inner | vec4 outer | vec2 center | float noise |
        //                  float opacity | uint hasGradient
        Q_ASSERT(buf->size() >= 144);
        char* p = buf->data();

        if (state.isMatrixDirty()) {
            std::memcpy(p + 0, state.combinedMatrix().constData(), 64);
            changed = true;
        }
        if (state.isOpacityDirty()) {
            const float o = state.opacity();
            std::memcpy(p + 64, &o, 4);
            changed = true;
        }
        auto* m = static_cast<BlobInMaterial*>(newMat);
        const FfiMaterial& fp = m->params();
        std::memcpy(p + 80, fp.inner.data(), 16);
        std::memcpy(p + 96, fp.outer.data(), 16);
        std::memcpy(p + 112, fp.center.data(), 8);
        std::memcpy(p + 120, &fp.noise, 4);
        std::memcpy(p + 124, &fp.opacity, 4);
        std::memcpy(p + 128, &fp.has_gradient, 4);
        return true;
    }
};

BlobInMaterial::BlobInMaterial() {
    setFlag(Blending, true);
}

QSGMaterialType* BlobInMaterial::type() const {
    static QSGMaterialType t;
    return &t;
}

QSGMaterialShader* BlobInMaterial::createShader(QSGRendererInterface::RenderMode) const {
    return new BlobInShader();
}

int BlobInMaterial::compare(const QSGMaterial* other) const {
    auto* o = static_cast<const BlobInMaterial*>(other);
    return std::memcmp(&m_params, &o->m_params, sizeof(FfiMaterial));
}

} // namespace blobin
