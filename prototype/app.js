const API_BASE = "";

const state = {
  world: null,
  residents: [],
  selectedResidentId: null,
  paused: false,
  speedIndex: 0,
  speedMultipliers: [1, 2, 4],
  timeMinutes: 7 * 60,
  weather: "clear",
  activeEvent: null,
  cameraMode: "god",
  followResidentId: null,
  eventLog: [],
  animationFrame: null,
  lastSimAt: performance.now(),
  bubbleByResident: new Map(),
};

const canvasEl = document.querySelector("#townCanvas");
const context = canvasEl.getContext("2d");
const worldClockEl = document.querySelector("#worldClock");
const worldStatusEl = document.querySelector("#worldStatus");
const residentCountEl = document.querySelector("#residentCount");
const residentListEl = document.querySelector("#residentList");
const residentInspectorEl = document.querySelector("#residentInspector");
const relationshipListEl = document.querySelector("#relationshipList");
const diagnosticsEl = document.querySelector("#diagnostics");
const eventLogEl = document.querySelector("#eventLog");
const pauseButtonEl = document.querySelector("#pauseButton");
const speedButtonEl = document.querySelector("#speedButton");
const followButtonEl = document.querySelector("#followButton");
const cameraModeEl = document.querySelector("#cameraMode");
const selectedModeEl = document.querySelector("#selectedMode");
const mapTitleEl = document.querySelector("#mapTitle");

function byId(list, id) {
  return list.find((item) => item.id === id);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function fetchJson(pathname) {
  const response = await fetch(`${API_BASE}${pathname}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${pathname}`);
  }
  return response.json();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatClock(minutes) {
  const whole = Math.floor(minutes) % (24 * 60);
  const normalized = whole < 0 ? whole + (24 * 60) : whole;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function worldTileSize() {
  return state.world?.tileSize || 24;
}

function buildingById(buildingId) {
  return byId(state.world?.buildings || [], buildingId);
}

function residentById(residentId) {
  return byId(state.residents, residentId);
}

function residentColor(role) {
  const palette = {
    grocer: "#bf6d3f",
    baker: "#cb9051",
    mechanic: "#596e7c",
    teacher: "#4d6fb4",
    medic: "#2b7c71",
    carpenter: "#8d6a46",
    courier: "#cf6f58",
    librarian: "#6470a2",
    gardener: "#4f8e5d",
    tailor: "#a45aa4",
    fisher: "#5089b9",
    broker: "#b2564f",
    farmer: "#759a4d",
    ranger: "#3f6a48",
    herbalist: "#6f9d62",
    blacksmith: "#6c5c53",
    cook: "#d88455",
    mason: "#8b7b6f",
    storyteller: "#aa6c8d",
    watchmaker: "#6b6f7f",
    boatwright: "#59899a",
    messenger: "#e0885c",
    beekeeper: "#b19c45",
    night_guard: "#53586d",
    caretaker: "#7d928f",
    scribe: "#61769a",
    miller: "#a08458",
    musician: "#b26d93"
  };
  return palette[role] || "#5f7180";
}

function addTownLog(title, detail, tags = []) {
  state.eventLog = [
    {
      id: `log-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      time: formatClock(state.timeMinutes),
      title,
      detail,
      tags
    },
    ...state.eventLog
  ].slice(0, 40);
  renderEventLog();
}

function makeMemory(text, tags = [], importance = 0.5, participants = []) {
  return {
    id: `memory-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    text,
    tags,
    importance,
    participants,
    minute: state.timeMinutes
  };
}

function recencyScore(memory) {
  const delta = Math.abs(state.timeMinutes - memory.minute);
  return 1 / (1 + (delta / 240));
}

function retrieveRelevantMemories(resident, contextTags) {
  const tags = new Set(contextTags);
  return (resident.memories || [])
    .map((memory) => {
      const overlap = memory.tags.filter((tag) => tags.has(tag)).length;
      const relevance = overlap ? overlap / Math.max(1, contextTags.length) : 0;
      const score = (memory.importance * 0.46) + (recencyScore(memory) * 0.34) + (relevance * 0.2);
      return { memory, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.memory);
}

function initializeResident(rawResident, index) {
  const home = buildingById(rawResident.home);
  const homeX = home?.doorX ?? 2;
  const homeY = home?.doorY ?? 2;

  return {
    ...rawResident,
    roleKey: rawResident.role.replaceAll("-", "_"),
    x: homeX,
    y: homeY,
    destinationId: rawResident.home,
    destinationLabel: home?.name || rawResident.home,
    currentAction: "starting the day",
    facing: index % 2 === 0 ? 1 : -1,
    energy: 0.72 + ((index % 5) * 0.04),
    hunger: 0.18 + ((index % 4) * 0.06),
    socialNeed: 0.22 + ((index % 6) * 0.05),
    mood: "steady",
    speech: null,
    interactionCooldown: 0,
    memories: rawResident.memorySummary.map((text, memoryIndex) =>
      makeMemory(text, [rawResident.role, "history"], 0.55 + (memoryIndex * 0.08), [rawResident.id])
    ),
    relations: (rawResident.relations || []).map((relation) => ({ ...relation })),
    reflections: [],
  };
}

function setResidentSpeech(resident, text, duration = 160) {
  resident.speech = {
    text,
    until: performance.now() + duration * 16
  };
  state.bubbleByResident.set(resident.id, resident.speech);
}

function townContextTags(resident) {
  return [
    resident.role,
    state.weather,
    state.activeEvent || "routine",
    resident.destinationId,
    resident.mood
  ].filter(Boolean);
}

function currentPhase(minutes) {
  if (minutes < 6 * 60) return "sleep";
  if (minutes < 8 * 60) return "morning";
  if (minutes < 12 * 60) return "work";
  if (minutes < 14 * 60) return "lunch";
  if (minutes < 18 * 60) return "work";
  if (minutes < 20 * 60) return "social";
  if (minutes < 22 * 60) return "evening";
  return "night";
}

function desiredDestination(resident) {
  const phase = currentPhase(state.timeMinutes);
  if (state.activeEvent === "festival") return "square";
  if (state.activeEvent === "rain" && ["social", "evening"].includes(phase)) return "cafe";
  if (state.activeEvent === "shortage" && ["morning", "work", "lunch"].includes(phase)) {
    return ["grocer", "baker", "miller"].includes(resident.role) ? "market" : resident.workplace;
  }
  if (state.activeEvent === "workdrive" && ["work", "social"].includes(phase)) {
    return ["mechanic", "carpenter", "blacksmith", "mason"].includes(resident.role) ? "workshop" : resident.workplace;
  }
  if (phase === "sleep" || phase === "night") return resident.home;
  if (phase === "morning") return resident.home;
  if (phase === "lunch") return resident.hangout || "square";
  if (phase === "social" || phase === "evening") return resident.hangout || "cafe";
  return resident.workplace;
}

function destinationPoint(buildingId) {
  const building = buildingById(buildingId);
  return {
    x: building?.doorX ?? 2,
    y: building?.doorY ?? 2
  };
}

function updateResidentNeeds(resident) {
  resident.hunger = clamp(resident.hunger + 0.0025, 0, 1);
  resident.socialNeed = clamp(resident.socialNeed + (resident.currentAction.includes("working") ? 0.0035 : 0.0018), 0, 1);
  resident.energy = clamp(resident.energy + (currentPhase(state.timeMinutes) === "sleep" ? 0.012 : -0.0022), 0, 1);

  if (resident.energy < 0.25) resident.mood = "drained";
  else if (resident.hunger > 0.78) resident.mood = "hungry";
  else if (resident.socialNeed > 0.72) resident.mood = "restless";
  else if (state.activeEvent === "festival") resident.mood = "lifted";
  else if (state.activeEvent === "shortage") resident.mood = "tense";
  else if (state.activeEvent === "rain") resident.mood = "contained";
  else resident.mood = "steady";
}

function updateResidentRoutine(resident) {
  const nextDestinationId = desiredDestination(resident);
  if (resident.destinationId !== nextDestinationId) {
    resident.destinationId = nextDestinationId;
    resident.destinationLabel = buildingById(nextDestinationId)?.name || nextDestinationId;
  }

  const destination = destinationPoint(resident.destinationId);
  const dx = destination.x - resident.x;
  const dy = destination.y - resident.y;
  const distance = Math.hypot(dx, dy);

  if (distance > 0.08) {
    const step = 0.08 * state.speedMultipliers[state.speedIndex];
    resident.x += (dx / distance) * Math.min(step, distance);
    resident.y += (dy / distance) * Math.min(step, distance);
    resident.currentAction = `walking to ${resident.destinationLabel}`;
    resident.facing = dx >= 0 ? 1 : -1;
  } else {
    const phase = currentPhase(state.timeMinutes);
    if (resident.destinationId === resident.workplace && phase === "work") {
      resident.currentAction = `working at ${resident.destinationLabel}`;
    } else if (resident.destinationId === resident.home && ["night", "sleep", "morning"].includes(phase)) {
      resident.currentAction = "resting at home";
    } else {
      resident.currentAction = `spending time at ${resident.destinationLabel}`;
    }
  }
}

function relationBetween(resident, targetId) {
  return resident.relations.find((relation) => relation.target === targetId);
}

function adjustRelation(resident, targetId, deltas) {
  let relation = relationBetween(resident, targetId);
  if (!relation) {
    relation = { target: targetId, trust: 0.42, warmth: 0.4, rivalry: 0.08 };
    resident.relations.push(relation);
  }
  relation.trust = clamp(relation.trust + (deltas.trust || 0), 0, 1);
  relation.warmth = clamp(relation.warmth + (deltas.warmth || 0), 0, 1);
  relation.rivalry = clamp(relation.rivalry + (deltas.rivalry || 0), 0, 1);
}

function interactionTopic(residentA, residentB) {
  if (state.activeEvent === "festival") return "festival";
  if (state.activeEvent === "rain") return "rain";
  if (state.activeEvent === "shortage") return "shortage";
  if (state.activeEvent === "rumor") return "rumor";
  if (residentA.destinationId === residentB.destinationId && residentA.destinationId === residentA.workplace) return "work";
  if (residentA.destinationId === "cafe" || residentA.destinationId === "square") return "social";
  return "routine";
}

function interactionTemplate(topic, residentA, residentB) {
  const templates = {
    festival: {
      memory: `${residentA.name} and ${residentB.name} aligned around festival preparation.`,
      speech: `${residentB.name}, let's make the square feel alive.`,
      deltas: { trust: 0.02, warmth: 0.04, rivalry: -0.01 }
    },
    rain: {
      memory: `${residentA.name} and ${residentB.name} swapped rain-day town updates at the cafe.`,
      speech: `Rain changes who shows up and who stays hidden.`,
      deltas: { trust: 0.015, warmth: 0.02 }
    },
    shortage: {
      memory: `${residentA.name} and ${residentB.name} negotiated around a shortage signal.`,
      speech: `We need to stop this from turning into panic.`,
      deltas: { trust: 0.01, rivalry: 0.02 }
    },
    rumor: {
      memory: `${residentA.name} traded rumor fragments with ${residentB.name}.`,
      speech: `Everyone is saying something slightly different.`,
      deltas: { warmth: 0.02, rivalry: 0.01 }
    },
    work: {
      memory: `${residentA.name} coordinated work with ${residentB.name}.`,
      speech: `If we keep the routine clean, the town holds.`,
      deltas: { trust: 0.02, warmth: 0.01 }
    },
    social: {
      memory: `${residentA.name} caught up with ${residentB.name} during town social time.`,
      speech: `The town feels different tonight, doesn't it?`,
      deltas: { warmth: 0.03, trust: 0.01, rivalry: -0.01 }
    },
    routine: {
      memory: `${residentA.name} crossed paths with ${residentB.name} and updated their local picture of town life.`,
      speech: `Small patterns are starting to shift again.`,
      deltas: { trust: 0.008, warmth: 0.008 }
    }
  };
  return templates[topic] || templates.routine;
}

function reflectIfNeeded(resident) {
  if ((resident.memories || []).length < 5) return;
  const phase = currentPhase(state.timeMinutes);
  if (!["evening", "night"].includes(phase)) return;
  const recentRelevant = retrieveRelevantMemories(resident, townContextTags(resident));
  if (!recentRelevant.length) return;
  if ((resident.reflections || []).some((entry) => Math.abs(entry.minute - state.timeMinutes) < 180)) return;

  const text = `${resident.name} notices a pattern: ${recentRelevant[0].text}`;
  resident.reflections.push({
    id: `reflection-${resident.id}-${Date.now()}`,
    text,
    minute: state.timeMinutes
  });
  resident.memories.push(makeMemory(text, ["reflection", resident.role], 0.66, [resident.id]));
}

function maybeInteract() {
  const residents = state.residents;
  for (let index = 0; index < residents.length; index += 1) {
    const residentA = residents[index];
    for (let inner = index + 1; inner < residents.length; inner += 1) {
      const residentB = residents[inner];
      if (residentA.interactionCooldown > 0 || residentB.interactionCooldown > 0) continue;
      const distance = Math.hypot(residentA.x - residentB.x, residentA.y - residentB.y);
      if (distance > 1.1) continue;
      const topic = interactionTopic(residentA, residentB);
      const template = interactionTemplate(topic, residentA, residentB);
      adjustRelation(residentA, residentB.id, template.deltas);
      adjustRelation(residentB, residentA.id, template.deltas);
      residentA.memories.push(makeMemory(template.memory, [topic, residentB.role], 0.58, [residentA.id, residentB.id]));
      residentB.memories.push(makeMemory(template.memory, [topic, residentA.role], 0.58, [residentA.id, residentB.id]));
      residentA.socialNeed = clamp(residentA.socialNeed - 0.12, 0, 1);
      residentB.socialNeed = clamp(residentB.socialNeed - 0.12, 0, 1);
      residentA.interactionCooldown = 16;
      residentB.interactionCooldown = 16;
      setResidentSpeech(residentA, template.speech);
      addTownLog(
        `${residentA.name} ↔ ${residentB.name}`,
        template.memory,
        [topic, residentA.role, residentB.role]
      );
      return;
    }
  }
}

function clearExpiredSpeech() {
  const now = performance.now();
  state.residents.forEach((resident) => {
    if (resident.speech && resident.speech.until < now) {
      resident.speech = null;
      state.bubbleByResident.delete(resident.id);
    }
  });
}

function runSimulationTick(deltaMinutes) {
  state.timeMinutes = (state.timeMinutes + deltaMinutes + (24 * 60)) % (24 * 60);
  state.residents.forEach((resident) => {
    resident.interactionCooldown = Math.max(0, resident.interactionCooldown - 1);
    updateResidentNeeds(resident);
    updateResidentRoutine(resident);
    reflectIfNeeded(resident);
  });
  if (Math.random() < 0.5) {
    maybeInteract();
  }
  clearExpiredSpeech();
}

function renderWorldStatus() {
  const diagnostics = [
    { label: `Weather ${state.weather}` },
    { label: state.activeEvent ? `Event ${state.activeEvent}` : "Event none" },
    { label: `Phase ${currentPhase(state.timeMinutes)}` },
    { label: `Speed x${state.speedMultipliers[state.speedIndex]}` }
  ];
  worldStatusEl.innerHTML = diagnostics.map((item) => `<span class="duckertown-chip">${escapeHtml(item.label)}</span>`).join("");
  worldClockEl.textContent = formatClock(state.timeMinutes);
}

function renderResidentList() {
  residentCountEl.textContent = `${state.residents.length} residents`;
  residentListEl.innerHTML = "";
  state.residents.forEach((resident) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `duckertown-list-item${state.selectedResidentId === resident.id ? " active" : ""}`;
    button.innerHTML = `
      <strong>${escapeHtml(resident.name)}</strong>
      <p>${escapeHtml(resident.role)} · ${escapeHtml(resident.currentAction)}</p>
    `;
    button.addEventListener("click", () => {
      state.selectedResidentId = resident.id;
      renderResidentList();
      renderInspector();
      renderCanvas();
    });
    residentListEl.appendChild(button);
  });
}

function topRelations(resident) {
  return resident.relations
    .map((relation) => ({
      ...relation,
      targetResident: residentById(relation.target),
      score: (relation.trust * 0.42) + (relation.warmth * 0.34) - (relation.rivalry * 0.12)
    }))
    .filter((relation) => relation.targetResident)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function renderRelationshipList() {
  const resident = residentById(state.selectedResidentId) || state.residents[0];
  if (!resident) return;
  relationshipListEl.innerHTML = topRelations(resident)
    .map((relation) => `
      <div class="duckertown-list-item">
        <strong>${escapeHtml(relation.targetResident.name)}</strong>
        <p>trust ${Math.round(relation.trust * 100)} · warmth ${Math.round(relation.warmth * 100)} · rivalry ${Math.round(relation.rivalry * 100)}</p>
      </div>
    `)
    .join("");
}

function renderDiagnostics() {
  const atWork = state.residents.filter((resident) => resident.currentAction.includes("working")).length;
  const resting = state.residents.filter((resident) => resident.currentAction.includes("resting")).length;
  const socializing = state.residents.filter((resident) => resident.currentAction.includes("spending")).length;
  const averageEnergy = state.residents.reduce((sum, resident) => sum + resident.energy, 0) / state.residents.length;
  const averageSocialNeed = state.residents.reduce((sum, resident) => sum + resident.socialNeed, 0) / state.residents.length;

  diagnosticsEl.innerHTML = `
    <div class="duckertown-stat-grid">
      <div class="duckertown-stat-card"><span class="duckertown-card-note">At work</span><strong>${atWork}</strong></div>
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Resting</span><strong>${resting}</strong></div>
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Social spaces</span><strong>${socializing}</strong></div>
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Avg energy</span><strong>${Math.round(averageEnergy * 100)}</strong></div>
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Avg social need</span><strong>${Math.round(averageSocialNeed * 100)}</strong></div>
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Active event</span><strong>${escapeHtml(state.activeEvent || "none")}</strong></div>
    </div>
  `;
}

function renderInspector() {
  const resident = residentById(state.selectedResidentId) || state.residents[0];
  if (!resident) return;
  const destination = buildingById(resident.destinationId);
  const relevantMemories = retrieveRelevantMemories(resident, townContextTags(resident));

  selectedModeEl.textContent = state.followResidentId === resident.id ? "Follow mode" : "Inspect mode";
  residentInspectorEl.innerHTML = `
    <div class="duckertown-card">
      <strong>${escapeHtml(resident.name)}</strong>
      <p>${escapeHtml(resident.role)} · ${escapeHtml(resident.currentAction)}</p>
      <p>${escapeHtml(resident.biography)}</p>
    </div>
    <div class="duckertown-stat-grid">
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Mood</span><strong>${escapeHtml(resident.mood)}</strong></div>
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Energy</span><strong>${Math.round(resident.energy * 100)}</strong></div>
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Hunger</span><strong>${Math.round(resident.hunger * 100)}</strong></div>
      <div class="duckertown-stat-card"><span class="duckertown-card-note">Social need</span><strong>${Math.round(resident.socialNeed * 100)}</strong></div>
    </div>
    <div class="duckertown-card">
      <strong>Routine destination</strong>
      <p>${escapeHtml(destination?.name || resident.destinationLabel || resident.destinationId)}</p>
    </div>
    <div class="duckertown-card">
      <strong>Traits</strong>
      <p>${escapeHtml(resident.traits.join(" · "))}</p>
    </div>
    <div class="duckertown-card">
      <strong>Retrieved memories</strong>
      ${relevantMemories.map((memory) => `<p>${escapeHtml(memory.text)}</p>`).join("") || "<p>No relevant memories yet.</p>"}
    </div>
  `;
  renderRelationshipList();
  followButtonEl.textContent = state.followResidentId === resident.id ? "Stop follow" : "Follow";
}

function renderEventLog() {
  eventLogEl.innerHTML = state.eventLog
    .map((entry) => `
      <div class="duckertown-log-item">
        <strong>${escapeHtml(entry.time)} · ${escapeHtml(entry.title)}</strong>
        <p>${escapeHtml(entry.detail)}</p>
      </div>
    `)
    .join("");
}

function drawTile(x, y, color) {
  const tile = worldTileSize();
  context.fillStyle = color;
  context.fillRect(x * tile, y * tile, tile, tile);
  context.strokeStyle = "rgba(36,48,58,0.05)";
  context.strokeRect(x * tile, y * tile, tile, tile);
}

function paintGround() {
  const world = state.world;
  if (!world) return;
  for (let y = 0; y < world.rows; y += 1) {
    for (let x = 0; x < world.cols; x += 1) {
      drawTile(x, y, world.palette.grass);
    }
  }

  for (let y = 8; y < 14; y += 1) {
    for (let x = 10; x < 20; x += 1) {
      drawTile(x, y, world.palette.plaza);
    }
  }

  for (let y = 0; y < world.rows; y += 1) {
    drawTile(14, y, world.palette.path);
    drawTile(15, y, world.palette.path);
  }
  for (let x = 0; x < world.cols; x += 1) {
    drawTile(x, 10, world.palette.path);
    drawTile(x, 11, world.palette.path);
  }

  for (let y = 15; y < 18; y += 1) {
    for (let x = 5; x < 10; x += 1) {
      drawTile(x, y, world.palette.soil);
    }
  }

  for (let y = 16; y < 19; y += 1) {
    for (let x = 20; x < 24; x += 1) {
      drawTile(x, y, world.palette.water);
    }
  }
}

function paintBuildings() {
  const tile = worldTileSize();
  (state.world?.buildings || []).forEach((building) => {
    context.fillStyle = building.type === "plaza" ? state.world.palette.plaza : state.world.palette.wood;
    context.fillRect(building.x * tile, building.y * tile, building.w * tile, building.h * tile);
    if (building.type !== "plaza") {
      context.fillStyle = state.world.palette.roof;
      context.fillRect(building.x * tile, building.y * tile, building.w * tile, tile);
    }
    context.fillStyle = "rgba(36,48,58,0.12)";
    context.fillRect(building.doorX * tile + (tile * 0.2), building.doorY * tile + (tile * 0.2), tile * 0.6, tile * 0.6);
  });
}

function drawSpeechBubble(resident, x, y) {
  if (!resident.speech) return;
  const padding = 6;
  context.font = "12px 'Avenir Next', sans-serif";
  const text = resident.speech.text.slice(0, 32);
  const width = context.measureText(text).width + (padding * 2);
  const bubbleX = x - (width / 2);
  const bubbleY = y - 28;
  context.fillStyle = "rgba(255,252,246,0.96)";
  context.strokeStyle = "rgba(36,48,58,0.15)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(bubbleX, bubbleY, width, 22, 8);
  context.fill();
  context.stroke();
  context.fillStyle = "#24303a";
  context.fillText(text, bubbleX + padding, bubbleY + 15);
}

function renderCanvas() {
  if (!state.world) return;
  const tile = worldTileSize();
  context.clearRect(0, 0, canvasEl.width, canvasEl.height);
  paintGround();
  paintBuildings();

  const selectedResident = residentById(state.selectedResidentId);
  state.residents.forEach((resident) => {
    const x = (resident.x * tile) + (tile / 2);
    const y = (resident.y * tile) + (tile / 2);
    context.fillStyle = residentColor(resident.roleKey || resident.role);
    context.fillRect(x - 6, y - 7, 12, 14);
    if (selectedResident?.id === resident.id) {
      context.strokeStyle = "#c25b33";
      context.lineWidth = 2;
      context.strokeRect(x - 8, y - 9, 16, 18);
    }
    drawSpeechBubble(resident, x, y - 10);
  });

  if (selectedResident) {
    const relationIds = new Set(topRelations(selectedResident).map((relation) => relation.targetResident.id));
    const sourceX = (selectedResident.x * tile) + (tile / 2);
    const sourceY = (selectedResident.y * tile) + (tile / 2);
    relationIds.forEach((residentId) => {
      const target = residentById(residentId);
      if (!target) return;
      const targetX = (target.x * tile) + (tile / 2);
      const targetY = (target.y * tile) + (tile / 2);
      context.strokeStyle = "rgba(43,124,113,0.42)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(sourceX, sourceY);
      context.lineTo(targetX, targetY);
      context.stroke();
    });
  }
}

function simDeltaMinutes() {
  return 6 * state.speedMultipliers[state.speedIndex];
}

function animationLoop(now) {
  const elapsed = now - state.lastSimAt;
  const tickInterval = 260;
  if (!state.paused && elapsed >= tickInterval) {
    runSimulationTick(simDeltaMinutes());
    state.lastSimAt = now;
    renderWorldStatus();
    renderInspector();
    renderDiagnostics();
  }
  renderCanvas();
  state.animationFrame = requestAnimationFrame(animationLoop);
}

function setWorldEvent(eventId) {
  state.activeEvent = eventId === "clear" ? null : eventId;
  if (eventId === "festival") {
    addTownLog("Festival called", "Residents start drifting toward the square.", ["director", "festival"]);
  } else if (eventId === "rain") {
    state.weather = "rain";
    addTownLog("Rain front", "Outdoor routines compress and indoor social density rises.", ["director", "rain"]);
  } else if (eventId === "rumor") {
    addTownLog("Rumor seeded", "A vague story begins moving through the market and square.", ["director", "rumor"]);
  } else if (eventId === "shortage") {
    addTownLog("Shortage warning", "Supply-sensitive roles start converging on the market.", ["director", "shortage"]);
  } else if (eventId === "workdrive") {
    addTownLog("Workdrive", "Repair and maintenance roles are asked to intensify output.", ["director", "workdrive"]);
  } else {
    state.weather = "clear";
    addTownLog("Event cleared", "The town drifts back toward default routine.", ["director"]);
  }
  renderWorldStatus();
}

function handleCanvasClick(event) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = canvasEl.width / rect.width;
  const scaleY = canvasEl.height / rect.height;
  const clickX = (event.clientX - rect.left) * scaleX;
  const clickY = (event.clientY - rect.top) * scaleY;
  const tile = worldTileSize();

  let selected = null;
  state.residents.forEach((resident) => {
    const x = (resident.x * tile) + (tile / 2);
    const y = (resident.y * tile) + (tile / 2);
    if (Math.abs(clickX - x) <= 10 && Math.abs(clickY - y) <= 10) {
      selected = resident;
    }
  });

  if (selected) {
    state.selectedResidentId = selected.id;
    renderResidentList();
    renderInspector();
  }
}

function wireEvents() {
  pauseButtonEl.addEventListener("click", () => {
    state.paused = !state.paused;
    pauseButtonEl.textContent = state.paused ? "Resume" : "Pause";
  });

  speedButtonEl.addEventListener("click", () => {
    state.speedIndex = (state.speedIndex + 1) % state.speedMultipliers.length;
    speedButtonEl.textContent = `Speed x${state.speedMultipliers[state.speedIndex]}`;
    renderWorldStatus();
  });

  followButtonEl.addEventListener("click", () => {
    const resident = residentById(state.selectedResidentId);
    if (!resident) return;
    state.followResidentId = state.followResidentId === resident.id ? null : resident.id;
    state.cameraMode = state.followResidentId ? "follow" : "god";
    cameraModeEl.textContent = state.followResidentId ? `Follow ${resident.name}` : "God view";
    renderInspector();
  });

  document.querySelectorAll("[data-event]").forEach((button) => {
    button.addEventListener("click", () => {
      setWorldEvent(button.dataset.event);
    });
  });

  canvasEl.addEventListener("click", handleCanvasClick);
}

async function bootstrap() {
  const payload = await fetchJson("/api/bootstrap");
  state.world = payload.world;
  state.residents = payload.residents.map((resident, index) => initializeResident(resident, index));
  state.selectedResidentId = state.residents[0]?.id || null;
  mapTitleEl.textContent = state.world.title;
  renderWorldStatus();
  renderResidentList();
  renderInspector();
  renderDiagnostics();
  renderEventLog();
  wireEvents();
  addTownLog("Town online", "Duckertown Alpha wakes with routines, memories, and social ties already in motion.", ["system"]);
  state.animationFrame = requestAnimationFrame(animationLoop);
}

bootstrap().catch((error) => {
  console.error(error);
});
