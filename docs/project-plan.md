# Project Plan

## 1. Project summary

Duckertown is a local-first pixel-world agent society project.

The project aims to build:

- a 2D top-down town
- populated primarily by AI-agent-controlled residents
- with persistent memory, social ties, routines, local economies, and spatial
  interaction

Humans should be able to:

- watch the world from a god view
- inspect any resident
- intervene as a director
- embody or create one resident and live inside the town

## 2. Why this project matters

Most agent systems today are trapped in:

- chat
- workflow
- invisible orchestration

Duckertown changes the object from:

- `conversation`

to:

- `lived social world`

That lets the system study and expose:

- memory in place
- routine and labor
- repeated social contact
- conflict and repair
- institutions
- trust and reputation

inside a world rather than only inside message logs.

## 3. Core product objects

### 3.1 Town

- map
- districts
- homes
- workplaces
- public spaces
- routes
- weather and day cycle

### 3.2 Residents

- identity
- role
- personality
- biography
- memories
- needs
- schedule
- inventory
- social edges

### 3.3 Society

- trust
- friendship
- rivalry
- kinship
- work ties
- trade
- factions
- local reputation

### 3.4 Human entry modes

- god view
- director mode
- embodied participant mode

## 4. What existing projects teach Duckertown

### `AI Town`

Reference:

- `https://github.com/a16z-infra/ai-town`

Useful lesson:

- a compact town is a strong sandbox for agent society
- strong backend state matters more than flashy surface

Borrow:

- town-sized agent simulation
- shared global state
- simulation-first world model

Do not copy:

- exact stack
- exact UI shell

### `Generative Agents`

Reference:

- `https://github.com/joonspk-research/generative_agents`

Useful lesson:

- believable agent life emerges from memory, reflection, and planning loops

Borrow:

- memory-reflection-action rhythm
- small-community social plausibility

Do not copy:

- research-demo framing as the final product

### `Neighborly`

Reference:

- `https://github.com/ShiJbey/neighborly`

Useful lesson:

- settlement simulation needs strong state models and event systems

Borrow:

- settlement and resident data discipline
- event-driven social evolution

### `Voyager`

Reference:

- `https://github.com/MineDojo/Voyager`

Useful lesson:

- long-horizon agent competence grows through reusable skills and selective
  expensive cognition

Borrow:

- skill library logic
- staged escalation

### `Anansi`

Reference:

- `https://github.com/ShiJbey/Anansi`

Useful lesson:

- simulation and narrative systems can be combined without collapsing into
  fully scripted dialogue

Borrow:

- social simulation + narrative bridge

### `Two Hours One Life / persistent community games`

Reference:

- `https://github.com/twohoursonelife/OneLife`

Useful lesson:

- social worlds become meaningful when time, place, scarcity, and community
  consequences persist

Borrow:

- long-lived world instinct
- community consequence over time

## 5. Strategic differentiation

Duckertown should not simply become:

- AI Town with prettier art
- Stardew-inspired NPC chat
- a city sim with LLMs pasted on top

Its unique position should be:

- `spatial, inspectable, agent society`

That means:

- place matters
- routine matters
- memory matters
- social ties matter
- world shocks matter

## 6. Engineering path

## Phase A

Build the static substrate.

- local repo
- docs
- art and asset policy
- site page

## Phase B

Build the town shell.

- tile map
- renderer
- camera
- buildings
- movement
- time of day

## Phase C

Build resident simulation.

- schedules
- needs
- routine movement
- local event triggers
- inspectable resident cards

## Phase D

Build agent social behavior.

- short dialogue actions
- memory updates
- relationship edge updates
- simple rumor / gift / trade / avoidance loops

## Phase E

Build human participation.

- god view tools
- director mode events
- embodied character mode

## Phase F

Build world persistence and replay.

- save / load
- world history
- resident history
- social event replay

## Phase G

Build larger-scale society growth.

- district expansion
- institutions
- local economy
- larger population scaling

## 7. Runtime design

## 7.1 Do not let all residents think expensively

Recommended execution layers:

- `ambient`
  - pathing
  - schedules
  - idle logic
- `local social`
  - nearby interaction
  - short memory lookup
- `critical cognition`
  - conflict
  - trade
  - major decisions
  - rare events

## 7.2 Why this matters

This is the same lesson already learned in DuckerChat:

- many agents can exist
- only a small subset should incur expensive reasoning at one time

## 7.3 Scaling objective

MVP:

- 20 to 50 residents

Near-term:

- 100 to 300 residents

Long-term research objective:

- large town or multi-town population with layered simulation and selective
  cognition

## 8. Human interaction specification

### 8.1 God view

Must support:

- pan
- zoom
- inspect resident
- inspect building
- inspect local relationship graph
- inspect recent events

### 8.2 Director mode

Must support:

- inject rumor
- inject shortage
- inject weather
- inject festival
- inject conflict trigger

### 8.3 Embodied mode

Must support:

- one controllable character
- local conversation
- local task participation
- visible consequence on relationships and memory

## 9. Asset policy

Duckertown should not use Stardew Valley art, screenshots, sprites, or GIFs in
the public site or repo.

Use:

- CC0 or similarly permissive pixel asset packs
- original mockups
- public-domain-like references where license is explicit

## 10. Public communication rule

When describing Duckertown publicly:

- do not present it as a finished game
- present it as a spatial agent-society program
- emphasize world, memory, relationships, and human entry modes

## 11. First public release target

The first serious public milestone should show:

- a visible pixel town
- living routines
- inspectable residents
- changing relationships
- one or two meaningful human interventions

That is enough to demonstrate the project thesis without pretending the world
is already massive.
