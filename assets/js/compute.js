// =============================================================
// NeuroFit • compute.js
// Computes RI, GOI, BFR, GazeStability, Capability Gaps, Safety Tags
// =============================================================

// Called by screening.js after answers are collected
window.NeuroFitCompute = {

  compute(allAnswers) {

    // -------------------------------
    // Extract helper for safe number
    // -------------------------------
    const num = (v, fallback = 3) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    // ============================================================
    // 1) Regulation Index (A1–A6)
    // ============================================================
    const Akeys = ["A1","A2","A3","A4","A5","A6"];
    const RI = average(Akeys.map(k => num(allAnswers[k])));

    // ============================================================
    // 2) Grow Orientation Index (B1–B6)
    // GOI = mean(B1–B5) × B6
    // ============================================================
    const B1toB5 = ["B1","B2","B3","B4","B5"].map(k => num(allAnswers[k]));
    const B6 = num(allAnswers["B6"]);
    const GOI = average(B1toB5) * B6;

    // ============================================================
    // 3) Balance Functional Readiness (GROW: D1–D10)
    // with sub-scales:
    //   Static:   D1, D2, D3
    //   Dynamic:  D4, D5, D6, D7
    //   Everyday: D8, D9, D10
    // ============================================================
    const BFR_static = average([num(allAnswers["D1"]), num(allAnswers["D2"]), num(allAnswers["D3"])]);
    const BFR_dynamic = average([
      num(allAnswers["D4"]),
      num(allAnswers["D5"]),
      num(allAnswers["D6"]),
      num(allAnswers["D7"])
    ]);
    const BFR_everyday = average([num(allAnswers["D8"]), num(allAnswers["D9"]), num(allAnswers["D10"])]);
    const BFR = average([BFR_static, BFR_dynamic, BFR_everyday]);

    // ============================================================
    // 4) Gaze Stability Index
    // Inputs:
    //   - D2 (reduced visual input)
    //   - D6 (turning movements)
    //   - E1/E2 triggers not needed—direct scores only
    //   - F2 (dizziness flag)
    // Final:
    //   - If dizziness = yes (F2 == 1), heavily reduce stability score
    // ============================================================
    const dizziness = num(allAnswers["F2"], 0); // boolean 0/1
    const gazeInputs = [
      num(allAnswers["D2"]),
      num(allAnswers["D6"])
    ];
    let gazeBase = average(gazeInputs);

    // Penalty if dizzy
    const GazeStability = dizziness === 1 ? Math.min(2, gazeBase) : gazeBase;

    // ============================================================
    // 5) Capability Gaps
    // Logic:
    //   gap_strength    = B1 (importance) - mean(C1,C2,C3)
    //   gap_balance     = B2 (importance) - BFR
    //   gap_mobility    = B3 (importance) - ??? (we’ll use average hip+lower)
    //   gap_energy      = B4 (importance) - average(A1, A6)
    //   gap_confidence  = B5 (importance) - average(D10, A5)
    // ============================================================
    const cap_upper = average([num(allAnswers["C1"]), num(allAnswers["C2"]), num(allAnswers["C3"])]);
    const cap_lower = average([num(allAnswers["C4"]), num(allAnswers["C5"]), num(allAnswers["C6"])]);
    const cap_core  = average([num(allAnswers["C7"]), num(allAnswers["C8"]), num(allAnswers["C9"])]);
    const cap_hip   = average([num(allAnswers["C10"]), num(allAnswers["C11"]), num(allAnswers["C12"])]);
    const cap_mobility = average([cap_lower, cap_hip]);  // simple proxy

    const cap_energy = average([num(allAnswers["A1"]), num(allAnswers["A6"])]);
    const cap_confidence = average([num(allAnswers["D10"]), num(allAnswers["A5"])]);

    const gaps = {
      strength:   num(allAnswers["B1"]) - cap_upper,
      balance:    num(allAnswers["B2"]) - BFR,
      mobility:   num(allAnswers["B3"]) - cap_mobility,
      energy:     num(allAnswers["B4"]) - cap_energy,
      confidence: num(allAnswers["B5"]) - cap_confidence
    };

    // ============================================================
    // 6) Safety Tags
    // From F1–F6
    // ============================================================
    const safety = {
      jointPain: num(allAnswers["F1"], 0) === 1,
      dizzy:     num(allAnswers["F2"], 0) === 1,
      // F3 is multiselect → treat differently
      painRecent: num(allAnswers["F4"], 0) === 1,
      kneeFlag:   num(allAnswers["F5"], 0) <= 2,
      hipBackFlag: num(allAnswers["F6"], 0) <= 2
    };

    // ============================================================
    // 7) Equipment Tags (from F3)
    // ============================================================
    let equip = [];
    if (typeof allAnswers["F3"] === "string") {
      // already a single string? (fallback)
      equip = [allAnswers["F3"]];
    }
    if (Array.isArray(allAnswers["F3"])) {
      equip = allAnswers["F3"];
    }

    const equipment = {
      floor: equip.includes("Floor"),
      chair: equip.includes("Chair"),
      wall: equip.includes("Wall"),
      band: equip.includes("Band"),
      db:   equip.includes("Dumbbells")
    };

    // ============================================================
    // RETURN EVERYTHING
    // ============================================================
    return {
      RI,
      GOI,
      BFR,
      BFR_static,
      BFR_dynamic,
      BFR_everyday,
      GazeStability,
      gaps,
      safety,
      equipment
    };
  }
};


// -----------------------------------------------------
// Helper: Average
// -----------------------------------------------------
function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a,b) => a + b, 0) / arr.length;
}
