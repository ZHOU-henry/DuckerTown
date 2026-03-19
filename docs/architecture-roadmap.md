# Architecture Roadmap

## 0. Purpose

Duckertown should become:

- a spatial agent society system
- a pixel-world simulation that humans can watch and enter
- a bridge between social-agent platforms and digital society worlds

It should not become:

- a chat system pasted into a town skin
- a scripted NPC toy town
- a large but empty sandbox with weak agent behavior

## 1. Product Definition

If DuckerChat is:

- `room society`

Duckertown is:

- `town society`

The core object is:

- a persistent small community where agents live in space and time

Humans should be able to:

- observe
- inspect
- intervene
- embody one character
- inject world events

## 2. Core Product Pillars

### 2.1 Spatial society

Agent interaction should depend on:

- where they are
- who they meet
- what they are doing
- what they remember
- what the town currently needs

### 2.2 Living routine

The world should feel inhabited even before the human does anything.

So the town needs:

- homes
- public places
- schedules
- work
- local events
- repeated encounters

### 2.3 Memory and relationship continuity

An agent should behave differently after:

- friendship
- betrayal
- trade
- shared work
- rumor
- conflict

### 2.4 Human access layers

Duckertown should support three human roles:

- `god view`
- `director`
- `embodied participant`

### 2.5 Open world growth

The MVP starts as one town.

The architecture should still leave space for:

- map expansion
- more districts
- more residents
- more factions
- more institutions

## 3. System Layers

## 3.1 Rendering layer

Recommended near-term rendering:

- 2D top-down pixel world
- low-cost, legible, locally runnable

Why:

- fast iteration
- clearer social readability than 3D
- easier to scale agent count

## 3.2 World simulation layer

World state should include:

- map tiles
- buildings
- rooms
- time
- weather
- events
- items
- resources

## 3.3 Character layer

Each character needs:

- role
- biography
- routine
- memory
- goals
- inventory
- home
- social ties
- speech
- mood / needs

## 3.4 Society layer

Society must include:

- trust
- rivalry
- family / kin-like ties
- friendship
- work ties
- status
- trade ties
- factions

## 3.5 Cognition layer

Not every action should require heavy model reasoning.

Recommended tiers:

- `ambient logic`
  - pathing
  - schedules
  - routine actions
- `social response`
  - nearby interaction
  - local dialogue
  - short-term memory updates
- `high-value reasoning`
  - conflict
  - plans
  - secrets
  - major choices

## 4. Runtime Model

## 4.1 Character loop

Each agent-character operates through:

- perceive local world
- update needs and local context
- recall relevant memory
- choose action
- emit movement / speech / interaction command
- update social edges and memory

## 4.2 Event classes

Duckertown should support:

- `ambient`
  - routine movement
- `social`
  - talk, gift, rumor, conflict, help
- `economic`
  - trade, work, production
- `world`
  - rain, outage, festival, shortage, danger
- `human`
  - direct intervention or embodiment

## 4.3 Simulation tiers

At scale:

- most residents use low-cost ambient logic
- nearby or socially relevant residents escalate into richer cognition
- only a small subset use expensive model calls

This mirrors the DuckerChat lesson:

- many characters
- few expensive active minds at once

## 5. Duckertown And Existing Duckermind Projects

Duckertown should connect to the existing portfolio:

- `DuckerChat`
  - visible social reasoning and relationship structure
- `Polis`
  - institutions, reputation, governance, economy
- `Kinema`
  - embodiment, movement, world models, control
- `Autogenesis`
  - recursive self-improving systems, control loops

Duckertown becomes the place where those abstractions are lived.

## 6. MVP Design

## 6.1 First town

Start with:

- one compact town
- 20 to 50 residents
- homes
- town square
- shop
- workshop
- cafe / gathering place
- a few repeated routines

## 6.2 First playable modes

Required:

- town overview camera
- click resident to inspect
- inspect relationship graph
- trigger one event
- possess one resident

## 6.3 First social behaviors

Required:

- greeting
- gossip / rumor
- gift
- trade
- task help
- disagreement
- avoidance / conflict

## 6.4 First world pressures

Required:

- time of day
- weather
- resource shortage
- shared event

## 7. Technical Build Path

## Phase 1

Build:

- town map and renderer
- movement and routine engine
- local inspection UI
- relationship graph panel

## Phase 2

Build:

- agent memory model
- local dialogue actions
- simple event system
- god-view control panel

## Phase 3

Build:

- possession / human-character mode
- stronger relationship updates
- social rumor and conflict propagation
- replay logs

## Phase 4

Build:

- district expansion
- institutions
- economy
- factions
- richer social hierarchy

## Phase 5

Build:

- larger population scaling
- world generation
- persistent server / cloud sync options
- long-horizon history

## 8. Key Risks

- too much expensive cognition per resident
- world feels alive only when the human looks at one corner
- town becomes a chat box with sprites
- social edges are decorative rather than causal
- rendering and simulation drift apart
- agent society is impressive in logs but not in play feel

## 9. Acceptance Criteria

The MVP succeeds when:

- the town feels inhabited without human prompting
- residents are not visibly all the same
- relationships matter in behavior
- humans can inspect and understand social change
- the system remains locally runnable

## 10. Asset And Public Site Policy

Do not use proprietary Stardew Valley images, sprites, or GIFs.

Use:

- permissive or CC0 pixel assets
- self-made mockups
- clearly licensed open-source material
