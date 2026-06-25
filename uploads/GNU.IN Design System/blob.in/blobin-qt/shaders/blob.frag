#version 440

// blob.frag — flat colour, optional radial gradient, optional value noise.
// The maths *parameters* come from Rust (material.rs); this only evaluates.
//
// PARITY: this is a line-for-line mirror of `blobin-core::raster::eval_fragment`.
// The golden harness (blobin-golden) produces reference PNGs from that Rust fn
// and pixel-diffs them (P3 / Q4). If you change this shader, change
// eval_fragment too and run `just goldens`.

layout(location = 0) in vec2 vUv;
layout(location = 1) in vec4 vColor;

layout(location = 0) out vec4 fragColor;

layout(std140, binding = 0) uniform Buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    vec4 inner;
    vec4 outer;
    vec2 center;
    float noise;
    float opacity;
    uint hasGradient;
} ubuf;

// Cheap hash noise — the "skin" texture; amplitude driven by ubuf.noise.
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}

void main() {
    vec4 col = vColor;

    if (ubuf.hasGradient == 1u) {
        float d = clamp(length(vUv - ubuf.center) * 1.6, 0.0, 1.0);
        // Sheen composited over the base by its own alpha (mirror of
        // raster::eval_fragment — P3). Body colour & alpha are preserved.
        vec4 g = mix(ubuf.inner, ubuf.outer, d);
        col.rgb = mix(col.rgb, g.rgb, g.a);
    }

    if (ubuf.noise > 0.0) {
        float n = (hash(vUv * 220.0) - 0.5) * ubuf.noise;
        col.rgb += n;
    }

    col.a *= ubuf.opacity * ubuf.qt_Opacity;
    // Premultiply for Qt's scene-graph blending.
    fragColor = vec4(col.rgb * col.a, col.a);
}
