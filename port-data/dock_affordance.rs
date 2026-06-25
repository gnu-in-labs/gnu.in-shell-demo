// gnuin-compose-core :: dock affordance (port target)
// The headline success criterion (GOAL_ALIGNMENT_AND_NEXT_SLICE.md §0): compose an
// expressive native affordance — a "deck of cards" dock — WITHOUT rewriting the
// runtime. Same data-driven pattern as the taskbar module registry: the dock is a
// scene node whose per-card layout is derived from a DockAffordanceConfig that
// asset-core can *plan* and the host *mounts* as-is.
//
// gnuin-dock/src/affordance.rs already parses DockAffordanceConfig { deck_style, .. };
// this is the engine-side resolution that turns one config into N card transforms.

use std::f32::consts::PI;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DeckStyle { Row, Stack, Fan }

#[derive(Clone, Debug)]
pub struct DockAffordanceConfig {
    pub deck_style: DeckStyle,
    pub card_px: f32,
    pub fan_arc_deg: f32, // total spread across all cards (Fan only)
    pub spread: f32,      // 0.4..1.6 multiplier on inter-card offset/angle
    pub items: usize,
    pub mounted_from: &'static str, // "asset-core://manifest"
}

impl Default for DockAffordanceConfig {
    fn default() -> Self {
        Self { deck_style: DeckStyle::Row, card_px: 42.0, fan_arc_deg: 42.0, spread: 1.0, items: 6, mounted_from: "asset-core://manifest" }
    }
}

/// Resolved per-card placement (transform-origin + 2D affine the renderer applies).
#[derive(Clone, Copy, Debug)]
pub struct CardPlacement {
    pub index: usize,
    pub dx: f32,           // px, relative to dock center
    pub dy: f32,           // px, up is negative
    pub rotate_deg: f32,
    pub origin_y_px: f32,  // transform-origin Y (from card top); a low pivot makes the fan
    pub z: i32,
}

impl DockAffordanceConfig {
    pub fn card_h(&self) -> f32 { (self.card_px * 1.16).round() }
    fn pivot_y(&self) -> f32 { self.card_h() + 62.0 }
    fn step_deg(&self) -> f32 { if self.items > 1 { self.fan_arc_deg / (self.items as f32 - 1.0) } else { 0.0 } }

    /// One config -> N placements. The ONLY thing that changes between a plain dock
    /// and a "deck of cards" is this derivation — no per-style host code path.
    pub fn place(&self) -> Vec<CardPlacement> {
        let n = self.items;
        let c = (n as f32 - 1.0) / 2.0;
        let gap = 7.0_f32;
        (0..n).map(|i| {
            let rel = i as f32 - c;
            let (dx, dy, rot, origin_y) = match self.deck_style {
                DeckStyle::Row => (rel * (self.card_px + gap), 0.0, 0.0, self.card_h() * 0.5),
                DeckStyle::Stack => {
                    let off = 10.0 * self.spread;
                    (rel * off, -rel.abs() * 1.5, rel * 2.4, self.card_h() * 0.5)
                }
                DeckStyle::Fan => (0.0, 0.0, rel * self.step_deg() * self.spread, self.pivot_y()),
            };
            CardPlacement { index: i, dx, dy, rotate_deg: rot, origin_y_px: origin_y, z: (i as i32) + 1 }
        }).collect()
    }

    /// Footprint the dock node reserves on the layer-surface (engine layout input).
    pub fn footprint(&self) -> (f32, f32) {
        let n = self.items as f32;
        let w = match self.deck_style {
            DeckStyle::Row => n * (self.card_px + 7.0) + 10.0,
            DeckStyle::Stack => self.card_px + (n - 1.0) * 10.0 * self.spread + 70.0,
            DeckStyle::Fan => {
                let max_ang = ((n - 1.0) / 2.0) * self.step_deg() * self.spread * PI / 180.0;
                2.0 * self.pivot_y() * max_ang.sin() + self.card_px + 44.0
            }
        };
        let h = match self.deck_style {
            DeckStyle::Row => self.card_px + 22.0,
            _ => self.card_h() + 52.0,
        };
        (w.round(), h.round())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn row_is_flat_and_unrotated() {
        let cfg = DockAffordanceConfig::default();
        let p = cfg.place();
        assert_eq!(p.len(), 6);
        assert!(p.iter().all(|c| c.rotate_deg == 0.0 && c.dy == 0.0));
    }

    #[test]
    fn fan_spreads_symmetrically() {
        let cfg = DockAffordanceConfig { deck_style: DeckStyle::Fan, ..Default::default() };
        let p = cfg.place();
        // first and last cards rotate opposite directions by the same magnitude
        assert!((p.first().unwrap().rotate_deg + p.last().unwrap().rotate_deg).abs() < 1e-3);
        assert!(p.first().unwrap().rotate_deg < 0.0);
        // fan reserves a wider footprint than a row of the same cards
        let row = DockAffordanceConfig::default().footprint().0;
        assert!(cfg.footprint().0 > row);
    }

    #[test]
    fn same_runtime_path_for_every_style() {
        // No per-style branch beyond `place()`: a new deck_style is data, not a new host.
        for s in [DeckStyle::Row, DeckStyle::Stack, DeckStyle::Fan] {
            let cfg = DockAffordanceConfig { deck_style: s, ..Default::default() };
            assert_eq!(cfg.place().len(), 6);
        }
    }
}
