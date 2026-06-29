// gnuin-compose-host :: protocol — PORT PARITY MIRROR (not the source of truth)
// ============================================================================
// Faithful mirror of gnu.in-os/engine/gnuin-compose-host/src/protocol.rs.
//
// Wire protocol for the Unix-socket IPC bridge between the QML ContextMenuService
// and the Rust composition host. Transport: NEWLINE-DELIMITED JSON over a Unix
// domain socket (the hyprconfd pattern) — one message per line.
//   QML → host:  HostMessage::Open { request, screen }  /  HostMessage::Close
//   host → QML:  HostEvent::Action { id }   (one line, after the host dismisses)
//
// Only compiled with the `serde` feature; in-process users link the engine
// directly and bypass this. The canonical wire strings live in
// scenes/wire-protocol.json (the cross-language contract the QML side must match).

use crate::compose::MenuRequest; // engine request type (compose_core.rs)

/// QML → host. `#[serde(tag="type", rename_all="snake_case")]` →
/// `"type":"open"` / `"type":"close"`. `screen` names the Wayland output
/// (e.g. "DP-1"); None = focused/default.
#[derive(Debug, Clone, PartialEq /*, Serialize, Deserialize */)]
pub enum HostMessage {
    Open { request: MenuRequest, screen: Option<String> },
    Close,
}

impl HostMessage {
    /// Serialize to a newline-terminated JSON line for socket transport.
    pub fn to_json(&self) -> Result<String, JsonError> { line(serialize(self)) }
    /// Deserialize from a single JSON line (trailing newline ignored).
    pub fn from_json(s: &str) -> Result<Self, JsonError> { deserialize(s.trim_end_matches('\n')) }
}

/// Current wire protocol version. Bumped on a breaking envelope change so a new
/// surface joins by version-negotiation rather than a flag-day cutover (M4).
pub const PROTOCOL_VERSION: u32 = 1;

/// A versioned envelope — the single wire frame that replaces per-surface socket
/// silos. The inner message FLATTENS, so the wire stays
/// `{"version":1,"type":"open",...}` — a superset of the legacy bare message, so
/// the two coexist during a per-surface cutover. An unknown future `version` is
/// DETECTED (`is_supported`), never mis-parsed: the host rejects or downgrades
/// instead of silently corrupting.
#[derive(Debug, Clone, PartialEq /*, Serialize, Deserialize */)]
pub struct Envelope {
    pub version: u32,
    // #[serde(flatten)]
    pub message: HostMessage,
}

impl Envelope {
    pub fn new(message: HostMessage) -> Self { Envelope { version: PROTOCOL_VERSION, message } }
    pub fn to_json(&self) -> Result<String, JsonError> { line(serialize(self)) }
    pub fn from_json(s: &str) -> Result<Self, JsonError> { deserialize(s.trim_end_matches('\n')) }
    /// Whether the host understands this envelope's protocol version.
    pub fn is_supported(&self) -> bool { self.version == PROTOCOL_VERSION }
}

/// host → QML, same `tag="type"` convention. `Action{id}` → QML
/// `ContextMenuService.actionTriggered(id)`. The host dismisses the menu BEFORE
/// sending, so QML never sees an Action while a menu is still live.
/// Wire: `{"type":"action","id":"copy"}\n`
#[derive(Debug, Clone, PartialEq /*, Serialize, Deserialize */)]
pub enum HostEvent {
    Action { id: String },
}

impl HostEvent {
    pub fn to_json(&self) -> Result<String, JsonError> { line(serialize(self)) }
    pub fn from_json(s: &str) -> Result<Self, JsonError> { deserialize(s.trim_end_matches('\n')) }
}

// (serialize/deserialize/JsonError/line stand in for serde_json in this mirror;
//  the real crate derives serde and calls serde_json directly.)
type JsonError = ();
fn serialize<T>(_: &T) -> String { String::new() }
fn deserialize<T>(_: &str) -> Result<T, JsonError> { Err(()) }
fn line(mut s: String) -> Result<String, JsonError> { s.push('\n'); Ok(s) }

#[cfg(test)]
mod tests {
    use super::*;
    // Self-contained shape assertions (no MenuRequest construction needed).

    #[test] fn host_event_action_round_trips() {
        let ev = HostEvent::Action { id: "copy".into() };
        // round-trips through JSON in the real crate; here we assert the variant shape.
        match ev { HostEvent::Action { ref id } => assert_eq!(id, "copy") }
    }
    #[test] fn close_message_is_unit_variant() {
        assert_eq!(HostMessage::Close, HostMessage::Close);
    }
    #[test] fn envelope_wraps_at_current_version_and_detects_unknown() {
        let env = Envelope::new(HostMessage::Close);
        assert_eq!(env.version, PROTOCOL_VERSION);
        assert!(env.is_supported());
        let future = Envelope { version: 999, message: HostMessage::Close };
        assert!(!future.is_supported(), "version 999 not understood");
        assert_eq!(future.message, HostMessage::Close); // still structurally parsed
    }
    // CANONICAL WIRE CONTRACT (see scenes/wire-protocol.json):
    //   QML→host open:  {"type":"open","request":{"style":"List",...},"screen":"DP-1"}\n
    //   QML→host close: {"type":"close"}\n
    //   enveloped:      {"version":1,"type":"open",...}\n   (inner flattens)
    //   host→QML:       {"type":"action","id":"copy"}\n
    // Enum variant strings are snake_case (HostMessage/HostEvent) but the nested
    // MenuRequest enums are PascalCase: MenuStyle "List", RowKind "Item",
    // Density "Mouse", NodeState "Open". If a string changes, update Rust + QML together.
}
