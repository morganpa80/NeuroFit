// =============================================================
// NeuroFit — Screening (Minimal Working Scaffold)
// =============================================================

// --- Display target "~40-ish" (just for the progress text)
const DISPLAY_TARGET = 41;

// --- Minimal state for the sprint flow
const state = {
  step: 0,                // 0-based index into `path`
  answers: {},            // { qid: value }
  path: []                // ordered list of items we show this run
};

// --- Tiny placeholder path (3 questions just to prove flow)
const QUESTIONS = [
  {
    id: "A1",
    text: "How would you describe your general energy level most weeks?",
    type: "likert5", // 1..5
    options: ["Very low", "Low", "Moderate", "High", "Very high"]
  },
  {
    id: "B2",
    text: "How important is improving balance & stability to you?",
    type: "likert5",
    options: ["Not at all", "Low", "Moderate", "High", "Very high"]
  },
  {
    id: "F2",
    text: "Do you experience dizziness with turning or rising quickly?",
    type: "boolean", // locks Back here in the full version; we'll allow back for now
    options: ["No", "Yes"],
    safety: true
  }
];

// Use the sample path for now
state.path = [...QUESTIONS];

// --- DOM references
const qCard       = document.getElementById("qCard");
const progressTxt = document.getElementById("progressText");
const backBtn     = document.getElementById("backBtn");
const nextBtn     = document.getElementById("nextBtn");
const finishBtn   = document.getElementById("finishBtn");

// --- Render current step
function render() {
  const i = state.step;
  const item = state.path[i];
  if (!item) return;

  // Progress
  progressTxt.textContent = `Step ${i + 1} of ~${DISPLAY_TARGET}-ish`;

  // Build the question UI
  qCard.innerHTML = `
    <h3 class="title" id="qTitle">${escapeHTML(item.text)}</h3>
    <div class="sub" id="qHelp">${helpText(item)}</div>
    <div class="nf-options" role="radiogroup" aria-labelledby="qTitle"
         style="margin-top:12px; display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
      ${renderOptions(item)}
    </div>
  `;

  // Restore prior answer if present
  const prev = state.answers[item.id];
  if (prev !== undefined) {
    const pill = qCard.querySelector(`.nf-option[data-value="${cssEsc(prev)}"]`);
    if (pill) {
      pill.classList.add("selected");
      const input = pill.querySelector("input");
      if (input) input.checked = true;
      nextBtn.disabled = false;
    }
  } else {
    nextBtn.disabled = true;
  }

  // Show/hide controls
  backBtn.disabled = false; // keep simple in scaffold
  nextBtn.hidden   = (i === state.path.length - 1);
  finishBtn.hidden = !nextBtn.hidden;
}

function helpText(item) {
  if (item.type === "likert5") return "Choose the option that matches your typical week.";
  if (item.type === "boolean") return "Please choose one option.";
  return "";
}

function renderOptions(item) {
  if (item.type === "likert5") {
    return item.options.map((label, idx) => pill(item.id, idx + 1, label)).join("");
  }
  if (item.type === "boolean") {
    return item.options.map((label, idx) => pill(item.id, idx, label)).join("");
  }
  return `<p>Unsupported question type.</p>`;
}

function pill(qid, value, label) {
  return `
    <label class="nf-option" data-qid="${qid}" data-value="${value}"
           style="display:flex; align-items:center; justify-content:center;
                  padding:10px 12px; border-radius:999px; cursor:pointer;
                  border:1px solid var(--nf-grey-200); background:#fff;">
      <input type="radio" name="${qid}" value="${value}" style="opacity:0; position:absolute;">
      <span>${escapeHTML(label)}</span>
    </label>
  `;
}

// --- Events
qCard.addEventListener("click", (e) => {
  const pill = e.target.closest(".nf-option");
  if (!pill) return;

  const qid = pill.dataset.qid;
  const val = pill.dataset.value;

  // Clear existing selection in this question
  qCard.querySelectorAll(`.nf-option[data-qid="${cssEsc(qid)}"]`)
      .forEach(p => p.classList.remove("selected"));
  pill.classList.add("selected");

  // Store answer (numbers for likert/boolean)
  const n = Number(val);
  state.answers[qid] = Number.isNaN(n) ? val : n;

  nextBtn.disabled = false;
});

backBtn.addEventListener("click", () => {
  if (state.step > 0) {
    state.step -= 1;
    render();
  }
});

nextBtn.addEventListener("click", () => {
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return; // require answer
  if (state.step < state.path.length - 1) {
    state.step += 1;
    render();
  }
});

finishBtn.addEventListener("click", () => {
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return; // require answer
  // For now, just prove it worked:
  alert("Screening scaffold complete. Answers: " + JSON.stringify(state.answers, null, 2));
  // Later:
  // sessionStorage.setItem('screeningAnswers', JSON.stringify(state.answers));
  // location.href = 'workout.html';
});

// --- Utils
function escapeHTML(s = "") {
  return s.replace(/[&<>\"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
}
function cssEsc(s = "") {
  return String(s).replace(/"/g, '\\"');
}

// --- Init
render();
``
