// blobin_material.h — QSGMaterial wrapping the RHI shader.
//
// The C++ side of the *split* atom (plan §4). The material maths is computed
// in Rust (material.rs) and arrives as FfiMaterial; this class only ferries
// those uniforms to the .qsb shader. No logic.

#pragma once

#include <QSGMaterial>
#include <QSGMaterialShader>
#include "blobin-core/src/ffi.rs.h"

namespace blobin {

class BlobInMaterial : public QSGMaterial {
public:
    BlobInMaterial();

    QSGMaterialType* type() const override;
    QSGMaterialShader* createShader(QSGRendererInterface::RenderMode) const override;
    int compare(const QSGMaterial* other) const override;

    void setParams(const FfiMaterial& p) { m_params = p; setFlag(Blending, true); }
    const FfiMaterial& params() const { return m_params; }

private:
    FfiMaterial m_params{};
};

} // namespace blobin
