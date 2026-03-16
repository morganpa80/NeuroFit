// =============================================================
// NeuroFit • groundgo.js
// 10‑minute reactive reset (internal logic only)
// =============================================================

(function(){
  const $ = (sel) => document.querySelector(sel);

  const stateEl = $('#gg-state');
  const envEl   = $('#gg-env');
  const seatEl  = $('#gg-seat');
  const buildBtn= $('#gg-build');
  const printBtn= $('#gg-print');
  const outEl   = $('#gg-output');
  const fbNote  = $('#fb-note');

  // --- Internal 10‑minute library (titles, cues, time) ---
  // Note: These are deliberately simple, school/NHS-friendly descriptions.
  const LIB = {
    // BLUE — Low & Flat (energise gently)
    blue: {
      warmup: [
        { title:"Rhythm March (Seated/Standing)", cue:"Build a smooth rhythm; relaxed shoulders.", info:"~90 sec" }
      ],
      main: [
        { title:"Arm Swings + Soft Reach", cue:"Open the chest softly; move comfortably.", info:"~2 min" },
        { title:"Step & Reach Pattern", cue:"Slow steps; reach forward with easy balance.", info:"~2 min" }
      ],
      settle: [
        { title:"Calm Breathing Finish", cue:"In 4 • Out 6; soften jaw and brow.", info:"~2 min" }
      ]
    },

    // GREEN — Steady & Ready (balanced)
    green: {
      warmup: [
        { title:"Joint Prep Flow", cue:"Smooth ankle–hip–shoulder circles.", info:"~90 sec" }
      ],
      main: [
        { title:"Supported Squat Pattern", cue:"Comfortable depth; steady tempo.", info:"~2 min" },
        { title:"Hinge + Reach", cue:"Long spine; slow hinge, gentle reach.", info:"~2 min" }
      ],
      settle: [
        { title:"Breath + Spine Cooldown", cue:"Slow down your exhales.", info:"~2 min" }
      ]
    },

    // YELLOW — Wound Up / On Edge (ground & slow)
    yellow: {
      warmup: [
        { title:"Grounded Breathing", cue:"Longer exhale than inhale.", info:"~90 sec" }
      ],
      main: [
        { title:"Seated Press + Release", cue:"Gentle isometric squeeze, then soften.", info:"~2 min" },
        { title:"Tempo Lower (Slow Down)", cue:"Count 3‑1‑3; easy range only.", info:"~2 min" }
      ],
      settle: [
        { title:"Soft Gaze + Long Exhale", cue:"Unclench jaw; soften eyes.", info:"~2 min" }
      ]
    },

    // RED — Overloaded (calm, supported, minimal intensity)
    red: {
      warmup: [
        { title:"Floor/Seated Calm Start", cue:"Comfortable position; quiet breathing.", info:"~90 sec" }
      ],
      main: [
        { title:"Supported Glute Bridge", cue:"Lift gently; small range; pause at top.", info:"~2 min" },
        { title:"Wall Hold (Hands or Forearms)", cue:"Light pressure; smooth breaths.", info:"~2 min" }
      ],
      settle: [
        { title:"Guided Rest", cue:"Stay low, slow, and comfortable.", info:"~2 min" }
      ]
    }
  };

  // --- Helpers: map UI state to color ---
  function mapStateToColor(state) {
    if (state === 'low') return 'blue';
    if (state === 'wound') return 'yellow';
    if (state === 'overloaded') return 'red';
    return 'green';
  }

  // --- Builder: create a plan based on state/env/seat ---
  function buildPlan(opts){
    const color = mapStateToColor(opts.state);
    const base  = structuredClone(LIB[color]);

    // Environment & seated adjustments (simple)
    const seated = (opts.seat === 'yes');
    const quiet  = (opts.env === 'quiet');

    const tweak = (blk) => blk.map(x => {
      const y = {...x};

      // Seated-friendly variants
      if (seated) {
        if (y.title.includes("Rhythm March")) y.title = "Seated Rhythm March";
        if (y.title.includes("Supported Squat")) y.title = "Sit‑to‑Stand (Supported)";
        if (y.title.includes("Hinge")) y.title = "Seated Hip Hinge (Short Range)";
        if (y.title.includes("Step & Reach")) y.title = "Seated Reach Pattern";
        if (y.title.includes("Wall Hold")) y.title = "Seated Press + Release (Isometric)";
      }

      // Quiet environment → prefer slow / low-stim cues
      if (quiet) {
        y.cue = (color === 'blue')
          ? "Keep it smooth and quiet; relaxed shoulders."
          : "Slow, quiet movement; longer exhales.";
      }

      return y;
    });

    return {
      color,
      sections: {
        warmup: tweak(base.warmup),
        main: tweak(base.main),
        settle: tweak(base.settle)
      }
    };
  }

  // --- Rendering ---
  function renderPlan(plan){
    const container = outEl;
    const section = (title, arr) => {
      let html = `<div class="section-title">${title}</div>`;
      arr.forEach(b => {
        html += `
          <div class="exercise-block">
            <p class="exercise-title">${b.title}</p>
            <p class="exercise-cue">${b.cue}</p>
            <p class="exercise-info">${b.info}</p>
          </div>
        `;
      });
      return html;
    };

    // Clear + render
    container.innerHTML =
      section("Warmup (~3 minutes)", plan.sections.warmup) +
      section("Main (~5 minutes)", plan.sections.main) +
      section("Settle (~2 minutes)", plan.sections.settle);
  }

  // --- Persistence: save minimal route for potential reuse ---
  function saveSession(plan, opts){
    // PreColor for consistency with your other flows
    const preColor = plan.color;
    const route = {
      version: "nf-1.0",
      origin: "ground-go",
      preColor,
      planType: "quick-10",
      env: opts.env,
      seated: (opts.seat === 'yes')
    };

    sessionStorage.setItem("screeningRoute", JSON.stringify(route));
    sessionStorage.setItem("preColor", preColor);
    sessionStorage.setItem("planType", "quick-10");
  }

  // --- Feedback capture (optional local note) ---
  document.querySelectorAll('.feedback-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const how = btn.getAttribute('data-fb') || btn.textContent.trim();
      fbNote.textContent = `Thanks — noted: “${how}”.`;
      try {
        sessionStorage.setItem('gg_feedback', how);
      } catch(e){}
    });
  });

  // --- Build click ---
  buildBtn.addEventListener('click', () => {
    const opts = {
      state: stateEl.value,   // low | steady | wound | overloaded
      env:   envEl.value,     // standard | quiet
      seat:  seatEl.value     // yes | no
    };

    const plan = buildPlan(opts);
    renderPlan(plan);
    saveSession(plan, opts);

    printBtn.disabled = false;
    // Scroll to output on small screens
    outEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // --- Print click ---
  printBtn.addEventListener('click', () => window.print());
})();
``
