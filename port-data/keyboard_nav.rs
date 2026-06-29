// keyboard_nav.rs — PORT TARGET (proposed; not yet in-crate)
// ============================================================================
// CM-5 keyboard navigation for gnuin-compose-core menus. Net-new design
// harvested from the CM-5 frontier (CONTEXT_MENU_FRONTIERS.md), specced in the
// Atelier (gnosis ▸ ux) and committed here as the proposed port target — there
// is no in-crate module yet, so this is the destination, not a mirror. When the
// crate adopts it, this file becomes a conformance mirror (update PARITY.md).
//
// Thesis: a flat keyboard CURSOR over the enabled, hittable rows of an open menu
// (+ ready agent suggestions when joined), read-only. The cursor never mutates a
// peer or the scene — it only selects; Enter dispatches the row's action through
// the same MenuRow→Action path the pointer uses (host_menu_state::on_hit). It is
// the keyboard analogue of the input model's cursor focus (compose_core.rs
// CursorState): observe-only, the engine still owns focus and dismissal.
//
// Decided spec (Atelier, agent-recommended → accepted):
//   nav     = flat-enabled+suggest    suggest = joined-when-ready
//   dismiss = esc+outside             focus   = neutral-on-open
//   ends    = clamp                   risk    = observe
#![allow(dead_code)]

/// How the flat keyboard list is built from the menu model.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum NavModel {
    /// Flat over enabled rows + ready suggestions (CM-5 default).
    FlatEnabledPlusSuggest,
    /// Sectioned: a group jump key moves between groups, ↑/↓ within.
    Sectioned,
    /// Items only — ready suggestions stay pointer-only.
    ItemsOnly,
}

/// Behaviour at the ends of the list.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Ends {
    Clamp,
    Wrap,
}

/// Dismissal surface. Precedence is always Esc > outside-press > select.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Dismiss {
    EscOnly,
    EscPlusOutside,
}

/// A dismissal trigger, resolved against `Dismiss`.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum DismissCause {
    Esc,
    OutsidePress,
    Select,
}

// ── Decided constants (Atelier spec) ────────────────────────────────────────
pub const NAV: NavModel = NavModel::FlatEnabledPlusSuggest;
pub const ENDS: Ends = Ends::Clamp;
pub const DISMISS: Dismiss = Dismiss::EscPlusOutside;
/// Menu opens with NO row focused; the first ↓ selects row 0 (the mouse stays
/// master until the keyboard acts — mirrors CursorState click-awareness).
pub const FOCUS_NEUTRAL_ON_OPEN: bool = true;
/// Ready agent suggestions are appended to the flat keyboard list once ready.
pub const SUGGEST_JOINS_LIST: bool = true;

/// A flat keyboard cursor over an open menu. `cursor == None` is the neutral
/// (no-row-focused) state; `len` counts the enabled rows (+ ready suggestions
/// when `SUGGEST_JOINS_LIST`). Read-only: `observe`.
#[derive(Clone, Debug, PartialEq)]
pub struct KeyboardNav {
    pub cursor: Option<usize>,
    pub len: usize,
}

impl KeyboardNav {
    /// Construct for an open menu of `len` enabled rows, honouring the
    /// neutral-on-open policy.
    pub fn new(len: usize) -> Self {
        let cursor = if FOCUS_NEUTRAL_ON_OPEN {
            None
        } else if len > 0 {
            Some(0)
        } else {
            None
        };
        KeyboardNav { cursor, len }
    }

    /// Move by `d` (+1 down / -1 up). Pure and total; honours `ENDS`. From the
    /// neutral state a step down lands on the first row, a step up on the last.
    pub fn step(&self, d: isize) -> Option<usize> {
        if self.len == 0 {
            return None;
        }
        let n = self.len as isize;
        match self.cursor {
            None => Some(if d > 0 { 0 } else { (n - 1) as usize }),
            Some(i) => {
                let ni = i as isize + d;
                Some(match ENDS {
                    Ends::Clamp => ni.clamp(0, n - 1) as usize,
                    Ends::Wrap => (((ni % n) + n) % n) as usize,
                })
            }
        }
    }

    /// Apply a step, returning the moved cursor (the engine reduces a new Scene
    /// from this; the cursor itself touches nothing else).
    pub fn moved(&self, d: isize) -> KeyboardNav {
        KeyboardNav {
            cursor: self.step(d),
            len: self.len,
        }
    }

    /// The row Enter would dispatch (None in the neutral state).
    pub fn activated(&self) -> Option<usize> {
        self.cursor
    }
}

/// Does this dismissal cause actually dismiss, under the configured `Dismiss`?
/// Precedence is fixed: Esc and outside-press dismiss; a plain select does not
/// (Enter dispatches the row and the host tears the menu down afterwards).
pub fn dismisses(cause: DismissCause) -> bool {
    match cause {
        DismissCause::Esc => true,
        DismissCause::OutsidePress => DISMISS == Dismiss::EscPlusOutside,
        DismissCause::Select => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn nav(len: usize, cursor: Option<usize>) -> KeyboardNav {
        KeyboardNav { cursor, len }
    }

    #[test]
    fn neutral_then_down_selects_first() {
        assert_eq!(nav(5, None).step(1), Some(0));
    }

    #[test]
    fn up_from_neutral_selects_last() {
        assert_eq!(nav(5, None).step(-1), Some(4));
    }

    #[test]
    fn down_advances() {
        assert_eq!(nav(5, Some(0)).step(1), Some(1));
    }

    #[test]
    fn clamp_holds_at_last() {
        if ENDS == Ends::Clamp {
            assert_eq!(nav(5, Some(4)).step(1), Some(4));
        }
    }

    #[test]
    fn empty_list_stays_neutral() {
        assert_eq!(nav(0, None).step(1), None);
    }

    #[test]
    fn esc_and_outside_dismiss_but_select_does_not() {
        assert!(dismisses(DismissCause::Esc));
        assert_eq!(
            dismisses(DismissCause::OutsidePress),
            DISMISS == Dismiss::EscPlusOutside
        );
        assert!(!dismisses(DismissCause::Select));
    }

    #[test]
    fn neutral_on_open_per_spec() {
        let expected = if FOCUS_NEUTRAL_ON_OPEN { None } else { Some(0) };
        assert_eq!(KeyboardNav::new(5).cursor, expected);
    }
}
