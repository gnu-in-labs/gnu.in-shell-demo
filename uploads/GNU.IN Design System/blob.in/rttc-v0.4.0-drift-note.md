---
type: research-note
status: active
created: 2026-06-06
owner: gnosis
doc_id: rttc-v040-drift-note
canonical: true
index: true
acl: shared
chunk_version: 1
project: gnuin
tags:
  - research/rttc-shell-spec
  - spec/drift
  - status/active
  - source/spec-review
refs:
  - "[[components/uikit/ContextMenu.rttc]]"
  - "[[components/uikit/ContextMenu.archetypes.rttc]]"
  - "[[components/motion/MotionSpecSheet.rttc]]"
  - "[[components/motion/atoms/README.rttc]]"
  - "[[components/motion/molecules/README.rttc]]"
  - "[[2026-05-16-rttc-shell-design-vs-integration]]"
authors:
  - gnosis
  - gnu.in labs · shell team
design_source: "Context.Spec v0.4.0 · Motion Spec v0.4.0"
role: "Bump RTTC existants de v1 → v0.4.0 · delta structurel"
---

# RTTC Drift Note — Context.Spec v1 → v3.1 (renuméroté v0.4.0)

> **Renumbering (2026-06-08)** — la version dite « v3.1 » dans ce document a été
> renumérotée **v0.4.0** pour suivre le semver du moteur blob.in. Les tables
> ci-dessous gardent l'étiquette historique « v3.1 » (c'est le delta réel qui a
> mené à l'état courant) ; « v3.1 » ≡ « v0.4.0 » partout ici.
>
> Les `.rttc.md` existants dans `components/` ont été écrits contre **Context.Spec v1**
> (2026-05-16). La spec de référence est maintenant à **v0.4.0** (ex-v3.1).
> Ce document capture le delta structurel et met à jour les statuts de gaps.
> À lire en parallèle des fichiers `.rttc.md` existants — il ne les remplace pas.

---

## 1 · Delta structurel v1 → v3.1

### 1.1 Atomes context menu

| v1 | v3.1 | Note |
|----|------|------|
| Nommage `MenuRow`, `MenuShell`, `MenuSection`… | Nommage canonique `GnuRow` (C.01), `GnuShell` (C.09), `GnuSection` (C.10)… | Préfixe `Gnu*` adopté dans l'API surface ◆.5 |
| (non documenté) | **24 atomes C.01–C.24** | +9 atomes vs v1 estimé (density/shape/brand variants explicites) |
| Density : 3 presets implicites | `gnuDensity('mouse'|'comfy'|'touch')` **explicite** avec rowH/fs/iconSize | Tokenisé |
| Shape : 4 presets | `gnuShape('rounded-soft'|'sharp'|'pill'|'cut')` **explicite** avec clipPath | Tokenisé |
| Brand : 3 heaviness variants | `gnuTheme({dark, brand:'heavy'|'medium'|'light'})` **explicite** | Tokenisé |

### 1.2 Molécules

| v1 | v3.1 | Note |
|----|------|------|
| Molécules motion M.01–M.12 (inchangées) | M.01–M.12 **identiques** ✓ | Bien aligné |
| (absent) | **16 molécules context CM.01–CM.16** | Nouveau scope : GnuSection, GnuStrip, GnuIdentityHeader, GnuMascotRow… |
| Total : 12 | Total : 28 (12 motion + 16 context) | — |

### 1.3 Archetypes

| v1 / RTTC existant | v3.1 | Note |
|--------------------|------|------|
| 25 archetypes design (dont radial/nested/tray) | **8 archetypes canoniques R.01–R.08** | Scope décision : les 17 restants sont "design explorations" non shipper-ables goal-2 |
| Couverture QML ≈ 10–30 % | Couverture QML ≈ 10–30 % (inchangé côté runtime) | Le gap s'est creusé — see §2 |
| `ContextMenuService` supporte 2 factories (v2) | 2 factories : `buildEmptySpaceStandard()`, `buildTrayAudio()` | Inchangé |

### 1.4 Motion spec

| v1 | v3.1 | Note |
|----|------|------|
| 15 atomes motion A.01–A.15 | **15 atomes identiques** ✓ | Bien aligné |
| 6 KITs (loading/mascot/controls/notifs/alerts/veille) | **6 KITs identiques** ✓ | Bien aligné |
| (absent) | **Section blob.in** | C++ blob renderer documenté comme proxy SVG dans la spec de référence |

---

## 2 · Statuts de gaps mis à jour

### ContextMenu.rttc — gaps G1–G14

| Gap | Statut v1 | Statut v3.1 |
|-----|-----------|-------------|
| G1 · pas d'`icon` slot | résolu (Goal-2) | ✓ résolu — GnuRow (C.01) a `icon` prop |
| G2 · pas de MaskReveal | moyen | ⚠ toujours open — QML utilise Behavior cascade 160 ms ; design utilise clip-path circle 280 ms. Intentionnel (perf). |
| G3 · pas de density/shape/brand | moyen | ✓ **résolu en v3.1** — density, shape, brand sont explicitement documentés et tokenisés |
| G4 · pas de toggle/slider row | résolu partiel | ✓ résolu — GnuToggle (C.04), GnuSlider (C.05) dans les 24 atomes |
| G5 · pas de sub-label | informatif | ⚠ open — GnuRow supporte `subLabel` dans le design, pas encore en QML |
| G6 · pas de danger style | informatif | ✓ documenté dans C.01 GnuRow `danger: bool` |
| G7 · pas de submenu arrow | moyen | ⚠ open — `hasSubmenu` prop documenté, QML pas de sous-menus |
| G8 · pas de mascot slot | moyen | ✓ **résolu en v3.1** — CM.08 GnuMascotRow est une molécule dédiée |
| G9 · pas de MenuSearch | informatif | ⚠ open |
| G10 · pas de ParticleBurst | informatif | ⚠ open |
| G11 · pas de DitherBg/GrainBg/EdgeRefraction | informatif | ✓ documentés comme overlays optionnels dans les tokens |
| G12 · pas de cutCorner | informatif | ✓ `gnuShape('cut')` explicite en v3.1 |
| G13 · width 304 literal | informatif | ✓ density-driven en v3.1 |
| G14 · Entry animation token | faible | ⚠ open — toujours 160 ms literal |

### ContextMenu.archetypes.rttc — couverture

| Catégorie | v1 | v3.1 |
|-----------|----|------|
| EmptySpace (R.01) | partiel 30 % | ✓ **spécifié complet** — icons, density, shape |
| Widget (R.02) | 0 % | ✓ spécifié — GnuWidgetCard molécule |
| Window/Tile (R.03) | 0 % | ✓ spécifié — GnuTileDiagram molécule |
| Tray · Audio (R.04, R.05) | 0 % | ✓ spécifié — GnuDeviceRow + GnuVolumeSlider |
| Bubble Tree (R.06 ★) | 0 % | ✓ spécifié — molécule BubbleBloom M.12 |
| Launcher (R.07 ✦) | 0 % | ✓ spécifié |
| Nested / Radial | design exploration | ⚠ scoped out de v3.1 — goal-3 |
| **Score runtime** | ~10 % | ~10 % (QML inchangé) |

### MotionSpecSheet.rttc — gaps G1–G9

| Gap | Statut v1 | Statut v3.1 |
|-----|-----------|-------------|
| G1 · pas de `.principles` strip | moyen | ⚠ open — section tokens présente en v3.1 mais pas le strip CSS interactif |
| G2 · pas de `body.paused` toggle | informatif | ⚠ open |
| G3 · pas de debug grid | informatif | ⚠ open |
| G4 · tweaks-panel absent | informatif | ✓ **présent en v3.1** — TweaksPanel intégré dans la Motion Spec |
| G5 · spec line simplifiée | faible | ⚠ open — ease-curve SVG absent |
| G6 · dot indicator partiel | informatif | ⚠ open |
| G7 · tile height 280 vs 360 | faible | ⚠ open |
| G8 · LIVE stamp ✓ | nul | ✓ |
| G9 · grid columns ✓ | nul | ✓ |

---

## 3 · Nouvelles entités v3.1 sans RTTC dans le remote

| Entité | Type | Action recommandée |
|--------|------|--------------------|
| `ContextMenuService` singleton | QML singleton | → Créer `components/services/ContextMenuService.rttc.md` |
| `GnuTheme` resolver (tokens.json → QML/Qt/GPUI) | build-time | → Créer `components/theme/GnuTheme.rttc.md` |
| Alaelestia blob renderer | C++ atoms | → Créer `components/a-laelestia/atoms/Blobs/blobs.rttc.md` |
| 16 molécules CM.01–CM.16 | design molecules | → Étendre `ContextMenu.rttc.md` §2 |
| `MascotMini` dock embed | QML component | → `components/uikit/MascotMini.rttc.md` existe — vérifier alignement v3.1 |

---

## 4 · Action items pour les RTTC existants

```
components/uikit/ContextMenu.rttc.md
  → §2 Nodes : ajouter GnuToggle, GnuSlider, GnuMascotRow, GnuSearch
  → §5.5 : marquer density/shape/brand comme résolus
  → §7 Gaps : update G3, G4, G8, G11, G12, G13

components/uikit/ContextMenu.archetypes.rttc.md
  → §2 : mettre à jour le tableau avec les 8 archetypes canoniques R.01–R.08
  → §5 Couverture : 8 archetypes spec-complets, ~10 % QML
  → Ajouter §6 : note sur le scoping out des nested/radial

components/motion/atoms/README.rttc.md
  → Mettre à jour le header : "Context.Spec v3.1" au lieu de "v1"
  → Ajouter colonne "câblé v3.1" dans la table M §M

components/motion/molecules/README.rttc.md
  → Mettre à jour le header
  → §Couverture : ajouter M.09 EdgeBounce câblé, M.10 IdleBreathe câblé+badge REC v2,
    M.11 ErrorShake câblé, M.12 BubbleBloom en cours (Loader delegate scope)
```

---

## 5 · Schéma delta

```
  Context.Spec v1 (2026-05-16)          Context.Spec v3.1 (2026-06-06)
  ──────────────────────────────         ──────────────────────────────
  ~15 atomes context (implicites)    →   24 atomes C.01–C.24 (nommés Gnu*)
  ~8 molécules context               →   16 molécules CM.01–CM.16
  25 archetypes design               →   8 archetypes canoniques R.01–R.08
  12 molécules motion M.01–M.12     →   12 molécules motion M.01–M.12 ✓
  15 atomes motion A.01–A.15        →   15 atomes motion ✓
  TweaksPanel absent                 →   TweaksPanel intégré ✓
  Alaelestia : non documenté        →   Section dédiée (proxy SVG ↔ C++ blobs)
  ContextMenuService : implicite    →   Board ◆.6 explicite

  QML runtime coverage : ~10 %      →   ~10 % (gap s'est creusé côté design)
  Goal-2 factories wired : 2        →   2 (inchangé — buildEmptySpaceStandard + buildTrayAudio)
```
