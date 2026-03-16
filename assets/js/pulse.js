// =============================================================
// NeuroFit • pulse.js
// 8-question sprint → 1 tailored micro-activity (internal logic only)
// =============================================================
(function(){
  const $ = (sel) => document.querySelector(sel);

  // DOM
  const stepWrap = $('#pulseStep');
  const pText    = $('#pulseProgress');
  const backBtn  = $('#pulseBack');
  const nextBtn  = $('#pulseNext');
  const finishBtn= $('#pulseFinish');
  const resultEl = $('#pulseResult');
  const printBtn = $('#pulsePrint');
  const fbNote   = $('#fb-note');

  // Sprint items (8)
  const ITEMS = [
    { id:'energy',    title:'How is your energy right now?', options:[
      {value:'low',  label:'Low'}, {value:'ok', label:'Okay'}, {value:'high', label:'High'} ]},
    { id:'focus',     title:'How is your focus?', options:[
      {value:'low',  label:'Low'}, {value:'ok', label:'Okay'}, {value:'high', label:'High'} ]},
    { id:'tension',   title:'How does your body feel?', options:[
      {value:'low',  label:'Calm/Loose'}, {value:'med', label:'Medium'}, {value:'high', label:'Tight'} ]},
    { id:'balance',   title:'Balance confidence right now?', options:[
      {value:'low',  label:'Low'}, {value:'ok', label:'Okay'}, {value:'high', label:'High'} ]},
    { id:'vestibular',title:'Head movement comfort?', options:[
      {value:'fixed', label:'Prefer fixed gaze'}, {value:'gentle', label:'Gentle turns'}, {value:'free', label:'Free turn OK'} ]},
    { id:'noise',     title:'Noise tolerance?', options:[
      {value:'quiet', label:'Quiet please'}, {value:'ok', label:'Okay'}, {value:'loud', label:'Loud is fine'} ]},
    { id:'posture',   title:'Would you prefer…', options:[
      {value:'seated', label:'Seated'}, {value:'either', label:'Either'}, {value:'standing', label:'Standing'} ]},
    { id:'time',      title:'Time available?', options:[
      {value:'30', label:'~30s'}, {value:'45', label:'~45s'}, {value:'60', label:'~60s'} ]}
  ];

  // State
  let index = 0;
  let answers = {}; // { id: value }

  // Render
  function render() {
    const item = ITEMS[index];
    pText.textContent = `Step ${index + 1} of ~${ITEMS.length}`;

    stepWrap.innerHTML = `
      <div class="nf-q">
        <div class="title" style="margin:0 0 6px;">${esc(item.title)}</div>
        <div class="nf-options" role="radiogroup" aria-label="${esc(item.title)}"
             style="display:grid; gap:8px; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr));">
          ${item.options.map(o => pill(item.id, o.value, o.label)).join('')}
        </div>
      </div>
    `;

    restoreSelection(item.id);

    backBtn.disabled = (index === 0);
    nextBtn.hidden = (index === ITEMS.length - 1);
    finishBtn.hidden = !nextBtn.hidden;
    nextBtn.disabled = (answers[item.id] === undefined);
  }

  function pill(qid, value, label) {
    return `
      <label class="nf-option" data-qid="${qid}" data-value="${value}"
             style="display:flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid var(--nf-grey-200);background:#fff;padding:10px 12px;cursor:pointer;">
        <input type="radio" name="${qid}" value="${value}" style="position:absolute;opacity:0;pointer-events:none;">
        <span>${esc(label)}</span>
      </label>
    `;
  }

  // Selection
  stepWrap.addEventListener('click', (e) => {
    const pill = e.target.closest('.nf-option');
    if (!pill) return;

    const qid = pill.dataset.qid;
    const val = pill.dataset.value;

    stepWrap.querySelectorAll(`.nf-option[data-qid="${css(qid)}"]`).forEach(p => p.classList.remove('selected'));
    pill.classList.add('selected');

    answers[qid] = val;
    nextBtn.disabled = false;
  });

  // Nav
  backBtn.addEventListener('click', () => {
    if (index > 0) { index -= 1; render(); }
  });

  nextBtn.addEventListener('click', () => {
    if (answers[ITEMS[index].id] === undefined) return;
    if (index < ITEMS.length - 1) { index += 1; render(); }
  });

  finishBtn.addEventListener('click', () => {
    if (answers[ITEMS[index].id] === undefined) return;

    // Build one activity
    const activity = pickActivity(answers);
    renderResult(activity);

    // Persist minimal pulse info (local only)
    try {
      sessionStorage.setItem('pulse_answers', JSON.stringify(answers));
      sessionStorage.setItem('pulse_result', JSON.stringify(activity));
    } catch(e){}

    printBtn.hidden = false;
    printBtn.onclick = () => window.print();
  });

  // Result rendering
  function renderResult(a) {
    resultEl.innerHTML = `
      <div class="result-card">
        <div class="section-title" style="margin-top:0;">Your Pulse Activity</div>
        <p class="result-title">${esc(a.title)}</p>
        <p class="result-meta">${esc(a.meta)}</p>
        <p class="result-cue">${esc(a.cue)}</p>
      </div>
    `;
    // Scroll to result
    resultEl.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  // Activity selection (internal NeuroFit logic)
  function pickActivity(ans) {
    const energy = ans.energy;              // low | ok | high
    const focus = ans.focus;                // low | ok | high
    const tension = ans.tension;            // low | med | high
    const balance = ans.balance;            // low | ok | high
    const vestib = ans.vestibular;          // fixed | gentle | free
    const noise  = ans.noise;               // quiet | ok | loud
    const posture= ans.posture;             // seated | either | standing
    const time   = Number(ans.time || '45');

    // Safety nudges
    const preferSeated = (posture === 'seated') || (balance === 'low');
    const fixedGaze    = (vestib === 'fixed');

    // 1) Regulation-first if needed
    if (tension === 'high' || focus === 'low') {
      if (preferSeated || fixedGaze) {
        return {
          type:'regulation',
          title:'Seated Box Breathing',
          meta: `~${time}s • fixed‑gaze friendly`,
          cue:'In 4 • Hold 2 • Out 6 — keep shoulders soft.'
        };
      }
      return {
        type:'regulation',
        title:'Box Breathing',
        meta: `~${time}s`,
        cue:'In 4 • Hold 2 • Out 6 — jaws relaxed, eyes soft.'
      };
    }

    // 2) Energy low → gentle energiser
    if (energy === 'low') {
      if (preferSeated) {
        return {
          type:'physical',
          title:'Seated March + Arm Swings',
          meta:`~${time}s`,
          cue:'Find a smooth rhythm; breathe easy.'
        };
      }
      if (noise === 'quiet') {
        return {
          type:'physical',
          title:'Seated Press + Release (Isometric)',
          meta:`~${time}s • quiet‑friendly`,
          cue:'Gently press palms together 3–4s, then relax.'
        };
      }
      return {
        type:'physical',
        title:'March + Arm Swings',
        meta:`~${time}s`,
        cue:'Soft steps, easy shoulders, steady breaths.'
      };
    }

    // 3) Vestibular care
    if (fixedGaze) {
      if (preferSeated) {
        return {
          type:'mindfulness',
          title:'Soft Gaze + 5‑Count Breath (Seated)',
          meta:`~${time}s • fixed‑gaze`,
          cue:'Soften eyes and count In 5, Out 5.'
        };
      }
      return {
        type:'mindfulness',
        title:'Soft Gaze + 5‑Count Breath',
        meta:`~${time}s • fixed‑gaze`,
        cue:'Unclench your jaw; In 5 • Out 5.'
      };
    }

    // 4) Default: light coordinative drill
    if (preferSeated) {
      return {
        type:'physical',
        title:'Seated Reach Pattern',
        meta:`~${time}s`,
        cue:'Reach forward/side gently; keep spine tall.'
      };
    }
    return {
      type:'physical',
      title:'Step + Reach Pattern',
      meta:`~${time}s`,
      cue:'Slow steps and smooth reaches; eyes softly focused.'
    };
  }

  // Restore selection per item
  function restoreSelection(qid) {
    const val = answers[qid];
    if (val === undefined) return;
    const el = stepWrap.querySelector(`.nf-option[data-qid="${css(qid)}"][data-value="${css(val)}"]`);
    if (el) el.classList.add('selected');
  }

  // Feedback (local-only)
  document.querySelectorAll('.feedback-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const how = btn.getAttribute('data-fb') || btn.textContent.trim();
      fbNote.textContent = `Thanks — noted: “${how}”.`;
      try {
        sessionStorage.setItem('pulse_feedback', how);
      } catch(e){}
    });
  });

  // Utils
  function esc(s=''){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function css(s=''){ return String(s).replace(/"/g,'\\"'); }

  // Init
  render();
})();
``
