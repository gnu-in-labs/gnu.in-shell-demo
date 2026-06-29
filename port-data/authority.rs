// gnuin-shell :: service authority & delegation (port target)
// ============================================================================
// The model behind the Control Center "Services" page. Its point is PROPER
// DELEGATION OF AUTHORITY: every service has exactly ONE owning authority, and
// a privileged action never runs under ambient authority — it is delegated to
// the owning authority through an explicit authorization step (polkit-style),
// which may be remembered for a TTL. This file owns the decision logic; the UI
// only renders it and raises the prompt.
//
//   Authority        — Session (the user agent, held permanently),
//                       System (root/systemd), Compositor (compose-core).
//   Service          — single-owner; an action needs the owner's authority.
//   authorize(...)   — Granted | NeedsDelegation(authority) | (deny is a UI act)
//   GrantTable       — remembered delegated authorities with expiry.

#![allow(dead_code)]

/// A single authority. `Session` is held by the requesting agent at all times;
/// the others must be delegated.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Authority {
    Session,
    System,
    Compositor,
}

impl Authority {
    pub fn label(self) -> &'static str {
        match self { Authority::Session => "Session", Authority::System => "System", Authority::Compositor => "Compositor" }
    }
    /// Session authority is ambient (always held); the rest require delegation.
    pub fn is_ambient(self) -> bool {
        matches!(self, Authority::Session)
    }
}

/// Blast radius of an action — reused from the context-menu risk vocabulary.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Risk { Observe, Local, System }

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ServiceStatus { Running, Healthy, Stopped, DependencyFailed }

impl ServiceStatus {
    pub fn is_up(self) -> bool { matches!(self, ServiceStatus::Running | ServiceStatus::Healthy) }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Action { Start, Stop, Restart }

/// A single managed service (single-owner).
#[derive(Clone, Debug)]
pub struct Service {
    pub id: &'static str,
    pub owner: Authority,
    pub risk: Risk,
    pub status: ServiceStatus,
}

/// The outcome of asking to run an action: either we already hold the needed
/// authority (run now), or we must delegate to / prompt the owner first.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Decision {
    Granted,
    NeedsDelegation(Authority),
}

/// Remembered delegated authorities (authority -> expiry in epoch-ms).
#[derive(Clone, Debug, Default)]
pub struct GrantTable {
    grants: std::collections::HashMap<&'static str, u64>,
}

impl GrantTable {
    /// Whether `authority` is currently held: Session always; others only while
    /// a remembered grant is unexpired.
    pub fn holds(&self, authority: Authority, now_ms: u64) -> bool {
        if authority.is_ambient() {
            return true;
        }
        self.grants.get(authority.label()).map_or(false, |&exp| exp > now_ms)
    }

    /// Remember a delegated authority until `now_ms + ttl_ms`.
    pub fn grant(&mut self, authority: Authority, now_ms: u64, ttl_ms: u64) {
        if !authority.is_ambient() {
            self.grants.insert(authority.label(), now_ms + ttl_ms);
        }
    }

    pub fn revoke(&mut self, authority: Authority) {
        self.grants.remove(authority.label());
    }

    /// Seconds remaining on a delegated grant (0 if none / ambient / expired).
    pub fn ttl_secs(&self, authority: Authority, now_ms: u64) -> u64 {
        if authority.is_ambient() { return 0; }
        match self.grants.get(authority.label()) {
            Some(&exp) if exp > now_ms => (exp - now_ms + 999) / 1000,
            _ => 0,
        }
    }
}

/// Decide how an action on `svc` proceeds given currently-held authority.
/// Pure: it does not mutate state or execute — the caller runs the action on
/// `Granted`, or raises an authorization prompt on `NeedsDelegation`.
pub fn authorize(svc: &Service, grants: &GrantTable, now_ms: u64) -> Decision {
    if grants.holds(svc.owner, now_ms) {
        Decision::Granted
    } else {
        Decision::NeedsDelegation(svc.owner)
    }
}

/// The status a service lands in after an action (Stop → Stopped; otherwise up,
/// preserving the Healthy flavour for the portal).
pub fn status_after(svc: &Service, action: Action) -> ServiceStatus {
    match action {
        Action::Stop => ServiceStatus::Stopped,
        _ if svc.id == "portal" => ServiceStatus::Healthy,
        _ => ServiceStatus::Running,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const TTL: u64 = 300_000;

    fn svc(owner: Authority) -> Service {
        Service { id: "x", owner, risk: Risk::System, status: ServiceStatus::Running }
    }

    #[test] fn session_actions_are_granted_without_delegation() {
        let g = GrantTable::default();
        assert_eq!(authorize(&svc(Authority::Session), &g, 1000), Decision::Granted);
    }

    #[test] fn privileged_actions_need_delegation() {
        let g = GrantTable::default();
        assert_eq!(authorize(&svc(Authority::System), &g, 1000), Decision::NeedsDelegation(Authority::System));
        assert_eq!(authorize(&svc(Authority::Compositor), &g, 1000), Decision::NeedsDelegation(Authority::Compositor));
    }

    #[test] fn remembered_grant_lets_action_through_until_expiry() {
        let mut g = GrantTable::default();
        g.grant(Authority::System, 1_000, TTL);
        assert_eq!(authorize(&svc(Authority::System), &g, 1_000 + 10), Decision::Granted);
        // ...but not after it expires
        assert_eq!(authorize(&svc(Authority::System), &g, 1_000 + TTL + 1), Decision::NeedsDelegation(Authority::System));
    }

    #[test] fn revoke_drops_authority_immediately() {
        let mut g = GrantTable::default();
        g.grant(Authority::Compositor, 0, TTL);
        assert!(g.holds(Authority::Compositor, 100));
        g.revoke(Authority::Compositor);
        assert!(!g.holds(Authority::Compositor, 100));
    }

    #[test] fn ttl_counts_down_and_session_is_zero() {
        let mut g = GrantTable::default();
        g.grant(Authority::System, 0, 5_000);
        assert_eq!(g.ttl_secs(Authority::System, 1_000), 4); // ceil(4000/1000)
        assert_eq!(g.ttl_secs(Authority::Session, 1_000), 0); // ambient, never delegated
    }

    #[test] fn status_after_actions() {
        let portal = Service { id: "portal", owner: Authority::Compositor, risk: Risk::System, status: ServiceStatus::Healthy };
        assert_eq!(status_after(&portal, Action::Restart), ServiceStatus::Healthy);
        assert_eq!(status_after(&svc(Authority::System), Action::Start), ServiceStatus::Running);
        assert_eq!(status_after(&svc(Authority::System), Action::Stop), ServiceStatus::Stopped);
        assert!(!ServiceStatus::Stopped.is_up());
    }
}
