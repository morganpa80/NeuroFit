// =============================
// NeuroFit – Screening (Sprint Scaffold)
// =============================

// --- Progress target "~40-ish"
const DISPLAY_TARGET = 41;

// --- State
const state = {
  step: 0,
  answers: {},
  path: [],
};

// --- TEMP QUESTIONS (3 only, just for flow testing)
const QUESTIONS = [
  {
    id: "A1",
    text: "How would you describe your general energy level most weeks?",
    type: "likert5",
    options: ["Very low","Low","Moderate","High","Very high"]
  },
  {
    id: "B2",
    text: "How important is improving balance & stability to you?",
    type: "likert5",
    options: ["Not at all","Low","Moderate","High","Very high"]
  },
  {
    id: "F2",
    text: "Do you experience dizziness with turning or rising quickly?",
    type: "boolean",
    options: ["No","Yes"],
    safety: true   // this locks Back
  }
];

// For now, use the placeholder path:
state.path = [...QUESTIONS];

// --- DOM references
const qCard = document.getElementById("qCard");
const progressText = document.getElementById("progressText");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const finishBtn = document.getElementById("finishBtn");

// --- Render step
function render() {
  const i = state.step;
  const item = state.path[i];

  progressText.textContent = `Step ${i+1} of ~${DISPLAY_TARGET}-ish`;

  qCard.innerHTML = `
    <h3 class="title">${item.text}</h3>
    <div class="sub">${item.safety ? "This helps keep your plan safe." : "Choose the option that fits your typical week."}</div>
    <div class="nf-options" style="margin-top:12px; display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
      ${renderOptions(item)}
    </div>
  `;

  restoreSelection(item);
  updateControls(item);
}

function renderOptions(item) {
  if (item.type === "likert5") {
    return item.options
      .map((label, idx) => pill(item.id, idx+1, label))
      .join("");
  }
  if (item.type === "boolean") {
    return item.options
      .map((label, idx) => pill(item.id, idx, label))
      .join("");
  }
}

function pill(qid, value, label) {
  return `
    <label class="nf-option" data-qid="${qid}" data-value="${value}"
      style="display:flex; align-items:center; justify-content:center;
             padding:10px 12px; border-radius:999px; cursor:pointer;
             border:1px solid var(--nf-grey-200); background:#fff;">
      <input type="radio" name="${qid}" value="${value}" style="opacity:0; position:absolute;">
      <span>${label}</span>
    </label>
  `;
}

function restoreSelection(item) {
  const val = state.answers[item.id];
  if (val !== undefined) {
    const el = qCard.querySelector(`[data-value="${val}"]`);
    if (el) el.classList.add("selected");
    nextBtn.disabled = false;
  } else {
    nextBtn.disabled = true;
  }
}

function updateControls(item) {
  backBtn.disabled = !!item.safety;
  nextBtn.hidden = (state.step === state.path.length - 1);
  finishBtn.hidden = !nextBtn.hidden;
}

// --- Event: click pill
qCard.addEventListener("click", e => {
  const pill = e.target.closest(".nf-option");
  if (!pill) return;

  const qid = pill.dataset.qid;
  const val = pill.dataset.value;

  qCard.querySelectorAll(`.nf-option[data-qid="${qid}"]`)
    .forEach(p => p.classList.remove("selected"));

  pill.classList.add("selected");

  state.answers[qid] = Number(val);
  nextBtn.disabled = false;
});

// --- Navigation
backBtn.addEventListener("click", () => {
  if (state.step > 0) {
    const item = state.path[state.step];
    if (!item.safety) {
      state.step -= 1;
      render();
    }
  }
});

nextBtn.addEventListener("click", () => {
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return;

  if (state.step < state.path.length - 1) {
    state.step += 1;
    render();
  }
});

finishBtn.addEventListener("click", () => {
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return;

  // placeholder route bundle
  sessionStorage.setItem("screeningAnswers", JSON.stringify(state.answers));
  sessionStorage.setItem("screeningRoute", JSON.stringify({ origin:"screening", mode:"scaffold" }));
  sessionStorage.setItem("preColor", JSON.stringify("green"));
  sessionStorage.setItem("planType", "6-week");

  location.href = "workout.html";
});

// --- Init
render();
