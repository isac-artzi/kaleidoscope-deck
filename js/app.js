// Valley Church dashboard — "any card, at any moment, from any card, in one keystroke."
// Requirements: ~/Documents/Valley Church Workshop/W2.2_presenter_requirements.md
import { BACK_POCKET, TOPICS, getTopic } from "./content.js?v=39289a3f";
import { CLOCK, COMPANION_QUESTIONS, DEFAULT_PATH, DEMO, RECORDINGS, RECORDINGS_DIR, recordingCandidates } from "./config.js?v=39289a3f";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) =>
  (s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Public (attendee QR) build strips the presenter-only keys and overlays: ?public=1
const PUBLIC = true; // public build (W2.3)

// --------------------------------------------------------------------------
// Presenter state (session-scoped: survives reload, not a new tab)
// --------------------------------------------------------------------------
const SS_KEY = "kaleidoscope.visited";
const state = {
  visited: new Set(JSON.parse(sessionStorage.getItem(SS_KEY) || "[]")),
  cuesOn: false,
  clockOn: false,
  clockStart: null,
  current: null, // topic id on screen, or null for home
};
function markVisited(id) {
  state.visited.add(id);
  sessionStorage.setItem(SS_KEY, JSON.stringify([...state.visited]));
}

// --------------------------------------------------------------------------
// Header
// --------------------------------------------------------------------------
function renderHeader() {
  $("#header").innerHTML = `
    <div class="brand" role="button" tabindex="0" title="Home (H)">
      <img src="assets/sensym-logo.svg" alt="SenSym, LLC" class="logo"/>
    </div>
    <div class="title-block">
      <h1>Nice to Meet You, Claude</h1>
      <p class="subtitle">Kaleidoscope · Valley Presbyterian Church · October 17, 2026</p>
    </div>
    <div class="header-right">
      <span class="hint">${PUBLIC ? "Pick any card" : "1–9 0 - = cards · H home · ? all keys"}</span>
    </div>`;
  $("#header .brand").addEventListener("click", goHome);
}

// --------------------------------------------------------------------------
// Router. A reload always lands on the home grid (visited marks persist).
// --------------------------------------------------------------------------
function route() {
  const m = (location.hash || "#/").match(/^#\/card\/(.+)$/);
  if (m) renderTopic(m[1]);
  else renderHome();
  window.scrollTo(0, 0);
}
function goHome() {
  exitFullscreen();
  if (location.hash && location.hash !== "#/") location.hash = "#/";
  else renderHome();
}
function goTo(id) {
  exitFullscreen();
  location.hash = `#/card/${id}`;
}

// --------------------------------------------------------------------------
// Home: 4×3 grid of numbered cards + the back-pocket row
// --------------------------------------------------------------------------
function cardHtml(t, cls = "") {
  const seen = state.visited.has(t.id);
  return `
    <a class="card ${cls} ${seen ? "seen" : ""}" href="#/card/${t.id}" style="--accent:${t.accent}">
      <span class="card-n">${t.n}</span>
      ${seen ? '<span class="card-check" title="Covered">✓</span>' : ""}
      <div class="card-icon">${t.icon}</div>
      <h2>${esc(t.title)}</h2>
      <p class="card-tag">${esc(t.tagline)}</p>
    </a>`;
}

function renderHome() {
  state.current = null;
  $("#view").innerHTML = `
    <div class="grid grid-12">${TOPICS.map((t) => cardHtml(t)).join("")}</div>
    <div class="pocket">
      <div class="pocket-label">If you ask…</div>
      <div class="grid grid-pocket">${BACK_POCKET.map((t) => cardHtml(t, "pocket-card")).join("")}</div>
    </div>`;
}

// --------------------------------------------------------------------------
// Card page: one big diagram, optional cues (C), no pager, no "3 of 12"
// --------------------------------------------------------------------------
function renderTopic(id) {
  const t = getTopic(id);
  if (!t) {
    location.hash = "#/";
    return;
  }
  state.current = id;
  markVisited(id);

  const cues = (t.talkingPoints || []).map((p) => `<li>${esc(p)}</li>`).join(""); // stripped in the public build
  const diagram = t.svg
    ? `<img src="${t.svg}" alt="${esc(t.title)} diagram" class="diagram-img" id="dimg"/>`
    : `<div class="no-diagram" style="--accent:${t.accent}">
         <div class="no-diagram-icon">${t.icon}</div>
         <h2>${esc(t.title)}</h2>
         <p>${esc(t.tagline)}</p>
       </div>`;
  const demoBtn = !PUBLIC && t.demo ? `<button id="demo-btn" class="ghost-btn">▶ Demo (D)</button>` : "";

  $("#view").innerHTML = `
    <div class="topic-bar" style="--accent:${t.accent}">
      <a class="back" href="#/">⌂ Home (H)</a>
      <div class="topic-id"><span class="tnum">${t.n}</span> ${esc(t.title)}</div>
      <div class="bar-actions">
        ${PUBLIC ? "" : '<button id="cues-btn" class="ghost-btn">▤ Cues (C)</button>'}
        ${demoBtn}
        <button id="fs-btn" class="ghost-btn">⤢ Fullscreen (F)</button>
      </div>
    </div>
    <div class="stage" id="stage" style="--accent:${t.accent}">${diagram}</div>
    ${
      PUBLIC
        ? ""
        : `<div class="cues" id="cues" ${state.cuesOn ? "" : "hidden"} style="--accent:${t.accent}">
      <div class="cues-col"><h4>Speaker cues</h4><ul>${cues}</ul></div>
      <div class="cues-col demo"><h4>Live demo</h4><p>${esc(t.demoCue || "No demo.")}</p></div>
    </div>`
    }`;

  $("#fs-btn").addEventListener("click", toggleFullscreen);
  const img = $("#dimg");
  if (img) img.addEventListener("click", toggleFullscreen);
  if (!PUBLIC) {
    $("#cues-btn").addEventListener("click", toggleCues);
    $("#cues-btn").classList.toggle("on", state.cuesOn);
    if (t.demo) $("#demo-btn").addEventListener("click", () => openDemo(t));
  }
}

function toggleCues() {
  state.cuesOn = !state.cuesOn;
  const c = $("#cues");
  if (c) c.hidden = !state.cuesOn;
  const b = $("#cues-btn");
  if (b) b.classList.toggle("on", state.cuesOn);
}

// --------------------------------------------------------------------------
// Fullscreen diagram
// --------------------------------------------------------------------------
function toggleFullscreen() {
  const stage = $("#stage");
  if (!stage) return;
  const on = stage.classList.toggle("fs");
  document.body.classList.toggle("noscroll", on);
}
function exitFullscreen() {
  const stage = $("#stage");
  if (stage && stage.classList.contains("fs")) toggleFullscreen();
}

// --------------------------------------------------------------------------
// Default-path arrows (convenience only)
// --------------------------------------------------------------------------
function stepPath(dir) {
  const t = state.current ? getTopic(state.current) : null;
  const pos = t ? DEFAULT_PATH.indexOf(t.n) : -1;
  let n;
  if (pos < 0) n = dir > 0 ? DEFAULT_PATH[0] : DEFAULT_PATH[DEFAULT_PATH.length - 1];
  else n = DEFAULT_PATH[(pos + dir + DEFAULT_PATH.length) % DEFAULT_PATH.length];
  const next = TOPICS.find((x) => x.n === n);
  if (next) goTo(next.id);
}

// --------------------------------------------------------------------------
// Demos (D) with graceful offline fallback (R plays the recording)
// --------------------------------------------------------------------------
function demoUrl(t) {
  const d = t.demo || "";
  if (d === "brain") return DEMO.brain;
  if (d.startsWith("streamlit:")) return `${DEMO.streamlit}/?topic=${d.split(":")[1]}`;
  if (d.startsWith("companion:")) {
    const lib = d.split(":")[1];
    const q = COMPANION_QUESTIONS[lib];
    const base = `${DEMO.companion}/?library=${lib === "halachic" ? "sefaria" : "bible"}&ack=1&big=1`;
    return q ? `${base}&q=${encodeURIComponent(q)}&auto=1` : base;
  }
  if (d === "padlet") return DEMO.padlet;
  if (d === "workflow" || d === "beyond" || d === "code") {
    const v = DEMO[d];
    return typeof v === "string" ? v : null; // objects are handled by openDemo
  }
  return null;
}

async function reachable(url) {
  // Only local demos are probed; the deck must not depend on the network.
  if (!/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) return true;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 2500);
    await fetch(url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
    clearTimeout(to);
    return true;
  } catch {
    return false;
  }
}

async function exists(path) {
  try {
    const r = await fetch(path, { method: "HEAD", cache: "no-store" });
    return r.ok;
  } catch {
    return false;
  }
}

async function openLocalFile(name) {
  // serve.py opens the file from the demos folder with its default app.
  try {
    const r = await fetch(`/__open?file=${encodeURIComponent(name)}`, { cache: "no-store" });
    return r.ok;
  } catch {
    return false;
  }
}

async function openDemo(t) {
  if (!t || !t.demo) return toast("No live demo on this card — press R for a recording.");
  const spec = DEMO[t.demo];
  if (spec && typeof spec === "object") {
    // Local files: open each with its app; a clip plays in the overlay.
    const missing = [];
    for (const f of spec.open || []) {
      toast(`Opening ${f}…`, 1500);
      if (!(await openLocalFile(f))) missing.push(f);
    }
    if (spec.video) {
      const path = `/demos/${spec.video}`;
      if (await exists(path)) playVideo(path, t);
      else missing.push(spec.video);
    }
    if (missing.length) toast(`Demo offline for ${t.n} (missing: ${missing.join(", ")}); press R to play the recording.`, 7000);
    return;
  }
  const url = demoUrl(t);
  if (!url) return toast(`No live demo for ${t.n} yet — press R to play the recording.`);
  toast(`Opening demo for ${t.n}…`, 1500);
  if (await reachable(url)) window.open(url, "sensym-demo");
  else toast(`Demo offline for ${t.n}; press R to play the recording.`, 6000);
}

// R: play this card's recording (<cardId>.mp4 by convention; R again → next one).
const playlistPos = {};
async function playRecording(t) {
  if (!t) return toast("Open a card first, then press R.");
  const override = RECORDINGS[t.id];
  const candidates = override ? [`${RECORDINGS_DIR}/${override}`] : recordingCandidates(t.id);
  const present = [];
  for (const c of candidates) if (await exists(c)) present.push(c);
  if (!present.length) {
    return toast(`No recording yet for ${t.n} — expected ${candidates[0].replace(RECORDINGS_DIR + "/", "demos/recordings/")} (W6.2).`, 6000);
  }
  const i = (playlistPos[t.id] ?? -1) + 1;
  const path = present[i % present.length];
  playlistPos[t.id] = i % present.length;
  closeRecording();
  playVideo(path, t, present.length > 1 ? `${(i % present.length) + 1} of ${present.length} · R for next` : "");
}

function playVideo(path, t, extra = "") {
  closeRecording();
  const v = document.createElement("div");
  v.className = "recording";
  v.innerHTML = `<video src="${path}" controls autoplay></video><div class="recording-hint">${esc(t ? `${t.n} · ` : "")}${esc(path.split("/").pop())}${extra ? " · " + esc(extra) : ""} · Esc closes</div>`;
  v.addEventListener("click", (e) => {
    if (e.target === v) v.remove();
  });
  document.body.appendChild(v);
  const vid = v.querySelector("video");
  vid.addEventListener("error", () => toast(`Could not play ${path.split("/").pop()}.`, 5000));
}
function closeRecording() {
  const r = $(".recording");
  if (r) r.remove();
}

// --------------------------------------------------------------------------
// Elapsed-time clock (T). Starts on first keypress, presenter-only.
// --------------------------------------------------------------------------
function ensureClockStarted() {
  if (!state.clockStart) state.clockStart = Date.now();
}
function toggleClock() {
  state.clockOn = !state.clockOn;
  $("#clock").hidden = !state.clockOn;
}
function tickClock() {
  const el = $("#clock");
  if (!el || !state.clockOn) return;
  const now = new Date();
  const elapsed = state.clockStart ? Math.floor((now - state.clockStart) / 1000) : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const parts = [`▶ ${mm}:${ss}`];
  for (const tgt of CLOCK.targets) {
    const [h, m] = tgt.at.split(":").map(Number);
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    const left = Math.round((at - now) / 60000);
    parts.push(`${tgt.label} ${left >= 0 ? `in ${left} min` : `${-left} min ago`}`);
  }
  el.textContent = parts.join("  ·  ");
}

// --------------------------------------------------------------------------
// Key map overlay (?) and toasts
// --------------------------------------------------------------------------
const KEYS = [
  ["1 – 9", "Cards 01–09"],
  ["0  -  =", "Cards 10, 11, 12"],
  ["Shift+1 … Shift+4", "Back-pocket B1–B4"],
  ["H or Esc", "Home grid (from anywhere, even fullscreen)"],
  ["←  →", "Previous / next on the default path 01→03→02→04→05→09→07→10→06→08→11→12"],
  ["F", "Fullscreen the diagram"],
  ["C", "Speaker cues on / off"],
  ["T", "Elapsed-time clock on / off"],
  ["D", "Open this card's live demo"],
  ["R", "Play this card's recorded backup"],
  ["?", "This key map"],
];
function toggleKeymap() {
  const k = $("#keymap");
  k.hidden = !k.hidden;
}
function renderOverlays() {
  const rows = KEYS.map(([k, d]) => `<tr><td><kbd>${esc(k)}</kbd></td><td>${esc(d)}</td></tr>`).join("");
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="keymap" class="keymap" hidden><div class="keymap-box"><h3>Keys</h3><table>${rows}</table><p>Press ? or Esc to close</p></div></div>
     <div id="clock" class="clock" hidden></div>
     <div id="toast" class="toast" hidden></div>`,
  );
  $("#keymap").addEventListener("click", toggleKeymap);
}
let toastTimer = null;
function toast(msg, ms = 3500) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), ms);
}

// --------------------------------------------------------------------------
// Keyboard: the whole contract from W2.2
// --------------------------------------------------------------------------
const DIGIT_TO_CARD = { Digit1: "01", Digit2: "02", Digit3: "03", Digit4: "04", Digit5: "05", Digit6: "06", Digit7: "07", Digit8: "08", Digit9: "09", Digit0: "10", Minus: "11", Equal: "12" };
const SHIFT_TO_POCKET = { Digit1: "B1", Digit2: "B2", Digit3: "B3", Digit4: "B4" };

function onKey(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  ensureClockStarted();

  const keymapOpen = $("#keymap") && !$("#keymap").hidden;
  if (e.key === "?") {
    e.preventDefault();
    return toggleKeymap();
  }
  if (keymapOpen && e.key === "Escape") return toggleKeymap();
  if ($(".recording") && (e.key === "Escape" || e.key === "h" || e.key === "H")) return closeRecording();

  // Numbers and Shift+numbers (use e.code so Shift+1 is not read as "!").
  if (e.shiftKey && SHIFT_TO_POCKET[e.code]) {
    const t = BACK_POCKET.find((x) => x.n === SHIFT_TO_POCKET[e.code]);
    if (t) goTo(t.id);
    return e.preventDefault();
  }
  if (!e.shiftKey && DIGIT_TO_CARD[e.code]) {
    const t = TOPICS.find((x) => x.n === DIGIT_TO_CARD[e.code]);
    if (t) goTo(t.id);
    return e.preventDefault();
  }

  const k = e.key.toLowerCase();
  if (k === "h" || e.key === "Escape") return goHome();
  if (e.key === "ArrowRight") return stepPath(+1);
  if (e.key === "ArrowLeft") return stepPath(-1);
  if (k === "f") return toggleFullscreen();
  if (PUBLIC) return;
  if (k === "c") return toggleCues();
  if (k === "t") return toggleClock();
  if (k === "d") return openDemo(state.current ? getTopic(state.current) : null) && undefined;
  if (k === "r") return playRecording(state.current ? getTopic(state.current) : null);
}

// --------------------------------------------------------------------------
// Self-test (?selftest=1): drives the real key handler with synthetic events
// and prints a pass/fail report. Used for rehearsal checks; never on stage.
// --------------------------------------------------------------------------
async function selfTest() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const press = async (init) => {
    window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
    await wait(80);
  };
  const results = [];
  const check = (name, ok, got) => results.push(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${got})`}`);
  const onCard = (id) => location.hash === `#/card/${id}`;

  await press({ key: "4", code: "Digit4" }); check("4 → card 04", onCard("where-it-lives"), location.hash);
  await press({ key: "3", code: "Digit3" }); check("3 → card 03", onCard("history"), location.hash);
  await press({ key: "@", code: "Digit2", shiftKey: true }); check("Shift+2 → B2", onCard("grandchildren"), location.hash);
  await press({ key: "0", code: "Digit0" }); check("0 → card 10", onCard("goes-wrong"), location.hash);
  await press({ key: "-", code: "Minus" }); check("- → card 11", onCard("image-of-god"), location.hash);
  await press({ key: "=", code: "Equal" }); check("= → card 12", onCard("whats-next"), location.hash);
  await press({ key: "h", code: "KeyH" }); check("H → home", location.hash === "#/" || location.hash === "", location.hash);
  await press({ key: "ArrowRight" }); check("→ from home → 01 (path start)", onCard("meet-claude"), location.hash);
  await press({ key: "ArrowRight" }); check("→ → 03 (default path 01→03)", onCard("history"), location.hash);
  await press({ key: "ArrowRight" }); check("→ → 02", onCard("inside"), location.hash);
  await press({ key: "ArrowLeft" }); check("← → 03", onCard("history"), location.hash);
  await press({ key: "f", code: "KeyF" }); check("F → fullscreen on", !!$("#stage")?.classList.contains("fs"), "no fs class");
  await press({ key: "Escape" }); check("Esc in fullscreen → home", (location.hash === "#/" || location.hash === "") && !$("#stage"), location.hash);
  await press({ key: "?" }); check("? → key map shown", !$("#keymap").hidden, "hidden");
  await press({ key: "?" }); check("? again → key map hidden", $("#keymap").hidden, "shown");
  await press({ key: "t", code: "KeyT" }); check("T → clock shown", !$("#clock").hidden, "hidden");
  check("clock started on first keypress", !!state.clockStart, "null");
  await press({ key: "5", code: "Digit5" }); check("5 → card 05", onCard("bible-companion"), location.hash);
  check("cues hidden by default", $("#cues")?.hidden === true, "shown");
  await press({ key: "c", code: "KeyC" }); check("C → cues shown", $("#cues")?.hidden === false, "hidden");
  check("visited marks persisted", JSON.parse(sessionStorage.getItem(SS_KEY) || "[]").length >= 8, sessionStorage.getItem(SS_KEY));
  check("demo URL card 05", demoUrl(getTopic("bible-companion")).includes("library=bible") && demoUrl(getTopic("bible-companion")).includes("auto=1"), demoUrl(getTopic("bible-companion")));
  check("demo URL card 04", demoUrl(getTopic("where-it-lives")) === DEMO.brain, demoUrl(getTopic("where-it-lives")));
  check("demo URL card 02 (streamlit topic)", demoUrl(getTopic("inside")).endsWith("?topic=2"), demoUrl(getTopic("inside")));
  check("card 08 demo = workbook + clip", !!(DEMO.beyond && DEMO.beyond.open?.[0]?.endsWith(".xlsx") && DEMO.beyond.video?.endsWith("08-video.mp4")), JSON.stringify(DEMO.beyond));
  check("recording candidates card 07", recordingCandidates("your-week").length === 5, recordingCandidates("your-week").join(","));
  await press({ key: "4", code: "Digit4" });
  const n = results.filter((r) => r.startsWith("PASS")).length;
  const box = document.createElement("pre");
  box.className = "selftest";
  box.textContent = `SELF-TEST ${n}/${results.length} passed\n` + results.join("\n");
  document.body.appendChild(box);
}

function boot() {
  renderHeader();
  renderOverlays();
  window.addEventListener("hashchange", route);
  window.addEventListener("keydown", onKey);
  setInterval(tickClock, 1000);
  // Presenter copy: reload → home grid, visited marks intact (W2.2). The public
  // copy keeps deep links so a handout or QR can open one card directly.
  if (!PUBLIC && location.hash && location.hash !== "#/") history.replaceState(null, "", location.pathname + location.search + "#/");
  route();
  if (new URLSearchParams(location.search).get("selftest") === "1") setTimeout(selfTest, 300);
}
boot();
