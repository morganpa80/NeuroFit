// =============================================================
// NeuroFit Adaptive Engine – logic.js
// Session-Stable Randomised Selection (38–42 questions)
// =============================================================

// We assume window.NeuroFitQuestions is already loaded (questions.js)

// -------------------------------------------------------------
// Utility: Session-Stable RNG
// -------------------------------------------------------------
function createSessionRNG() {
  // Create or re-use a uuid seed for this session
  let seed = sessionStorage.getItem("nf_session_seed");
  if (!seed) {
    seed = crypto.randomUUID();
    sessionStorage.setItem("nf_session_seed", seed);
  }

  // Convert the UUID into a numeric seed
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  let state = h >>> 0;

  // Mulberry32 PRNG (fast, deterministic)
  return function() {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rng = createSessionRNG();

// -------------------------------------------------------------
// Utility: Shuffle (session-stable)
// -------------------------------------------------------------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -------------------------------------------------------------
// Adaptive Selector
// -------------------------------------------------------------
window.NeuroFitLogic = {

  buildSelection(answersSoFar = {}) {
    const Q = window.NeuroFitQuestions;

    // -----------------------------------------
    // Step 1: Always-Ask A + B
    // -----------------------------------------
    const A = [...Q.A];
    const B = [...Q.B];

    // Keep A+B ordered (these establish RI & GOI)
    const base = [...A, ...B]; // 12 items

    // -----------------------------------------
    // Step 2: Seed Core Pools (C + D)
    // -----------------------------------------
    // Sample enough items to cover all families
    let coreC = shuffle([...Q.C]);
    let coreD = shuffle([...Q.D]);

    // Minimum guaranteed representation:
    const minC = 8;   // from C pool
    const minD = 6;   // from D pool

    coreC = coreC.slice(0, minC);
    coreD = coreD.slice(0, minD);

    // Combined core pool (~14 items)
    const core = [...coreC, ...coreD];

    // -----------------------------------------
    // Step 3: Pre-Trigger Calculations
    // -----------------------------------------
    // Minimal stub until full compute.js arrives
    function low(val) { return val !== undefined && val <= 2; }
    function high(val) { return val !== undefined && val >= 4; }

    // Quick signals used by E triggers:
    const balanceLowSignal =
      low(answersSoFar["D1"]) ||
      low(answersSoFar["D2"]) ||
      low(answersSoFar["D3"]);

    const coreLowSignal =
      low(answersSoFar["C7"]) ||
      low(answersSoFar["C8"]) ||
      low(answersSoFar["C9"]);

    const confidenceSignal =
      high(answersSoFar["B5"]) && (
        low(answersSoFar["C1"]) ||
        low(answersSoFar["C4"]) ||
        low(answersSoFar["C7"])
      );

    const adherenceSignal = low(answersSoFar["B6"]);

    const highCapSignal =
      high(answersSoFar["C1"]) &&
      high(answersSoFar["C4"]) &&
      high(answersSoFar["D1"]);

    // -----------------------------------------
    // Step 4: Conditional E Items
    // -----------------------------------------
    let conditionals = [];

    Q.E.forEach(q => {
      if (q.trigger === "balanceLow" && balanceLowSignal) conditionals.push(q);
      if (q.trigger === "coreLow" && coreLowSignal) conditionals.push(q);
      if (q.trigger === "confidence" && confidenceSignal) conditionals.push(q);
      if (q.trigger === "adherence" && adherenceSignal) conditionals.push(q);
      if (q.trigger === "highCap" && highCapSignal) conditionals.push(q);
    });

    // Sample from conditionals:
    conditionals = shuffle(conditionals).slice(0, 8);

    // -----------------------------------------
    // Step 5: Safety F Items (flag only)
    // -----------------------------------------
    let safety = [];
    if (answersSoFar["F1"] === 1) safety.push(Q.F[0]);  // joint pain
    if (answersSoFar["F2"] === 1) safety.push(Q.F[1]);  // dizziness
    // F3 equipment always shown in full screen if needed:
    // We show once in the screening:
    safety.push(Q.F[2]); // equipment

    // Pain recency etc. (only if F1 triggered)
    if (answersSoFar["F1"] === 1) {
      safety.push(Q.F[3]);
      safety.push(Q.F[4]);
      safety.push(Q.F[5]);
    }

    // -----------------------------------------
    // Step 6: Calibration G Items (rare)
    // -----------------------------------------
    let calibration = [];

    // Simple mismatch signals for now
    const strengthVsBalanceMismatch =
      high(answersSoFar["C1"]) && low(answersSoFar["D1"]);
    const tensionVsIntensityMismatch =
      high(answersSoFar["A4"]) && high(answersSoFar["B6"]);
    const energyVsReadinessMismatch =
      high(answersSoFar["A1"]) && low(answersSoFar["A6"]);
    const corePreferenceMismatch =
      high(answersSoFar["E4"]) && low(answersSoFar["C8"]);
    const vestibularMismatch =
      answersSoFar["F2"] === 1 && high(answersSoFar["D6"]);
    const hipMismatch =
      low(answersSoFar["C10"]) && high(answersSoFar["F5"]);

    Q.G.forEach(q => {
      if (q.trigger === "strengthVsBalanceMismatch" && strengthVsBalanceMismatch) calibration.push(q);
      if (q.trigger === "tensionVsIntensityMismatch" && tensionVsIntensityMismatch) calibration.push(q);
      if (q.trigger === "energyVsReadinessMismatch" && energyVsReadinessMismatch) calibration.push(q);
      if (q.trigger === "corePreferenceMismatch" && corePreferenceMismatch) calibration.push(q);
      if (q.trigger === "vestibularMismatch" && vestibularMismatch) calibration.push(q);
      if (q.trigger === "hipMismatch" && hipMismatch) calibration.push(q);
    });

    calibration = shuffle(calibration).slice(0, 2);

    // -----------------------------------------
    // Step 7: Combine (with priority)
    // -----------------------------------------
    let all = [
      ...base,          // Always-Ask (A+B)
      ...core,          // Core pools
      ...conditionals,  // Conditionals
      ...safety,        // Safety
      ...calibration    // Calibration
    ];

    // -----------------------------------------
    // Step 8: Silent Reserve (anti-copy)
    // -----------------------------------------
    shuffle(all);
    const silentReserveCount = Math.floor(rng() * 4) + 4; // 4–8
    // Remove that many from the end
    const reserve = all.splice(all.length - silentReserveCount, silentReserveCount);

    // -----------------------------------------
    // Step 9: Enforce target count
    // -----------------------------------------
    const DISPLAY_TARGET_CHOICES = [38, 39, 40, 41, 42];
    let target = DISPLAY_TARGET_CHOICES[Math.floor(rng() * DISPLAY_TARGET_CHOICES.length)];

    if (all.length > target) {
      all = all.slice(0, target);
    }

    // -----------------------------------------
    // Step 10: Final shuffle (session-stable)
    // -----------------------------------------
    shuffle(all);

    return all;
  }
};
