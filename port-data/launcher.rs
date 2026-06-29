// gnuin-launcher :: fuzzy search + provider routing + frecency (port target)
// ============================================================================
// The launcher's algorithmic core, lifted out of the Central prototype so the
// host has no per-result heuristics inline. Three concerns, each pure:
//
//   1. fuzzy_match  — fzf-lite subsequence scorer with positions (for hi-lite).
//   2. Provider     — prefix routing: ">" commands · "=" calc · else apps.
//   3. Frecency     — recency-weighted launch frequency for the empty-query
//                     "recents" ordering.
//
// The calculator itself stays host-side (a guarded JS expression evaluator);
// this module only ROUTES to it. Apps/commands corpora are supplied by the
// caller (XDG .desktop scan + the shell command registry).

#![allow(dead_code)]

// ── 1. Fuzzy subsequence matcher ────────────────────────────────────────────

/// A successful fuzzy match: a score (higher = better) and the matched byte
/// positions in the target (ascending), used to bold the matched glyphs.
#[derive(Clone, Debug, PartialEq)]
pub struct FuzzyMatch {
    pub score: f32,
    pub positions: Vec<usize>,
}

/// Match `query` against `target` as an ordered subsequence. Returns `None` if
/// any query char is missing in order. Scoring rewards (in descending weight):
/// a match at index 0, a match after a word boundary (space/-/_/./slash), a
/// camelCase hump, and runs of consecutive matches; it penalizes a leading gap
/// and trailing target length so shorter, tighter, earlier matches win.
///
/// Case-insensitive; `query` is expected pre-lowercased by the caller.
pub fn fuzzy_match(query: &str, target: &str) -> Option<FuzzyMatch> {
    if query.is_empty() {
        return Some(FuzzyMatch { score: 0.0, positions: vec![] });
    }
    let q: Vec<char> = query.chars().collect();
    let t: Vec<char> = target.chars().collect();
    let tl = t.len();
    if q.len() > tl {
        return None;
    }
    let lower: Vec<char> = t.iter().map(|c| c.to_ascii_lowercase()).collect();

    let mut ti = 0usize;
    let mut score = 0.0f32;
    let mut prev: isize = -2;
    let mut lead: isize = -1;
    let mut positions = Vec::with_capacity(q.len());

    for &c in &q {
        let mut found: isize = -1;
        let mut k = ti;
        while k < tl {
            if lower[k] == c {
                found = k as isize;
                break;
            }
            k += 1;
        }
        if found < 0 {
            return None;
        }
        let f = found as usize;
        if lead < 0 {
            lead = found;
        }
        let mut b = 1.0f32;
        if found == prev + 1 {
            b += 6.0; // consecutive run
        }
        if f == 0 {
            b += 9.0; // start of string
        } else {
            let pc = lower[f - 1];
            if pc == ' ' || pc == '-' || pc == '_' || pc == '/' || pc == '.' {
                b += 7.0; // word boundary
            } else if t[f - 1].is_ascii_lowercase() && t[f].is_ascii_uppercase() {
                b += 6.0; // camelCase hump
            }
        }
        score += b;
        positions.push(f);
        prev = found;
        ti = f + 1;
    }

    score -= lead as f32 * 0.5;
    score -= (tl - q.len()) as f32 * 0.1;
    Some(FuzzyMatch { score, positions })
}

// ── 2. Provider routing ─────────────────────────────────────────────────────

/// Which result provider a raw query targets.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Provider {
    Apps,
    Commands,
    Calc,
}

/// Route a raw query to a provider + the remaining (trimmed) body.
/// `>` → Commands, `=` → Calc, otherwise Apps. The prefix is stripped.
pub fn route(raw: &str) -> (Provider, String) {
    let t = raw.trim();
    match t.chars().next() {
        Some('>') => (Provider::Commands, t[1..].trim().to_string()),
        Some('=') => (Provider::Calc, t[1..].trim().to_string()),
        _ => (Provider::Apps, t.to_string()),
    }
}

/// Apps-mode auto-detect: a body with a digit and an operator that the host
/// calculator can evaluate should surface a calc row at the top even without
/// the explicit `=` prefix. (Pure predicate; evaluation is host-side.)
pub fn looks_like_math(body: &str) -> bool {
    body.chars().any(|c| c.is_ascii_digit())
        && body.chars().any(|c| matches!(c, '+' | '-' | '*' | '/'))
}

// ── 3. Frecency ─────────────────────────────────────────────────────────────

/// One app's launch history.
#[derive(Clone, Copy, Debug, Default)]
pub struct FrecencyEntry {
    pub count: u32,
    pub last_ms: u64,
}

impl FrecencyEntry {
    /// Recency-weighted frequency. `now_ms` is the current epoch-ms clock.
    /// Weight halves roughly every 30 minutes of idle; unused entries score 0.
    pub fn score(&self, now_ms: u64) -> f32 {
        if self.count == 0 {
            return 0.0;
        }
        let age_min = (now_ms.saturating_sub(self.last_ms)) as f32 / 60_000.0;
        (self.count as f32) * 12.0 * (1.0 / (1.0 + age_min / 30.0)) + 0.001
    }
    /// Record a launch at `now_ms`.
    pub fn bump(&mut self, now_ms: u64) {
        self.count += 1;
        self.last_ms = now_ms;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test] fn non_subsequence_is_rejected() {
        assert!(fuzzy_match("xyz", "Terminal").is_none());
        assert!(fuzzy_match("trz", "Terminal").is_none()); // order matters: z absent after r
    }

    #[test] fn subsequence_matches_with_positions() {
        let m = fuzzy_match("trm", "Terminal").unwrap();
        assert_eq!(m.positions, vec![0, 2, 4]); // T·r·m  (Te[r]m)
    }

    #[test] fn empty_query_is_a_zero_score_match() {
        let m = fuzzy_match("", "Files").unwrap();
        assert_eq!(m.score, 0.0);
        assert!(m.positions.is_empty());
    }

    #[test] fn consecutive_beats_scattered() {
        // " term" prefix run should outrank the same chars scattered in a longer name.
        let tight = fuzzy_match("term", "Terminal").unwrap();
        let loose = fuzzy_match("term", "Theme Editor Roomy Mix").unwrap();
        assert!(tight.score > loose.score);
    }

    #[test] fn prefix_outranks_internal_match() {
        let prefix = fuzzy_match("ma", "Mail").unwrap();
        let internal = fuzzy_match("ma", "Roomate").unwrap();
        assert!(prefix.score > internal.score);
    }

    #[test] fn word_boundary_bonus_applies() {
        // 'c' at a word boundary (after space) should beat a mid-word 'c'.
        let boundary = fuzzy_match("c", "New Code").unwrap();   // C starts "Code"
        let midword = fuzzy_match("c", "Welcome").unwrap();     // c inside "Welcome"
        assert!(boundary.score > midword.score);
    }

    #[test] fn routing_strips_prefix_and_trims() {
        assert_eq!(route(">  reduce"), (Provider::Commands, "reduce".to_string()));
        assert_eq!(route("= 2 + 2"), (Provider::Calc, "2 + 2".to_string()));
        assert_eq!(route("  files "), (Provider::Apps, "files".to_string()));
    }

    #[test] fn math_autodetect() {
        assert!(looks_like_math("2+2"));
        assert!(looks_like_math("128 * 4"));
        assert!(!looks_like_math("terminal"));
        assert!(!looks_like_math("2")); // a bare number is not an expression
    }

    #[test] fn frecency_recent_and_frequent_ranks_higher() {
        let now = 10_000_000u64;
        let mut hot = FrecencyEntry::default();
        hot.bump(now - 60_000); hot.bump(now); // twice, just now
        let mut cold = FrecencyEntry::default();
        cold.bump(now - 3_600_000); // once, an hour ago
        assert!(hot.score(now) > cold.score(now));
        assert_eq!(FrecencyEntry::default().score(now), 0.0); // unused
    }
}
