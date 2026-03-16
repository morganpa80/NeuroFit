// =============================
// NeuroFit – Screening (Scaffold)
// =============================

// --- Display target: "~40-ish" (default 41; we can randomise later)
const DISPLAY_TARGET_CHOICES = [38, 39, 40, 41, 42];
const displayTarget = 41;
// If you want entropy right now, uncomment:
// const displayTarget = DISPLAY_TARGET_CHOICES[Math.floor(Math.random() * DISPLAY_TARGET_CHOICES.length)];

// --- Minimal state for the sprint flow
const state = {
  step: 0,                 // 0-based index into `path`
  answers: {},             // { qid: value }
  path: [],                // the ordered list of items we show this run
  planType: '6-week',
};

// --- TEMP questions (for page flow ONLY)
// We'll replace this with your adaptive 60 -> ~40 selector in Step 2.5
const SEED_QUESTIONS = [
  {
    id: 'A1',
    text: 'How would you describe your general energy level most weeks?',
    type: 'likert5',
    options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
    group: 'A', pillar: 'GROUND'
  },
  {
    id: 'B2',
    text: 'How important is improving balance & stability to you?',
    type: 'likert5',
    options: ['Not at all', 'Low', 'Moderate', 'High', 'Very high'],
    group: 'B', pillar: 'GROW'
  },
  {
    id: 'F2',
    text: 'Do you experience dizziness with turning or rising quickly?',
    type: 'boolean',
    options: ['No', 'Yes'],
    group: 'F', pillar: 'SAFETY', safety: true
  }
];

// For the scaffold, just use the seed path:
state.path = [...SEED_QUESTIONS];

// --- DOM refs
const qCard = document.getElementById('qCard');
const progressText = document.getElementById('progressText');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const finishBtn = document.getElementById('finishBtn');

// --- Render a single step
function render() {
  const i = state.step;
  const item = state.path[i];
  if (!item) return;

  // Progress (playful)
  progressText.textContent = `Step ${i + 1} of ~${displayTarget}-ish`;

  // Build options UI (pills)
  qCard.innerHTML = `
    <div class="nf-q">
      <h3 class="title" id="qTitle">${escapeHtml(item.text)}</h3>
      <div class="sub" id="qHelp">${helpText(item)}</div>

      <div class="nf-options" role="radiogroup" aria-labelledby="qTitle"
           style="display:grid; gap:8px; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); margin-top:10px;">
        ${renderOptions(item)}
      </div>
    </div>
  `;

  // Restore selection if already answered
  const prev = state.answers[item.id];
  if (prev !== undefined) {
    const selected = qCard.querySelector(`.nf-option[data-value="${cssEscape(prev)}"]`);
    if (selected) {
      selected.classList.add('selected');
      const input = selected.querySelector('input');
      if (input) input.checked = true;
      nextBtn.disabled = false;
    }
  } else {
    nextBtn.disabled = true;
  }

  // Controls
  backBtn.disabled = !!item.safety;             // Back locked on safety confirmations
  nextBtn.hidden = (i === state.path.length - 1);
  finishBtn.hidden = !nextBtn.hidden;
}

function helpText(item) {
  if (item.type === 'likert5') return 'Use the scale that best matches your typical week.';
  if (item.safety) return 'This helps us keep your plan safe and comfortable.';
  return '';
}

function renderOptions(item) {
  if (item.type === 'likert5') {
    return item.options.map((label, idx) => pill(item.id, idx + 1, label)).join('');
  }
  if (item.type === 'boolean') {
    return item.options.map((label, idx) => pill(item.id, idx, label)).join('');
  }
  return '';
}

function pill(qid, value, label) {
  return `
    <label class="nf-option" data-qid="${qid}" data-value="${value}"
           style="display:inline-flex; align-items:center; justify-content:center; border-radius:999px; border:1px solid var(--nf-grey-200); background:#fff; padding:10px 12px; cursor:pointer; user-select:none;">
      <input type="radio" name="${qid}" value="${value}" aria-label="${escapeHtml(label)}"
             style="position:absolute; opacity:0; pointer-events:none;">
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

// --- Events (pills + nav)
qCard.addEventListener('click', (e) => {
  const pill = e.target.closest('.nf-option');
  if (!pill) return;
  const qid = pill.getAttribute('data-qid');
  const value = pill.getAttribute('data-value');

  // Clear group selection and set new
  qCard.querySelectorAll(`.nf-option[data-qid="${cssEscape(qid)}"]`).forEach(p => p.classList.remove('selected'));
  pill.classList.add('selected');

  // Store answer (numbers for likert & boolean)
  const numeric = Number(value);
  state.answers[qid] = Number.isNaN(numeric) ? value : numeric;

  nextBtn.disabled = false;
});

backBtn.addEventListener('click', () => {
  const item = state.path[state.step];
  if (item?.safety) return; // safeguard
  state.step = Math.max(0, state.step - 1);
  render();
});

nextBtn.addEventListener('click', () => {
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return; // must answer
  state.step = Math.min(state.path.length - 1, state.step + 1);
  render();
});

finishBtn.addEventListener('click', () => {
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return; // must answer

  // --- Minimal routing bundle (placeholder for now)
  const screeningAnswers = state.answers;

  // Simple preColor example: will be replaced by RI/Zone mapping
  const energy = Number(screeningAnswers['A1'] ?? 3);
  const preColor = energy <= 2 ? 'blue' : (energy >= 4 ? 'yellow' : 'green');

  const screeningRoute = {
    origin: 'screening-adaptive',
    version: 'v0-scaffold'
    // Tags & composites added in Step 2.5
  };

  // Required storage keys for workout.html
  sessionStorage.setItem('screeningAnswers', JSON.stringify(screeningAnswers));
  sessionStorage.setItem('screeningRoute', JSON.stringify(screeningRoute));
  sessionStorage.setItem('preColor', JSON.stringify(preColor));
  sessionStorage.setItem('planType', '6-week');

  // Navigate to plan
  location.href = 'workout.html';
});

// --- Utils
function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function cssEscape(s) {
  return String(s).replace(/"/g, '\\"');
}

// --- Init
render();
