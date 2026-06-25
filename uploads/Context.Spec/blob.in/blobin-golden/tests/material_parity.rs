//! material_parity — P3 golden harness.
//!
//! For each mascot state, render its material as a UV patch via the Rust
//! reference (`blobin_core::raster::render_patch`) and compare against the
//! checked-in golden PNG. The goldens were produced by the independent JS
//! oracle in `tools/gen_goldens` from the *same* fragment spec — so a pass
//! proves the Rust maths and the shader spec agree (Q4: pixel gate + SSIM).
//!
//! Set `UPDATE_GOLDEN=1` to rewrite the goldens from the Rust side (use only
//! when you've intentionally changed the fragment and updated blob.frag too).
//!
//! Run: `cargo test -p blobin-golden`

use blobin_core::diff::{pixel_diff, ssim};
use blobin_core::material::Material;
use blobin_core::raster::{composite_over, render_patch, PREVIEW_BG};
use blobin_core::state::MascotState;
use std::path::PathBuf;

const W: u32 = 128;
const H: u32 = 128;

// The hard gate (Q4). f32(Rust) vs f64(JS oracle) on a high-frequency noise
// hash means exact equality is unrealistic; the gate allows a few LSBs.
const MAX_DELTA: u8 = 4;
const MAX_OVER_FRACTION: f32 = 0.01; // ≤ 1 % of pixels may exceed threshold
const PIXEL_THRESHOLD: u8 = 2;
const SSIM_FLOOR: f32 = 0.99; // signal, logged; also asserted as a soft floor

fn golden_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("golden")
}

fn material_for(state: MascotState) -> Material {
    state.target().material
}

fn render(state: MascotState) -> Vec<u8> {
    let m = material_for(state);
    // Composite premultiplied output over the fixed preview bg, so goldens are
    // opaque, viewable, and free of low-alpha PNG roundtrip loss.
    let premult = render_patch(W, H, m.base_rgba(), &m.params());
    composite_over(&premult, PREVIEW_BG)
}

fn load_png(path: &PathBuf) -> (Vec<u8>, u32, u32) {
    let file = std::fs::File::open(path)
        .unwrap_or_else(|_| panic!("missing golden: {} — run tools/gen_goldens", path.display()));
    let decoder = png::Decoder::new(file);
    let mut reader = decoder.read_info().expect("png header");
    let mut buf = vec![0; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).expect("png frame");
    buf.truncate(info.buffer_size());
    (buf, info.width, info.height)
}

fn save_png(path: &PathBuf, rgba: &[u8], w: u32, h: u32) {
    let file = std::fs::File::create(path).unwrap();
    let mut enc = png::Encoder::new(file, w, h);
    enc.set_color(png::ColorType::Rgba);
    enc.set_depth(png::BitDepth::Eight);
    enc.write_header().unwrap().write_image_data(rgba).unwrap();
}

fn check(state: MascotState, name: &str) {
    let actual = render(state);
    let path = golden_dir().join(format!("{name}.png"));

    if std::env::var("UPDATE_GOLDEN").is_ok() {
        std::fs::create_dir_all(golden_dir()).ok();
        save_png(&path, &actual, W, H);
        eprintln!("updated golden {name}");
        return;
    }

    let (golden, gw, gh) = load_png(&path);
    assert_eq!((gw, gh), (W, H), "golden {name} wrong size");

    let d = pixel_diff(&actual, &golden, PIXEL_THRESHOLD);
    let s = ssim(&actual, &golden);
    eprintln!(
        "{name}: max_delta={} over={:.3}% ssim={:.5}",
        d.max_delta,
        d.over_fraction() * 100.0,
        s
    );

    // Hard gate.
    assert!(
        d.passes(MAX_DELTA, MAX_OVER_FRACTION),
        "{name} pixel gate FAILED: max_delta={} (≤{}), over={:.3}% (≤{:.1}%)",
        d.max_delta,
        MAX_DELTA,
        d.over_fraction() * 100.0,
        MAX_OVER_FRACTION * 100.0
    );
    // Soft floor on the perceptual signal.
    assert!(s >= SSIM_FLOOR, "{name} SSIM {s} below floor {SSIM_FLOOR}");
}

#[test]
fn idle_material_parity() {
    check(MascotState::Idle, "idle");
}

#[test]
fn listening_material_parity() {
    check(MascotState::Listening, "listening");
}

#[test]
fn transmit_material_parity() {
    check(MascotState::Transmit, "transmit");
}

#[test]
fn veille_material_parity() {
    check(MascotState::Veille, "veille");
}
