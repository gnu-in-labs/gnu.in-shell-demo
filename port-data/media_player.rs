// gnuin-shell :: media transport (MPRIS-backed) — port target
// ============================================================================
// The model behind the Control Center Quick page's now-playing card (and the
// bar's media widget). In the shipping shell this is a thin projection over the
// MPRIS player exposed on the session bus; here it owns a small playlist so the
// prototype's transport is self-driving. Pure + deterministic:
//
//   advance(dt) — wraps to the next track at end (auto-advance)
//   toggle / next / prev — transport, with the conventional "prev restarts the
//                          current track unless we're within the first 3 s"
//   seek_fraction — scrub clamped to [0,1]
//   fmt_time / progress — display projections (mm:ss, 0..1)

#![allow(dead_code)]

#[derive(Clone, Debug, PartialEq)]
pub struct Track {
    pub title: String,
    pub artist: String,
    pub len_s: f32,
}

#[derive(Clone, Debug)]
pub struct MediaPlayer {
    pub tracks: Vec<Track>,
    pub index: usize,
    pub playing: bool,
    pub pos_s: f32,
}

/// Seconds within the current track under which `prev` skips to the previous
/// track instead of restarting the current one.
const PREV_RESTART_THRESHOLD_S: f32 = 3.0;

impl MediaPlayer {
    pub fn new(tracks: Vec<Track>) -> Self {
        Self { tracks, index: 0, playing: true, pos_s: 0.0 }
    }

    pub fn current(&self) -> &Track {
        &self.tracks[self.index]
    }

    /// Advance playback by `dt` seconds; auto-advances (and wraps) at track end.
    pub fn advance(&mut self, dt: f32) {
        if !self.playing || self.tracks.is_empty() {
            return;
        }
        self.pos_s += dt;
        let len = self.current().len_s;
        if self.pos_s >= len {
            self.pos_s = 0.0;
            self.index = (self.index + 1) % self.tracks.len();
        }
    }

    pub fn toggle(&mut self) {
        self.playing = !self.playing;
    }

    pub fn next(&mut self) {
        self.index = (self.index + 1) % self.tracks.len();
        self.pos_s = 0.0;
    }

    /// Previous: restart the current track if we're past the threshold,
    /// otherwise step to the previous track (wrapping).
    pub fn prev(&mut self) {
        if self.pos_s > PREV_RESTART_THRESHOLD_S {
            self.pos_s = 0.0;
        } else {
            self.index = (self.index + self.tracks.len() - 1) % self.tracks.len();
            self.pos_s = 0.0;
        }
    }

    /// Scrub to a fraction of the current track, clamped to [0,1].
    pub fn seek_fraction(&mut self, f: f32) {
        let f = f.clamp(0.0, 1.0);
        self.pos_s = f * self.current().len_s;
    }

    /// Playback progress in [0,1].
    pub fn progress(&self) -> f32 {
        let len = self.current().len_s;
        if len <= 0.0 { 0.0 } else { (self.pos_s / len).clamp(0.0, 1.0) }
    }

    /// Format a seconds value as `m:ss`.
    pub fn fmt_time(secs: f32) -> String {
        let s = secs.max(0.0).floor() as u32;
        format!("{}:{:02}", s / 60, s % 60)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn player() -> MediaPlayer {
        MediaPlayer::new(vec![
            Track { title: "A".into(), artist: "x".into(), len_s: 10.0 },
            Track { title: "B".into(), artist: "y".into(), len_s: 20.0 },
            Track { title: "C".into(), artist: "z".into(), len_s: 30.0 },
        ])
    }

    #[test] fn advance_auto_wraps_at_end() {
        let mut p = player();
        p.advance(9.5);
        assert_eq!(p.index, 0);
        p.advance(1.0); // crosses 10s end of track A
        assert_eq!(p.index, 1);
        assert!(p.pos_s.abs() < 1e-6);
    }

    #[test] fn paused_does_not_advance() {
        let mut p = player();
        p.toggle();
        p.advance(5.0);
        assert_eq!(p.pos_s, 0.0);
        assert!(!p.playing);
    }

    #[test] fn prev_restarts_then_steps() {
        let mut p = player();
        p.next(); // on B (index 1)
        p.pos_s = 6.0;
        p.prev(); // past threshold → restart B
        assert_eq!(p.index, 1);
        assert_eq!(p.pos_s, 0.0);
        p.prev(); // within threshold → step to A
        assert_eq!(p.index, 0);
    }

    #[test] fn prev_wraps_to_last() {
        let mut p = player(); // on A (index 0), pos 0
        p.prev();
        assert_eq!(p.index, 2); // wrapped to C
    }

    #[test] fn seek_clamps_to_track() {
        let mut p = player(); // track A len 10
        p.seek_fraction(0.5);
        assert!((p.pos_s - 5.0).abs() < 1e-6);
        p.seek_fraction(2.0); // clamped
        assert!((p.pos_s - 10.0).abs() < 1e-6);
        assert!((p.progress() - 1.0).abs() < 1e-6);
    }

    #[test] fn time_formatting() {
        assert_eq!(MediaPlayer::fmt_time(0.0), "0:00");
        assert_eq!(MediaPlayer::fmt_time(9.0), "0:09");
        assert_eq!(MediaPlayer::fmt_time(75.4), "1:15");
        assert_eq!(MediaPlayer::fmt_time(-3.0), "0:00");
    }
}
