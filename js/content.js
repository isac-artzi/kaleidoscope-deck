// Card copy for the Valley Church dashboard ("Kaleidoscope: Nice to Meet You, Claude").
// Source of truth for copy: ~/Documents/Valley Church Workshop/W1.2_card_copy_draft.js (W1.2);
// copied here for W2.1 on 2026-10-04. Edit there, then re-copy.
// Same shape as how-to-ai-presentation/frontend/js/content.js so the engine lane
// can replace TOPICS wholesale in W2.1. Diagram paths: keep existing SVGs where
// marked REUSE; NEW diagrams are specified in the comment above each card.
// Talking points: 3–4 lines, spoken; never the word "engineering."

export const TOPICS = [
  {
    id: "meet-claude",
    n: "01",
    icon: "👋",
    accent: "#5eead4",
    title: "Nice to Meet You, Claude",
    tagline: "The thing everyone calls “AI,” explained in five minutes.",
    svg: "assets/diagrams/language-model.svg", // REUSE
  },
  {
    id: "inside",
    n: "02",
    icon: "🔬",
    accent: "#818cf8",
    title: "Inside the Machine",
    tagline: "Words become numbers, numbers become meaning.",
    svg: "assets/diagrams/transformer.svg", // REUSE
  },
  // NEW diagram: horizontal timeline, 14 anchors from W8.1_timeline_facts.md (★ rows),
  // large type, two winters shaded. Same SVG prints as the 36×24 poster.
  {
    id: "history",
    n: "03",
    icon: "📜",
    accent: "#fbbf24",
    title: "A Short History",
    tagline: "From Pascal's adding machine to the 2024 Nobel Prizes.",
    svg: "assets/diagrams/history.svg", // NEW (W8.2)
  },
  // Diagram: REUSE the app's own three-zone SVG from /brain (W7.2); screenshot W7.2_three_zones.png.
  // Numbers measured 2026-10-03 on the Mac Studio M4 Max, gemma4:26b, Bible Companion end to end.
  {
    id: "where-it-lives",
    n: "04",
    icon: "📡",
    accent: "#38bdf8",
    title: "Where Does It Live?",
    tagline: "In your pocket, in the cloud, or both.",
    svg: "assets/diagrams/three-zones.svg", // REUSE from /brain page (W7.2)
  },
  // NEW diagram: a question flowing into the companion, out to (1) verses, (2) Strong's,
  // (3) Henry/Calvin/Westminster, back to a cited answer with a "Berean check" panel.
  {
    id: "bible-companion",
    n: "05",
    icon: "📖",
    accent: "#a3e635",
    title: "Bible Companion",
    tagline: "A study partner that always shows its sources.",
    svg: "assets/diagrams/bible-companion.svg", // NEW
  },
  // NEW diagram: one engine box with two switches (Library: Sefaria | Bible+Reformed;
  // Brain: local | cloud | auto) and two front ends.
  {
    id: "one-engine",
    n: "06",
    icon: "🔁",
    accent: "#c4b5fd",
    title: "One Engine, Many Libraries",
    tagline: "The same companion, a different bookshelf.",
    svg: "assets/diagrams/one-engine.svg", // NEW
  },
  {
    id: "your-week",
    n: "07",
    icon: "🗓️",
    accent: "#fb7185",
    title: "AI in Your Week",
    tagline: "Four ordinary tasks, done with a design mindset.",
    svg: "assets/diagrams/co-creator.svg", // REUSE, relabel loop: discuss → plan → make → check → refine
  },
  // NEW diagram: a chat window in the center with spokes to Excel, Word, voice, video,
  // files on your Mac, calendar. Caption: “The chat box is the doorway, not the room.”
  {
    id: "beyond",
    n: "08",
    icon: "🧰",
    accent: "#38bdf8",
    title: "Beyond the Chat Box",
    tagline: "Spreadsheets, documents, voice, video, your own files.",
    svg: "assets/diagrams/beyond-chat.svg", // NEW
  },
  // NEW diagram: five-step checklist (sources → check one → ask the other side →
  // notice confidence → keep judgment) with Acts 17:11 as the header. Same art as the handout.
  {
    id: "berean",
    n: "09",
    icon: "🔎",
    accent: "#a3e635",
    title: "The Berean Test",
    tagline: "“They examined the Scriptures daily to see if these things were so.”",
    svg: "assets/diagrams/berean.svg", // NEW
  },
  // REUSE ethics.svg but crop/relabel to the four failure modes + the confidentiality rule.
  {
    id: "goes-wrong",
    n: "10",
    icon: "⚠️",
    accent: "#f87171",
    title: "Where It Goes Wrong",
    tagline: "Hallucination, flattery, stale data, and your neighbor's prayer request.",
    svg: "assets/diagrams/ethics.svg", // REUSE, relabel
  },
  // NEW diagram: minimal. Two columns: “Made in the image of God” / “Made by people from
  // human words.” Four short pairs. Gen 1:27 and WSC Q1 as footers. No illustration of God.
  {
    id: "image-of-god",
    n: "11",
    icon: "🕊️",
    accent: "#fbbf24",
    title: "Made in the Image of God",
    tagline: "What AI is, and what it is not.",
    svg: "assets/diagrams/image-of-god.svg", // NEW
  },
  {
    id: "whats-next",
    n: "12",
    icon: "🚀",
    accent: "#818cf8",
    title: "What's Next, and Your Questions",
    tagline: "Two years, a decade, and the question board.",
    svg: "assets/diagrams/whats-next.svg", // REUSE
  },
];

export const BACK_POCKET = [
  {
    id: "building",
    n: "B1",
    icon: "💻",
    accent: "#38bdf8",
    title: "Building Something",
    tagline: "Yes, it writes programs. Here's what that looks like.",
    svg: "assets/diagrams/co-engineer.svg", // REUSE
  },
  {
    id: "grandchildren",
    n: "B2",
    icon: "🍎",
    accent: "#fb7185",
    title: "AI and Your Grandchildren",
    tagline: "Tutor, cheat sheet, or both.",
    svg: "assets/diagrams/co-teacher.svg", // REUSE
  },
  {
    id: "jobs",
    n: "B3",
    icon: "🏗️",
    accent: "#fbbf24",
    title: "Will It Take Our Jobs?",
    tagline: "The honest two-horizon answer.",
    svg: null,
  },
  {
    id: "trained",
    n: "B4",
    icon: "🏭",
    accent: "#c4b5fd",
    title: "How Was It Trained?",
    tagline: "Data, copyright, energy. For the engineers.",
    svg: null,
  },
];

export function getTopic(id) {
  return [...TOPICS, ...BACK_POCKET].find((t) => t.id === id);
}
