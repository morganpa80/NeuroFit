// =============================================================
// NeuroFit Adaptive Engine – Question Bank (60 items + A/B variants)
// =============================================================

window.NeuroFitQuestions = {

  // ALWAYS-ASK SECTIONS ----------------------------------------
  A: [ // Regulation & Readiness (6)
    { id:"A1", text:"General energy level most weeks.", type:"likert5" },
    { id:"A2", text:"Ease of focus during movement sessions.", type:"likert5" },
    { id:"A3", text:"Ability to settle with slow breathing when you choose to.", type:"likert5" },
    { id:"A4", text:"Body tension before activity (tense ↔ relaxed).", type:"likert5" },
    { id:"A5", text:"Motivation to follow a regular movement routine.", type:"likert5" },
    { id:"A6", text:"How often you feel rested enough to train.", type:"likert5" }
  ],

  B: [ // Growth Priorities & Commitment (6)
    { id:"B1", text:"How important is building physical strength in the next 6 weeks?", type:"likert5" },
    { id:"B2", text:"How important is improving balance & stability?", type:"likert5" },
    { id:"B3", text:"How important is improving mobility/flexibility?", type:"likert5" },
    { id:"B4", text:"How important is boosting cardiovascular energy?", type:"likert5" },
    { id:"B5", text:"How important is building everyday confidence through movement?", type:"likert5" },
    { id:"B6", text:"Readiness to commit to 2–3 sessions/week for 6 weeks.", type:"likert5" }
  ],

  // CORE POOL --------------------------------------------------
  C: [ // Capabilities (Upper/Lower/Core/Hip) (12)
    { id:"C1", text:"Confidence with push/pull/hold upper-body patterns.", type:"likert5" },
    { id:"C2", text:"Shoulder comfort during upper-body work.", type:"likert5" },
    { id:"C3", text:"Upper-body endurance (reps or holds).", type:"likert5" },

    { id:"C4", text:"Confidence with squat/step/hinge patterns.", type:"likert5" },
    { id:"C5", text:"Knee/ankle comfort in lower-body work.", type:"likert5" },
    { id:"C6", text:"Lower-body endurance (reps or time).", type:"likert5" },

    { id:"C7", text:"Confidence holding controlled core positions (e.g., plank).", type:"likert5" },
    { id:"C8", text:"Confidence with anti-rotation / cross-body patterns.", type:"likert5" },
    { id:"C9", text:"Midsection steadiness in everyday tasks.", type:"likert5" },

    { id:"C10", text:"Hip/low-back comfort in hip-dominant movements.", type:"likert5" },
    { id:"C11", text:"Confidence with bridges/hip thrusts/hamstring activation.", type:"likert5" },
    { id:"C12", text:"General glute & hamstring activation strength.", type:"likert5" }
  ],

  D: [ // Functional Balance (10)
    { id:"D1", text:"Single-leg stance (eyes open).", type:"likert5" },
    { id:"D2", text:"Balance with reduced visual input (soft gaze).", type:"likert5", variantB:"Confidence balancing with softer visual focus." },
    { id:"D3", text:"Steadiness when standing still (minimal wobble).", type:"likert5" },

    { id:"D4", text:"Control with step-and-reach patterns.", type:"likert5" },
    { id:"D5", text:"Control when changing direction.", type:"likert5" },
    { id:"D6", text:"Control during pivot/turn movements.", type:"likert5" },
    { id:"D7", text:"Ability to follow a short multi-step movement sequence.", type:"likert5" },

    { id:"D8", text:"Confidence getting down to / up from the floor.", type:"likert5" },
    { id:"D9", text:"Confidence walking on uneven surfaces.", type:"likert5" },
    { id:"D10", text:"Confidence carrying light objects while moving.", type:"likert5" }
  ],

  // CONDITIONAL POOL ------------------------------------------
  E: [
    // Balance depth
    { id:"E1", text:"Balance while turning the head left/right.", type:"likert5", trigger:"balanceLow" },
    { id:"E2", text:"Track a moving visual target while stepping.", type:"likert5", trigger:"balanceLow" },
    { id:"E3", text:"Reach across midline while standing.", type:"likert5", trigger:"balanceLow" },
    { id:"E4", text:"Split-stance stability with light rotation.", type:"likert5", trigger:"balanceLow" },

    // Stability / tempo
    { id:"E5", text:"Comfort with slow tempo (e.g., 3‑1‑3).", type:"likert5", trigger:"coreLow" },
    { id:"E6", text:"Confidence in anti-extension core patterns (deadbug family).", type:"likert5", trigger:"coreLow" },
    { id:"E7", text:"Tolerance for holds under fatigue.", type:"likert5", trigger:"coreLow" },
    { id:"E8", text:"Preference for predictable rhythmic patterns.", type:"likert5", trigger:"coreLow" },

    // Confidence
    { id:"E9",  text:"Confidence starting a new movement without demo.", type:"likert5", trigger:"confidence" },
    { id:"E10", text:"Comfort trying a slightly harder option if suggested.", type:"likert5", trigger:"confidence" },
    { id:"E11", text:"Willingness to repeat a drill to feel steadier.", type:"likert5", trigger:"confidence" },

    // Adherence
    { id:"E12", text:"Preference for shorter sessions (15–20 min).", type:"likert5", trigger:"adherence" },
    { id:"E13", text:"Preference for fewer exercises but more sets.", type:"likert5", trigger:"adherence" },

    // High capability
    { id:"E14", text:"Confidence with unilateral lower-body strength.", type:"likert5", trigger:"highCap" },
    { id:"E15", text:"Comfort with uneven support stance.", type:"likert5", trigger:"highCap" },
    { id:"E16", text:"Readiness for reach/turn/tempo combined complexity.", type:"likert5", trigger:"highCap" }
  ],

  // SAFETY -----------------------------------------------------
  F: [
    { id:"F1", text:"Do you experience any joint pain during exercise?", type:"boolean", safety:true },
    { id:"F2", text:"Do you experience dizziness with turning or rising?", type:"boolean", safety:true },
    { id:"F3", text:"What equipment do you have access to?", type:"multi", options:["Floor","Chair","Wall","Band","Dumbbells"], safety:true },

    { id:"F4", text:"Is this joint pain current (last 7–14 days)?", type:"boolean", safety:true },
    { id:"F5", text:"Knee stability: comfort with step down / box depth.", type:"likert5", safety:true },
    { id:"F6", text:"Low-back comfort: hinge vs squat preference.", type:"likert5", safety:true }
  ],

  // CALIBRATION -----------------------------------------------
  G: [
    { id:"G1", text:"Knee alignment awareness in hinges/squats.", type:"likert5", trigger:"strengthVsBalanceMismatch" },
    { id:"G2", text:"Comfort starting slower when feeling tense.", type:"likert5", trigger:"tensionVsIntensityMismatch" },
    { id:"G3", text:"Consistency with recovery habits.", type:"likert5", trigger:"energyVsReadinessMismatch" },
    { id:"G4", text:"Comfort with anti-rotation using band.", type:"likert5", trigger:"corePreferenceMismatch" },
    { id:"G5", text:"Comfort using fixed-gaze versions when dizzy.", type:"likert5", trigger:"vestibularMismatch" },
    { id:"G6", text:"Comfort using supported bridges for hip sensitivity.", type:"likert5", trigger:"hipMismatch" }
  ]
};
``
