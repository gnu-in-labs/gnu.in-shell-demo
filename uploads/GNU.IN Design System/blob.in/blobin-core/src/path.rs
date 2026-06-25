//! Path — the lingua franca between shapes and the tessellator.
//!
//! A `Path` is a list of cubic-Bézier segments forming one or more closed
//! contours. Every `Blob` lowers itself to a `Path` at a given animation
//! phase `t`; the tessellator only ever sees `Path`, never the shape type.
//!
//! Coordinates are in *logical blob space* (unit-ish, centred near origin).
//! The `Group` transform and the device pixel ratio are applied later, so
//! shapes stay resolution-independent.

/// A 2D point in logical blob space.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

impl Point {
    #[inline]
    pub const fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }

    #[inline]
    pub fn lerp(self, other: Point, t: f32) -> Point {
        Point::new(
            self.x + (other.x - self.x) * t,
            self.y + (other.y - self.y) * t,
        )
    }
}

/// One cubic-Bézier segment: end point + the two control handles that lead
/// *into* it from the previous segment's end point.
#[derive(Clone, Copy, Debug)]
pub struct Cubic {
    pub c1: Point,
    pub c2: Point,
    pub to: Point,
}

/// A closed contour. Winding decides fill vs. hole (see `Inverted`).
#[derive(Clone, Debug)]
pub struct Contour {
    pub start: Point,
    pub cubics: Vec<Cubic>,
    /// `true` = clockwise. lyon uses winding for hole subtraction.
    pub clockwise: bool,
}

impl Contour {
    pub fn new(start: Point) -> Self {
        Self { start, cubics: Vec::new(), clockwise: true }
    }

    #[inline]
    pub fn cubic_to(&mut self, c1: Point, c2: Point, to: Point) -> &mut Self {
        self.cubics.push(Cubic { c1, c2, to });
        self
    }

    /// Reverse winding in place — turns a fill into a hole and vice-versa.
    pub fn reverse_winding(&mut self) {
        self.clockwise = !self.clockwise;
    }

    /// Axis-aligned bounds, sampling control points (a cheap conservative box
    /// — fine for viewport culling, not for exact bounds).
    pub fn rough_bounds(&self) -> (Point, Point) {
        let mut min = self.start;
        let mut max = self.start;
        let mut acc = |p: Point| {
            min.x = min.x.min(p.x);
            min.y = min.y.min(p.y);
            max.x = max.x.max(p.x);
            max.y = max.y.max(p.y);
        };
        for c in &self.cubics {
            acc(c.c1);
            acc(c.c2);
            acc(c.to);
        }
        (min, max)
    }
}

/// A path is one or more contours.
#[derive(Clone, Debug, Default)]
pub struct Path {
    pub contours: Vec<Contour>,
}

impl Path {
    pub fn new() -> Self {
        Self { contours: Vec::new() }
    }

    pub fn with_contour(mut self, c: Contour) -> Self {
        self.contours.push(c);
        self
    }

    pub fn push(&mut self, c: Contour) {
        self.contours.push(c);
    }

    pub fn is_empty(&self) -> bool {
        self.contours.is_empty()
    }
}

/// The magic constant for approximating a quarter-circle with one cubic
/// Bézier: handle length = radius * k. Used by every rounded shape.
pub const KAPPA: f32 = 0.552_284_75;
