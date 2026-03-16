// =============================================================
// NeuroFit • router.js
// Turns screening answers + computed profile into final plan route
// =============================================================

window.NeuroFitRouter = {

  buildRoute(answers, profile) {

    // ----------------------------------------
    // 1. Determine PreColor (state baseline)
    // ----------------------------------------
    // Based on Regulation Index + Tension + Dizziness
    const RI = profile.RI;
    const tension = Number(answers["A4"] || 3);
    const dizzy = profile.safety.dizzy;

    let preColor = "green";

    if (RI <= 2.2 || tension <= 2) preColor = "blue";
    if (RI >= 3 && RI < 4.2 && tension >= 3) preColor = "yellow";
    if (RI >= 4.2 || tension >= 4 || dizzy) preColor = "red";

    // ----------------------------------------
    // 2. Generate Workout Tags
    // ----------------------------------------
    const tags = [];

    // Goals
    if (profile.gaps.strength > 0.5)   tags.push("goal_strength");
    if (profile.gaps.balance > 0.5)    tags.push("goal_balance");
    if (profile.gaps.mobility > 0.5)   tags.push("goal_mobility");
    if (profile.gaps.energy > 0.5)     tags.push("goal_energy");
    if (profile.gaps.confidence > 0.5) tags.push("goal_confidence");

    // Capabilities
    if (profile.BFR_static   <= 2.5) tags.push("low_balance_static");
    if (profile.BFR_dynamic  <= 2.5) tags.push("low_balance_dynamic");
    if (profile.BFR_everyday <= 2.5) tags.push("low_balance_everyday");

    // Gaze stability
    if (profile.GazeStability < 3) tags.push("vestibular_care");

    // Safety
    if (profile.safety.jointPain) tags.push("safety_joint_pain");
    if (profile.safety.dizzy)     tags.push("safety_dizzy");
    if (profile.safety.painRecent) tags.push("safety_recent_pain");
    if (profile.safety.kneeFlag)   tags.push("safety_knee");
    if (profile.safety.hipBackFlag) tags.push("safety_hip_back");

    // Equipment
    if (profile.equipment.chair) tags.push("equip_chair");
    if (profile.equipment.wall)  tags.push("equip_wall");
    if (profile.equipment.band)  tags.push("equip_band");
    if (profile.equipment.db)    tags.push("equip_db");

    // ----------------------------------------
    // 3. Build Route Object
    // ----------------------------------------
    const route = {
      version: "nf-1.0",
      origin: "adaptive-screening",

      preColor,             // state baseline for workout bias
      RI: profile.RI,
      GOI: profile.GOI,
      BFR: profile.BFR,
      BFR_static: profile.BFR_static,
      BFR_dynamic: profile.BFR_dynamic,
      BFR_everyday: profile.BFR_everyday,
      GazeStability: profile.GazeStability,

      gaps: profile.gaps,
      safety: profile.safety,
      equipment: profile.equipment,

      tags,                 // flattened list used by workout builder
      planType: "6-week"
    };

    // ----------------------------------------
    // 4. Save everything to sessionStorage
    // ----------------------------------------
    sessionStorage.setItem("screeningAnswers", JSON.stringify(answers));
    sessionStorage.setItem("screeningProfile", JSON.stringify(profile));
    sessionStorage.setItem("screeningRoute", JSON.stringify(route));
    sessionStorage.setItem("preColor", preColor);
    sessionStorage.setItem("planType", "6-week");

    // ----------------------------------------
    // 5. Navigate to workout builder
    // ----------------------------------------
    window.location.href = "workout.html";
