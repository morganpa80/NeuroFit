<script>
// =============================
// NeuroFit Screening – Scaffold
// =============================

// --- Config: target count ~40-ish (default weight towards 41)
const DISPLAY_TARGET_CHOICES = [38, 39, 40, 41, 42];
const displayTarget = 41; // we can randomise later if you prefer
// const displayTarget = DISPLAY_TARGET_CHOICES[Math.floor(Math.random()*DISPLAY_TARGET_CHOICES.length)];

const state = {
  step: 0,                       // 0-based index
  answers: {},                   // { qid: value }
  path: [],                      // array of question objects in the order shown
  lockedBackFor: new Set(),      // qids that are safety confirmations
  preColor: null,                // placeholder for your pre-color / state logic
  planType: '6-week'
};

// --- Placeholder questions (will be replaced by your adaptive selector)
const SEED_QUESTIONS = [
  {
    id: 'A1',
    text: 'How would you describe your general energy level most weeks?',
    type: 'likert5',
    options: ['Very low','Low','Moderate','High','Very high'],
    group: 'A', pillar: 'GROUND'
  },
  {
    id: 'B2',
    text: 'How important is improving balance & stability to you?',
    type: 'likert5',
    options: ['Not at all','Low','Moderate','High','Very high'],
    group: 'B', pillar: 'GROW'
  },
  {
    id: 'F2',
    text: 'Do you experience dizziness with turning or rising quickly?',
    type: 'boolean', // safety confirmation – Back will be locked here
    options: ['No','Yes'],
    group: 'F', pillar: 'SAFETY', safety: true
  }
];

// For scaffold, our path == seed questions.
// Later this will be the adaptive 60→~40 selection.
state.path = [...SEED_QUESTIONS];

// ---------- DOM refs
const qCard = document.getElementById('qCard');
const progressText = document.getElementById('progressText');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const finishBtn = document.getElementById('finishBtn');

// ---------- Render
function render() {
  const i = state.step;
  const total = state.path.length; // for scaffold; later show "~40-ish"
  const item = state.path[i];
  if (!item) return;

  // Progress text (playful)
  progressText.textContent = `Step ${i + 1} of ~${displayTarget}-ish`;

  // Build the card
  qCard.innerHTML = `
    <div class="nf-q">
      <h3 class="title" id="qTitle">${item.text}</h3>
      <div class="sub" id="qHelp">${helpText(item)}</div>
      <div class="nf-options" role="radiogroup" aria-labelledby="qTitle" style="display:grid; gap:8px; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); margin-top:10px;">
        ${renderOptions(item)}
      </div>
    </div>
  `;

  // Restore selection if answered
  if (state.answers[item.id] !== undefined) {
    const val = state.answers[item.id];
    const el = qCard.querySelector(`[data-value="${cssEscape(val)}"]`);
    if (el) {
      el.classList.add('selected');
      const input = el.querySelector('input');
      if (input) input.checked = true;
      nextBtn.disabled = false;
    }
  } else {
    nextBtn.disabled = true;
  }

  // Back/Next/Finish visibility
  backBtn.disabled = shouldLockBack(item);
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
  // extend for multiselect later
  return '';
}

function pill(qid, value, label) {
  return `
    <label class="nf-option" data-qid="${qid}" data-value="${value}"
           style="display:inline-flex; align-items:center; justify-content:center; border-radius:999px; border:1px solid var(--nf-grey-200); background:#fff; padding:10px 12px; cursor:pointer; user-select:none;">
      <input type="radio" name="${qid}" value="${value}" aria-label="${escapeHtml(label)}" style="position:absolute; opacity:0; pointer-events:none;">
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function shouldLockBack(item) {
  // Back is locked on safety confirmations only (your rule)
  return !!item.safety;
}

// ---------- Events
qCard.addEventListener('click', (e) => {
  const pill = e.target.closest('.nf-option');
  if (!pill) return;
  const qid = pill.getAttribute('data-qid');
  const value = pill.getAttribute('data-value');

  // clear group selection
  qCard.querySelectorAll(`.nf-option[data-qid="${cssEscape(qid)}"]`).forEach(p => p.classList.remove('selected'));
  pill.classList.add('selected');

  // store answer
  state.answers[qid] = isNaN(Number(value)) ? value : Number(value);
  nextBtn.disabled = false;
});

backBtn.addEventListener('click', () => {
  const item = state.path[state.step];
  if (shouldLockBack(item)) return; // safeguard
  state.step = Math.max(0, state.step - 1);
  render();
});

nextBtn.addEventListener('click', () => {
  // require an answer before continuing
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return;
  // advance
  state.step = Math.min(state.path.length - 1, state.step + 1);
  render();
});

finishBtn.addEventListener('click', () => {
  // ensure last question answered
  const item = state.path[state.step];
  if (state.answers[item.id] === undefined) return;

  // ----- derive minimal route bundle (placeholder)
  const screeningAnswers = state.answers;

  // Example mapping for preColor (your state/zone precursor) – to be replaced by RI calc
  const avgEnergy = Number(screeningAnswers['A1'] || 3);
  const preColor = avgEnergy <= 2 ? 'blue' : (avgEnergy >= 4 ? 'yellow' : 'green');

  // Route payload (extend later)
  const screeningRoute = {
    origin: 'screening-adaptive',
    version: 'v1-scaffold',
    // add tags later (goal_strength, safety_dizzy, etc.)
  };

  // Write required sessionStorage keys
  sessionStorage.setItem('screeningAnswers', JSON.stringify(screeningAnswers));
  sessionStorage.setItem('screeningRoute', JSON.stringify(screeningRoute));
  sessionStorage.setItem('preColor', JSON.stringify(preColor));
  sessionStorage.setItem('planType', '6-week');

  // Navigate to workout
  location.href = 'workout.html';
});

// ---------- Utils
function escapeHtml(s=''){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function cssEscape(s){ return String(s).replace(/"/g,'\\"'); }

// ---------- Init
render();
</script>
``
