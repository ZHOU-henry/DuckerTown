# Prototype Notes

This first code prototype is intentionally local, readable, and low-cost.

## Research-informed choices

### From `Generative Agents`

Borrow:

- memory entries with:
  - recency
  - importance
  - relevance
- reflection as a later-stage summary process

Current simplified implementation:

- `retrieveRelevantMemories()`
- simple memory salience scoring
- evening reflection summaries

### From `Smallville` / town-agent experiments

Borrow:

- compact town as the first world scale
- inspectable social life
- local routines and place-based interaction

### From larger simulation systems

Borrow:

- layered simulation
- not every character reasons expensively all the time

Current implementation:

- routine loop
- local interaction loop
- reflection and memory loop

## Deliberate early simplifications

- no expensive LLM calls in the first prototype
- rule-based behavior and memory retrieval
- town-scale rather than open-world scale
- readable 2D canvas before heavier game-engine complexity

## Why this is still the right first step

It proves the core object:

- agents in space
- with memory
- with routines
- with changing relationships
- visible to a human observer

before the project incurs heavier runtime and infrastructure cost.
