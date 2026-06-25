# GNU6-shell — ASCII / CLI-TUI experiments

These are intentionally text-only: useful for a site `<pre>`, a terminal splash, shell completion, or a local AI agent TUI.

## 1. One-line prompt signature

```txt
GNU6-shell ▸ local agent ready >_
```

```txt
[GNU6-shell] >_ context loaded · 3 notifications
```

## 2. Compact cube signature

```txt
    ______
   /_____/|
  | >_  | |
  |_____|/
GNU6-shell
```

## 3. Dialogue / assistant signature

```txt
    ______        ┌───────────────────────┐
   /_____/|       │ local assistant ready │
  | >_  | |───────┤ context: project      │
  |_____|/        └───────────────┬───────┘
GNU6-shell                         >_
```

## 4. Notification state

```txt
GNU6-shell  ● ● ●
>_ 3 notifications en attente
```

## 5. Onboarding state

```txt
GNU6-shell onboarding
[1] context  [2] shell  [ ] scripts  [ ] local-AI
             ^
>_ Configure shell context
```

## 6. Agentic CLI-TUI block

```txt
┌─ GNU6-shell ─────────────────────────────────────────────┐
│ cube-dialogue: present                                   │
│ context: GNU6-shell · local AI · scripts                 │
│ notifications: 3                                         │
├──────────────────────────────────────────────────────────┤
│ >_ Commande reçue.                                       │
│    Exécution planifiée: ./run                            │
│                                                          │
│ [1] résumer logs   [2] onboarding   [3] ouvrir contexte  │
└──────────────────────────────────────────────────────────┘
```

## 7. ANSI shell snippet

```sh
printf '\033[38;2;255;106;0mGNU6\033[0m-shell ▸ \033[38;2;255;106;0m>_\033[0m local agent ready\n'
```

## 8. More opinionated terminal header

```txt
╭─ GNU6-shell ─────────────────────────────────────────────╮
│ >_ aware terminal · contextual onboarding · local agent   │
╰──────────────────────────────────────────────────────────╯
```
