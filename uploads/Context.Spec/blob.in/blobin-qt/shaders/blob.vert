#version 440

// blob.vert — passthrough with Qt's standard matrix. Vertex colour and UV
// flow to the fragment stage; geometry is already device-space from Rust.

layout(location = 0) in vec2 pos;
layout(location = 1) in vec2 uv;
layout(location = 2) in vec4 rgba;

layout(location = 0) out vec2 vUv;
layout(location = 1) out vec4 vColor;

layout(std140, binding = 0) uniform Buf {
    mat4 qt_Matrix;
    float qt_Opacity;
    // material block (see fragment)
    vec4 inner;
    vec4 outer;
    vec2 center;
    float noise;
    float opacity;
    uint hasGradient;
} ubuf;

void main() {
    vUv = uv;
    vColor = rgba;
    gl_Position = ubuf.qt_Matrix * vec4(pos, 0.0, 1.0);
}
