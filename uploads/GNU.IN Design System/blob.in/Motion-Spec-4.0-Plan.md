---
type: planning-note
status: active
created: 2026-06-06
owner: gnosis
doc_id: motion-spec-4.0-plan
canonical: true
index: true
acl: shared
chunk_version: 1
project: gnuin
supersedes: "[[rttc-v0.14.0-drift-note]]"
tags:
  - planning/motion-spec
  - arch/blob-in
  - arch/rust-migration
  - status/active
refs:
  - "[[components/blob.in/atoms/Blobs]]"
  - "[[motion-alaelestia.jsx]]"
  - "[[rttc-v0.14.0-drift-note]]"
  - "[[components/motion/MotionSpecSheet.rttc]]"
authors:
  - gnosis
  - gnu.in labs · shell team
role: "Plan Motion Spec 4.0 · résolution blob.in · migration C++ → Rust/cxx"
---

# Motion Spec 4.0 — Plan & Changelog

> **Résolution à propager** : adapter la Motion Spec pour le moteur **blob.in**,
> et migrer blob.in **C++ → Rust (via cxx)** — en gardant le C++ comme
> **second mini-moteur appelé le moins souvent possible**.
>
> **Non-négociables** : ① qualité visuelle ② versatilité des composants
> ③ réactivité. **Objectif** : maximiser la surface Rust (~90 % LoC).

---

## 0 · Changelog

> Ordre anti-chronologique. Chaque entrée = une décision ou un livrable daté.
> Ce bloc est la **mémoire vive** du plan — on l'append, on ne le réécrit pas.

### 2026-06-08 · 4.0-P5-FOLLOW + Q6 · PROTOCOLES MANUELS + BINDINGS RÉACTIFS
- **R7 · Frame budget** — crate `blobin-bench/` (Criterion) avec deux benches :
  `frame_budget` (cost de `Engine::tick` par état + `BubbleBloom::tick` par
  nombre de feuilles) et `scheduler_throughput` (1/4/8/16 engines, séquentiel
  vs `--features threaded-solver`). Protocole signé dans
  `tools/r7-frame-budget.md` : reference box gelée, baseline v3.1 committée,
  budget de régression ≤ 5/8/10 %.
- **R8 · Shader parity** — protocole `tools/r8-shader-parity.md` : run
  software-RHI (gate strict : maxΔ ≤ 4, ≤1 % pixels, SSIM ≥ 0.99) + run
  hardware (informatif, tolerances relaxées). Le binaire `render_goldens` est
  un placeholder jusqu'à provisioning d'un runner CI avec RHI logiciel.
- **R9 · Qt-5 fallback** — `tools/r9-qt5-fallback.md` : box gelée (Debian 12
  + Qt 5.15 LTS), matrice de 8 smokes (boot, transitions, veille longue,
  bloom open/close, resize, theme swap, rapid state changes). Toute défaillance
  bloque la bascule rust-default.
- **R10 · Dogfood** — `tools/r10-dogfood.md` : 14 jours consécutifs avec
  `BLOBIN_BACKEND=rust`, log quotidien append-only (`r10-dogfood-log.jsonl`),
  3 classes de machines minimum, reset complet si P0/P1.
- **Q6 · Bindings réactifs cxx-qt** — crate `blobin-cxxqt/` parallèle à
  `blobin-qt` (jamais en remplacement). Deux QObject :
  - `Mascot` — `Q_PROPERTY` sur `state` (QString), `size`, `tolerance`, `cold` ;
    signal `cooled()` quand le moteur passe froid. QML : `mascot.state =
    "listening"` et redraw automatique.
  - `Bloom` — `Q_PROPERTY` sur `open`, `leaves`, `ring`, `stagger`,
    `bubble_size`, `cold` ; signaux `bloomed()` / `retracted()`.
  Module QML enregistré sous `blob.in.qml 0.4`. `tools/no-unsafe.sh` (R6)
  étendu : les modules cxx-qt sont des frontières FFI au même titre que
  `ffi.rs`, le reste reste safe Rust.
- **Workspace** — `blobin-bench` et `blobin-cxxqt` membres du Cargo workspace ;
  `just bench` et `just cxxqt` ajoutés ; tableau `readiness.md` mis à jour
  (status `protocol committed` pour R7–R10).

### 2026-06-08 · 4.0-M.12 · BUBBLEBLOOM · PREMIÈRE RECETTE RADIALE
- **Livré** — `blobin-core/src/bloom.rs` : `BubbleBloom`, la recette signature
  ★ (R.04). Premier scene multi-blob **non-mascot** du moteur : un hub au
  curseur + N bulles-feuilles qui éclosent sur un anneau, chacune sur un spring
  `mspring::WOBBLY` avec un **stagger** par bulle, reliées au hub par des
  threads coniques dont l'alpha suit le bloom. Aucun panneau — que des blobs
  et des lignes.
- **Réemploi total** — `SuperBlob` par bulle, `Group` pour les placer, `Spring`
  pour le bloom élastique (overshoot conservé = pop), `tessellate::fill` +
  quad de ligne, le tout batché par le même `Mesh::append` que l'engine mascot.
- **Sémantique froid** — contrairement au mascot, le radial est de l'UI
  transitoire : il ne respire pas → `is_cold()` propre quand ouvert+éclos ou
  fermé+rétracté. Le host coupe les frames.
- **Bridge** — `BloomHandle` exposé via `ffi.rs` (bloom_new/open/close/tick/
  is_cold/vertices/indices). Un handle par menu radial.
- **Tests** — `bloom.rs` : collapse initial, bloom→settle, stagger (1ère
  devance la dernière), close→rétraction, scale. Géométrie validée
  visuellement (hub + 6 feuilles + threads).
- **État** — la dernière capacité moteur manquante est livrée. blob.in couvre
  désormais mascot **et** recettes radiales. Reste P5 manuel (R7–R10) et le
  recolorage per-instance des bulles (le contrat géométrie est figé).

### 2026-06-08 · 4.0-P5 · READINESS + RENUMBERING 0.14.0
- **Livré** — `blob.in/readiness.md` + `tools/readiness.sh` : gate P5
  exécutable. 10 gates — R1–R6 **auto** (CI), R7–R10 **manuels** signés. Le
  script lance les auto, liste les manuels comme `MANUAL` (jamais de pass
  silencieux), exit non-zéro si un auto échoue.
- **Livré** — `tools/no-unsafe.sh` (gate R6) : `unsafe` interdit hors `ffi.rs`.
- **Contrat bascule** — défaut `BLOBIN_BACKEND=rust` seulement quand R1–R10
  verts + dogfood tenu. Rollback = `BLOBIN_BACKEND=cpp` (env, sans rebuild) ;
  le C++ n'est jamais supprimé (oracle de parité, plan §6).
- **Renumbering** — la spec passe de **v3.1 → v0.14.0** pour suivre le semver du
  moteur blob.in (4.0 / P-series). Branding v3.1 **purgé** des deux specs
  (Motion + Context), entrées de changelog historiques conservées. Artefact
  print v3.1 obsolète supprimé ; Context Spec renommé en v0.14.0.
- **Visuel** — Motion Spec : board `∞.8 · Readiness` (échelle P0→P5 + grille
  R1–R10 + contrat bascule/rollback) ; changelog `◆.5` bumpé avec l'entrée
  v0.14.0. Cover + footer en v0.14.0.
- **État** — P5 ouvert : R1–R6 verts, R7–R10 en attente de signature. La 4.0
  est **complète côté code** ; reste la validation terrain (dogfood) et les
  recettes radiales M.12 (hors-scope moteur de base).

### 2026-06-08 · 4.0-P4 · POOL SOLVEUR · BASCULE BACKEND · GARDE LoC
- **Livré** — `blobin-core/src/pool.rs` : `Scheduler` multi-engine. Le host
  possède UN scheduler, batch-tick tous les blobs (mascot + bulles M.12 +
  pills notif) **hors thread Qt**. Avec `--features threaded-solver`, tick en
  parallèle sur rayon ; séquentiel sinon. Déterministe (fixed dt → résultat
  identique parallèle/séquentiel), donc parité golden préservée. Décision Q2.
- **Livré** — `blobin-core/src/backend.rs` : `Backend::from_env()` lit
  `BLOBIN_BACKEND=rust|cpp` (défaut **rust**). Le C++ devient fallback / oracle
  de parité (plan §6). Exposé au shim via `backend_from_env()`.
- **Livré** — bridge `ffi.rs` étendu : `SchedulerHandle` (add/remove/
  set_state/set_size/tick_all→ids dirty/all_cold/active + buffers par id) et
  `backend_from_env`. L'API single-engine reste pour les items mono-blob.
- **Mesuré** — shim C++ = **205 LoC code** (item 137 + material 68), sous le
  budget 300. Garde-fou `tools/loc-guard.sh` + `just loc` → échec CI si > 300.
- **Sémantique froid clarifiée** — Veille passe à wobble 0 (sommeil = immobile)
  donc l'engine devient *froid* et le host coupe les frames ; idle/listening/
  transmit respirent et ne refroidissent jamais (mascot vivant). Tests
  `tests/scene.rs` couvrent les deux régimes + quiescence.
- **CI** — `just ci` = check-tokens + test + test-threaded + loc + parity.
- **État** — P4 complet. Reste **P5** : dogfood 2 sem, zéro régression Qt 5
  fallback, readiness ◇.6 verte, défaut `BLOBIN_BACKEND=rust` en prod.

### 2026-06-08 · 4.0-P3 · PARITÉ MATIÈRE
- **Livré** — `blobin-core/src/raster.rs` : rasteriseur CPU de référence,
  miroir ligne-à-ligne de `blob.frag` (`eval_fragment`). Oracle partagé
  Rust ↔ shader, sans GPU.
- **Livré** — `blobin-core/src/diff.rs` : `pixel_diff` (gate dur : max-delta +
  fraction de pixels hors seuil) **+** `ssim` (signal perceptuel). Décision Q4
  implémentée.
- **Livré** — `blobin-golden/` : crate harness. Pour chaque état mascot, rend
  le matériau via le raster Rust et compare au PNG golden. Gate : max-delta ≤ 4,
  ≤ 1 % de pixels hors seuil ; plancher SSIM ≥ 0.99.
- **Livré** — 4 goldens PNG (idle/listening/transmit/veille) + planche contact,
  produits par un **oracle JS indépendant** (port exact de `eval_fragment`).
  Agreement Rust↔JS = preuve de parité.
- **Bug attrapé par P3** — le gradient *remplaçait* la couleur de base au lieu
  de la sublimer (voile composité sur la base, pondéré par son alpha). Corrigé
  des deux côtés : `raster.rs` **et** `blob.frag`, en miroir. Sémantique
  opacité aussi nettoyée (appliquée une seule fois, plus de opacity² latent).
- **Livré** — `blob.in/gen/` : `gnu_theme.h` + `gnu_theme.gpui.rs` réellement
  générés depuis tokens.json. `GnuTheme.qml` conservé en opt-in (`just tokens-qml`).
  `gnu_theme.dart` supprimé (Flutter retiré du périmètre).
- **Tooling** — `just goldens` (régénère), `just parity` (gate CI).
- **État** — P3 complet. Reste P4 (pool solveur par défaut, C++ < 300 LoC
  mesuré, bascule `BLOBIN_BACKEND=rust`) et P5 (dogfood + readiness).

### 2026-06-06 · 4.0-P2 · BOUCLE TOKENS FERMÉE
- **Livré** — `blob.in/tokens.json` : source unique de vérité (motion + color).
- **Livré** — `blob.in/blobin-gen/` : générateur réel (serde) qui lit
  tokens.json et émet — **Rust/C++ first** : `--rust` (blobin_tokens.rs · consts
  du solveur), `--header` (gnu_theme.h constexpr), `--gpui` (gnu_theme.gpui.rs ·
  GPUI Rgba + motion shims). `--qml` conservé en opt-in uniquement (surfaces Qt).
  Flutter/Dart supprimé. Tests unitaires (camelCase, ARGB).
- **Vérifié** — `tokens.rs` régénéré depuis tokens.json est **byte-identique**
  à la version écrite à la main : la colonne « token » des tables motion pointe
  désormais vers une const réellement générée, plus recopiée. Drift v1→v3.1
  **fermé** au niveau du code (plan §7).
- **Livré** — workspace Cargo (`blob.in/Cargo.toml`) + `justfile` :
  `just tokens` régénère tout · `just check-tokens` est le **garde-fou CI**
  (diff tokens.rs vs tokens.json → échec si stale).
- **État** — P2 complet (solveurs + tokens unifiés + garde anti-drift).
  Prochain : P3 (parité matière vs oracle C++), génération effective des
  fichiers de thème dans `gen/`, et harness golden-test (pixel + SSIM).

### 2026-06-06 · 4.0-P0→P2 · LIVRAISON CODE (au-delà du scaffold)
- **Livré** — `blob.in/blobin-core/` : moteur Rust complet et testé.
  - `path.rs` · primitive cubic-Bézier
  - `blob.rs` · trait `Blob` + `RectBlob` (4 rayons Bézier) + `SuperBlob`
    (superellipse Catmull-Rom + wobble organique) + `Inverted<B>` (combinateur)
  - `group.rs` · composition affine 2D (glam)
  - `tessellate.rs` · Path → mesh via **lyon**, tolérance adaptative
  - `tokens.rs` · MDUR/MEASE/MSPRING (artefact généré depuis tokens.json)
  - `solve.rs` · easing cubic-Bézier (Newton-Raphson) + spring semi-implicite
  - `material.rs` · couleur/gradient/noise + POD `MaterialParams`
  - `state.rs` · machine idle/listening/transmit/veille (springs → silhouette)
  - `engine.rs` · scène vivante, batch 1 draw call, `is_cold()` throttle
  - `ffi.rs` · `#[cxx::bridge]` flat-buffer (`FfiVertex`/`FfiMaterial` repr(C))
  - `tests/` · unitaires par module + `lifecycle.rs` intégration sans C++
- **Livré** — `blob.in/blobin-qt/` : shim C++ de rendu (< 300 LoC visé).
  - `blobin_item.*` · `QQuickItem` · `updatePaintNode` → memcpy QSGGeometry
  - `blobin_material.*` · `QSGMaterial` → shader RHI
  - `shaders/blob.{vert,frag}` · flat + radial + value-noise
  - `CMakeLists.txt` · Corrosion (cargo→CMake) + qt_add_shaders
  - `qml/MascotView.qml` · harness drop-in
- **État** — couvre P0 (pont), P1 (géométrie 5 atomes), P2 (solveurs + tokens).
  Reste P3 (parité matière vs oracle C++), P4 (pool solveur par défaut +
  C++ < 300 LoC mesuré), P5 (bascule défaut rust). `cxx-qt` réactif encore
  remplacé par des propriétés Qt simples.
- **Note build** — code écrit pour `cargo test` (core, sans toolchain C++) et
  `cmake` (plugin Qt complet). Non compilé dans cet environnement de design.

### 2026-06-06 · 4.0-α1 · DÉCISIONS §8 TRANCHÉES + RENAME
- **Décision A5** — **rename `alaelestia` → `blob.in`**. Crate `blobin-core`,
  shim `blobin-qt`, `BlobInItem`/`BlobInMaterial`, repo `gnu-in-labs/blob.in`
  (remplace `gnuin-alaelestia-component`), chemin embarqué `components/blob.in/`.
- **Q1 résolu** — tessellation via **`lyon`**.
- **Q2 résolu** — solveur sur **pool Rust dédié** (hors thread Qt) dès que
  la parité P2 est verte (pas en P2, bascule en P4).
- **Q3 résolu** — **Qt RHI (Vulkan/Metal/D3D) primaire + GL legacy fallback**.
- **Q4 résolu** — **pixel image-diff = gate dur CI** ; **SSIM perceptuel = signal
  complémentaire** (n'échoue pas seul, alerte sur dérive).
- **Q5 résolu** — versioning : semver `blobin-core` + tag namespace QSG (cf. A5).
- **Q6 résolu** — **hybride** : `cxx` brut sur le chemin chaud géométrie
  (buffer plat, zéro QObject) ; **`cxx-qt`** seulement pour la surface réactive
  (états + propriétés QML exposées au tweaks-panel).

### 2026-06-06 · 4.0-α0 · OUVERTURE DU PLAN
- **Décision A1** — blob.in devient le moteur de référence des formes
  organiques. La Motion Spec doit le refléter (∞.6 existant → ∞.7 archi 4.0).
- **Décision A2** — migration cible **Rust/cxx**. Le calcul (géométrie,
  tessellation, solveurs spring/easing, matériaux, états) passe en Rust.
- **Décision A3** — le C++ reste, réduit à un **shim de scène-graphe Qt**
  (`updatePaintNode` + upload GPU). « Second mini-moteur appelé le moins
  souvent possible » = il ne s'exécute qu'à la phase sync de Qt, zéro logique.
- **Décision A4** — `tokens.json` devient aussi la source des tokens motion
  Rust (génère `blobin_tokens.rs`). Ferme la boucle de drift v1→v3.1.
- **À trancher** — voir §8 (cibles RHI, thread du solveur, golden-test harness).

<!-- prochaines entrées ici -->

---

## 1 · Pourquoi 4.0 — la résolution

La v3.1 a **documenté** blob.in (board ∞.6) mais comme un *proxy SVG* : la
spec décrit des formes que le runtime rend en C++, sans que la spec connaisse
le moteur. Trois problèmes :

1. **Drift d'autorité** — le C++ blob.in est la vérité visuelle, mais la
   spec parle SVG. Deux représentations divergentes de la même forme.
2. **Coût de modification** — toucher une forme = éditer du C++ Qt, recompiler,
   re-tester. Pas de séparation calcul/rendu.
3. **Plafond de réactivité** — la logique d'animation vit sur le thread Qt
   principal (C++), couplée au scène-graphe.

**4.0 résout les trois** en déplaçant *le calcul* en Rust et en ne laissant à
Qt/C++ que *le rendu*. La spec 4.0 décrit alors le **contrat Rust** (tokens,
solveurs, paramètres) — qui est exactement ce que le runtime exécute. Plus de
proxy : la spec et le moteur lisent la même source.

---

## 2 · Les trois non-négociables → comment 4.0 les tient

| Contrainte | Risque migration | Comment 4.0 le préserve (ou l'améliore) |
|---|---|---|
| **① Qualité visuelle** | Tessellation Rust ≠ pixel-identique au C++ | Le **chemin GPU ne change pas** (même QSG, mêmes shaders RHI). Seul le *générateur* de géométrie bouge. Tessellation = paramètre Rust → on peut **dépasser** la finesse C++ (tessellation adaptative bon marché). Garde-fou : golden-image diff < 1 px par atome (gate de chaque phase). |
| **② Versatilité** | Hiérarchie de classes C++ → traits Rust, perte d'API ? | **Gain net.** `trait Blob { fn path(&self, t: f32) -> Path }` compose mieux que l'héritage `QQuickItem`. Nouveau type de forme = nouveau `impl`, **zéro recompile Qt**. Les 5 atomes deviennent 5 impls d'un trait commun + combinateurs. |
| **③ Réactivité** | FFI cxx ajoute une frontière par frame | La frontière est traversée **une fois par frame sale**, avec un buffer plat (memcpy). Le solveur spring/easing tourne en Rust **hors du thread Qt** (pool optionnel) → le main-thread Qt ne fait plus que l'upload. Budget frame **libéré**, pas chargé. |
| **Maximiser Rust** | Qt impose du C++ irréductible | On mesure : cible **≥ 90 % LoC en Rust**. Le C++ irréductible (cf. §4) tient en **< 300 lignes** : un `QQuickItem` générique + un `QSGMaterial`. Tout le reste — géométrie, anim, états, matériaux — Rust. |

---

## 3 · Architecture cible — où passe la frontière

```
┌─────────────────────────────────────────────────────────────┐
│  blobin-core   (crate Rust — LE moteur, ~90% du code)    │
│  ───────────────────────────────────────────────────────────│
│  blob.rs        formes : superellipse / rect coins-Bézier /  │
│                 metaball / inverted — un trait `Blob`        │
│  tessellate.rs  Path → (Vec<Vertex>, Vec<u16>) · lyon/custom │
│  solve.rs       spring + easing · tokens GnuinMotion en const│
│  material.rs    couleur / opacité / gradient stops / noise   │
│  group.rs       transforms 2D affine (glam) · composition    │
│  state.rs       machine idle/listening/transmit/veille→target│
│  ffi.rs         #[cxx::bridge] — surface FFI minimale        │
└───────────────┬─────────────────────────────────────────────┘
                │  cxx bridge (frontière unique, 1×/frame sale)
                │  Rust→C++ : Vec<Vertex> flat, Vec<u16>, MatParams
                │  C++→Rust : tick(id,dt) · set_state(id,s) · viewport
┌───────────────┴─────────────────────────────────────────────┐
│  blobin-qt    (shim C++ — SECOND mini-moteur, <300 LoC)  │
│  ───────────────────────────────────────────────────────────│
│  BlobInItem : QQuickItem                                 │
│    updatePaintNode()  ← SEUL chemin chaud · appelle Rust,    │
│                          upload QSGGeometryNode, return       │
│  BlobInMaterial : QSGMaterial  (params depuis Rust)      │
│  shader RHI (.qsb)    ← données, pas de logique              │
└──────────────────────────────────────────────────────────────┘
                │
                ▼  Qt Scene Graph → GPU (inchangé vs v3.1)
```

**Principe directeur** : le C++ est *réactif, pas proactif*. Il ne décide
rien. Il se réveille quand Qt déclare un nœud sale, demande à Rust « donne-moi
les triangles », les copie, rend la main. Toute l'intelligence — quand animer,
comment interpoler, quelle forme à `t` — est en Rust.

---

## 4 · Ce qui migre vs ce qui reste — par atome

| Atome (C++ actuel) | → Rust (blobin-core) | Reste C++ | Note |
|---|---|---|---|
| `BlobShape` (16 KB) | `blob.rs` trait + compose | — | **100 % Rust.** Le plus gros fichier = le plus gros gain. |
| `BlobRect` (8 KB) | `blob.rs::RectBlob` (4 rayons Bézier) | — | 100 % Rust. |
| `BlobInvertedRect` (5.5 KB) | `blob.rs::Inverted<RectBlob>` | — | 100 % Rust — combinateur, pas une classe. |
| `BlobGroup` (3 KB) | `group.rs` (glam affine) | — | 100 % Rust. |
| `BlobMaterial` (3.5 KB) | `material.rs` (params) | `QSGMaterial` binding | **Split** : math des params en Rust ; le `QSGMaterialShader` (GLSL→.qsb) reste data côté Qt. |
| *(scène-graphe)* | — | `BlobInItem::updatePaintNode` | **Irréductible.** L'API QSG est C++. C'est le « second moteur ». |
| *(enregistrement QML type)* | — | `qmlRegisterType` 1 ligne | Irréductible. |

**Bilan** : 4 atomes → 100 % Rust. 1 atome (Material) → split, math en Rust.
Le C++ résiduel = 1 item générique + 1 material + 1 ligne d'enregistrement.

---

## 5 · Plan de migration par phase

> Chaque phase ferme une **gate de parité visuelle** (golden-diff < 1 px) avant
> la suivante. Pas de big-bang : le runtime reste shippable à chaque étape via
> un flag `BLOBIN_BACKEND=cpp|rust`.

| Phase | Code | Livrable | Gate |
|---|---|---|---|
| **P0 · Pont** | scaffold `blobin-core` + `#[cxx::bridge]` ; porter **BlobRect** seul | crate Rust qui build, 1 atome traversant cxx | golden-diff BlobRect < 1 px · build CI 3 plateformes |
| **P1 · Géométrie** | `blob.rs` + `tessellate.rs` pour les 5 atomes ; shim C++ générique | tous les atomes rendus via Rust, anim encore C++ | parité visuelle statique 100 % · LoC Rust ≥ 50 % |
| **P2 · Solveurs** | `solve.rs` (spring/easing) ; `blobin_tokens.rs` généré depuis `tokens.json` | animation pilotée Rust ; tokens unifiés design↔runtime | M.01–M.12 rejouées · courbes identiques au 1/100e · LoC ≥ 70 % |
| **P3 · Matériaux** | `material.rs` ; C++ ne garde que le `QSGMaterialShader` | gradient/noise/opacité calculés Rust | parité gradient + noise · LoC ≥ 82 % |
| **P4 · États + réactivité** | `state.rs` ; suppression logique C++ ; solveur sur thread Rust | 4 états mascot + radials en Rust ; C++ < 300 LoC | budget frame ≤ v3.1 · LoC ≥ 90 % · `cpp` backend devient fallback |
| **P5 · Bascule** | défaut `BLOBIN_BACKEND=rust` ; C++ = fallback documenté | Rust par défaut, C++ « second moteur » | dogfood 2 sem · zéro régression · gate readiness verte |

**Estimation** : P0–P2 = cœur de valeur (géométrie + tokens unifiés). P3–P5 =
consolidation. Le C++ n'est jamais supprimé — il devient le `cpp` backend de
secours, compilable, appelé seulement si `rust` indisponible (plateforme exotique,
debug de parité).

---

## 6 · Pourquoi garder le C++ du tout (le « second mini-moteur »)

Trois raisons de **ne pas** supprimer le C++, conformes à ta consigne :

1. **Qt impose un shim C++** — le scène-graphe (`QSGGeometryNode`,
   `QSGMaterial`) n'a pas d'API Rust native. Un minimum de C++ est *structurel*,
   pas un choix. Autant le garder propre et minimal.
2. **Fallback de parité** — pendant la migration, `BLOBIN_BACKEND=cpp`
   est l'oracle des golden-tests. On compare Rust *contre* C++ à chaque gate.
3. **Plateformes exotiques** — si une cible n'a pas de toolchain Rust mûre,
   le `cpp` backend reste compilable. Appelé « le moins souvent possible » =
   jamais en production sur les plateformes principales, mais présent.

> **Règle 4.0** : tout nouveau code de forme/anim/matériau s'écrit en Rust.
> Le C++ est **gelé** sauf le shim QSG. Aucune feature ne s'ajoute côté C++.

---

## 7 · Propagation des tokens — la pièce maîtresse

C'est ce qui ferme le drift documenté dans `rttc-v0.14.0-drift-note.md` :

```
tokens.json   (source unique — Rust/C++ first; Flutter supprimé; QML opt-in)
     │  build-time codegen
     ├──→ blobin_tokens.rs            (durées, courbes — Rust solver PRIMARY)
     ├──→ gnu_theme.h                 (C++ constexpr PRIMARY)
     ├──→ gnu_theme.gpui.rs           (GPUI Rgba + motion shims PRIMARY)
     └──→ [GnuTheme.qml]             (Qt/Quickshell — opt-in seulement)
              │
              ▼
        solve.rs lit MDUR/MEASE en const Rust
              │
              ▼
        la Motion Spec (board) lit le MÊME tokens.json
        ⇒ spec et runtime ne peuvent plus diverger
```

Conséquence directe : la colonne « token » des tables motion (A.01–A.15,
M.01–M.12) devient **exécutable** — elle pointe vers une const Rust réelle,
plus vers une valeur recopiée à la main.

---

## 8 · Décisions tranchées (2026-06-06)

| # | Question | **Résolution** | Implication |
|---|---|---|---|
| Q1 | Crate de tessellation | **`lyon`** | Path→triangles mûr et testé. Budget binaire accepté ; pas de tessellateur maison à maintenir. |
| Q2 | Thread du solveur | **pool Rust dédié** | Spring/easing hors thread Qt → le main-thread ne fait plus que l'upload. Câblé en P4 (après parité P2 sur main-thread). |
| Q3 | Cibles RHI | **Qt RHI (Vulkan/Metal/D3D) primaire + GL legacy fallback** | On suit la couche RHI de Qt ; GL legacy reste compilable pour vieux GPU. Pas de couche graphique maison. |
| Q4 | Harness golden-test | **pixel image-diff = gate dur CI · SSIM perceptuel = complément** | Le pixel-diff < 1 px bloque le merge ; le SSIM alerte sur dérive perceptuelle sans bloquer seul. |
| Q5 | Versioning | **semver `blobin-core` + tag namespace QSG** | Le crate est versionné semver ; le namespace QSG porte un tag de version pour le side-by-side. |
| Q6 | Bridge FFI | **hybride : `cxx` brut (chemin chaud) + `cxx-qt` (surface réactive)** | `cxx` brut pour la géométrie (buffer plat, zéro QObject, max perf). `cxx-qt` seulement pour exposer états + propriétés QML au tweaks-panel. |

> **Note d'archi sur Q6** — la frontière chaude (1×/frame sale) reste `cxx`
> brut : aucune allocation QObject sur le chemin de rendu. `cxx-qt` est cantonné
> à la **surface froide** (changements d'état utilisateur, binding tweaks) où
> l'intégration QObject/QML vaut son coût. On ne mélange pas les deux sur le
> même chemin.

---

## 9 · Impact sur l'artefact Motion Spec (à propager en visuel)

Quand le plan est validé, la **Motion Spec HTML** gagne :

- **∞.6 (existant)** — reformulé : « proxy SVG » → « proxy SVG du moteur Rust »
  (le proxy reste, mais on précise qu'il approxime Rust, plus C++).
- **∞.7 (nouveau)** — board « Engine 4.0 · Rust/cxx » : le schéma §3, la
  frontière cxx, le split par atome §4, la barre de progression LoC Rust.
- **Tables tokens** — annoter la colonne token « → blobin_tokens.rs ».
- **Changelog ◆.5** — entrée v4.0 « moteur Rust, tokens unifiés ».

> Je n'ai **pas** encore touché au visuel — ce plan est l'étape 1. Dis-moi
> si je propage en ∞.7 maintenant ou si tu veux d'abord trancher §8.

---

## 10 · Schéma — avant / après 4.0

```
        v3.1 (aujourd'hui)                 4.0 (cible)
   ────────────────────────────      ────────────────────────────
   Spec ──décrit──> SVG proxy         Spec ──décrit──> contrat Rust
                      ╳ drift                              │ même tokens.json
   Runtime: C++ Qt (calc + rendu)     Runtime: Rust (calc) ─cxx─> C++ (rendu)
            tout couplé                        découplé · C++ < 300 LoC
   Anim sur thread Qt                  Anim en Rust (thread libre)
   Nouvelle forme = C++ + recompile    Nouvelle forme = impl Rust, 0 recompile Qt
   LoC Rust : 0 %                      LoC Rust : ≥ 90 %
```
