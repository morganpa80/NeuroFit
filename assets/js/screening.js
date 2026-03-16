// =============================================================
// NeuroFit — Screening (Minimal Working Scaffold)
// =============================================================

// --- Display target "~40-ish" (just for the progress text)
const DISPLAY_TARGET = 41;

// --- Minimal state for the sprint flow
const state = {
  step: 0,
  answers: {},
  path: []
};

// --- Tiny placeholder path (3 questions)
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
    safety: true
  }
];

// Use this sample for now
state.path = [...QUESTIONS];

// --- DOM
const qCard       = document.getElementById("qCard");
const progressTxt = document.getElementById("progressText");
const backBtn     = document.getElementById("backBtn");
const nextBtn     = document.getElementById("nextBtn");
const finishBtn   = document.getElementById("finishBtn");

// --- Render
function render() {
  const i = state.step;
  const item = state.path[i];

  progressTxt.textContent = `Step ${i + 1} of ~${DISPLAY_TARGET}-ish`;

  qCard.innerHTML = `
    <h3 class="title" id="qTitle">${item.text}</h3>
    <div class="sub">${item.type==="likert5" ? "Choose the option that matches your typical week." : "Choose one option."}</div>
    <div class="nf-options" style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin-top:12px;">
      ${renderOptions(item)}
    </div>
  `;

  restore(item);
  nextBtn.hidden   = (i === state.path.length - 1);
  finishBtn.hidden = !nextBtn.hidden;
}

function renderOptions(item) {
  if (item.type === "likert5") {
    return item.options.map((label, idx) => pill(item.id, idx+1, label)).join("");
  }
  if (item.type === "boolean") {
    return item.options.map((label, idx) => pill(item.id, idx, label)).join("");
  }
}

function pill(qid, value, label) {
  return `
    <label class="nf-option" data-qid="${qid}" data-value="${value}"
           style="display:flex;align-items:center;justify-content:center;padding:10px;border-radius:999px;border:1px solid #ddd;cursor:pointer;">
      <input type="radio" name="${qid}" value="${value}" style="opacity:0;position:absolute;">
      <span>${label}</span>
    </label>
  `;
}

qCard.addEventListener("click", e => {
  const opt = e.target.closest(".nf-option");
  if (!opt) return;

  const qid = opt.dataset.qid;
  const val = opt.dataset.value;

  qCard.querySelectorAll(`.nf-option[data-qid="${qid}"]`).forEach(x => x.classList.remove("selected"));
  opt.classList.add("selected");

  state.answers[qid] = Number(val);
  nextBtn.disabled = false;
});

backBtn.addEventListener("click", () => {
  if (state.step > 0) {
    state.step--;
    render();
  }
});

nextBtn.addEventListener("click", () => {
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return;
  if (state.step < state.path.length - 1) {
    state.step++;
    render();
  }
});

finishBtn.addEventListener("click", () => {
  alert("Finished scaffold! Answers:\n" + JSON.stringify(state.answers, null, 2));
});

function restore(item) {
  const val = state.answers[item.id];
  if (val !== undefined) {
    const el = qCard.querySelector(`.nf-option[data-value="${val}"]`);
    if (el) el.classList.add("selected");
    nextBtn.disabled = false;
  } else {
    nextBtn.disabled = true;
  }
}

render();
``
