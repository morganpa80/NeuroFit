// =============================================================
// NeuroFit • screening.js
// Full sprint-style adaptive screening controller
// Integrates: questions.js, logic.js, compute.js, router.js
// =============================================================

// -------------------------------------------------------------
// 0. Setup
// -------------------------------------------------------------
let screeningPath = [];      // final ordered list of questions
let answers = {};            // { qid: value }
let step = 0;                // index into screeningPath
let displayTarget = 41;      // default "~40-ish"

// DOM
const qCard = document.getElementById("qCard");
const progressText = document.getElementById("progressText");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const finishBtn = document.getElementById("finishBtn");

// -------------------------------------------------------------
// 1. Initialise Adaptive Path
// -------------------------------------------------------------
function initScreening() {
  // Build selection WITHOUT answers (first pass)
  // We only use selection gates requiring early answers (none yet)
  screeningPath = window.NeuroFitLogic.buildSelection(answers);

  // shuffle determined inside logic.js with session-stable RNG
  step = 0;
  renderStep();
}

// -------------------------------------------------------------
// 2. Render Current Step
// -------------------------------------------------------------
function renderStep() {
  const item = screeningPath[step];
  if (!item) return;

  // Progress text
  progressText.textContent = `Step ${step + 1} of ~${displayTarget}-ish`;

  // Build UI
  qCard.innerHTML = `
    <h3 class="title">${escapeHTML(item.text)}</h3>
    <div class="sub">${helperText(item)}</div>
    <div class="nf-options"
         style="margin-top:12px; display:grid; gap:10px;
                grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
      ${renderOptions(item)}
    </div>
  `;

  restorePreviousAnswer(item);
  configureControls(item);
}

// -------------------------------------------------------------
// 3. Build Option HTML
// -------------------------------------------------------------
function renderOptions(item) {
  if (item.type === "likert5") {
    return [1,2,3,4,5]
      .map(v => pill(item.id, v, likertLabel(v)))
      .join("");
  }

  if (item.type === "boolean") {
    return [
      pill(item.id, 0, "No"),
      pill(item.id, 1, "Yes")
    ].join("");
  }

  if (item.type === "multi" && item.options) {
    return item.options
      .map(opt => multiPill(item.id, opt))
      .join("");
  }

  return "<p>Error: unknown type</p>";
}

// Likert helpers
function likertLabel(v) {
  return ["Very low","Low","Moderate","High","Very high"][v-1];
}

function pill(qid, value, label) {
  return `
    <label class="nf-option"
           data-qid="${qid}"
           data-value="${value}"
           style="display:flex;justify-content:center;align-items:center;
           padding:10px;border-radius:999px;border:1px solid var(--nf-grey-200);
           background:#fff;cursor:pointer;">
      <input type="radio" name="${qid}" value="${value}"
             style="opacity:0;position:absolute;">
      <span>${escapeHTML(label)}</span>
    </label>
  `;
}

function multiPill(qid, label) {
  return `
    <label class="nf-option"
           data-qid="${qid}"
           data-value="${escapeAttr(label)}"
           data-multi="1"
           style="display:flex;justify-content:center;align-items:center;
           padding:10px;border-radius:999px;border:1px solid var(--nf-grey-200);
           background:#fff;cursor:pointer;">
      <input type="checkbox" name="${qid}"
             value="${escapeAttr(label)}"
             style="opacity:0;position:absolute;">
      <span>${escapeHTML(label)}</span>
    </label>
  `;
}

// -------------------------------------------------------------
// 4. Answer Selection
// -------------------------------------------------------------
qCard.addEventListener("click", e => {
  const pill = e.target.closest(".nf-option");
  if (!pill) return;

  const qid = pill.dataset.qid;
  const value = pill.dataset.value;
  const isMulti = pill.dataset.multi === "1";

  if (!isMulti) {
    // clear previous for this qid
    qCard.querySelectorAll(`.nf-option[data-qid="${cssEsc(qid)}"]`)
         .forEach(p => p.classList.remove("selected"));

    pill.classList.add("selected");

    answers[qid] = Number(value);
    nextBtn.disabled = false;
  } else {
    // multiselect
    pill.classList.toggle("selected");

    const selected = [...qCard.querySelectorAll(
      `.nf-option[data-qid="${cssEsc(qid)}"].selected`
    )].map(p => p.dataset.value);

    answers[qid] = selected;
    nextBtn.disabled = selected.length === 0;
  }
});

// -------------------------------------------------------------
// 5. Navigation
// -------------------------------------------------------------
backBtn.addEventListener("click", () => {
  const item = screeningPath[step];
  if (item.safety) return; // locked

  if (step > 0) {
    step--;
    renderStep();
  }
});

nextBtn.addEventListener("click", () => {
  const item = screeningPath[step];
  if (answers[item.id] === undefined ||
      answers[item.id] === null ||
      (Array.isArray(answers[item.id]) && answers[item.id].length === 0)) {
    return;
  }

  if (step < screeningPath.length - 1) {
    step++;
    renderStep();
  }
});

finishBtn.addEventListener("click", () => {
  const item = screeningPath[step];
  if (answers[item.id] === undefined ||
      answers[item.id] === null ||
      (Array.isArray(answers[item.id]) && answers[item.id].length === 0)) {
    return;
  }

  // Compute profile
  const profile = window.NeuroFitCompute.compute(answers);

  // Route to plan
  window.NeuroFitRouter.buildRoute(answers, profile);
});

// -------------------------------------------------------------
// 6. Helpers
// -------------------------------------------------------------
function restorePreviousAnswer(item) {
  const val = answers[item.id];
  if (val === undefined) {
    nextBtn.disabled = true;
    return;
  }

  if (Array.isArray(val)) {
    val.forEach(v => {
      const el = qCard.querySelector(
        `.nf-option[data-value="${cssEsc(v)}"]`
      );
      if (el) el.classList.add("selected");
    });
    nextBtn.disabled = val.length === 0;
    return;
  }

  const el = qCard.querySelector(
    `.nf-option[data-value="${cssEsc(val)}"]`
  );
  if (el) el.classList.add("selected");
  nextBtn.disabled = false;
}

function configureControls(item) {
  backBtn.disabled = !!item.safety;
  nextBtn.hidden = (step === screeningPath.length - 1);
  finishBtn.hidden = !nextBtn.hidden;
}

function helperText(item) {
  if (item.type === "likert5")
    return "Choose the option that matches your typical week.";
  if (item.type === "boolean")
    return "Please choose one option.";
  if (item.type === "multi")
    return "Select all that apply.";
  if (item.safety)
    return "This helps keep your plan safe.";
  return "";
}

function escapeHTML(s="") {
  return s.replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" }[c]
  ));
}

function escapeAttr(s="") {
  return escapeHTML(s).replace(/"/g,'&quot;');
}

function cssEsc(s="") {
  return String(s).replace(/"/g, '\\"');
}

// -------------------------------------------------------------
// 7. INIT
// -------------------------------------------------------------
initScreening();
