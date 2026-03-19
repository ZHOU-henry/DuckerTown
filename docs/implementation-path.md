# Implementation Path

## 1. Immediate technical choice

Build Duckertown as:

- a local-first software prototype
- 2D top-down
- pixel-art readable
- simulation-first

Recommended initial stack:

- `TypeScript`
- `Electron`
- `PixiJS` or `Phaser`
- local JSON / SQLite persistence

Why:

- readable 2D rendering
- easier local packaging
- good iteration speed
- lower hardware pressure than full 3D

## 2. World architecture

### 2.1 Map

Represent the town as:

- chunks
- tile layers
- collision / walkability
- semantic zones

Semantic zones matter more than only art:

- home
- work
- leisure
- market
- path
- event site

### 2.2 Tick model

Use a layered tick system:

- render tick
- movement tick
- routine tick
- social tick
- cognition escalation tick

This avoids wasting expensive reasoning on every frame.

## 3. Agent architecture

### 3.1 Resident state

Resident object:

- `identity`
- `body position`
- `current activity`
- `daily schedule`
- `needs`
- `short memory`
- `long memory`
- `relationship vector`
- `inventory`
- `role-specific capabilities`

### 3.2 Behavior routing

Behavior priority should be:

1. urgent needs
2. scheduled commitments
3. social opportunities
4. local world events
5. long-term goals

### 3.3 Escalation

Escalate into heavier reasoning only when:

- a meaningful social interaction occurs
- the world changes sharply
- a resident faces conflict, trade, betrayal, or a novel event

## 4. Human interaction

### 4.1 God view

Needs:

- free camera
- inspect resident
- inspect building
- inspect social graph
- inject event

### 4.2 Embodied mode

Needs:

- player-controlled character
- local dialogue options
- object interaction
- relationship consequences

### 4.3 Director mode

Needs:

- create rumor
- create task
- create shortage
- create weather shift
- create conflict trigger

## 5. Scaling strategy

Do not give all residents expensive minds all the time.

Recommended:

- `ambient residents`
  - low-cost routine simulation
- `focused residents`
  - in camera, nearby, or socially relevant
- `critical residents`
  - involved in major ongoing situations

This is how Duckertown can eventually reach much larger populations.

## 6. Research inputs worth studying

Project families to learn from:

- `AI Town`
  - compact LLM town simulation
- `generative agents / Smallville`
  - memory-reflection-action loops
- `Neighborly`
  - procedural social simulation data models
- persistent social world games and life sims
  - for place, routine, labor, scarcity, and social consequence

## 7. Public milestone plan

### Milestone A

- docs
- concept page
- local repo setup

### Milestone B

- one map
- a few residents
- routine loop
- inspector UI

### Milestone C

- speech / interaction
- memory updates
- social graph panel

### Milestone D

- human embodiment
- event injection
- replay and world history

### Milestone E

- larger town scaling
- district growth
- institutions and economy
