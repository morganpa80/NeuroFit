// =============================================================
// NeuroFit • screening.js
// Full sprint-style adaptive screening controller
// Integrates: questions.js, logic.js, compute.js, router.js
// =============================================================
(function () {
  // -----------------------------
  // DOM refs (fail-safe lookups)
  // -----------------------------
  const qCard       = document.getElementById("qCard");
  const progressEl  = document.getElementById("progressText");
  const backBtn     = document.getElementById("backBtn");
  const nextBtn     = document.getElementById("nextBtn");
  const finishBtn   = document.getElementById("finishBtn");

  if (!qCard || !progressEl || !backBtn || !nextBtn || !finishBtn) {
    console.error("[NeuroFit] screening.js: Missing required DOM elements.");
    return;
  }

  // -----------------------------
  // State
  // -----------------------------
  const DISPLAY_TARGET_CHOICES = [38, 39, 40, 41, 42];
  // default to 41; you can randomise elsewhere and stash a choice in sessionStorage if you like
  const displayTarget = Number(sessionStorage.getItem("nf_display_target")) || 41;

  const state = {
    step: 0,                 // 0-based index into path
    path: [],                // final ordered list of items
    answers: Object.create(null), // { qid: number | string | string[] }
  };

  // -----------------------------
  // Init
  // -----------------------------
  init();

  function init() {
    try {
      // Build an adaptive selection once at start (session-stable via logic.js RNG)
      if (window.NeuroFitLogic && window.NeuroFitQuestions) {
        state.path = window.NeuroFitLogic.buildSelection(state.answers) || [];
      } else {
        console.warn("[NeuroFit] logic/questions missing — falling back to a minimal path.");
        state.path = fallbackSeed();
      }

      // Guard against empty path
      if (!Array.isArray(state.path) || state.path.length === 0) {
        state.path = fallbackSeed();
      }

      state.step = 0;
      render();
      wireEvents();
    } catch (err) {
      console.error("[NeuroFit] init failed:", err);
      qCard.innerHTML = `<p class="sub">Sorry — something went wrong starting the screening. Please refresh.</p>`;
    }
  }

  // -----------------------------
  // Rendering
  // -----------------------------
  function render() {
    const item = state.path[state.step];
    if (!item) return;

    // Progress text
    progressEl.textContent = `Step ${state.step + 1} of ~${displayTarget}-ish`;

    // Build options
    const optionsHTML = renderOptions(item);

    // Build card
    qCard.innerHTML = `
      <h3 class="title" id="qTitle">${html(item.text)}</h3>
      <div class="sub" id="qHelp">${helpText(item)}</div>
      <div class="nf-options"
           ${item.type === "likert5" ? 'role="radiogroup" aria-labelledby="qTitle"' : 'role="group" aria-labelledby="qTitle"'}
           style="margin-top:12px; display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
        ${optionsHTML}
      </div>
    `;

    // Restore previous answer (if any) and set nav buttons correctly
    restoreSelection(item);
    configureNav(item);
  }

  function renderOptions(item) {
    if (item.type === "likert5") {
      return [1, 2, 3, 4, 5].map(v => radioPill(item.id, v, likertLabel(v))).join("");
    }
    if (item.type === "boolean") {
      return radioPill(item.id, 0, "No") + radioPill(item.id, 1, "Yes");
    }
    if (item.type === "multi") {
      const opts = Array.isArray(item.options) ? item.options : [];
      return opts.map(label => multiPill(item.id, String(label))).join("");
    }
    return `<p class="sub">Unsupported item type.</p>`;
  }

  function radioPill(qid, value, label) {
    return `
      <label class="nf-option"
             data-qid="${attr(qid)}"
             data-value="${attr(value)}"
             style="display:flex;align-items:center;justify-content:center;
                    padding:10px;border-radius:999px;border:1px solid var(--nf-grey-200);
                    background:#fff;cursor:pointer;user-select:none;">
        <input type="radio" name="${attr(qid)}" value="${attr(value)}"
               aria-label="${attr(label)}"
               style="position:absolute;opacity:0;pointer-events:none;">
        <span>${html(label)}</span>
      </label>
    `;
  }

  function multiPill(qid, label) {
    return `
      <label class="nf-option"
             data-qid="${attr(qid)}"
             data-value="${attr(label)}"
             data-multi="1"
             style="display:flex;align-items:center;justify-content:center;
                    padding:10px;border-radius:999px;border:1px solid var(--nf-grey-200);
                    background:#fff;cursor:pointer;user-select:none;">
        <input type="checkbox" name="${attr(qid)}" value="${attr(label)}"
               aria-label="${attr(label)}"
               style="position:absolute;opacity:0;pointer-events:none;">
        <span>${html(label)}</span>
      </label>
    `;
  }

  function helpText(item) {
    if (item.safety) return "This helps keep your plan safe.";
    if (item.type === "likert5") return "Choose the option that matches your typical week.";
    if (item.type === "boolean") return "Please choose one option.";
    if (item.type === "multi") return "Select all that apply (you can also continue with none).";
    return "";
  }

  function likertLabel(v) {
    return ["Very low", "Low", "Moderate", "High", "Very high"][v - 1] || String(v);
  }

  // -----------------------------
  // Events
  // -----------------------------
  function wireEvents() {
    // Select / toggle
    qCard.addEventListener("click", onPillClick);

    // Nav
    backBtn.addEventListener("click", onBack);
    nextBtn.addEventListener("click", onNext);
    finishBtn.addEventListener("click", onFinish);

    // Accessibility: Enter advances if answer present
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !nextBtn.hidden && !nextBtn.disabled) {
        e.preventDefault();
        onNext();
      }
    });
  }

  function onPillClick(e) {
    const pill = e.target.closest(".nf-option");
    if (!pill) return;

    const qid    = pill.getAttribute("data-qid");
    const value  = pill.getAttribute("data-value");
    const isMulti = pill.getAttribute("data-multi") === "1";
    const item   = state.path[state.step];

    if (!item || !qid) return;

    if (isMulti) {
      // -------- MULTI-SELECT (SAFE) --------
      pill.classList.toggle("selected");

      // collect all selected values for this qid
      const selected = [...qCard.querySelectorAll(`.nf-option[data-qid="${css(qid)}"].selected`)]
        .map(p => p.getAttribute("data-value"));

      // store array (support empty = "no equipment" / "none selected")
      state.answers[qid] = selected;

      // For multi-select we ALLOW zero selections (user can continue)
      nextBtn.disabled = false;
      return;
    }

    // -------- SINGLE SELECT (Likert/Boolean) --------
    // clear group
    qCard.querySelectorAll(`.nf-option[data-qid="${css(qid)}"]`)
      .forEach(p => p.classList.remove("selected"));

    pill.classList.add("selected");

    // store as number if numeric, otherwise string
    const n = Number(value);
    state.answers[qid] = Number.isFinite(n) ? n : value;

    // now you can continue
    nextBtn.disabled = false;
  }

  function onBack() {
    const item = state.path[state.step];
    // Back is locked on safety confirmations only
    if (item && item.safety) return;

    if (state.step > 0) {
      state.step -= 1;
      render();
    }
  }

  function onNext() {
    const item = state.path[state.step];
    if (!item) return;

    // Require an answer for single-select; allow empty for multi-select
    const val = state.answers[item.id];
    const isMulti = item.type === "multi";

    if (!isMulti && (val === undefined || val === null)) {
      nextBtn.disabled = true;
      return;
    }

    if (state.step < state.path.length - 1) {
      state.step += 1;
      render();
    }
  }

  function onFinish() {
    const item = state.path[state.step];
    if (!item) return;

    const val = state.answers[item.id];
    const isMulti = item.type === "multi";
    if (!isMulti && (val === undefined || val === null)) return;

    try {
      if (!window.NeuroFitCompute || !window.NeuroFitRouter) {
        console.error("[NeuroFit] compute/router missing.");
        alert("Sorry — the final step cannot complete (compute/router missing).");
        return;
      }

      const profile = window.NeuroFitCompute.compute(state.answers);
      window.NeuroFitRouter.buildRoute(state.answers, profile);
      // buildRoute will navigate to workout.html
    } catch (err) {
      console.error("[NeuroFit] finish failed:", err);
      alert("Sorry — something went wrong finishing your screening. Please try again.");
    }
  }

  // -----------------------------
  // Restore + Nav helpers
  // -----------------------------
  function restoreSelection(item) {
    const val = state.answers[item.id];
    // No previous answer
    if (val === undefined) {
      // For multi-select we let users continue with none
      nextBtn.disabled = item.type === "multi" ? false : true;
      return;
    }

    // Multi-select: array of strings
    if (Array.isArray(val)) {
      val.forEach(v => {
        const el = qCard.querySelector(`.nf-option[data-value="${css(v)}"]`);
        if (el) el.classList.add("selected");
      });
      // allow continue even if array currently empty
      nextBtn.disabled = false;
      return;
    }

    // Single option
    const el = qCard.querySelector(`.nf-option[data-value="${css(val)}"]`);
    if (el) el.classList.add("selected");
    nextBtn.disabled = false;
  }

  function configureNav(item) {
    backBtn.disabled = !!item.safety;
    const isLast = state.step === state.path.length - 1;
    nextBtn.hidden = isLast;
    finishBtn.hidden = !isLast;

    // If we’re on a multi-select, allow continuing even if nothing selected yet
    if (item.type === "multi") {
      nextBtn.disabled = false;
    }
  }

  // -----------------------------
  // Fallback (if engine not loaded)
  // -----------------------------
  function fallbackSeed() {
    return [
      {
        id: "A1",
        text: "How would you describe your general energy level most weeks?",
        type: "likert5"
      },
      {
        id: "B2",
        text: "How important is improving balance & stability to you?",
        type: "likert5"
      },
      {
        id: "F3",
        text: "What equipment do you have access to?",
        type: "multi",
        options: ["Floor", "Chair", "Wall", "Band", "Dumbbells"],
        safety: true
      }
    ];
  }

  // -----------------------------
  // Utils
  // -----------------------------
  function html(s = "") {
    return String(s).replace(/[&<>\"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }
  function attr(s = "") {
    // attribute-safe
    return html(String(s)).replace(/"/g, "&quot;");
  }
  function css(s = "") {
    // minimal escape for attribute selectors
    return String(s).replace(/"/g, '\\"');
  }
})();
``
