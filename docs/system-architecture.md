# System Architecture

## 1. World Layer

Core world objects:

- `town map`
- `tiles`
- `buildings`
- `rooms`
- `items`
- `resources`
- `weather`
- `time of day`
- `world events`

This layer gives agents:

- location
- movement
- physical context
- repeated place-based interaction

## 2. Character Layer

Each agent-character should have:

- `identity`
- `role`
- `home`
- `schedule`
- `inventory`
- `energy / mood / needs`
- `memories`
- `relationship graph`
- `speech style`
- `capabilities`

This layer makes the world socially legible rather than mechanically empty.

## 3. Society Layer

Duckertown should model:

- friendship
- trust
- rivalry
- family
- trade
- reputation
- shared events

The town is not only many characters.

It is:

- a relationship system embedded in place and time

## 4. Behavior Layer

Agent behavior should combine:

- routine
- reactive behavior
- social coordination
- long-term memory
- local goals
- world constraints

That means not every action should require heavy model reasoning.

Recommended execution tiers:

- `ambient simulation`
  - walking, schedules, idle routines
- `social response`
  - local interaction with nearby agents
- `high-value cognition`
  - conflict, planning, secrets, trade, important decisions

## 5. Human Interaction Layer

Humans should be able to:

- inspect any character
- inspect relationships
- follow one agent
- possess one role
- trigger events
- spawn new tasks or items
- watch town-level metrics evolve

## 6. Rendering Layer

Rendering should stay:

- 2D
- readable
- expressive
- low-cost enough to run locally

Visual priority:

- pixel-style world
- clear character silhouettes
- visible interaction states
- readable speech / action overlays
- inspectable social graph overlays

## 7. Persistence Layer

Persistent state should include:

- world state
- character state
- relationship edges
- major memories
- event history

The world must be replayable.

That makes it useful both as:

- a playable system
- an agent-society research system
