// gnosis-bus.js — Gnosis agent-bus client (the CM-7 seam)
// ============================================================================
// A transport-abstracted client for the Gnosis agent bus. The WIRE is real and
// byte-accurate to gnuin-compose-host::protocol (host_protocol.rs):
//   · newline-delimited JSON, one message per line
//   · a versioned Envelope { version, <flattened message> } (tag="type", snake_case)
//   · an unknown `version` is DETECTED (is_supported), never mis-parsed
// The TRANSPORT is swappable. In a browser DC the gnu6 AF_UNIX socket is not
// reachable, so SimTransport (loopback) stands in; SocketTransport is the
// drop-in seam where a host-side ws→unix bridge connects at cutover. Nothing
// above the transport changes when it is swapped — that is the whole point.
//
// Consumed by: Gnu.In-Shell - Atelier.dc.html  (the inférence station + bus inspector)

export const PROTOCOL_VERSION = 1;

// Envelope mirrors host_protocol::Envelope — inner message flattens onto the frame.
export function envelope(message) { return { version: PROTOCOL_VERSION, message }; }
export function frame(env) { return JSON.stringify(env) + "\n"; }      // newline-delimited
export function parseFrame(line) { return JSON.parse(String(line).replace(/\n$/, "")); }

// client → bus (tag="type", snake_case — matches HostMessage convention)
export const Msg = {
  hello: () => ({ type: "hello", client: "atelier" }),
  grant: (capability) => ({ type: "grant_request", capability }),
  infer: (surface, context) => ({ type: "infer", surface, context: context || {} }),
  enrich: (target, kinds) => ({ type: "enrich", target, kinds: kinds || [] }),
};
// bus → client events: { type:"ready_handshake" } | { type:"granted", capability, ttl_s }
//                      | { type:"state", state:"thinking"|"ready" } | { type:"suggest", ... }
//                      | { type:"error", reason }

// ── SimTransport · loopback (stand-in du socket gnu6) ───────────────────────
// Frames in → authored frames out, on the configured latency. This is the
// ~620ms timer of CM-1, promoted to a real protocol loopback. `dataset(surface)`
// supplies the suggest payload so the transport stays content-agnostic.
export class SimTransport {
  constructor({ latencyMs = 620, dataset = () => ({}), enrich = () => [] } = {}) {
    this.kind = "sim";
    this.label = "SimTransport · loopback (stand-in gnu6)";
    this.latencyMs = latencyMs;
    this.dataset = dataset;
    this.enrich = enrich;
    this._on = null;
    this._timers = [];
  }
  onLine(cb) { this._on = cb; }
  _emit(message, delay = 0) {
    const f = frame(envelope(message));
    this._timers.push(setTimeout(() => { if (this._on) this._on(f); }, delay));
  }
  send(line) {
    const m = parseFrame(line).message;
    if (m.type === "hello") { this._emit({ type: "ready_handshake", version: PROTOCOL_VERSION }, 0); return; }
    if (m.type === "grant_request") { this._emit({ type: "granted", capability: m.capability, ttl_s: 300 }, 50); return; }
    if (m.type === "infer") {
      this._emit({ type: "state", state: "thinking" }, 0);
      this._emit({ type: "suggest", surface: m.surface, ...this.dataset(m.surface) }, this.latencyMs);
      this._emit({ type: "state", state: "ready" }, this.latencyMs + 1);
      return;
    }
    if (m.type === "enrich") {
      this._emit({ type: "enrich_state", target: m.target, state: "gathering" }, 0);
      const items = this.enrich(m.target) || [];
      items.forEach((it, i) => this._emit({ type: "enrichment", target: m.target, ...it }, 120 + i * 140));
      this._emit({ type: "enrich_state", target: m.target, state: "done" }, 120 + items.length * 140 + 60);
      return;
    }
  }
  setLatency(ms) { this.latencyMs = ms; }
  dispose() { this._timers.forEach(clearTimeout); this._timers = []; }
}

// ── SocketTransport · the cutover seam ──────────────────────────────────────
// The real binding: a host-side bridge in front of the gnu6 Unix domain socket
// (the gnu.in-os host links the agent bus; a browser cannot open AF_UNIX). This
// is intentionally inert in the DC — it documents exactly where the timer is
// replaced, with no behavioural pretence of a live connection.
export class SocketTransport {
  constructor({ url = "ws://127.0.0.1:6/gnosis" } = {}) {
    this.kind = "socket";
    this.label = "SocketTransport · gnu6 (cutover)";
    this.url = url;
    this._on = null;
  }
  onLine(cb) { this._on = cb; }
  send() {
    throw new Error("SocketTransport: pas de pont gnu6 dans le navigateur — câblage host (host_protocol.rs).");
  }
}

// ── GnosisBus · transport-agnostic client ───────────────────────────────────
export class GnosisBus {
  constructor(transport) {
    this.t = transport;
    this.version = PROTOCOL_VERSION;
    this.state = "disconnected";
    this.caps = {};
    this.wire = [];                 // newest-first ring of {dir, line, t}
    this._subs = [];
    this.t.onLine((line) => this._recv(line));
  }
  subscribe(cb) { this._subs.push(cb); return () => { this._subs = this._subs.filter((x) => x !== cb); }; }
  _log(dir, line) { this.wire.unshift({ dir, line: String(line).replace(/\n$/, ""), t: Date.now() }); this.wire = this.wire.slice(0, 8); }
  _send(message) { const line = frame(envelope(message)); this._log("▸", line); this.t.send(line); }
  _recv(line) {
    this._log("◂", line);
    const env = parseFrame(line);
    if (env.version !== this.version) { this._fan({ type: "error", reason: "version " + env.version + " non supportée" }); return; }
    this._fan(env.message);
  }
  _fan(message) {
    if (message.type === "ready_handshake") this.state = "connected";
    if (message.type === "granted") this.caps[message.capability] = message.ttl_s;
    this._subs.forEach((cb) => cb(message));
  }
  connect() { this.state = "connecting"; this._send(Msg.hello()); }
  grant(capability) { this._send(Msg.grant(capability)); }
  infer(surface, context) { this._send(Msg.infer(surface, context)); }
  enrich(target, kinds) { this._send(Msg.enrich(target, kinds)); }
  dispose() { this.t.dispose && this.t.dispose(); }
}
