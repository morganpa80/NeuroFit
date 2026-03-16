// =============================================================
// NeuroFit • groundgo.js
// 10‑minute reactive reset (internal NeuroFit logic only)
// =============================================================
(function () {
    const $ = (sel) => document.querySelector(sel);

    const stateEl = $('#gg-state');
    const envEl = $('#gg-env');
    const seatEl = $('#gg-seat');
    const buildBtn = $('#gg-build');
    const printBtn = $('#gg-print');
    const outEl = $('#gg-output');
    const fbNote = $('#fb-note');

    // =============================================================
    // Internal 10‑minute movement library (NO external sources)
    // =============================================================
    const LIB = {
        // BLUE — Low & Flat (gentle energiser)
        blue: {
            warmup: [
                {
                    title: "Rhythm March (Seated/Standing)",
                    cue: "Build a smooth rhythm; relaxed shoulders.",
                    info: "~90 sec"
                }
            ],
            main: [
                {
                    title: "Arm Swings + Soft Reach",
                    cue: "Open the chest softly; move comfortably.",
                    info: "~2 min"
                },
                {
                    title: "Step & Reach Pattern",
                    cue: "Slow steps; reach forward with easy balance.",
                    info: "~2 min"
                }
            ],
            settle: [
                {
                    title: "Calm Breathing Finish",
                    cue: "In 4 • Out 6; soften jaw and brow.",
                    info: "~2 min"
                }
            ]
        },

        // GREEN — Steady & Ready (balanced)
        green: {
            warmup: [
                {
                    title: "Joint Prep Flow",
                    cue: "Smooth ankle–hip–shoulder circles.",
                    info: "~90 sec"
                }
            ],
            main: [
                {
                    title: "Supported Squat Pattern",
                    cue: "Comfortable depth; steady tempo.",
                    info: "~2 min"
                },
                {
                    title: "Hinge + Reach",
                    cue: "Long spine; slow hinge, gentle reach.",
                    info: "~2 min"
                }
            ],
            settle: [
                {
                    title: "Breath + Spine Cooldown",
                    cue: "Slow down your exhales.",
                    info: "~2 min"
                }
            ]
        },

        // YELLOW — Wound Up / On Edge (ground + slow)
        yellow: {
            warmup: [
                {
                    title: "Grounded Breathing",
                    cue: "Longer exhale than inhale.",
                    info: "~90 sec"
                }
            ],
            main: [
                {
                    title: "Seated Press + Release",
                    cue: "Gentle isometric squeeze, then soften.",
                    info: "~2 min"
                },
                {
                    title: "Tempo Lower (Slow Down)",
                    cue: "Count 3‑1‑3; easy range only.",
                    info: "~2 min"
                }
            ],
            settle: [
                {
                    title: "Soft Gaze + Long Exhale",
                    cue: "Unclench jaw; soften eyes.",
                    info: "~2 min"
                }
            ]
        },

        // RED — Overloaded (calm, supported, minimal intensity)
        red: {
            warmup: [
                {
                    title: "Floor/Seated Calm Start",
                    cue: "Comfortable position; quiet breathing.",
                    info: "~90 sec"
                }
            ],
            main: [
                {
                    title: "Supported Glute Bridge",
                    cue: "Lift gently; small range; pause at top.",
                    info: "~2 min"
                },
                {
                    title: "Wall Hold (Hands or Forearms)",
                    cue: "Light pressure; smooth breaths.",
                    info: "~2 min"
                }
            ],
            settle: [
                {
                    title: "Guided Rest",
                    cue: "Stay low, slow, and comfortable.",
                    info: "~2 min"
                }
            ]
        }
    };

    // =============================================================
    // Map state → colour
    // =============================================================
    function mapStateToColor(state) {
        if (state === "low") return "blue";
        if (state === "wound") return "yellow";
        if (state === "overloaded") return "red";
        return "green"; // default
    }

    // =============================================================
    // Build plan from opts
    // =============================================================
    function buildPlan(opts) {
        const color = mapStateToColor(opts.state);
        const base = structuredClone(LIB[color]);

        const seated = (opts.seat === "yes");
        const quiet = (opts.env === "quiet");

        // Modify blocks based on seated/quiet
        const applyMods = (blocks) =>
            blocks.map(x => {
                const b = { ...x };

                // ---- Seated variants ----
                if (seated) {
                    if (b.title.includes("Rhythm March")) b.title = "Seated Rhythm March";
                    if (b.title.includes("Supported Squat")) b.title = "SittoStand (Supported)";
                    if (b.title.includes("Hinge")) b.title = "Seated Hip Hinge (Short Range)";
                    if (b.title.includes("Step & Reach")) b.title = "Seated Reach Pattern";
                    if (b.title.includes("Wall Hold")) b.title = "Seated Press + Release (Isometric)";
                }

                // ---- Quiet environment tweaks ----
                if (quiet) {
                    b.cue = (color === "blue")
                        ? "Keep it smooth and quiet; relaxed shoulders."
                        : "Slow, quiet movement; longer exhales.";
                }

                return b;
            });

        return {
            color,
            sections: {
                warmup: applyMods(base.warmup),
                main: applyMods(base.main),
                settle: applyMods(base.settle)
            }
        };
    }

    // =============================================================
    // Render
    // =============================================================
    function renderPlan(plan) {
        const section = (title, list) => {
            let html = `<div class="section-title">${title}</div>`;
            list.forEach(item => {
                html += `
                    <div class="exercise-block">
                        <p class="exercise-title">${item.title}</p>
                        <p class="exercise-cue">${item.cue}</p>
                        <p class="exercise-info">${item.info}</p>
                    </div>
                `;
            });
            return html;
        };

        outEl.innerHTML =
            section("Warmup (~3 minutes)", plan.sections.warmup) +
            section("Main (~5 minutes)", plan.sections.main) +
            section("Settle (~2 minutes)", plan.sections.settle);
    }

    // =============================================================
    // Save minimal session (so Ground & Go can influence future logic)
    // =============================================================
    function saveSession(plan, opts) {
        const route = {
            version: "nf-1.0",
            origin: "ground-go",
            preColor: plan.color,
            planType: "quick-10",
            env: opts.env,
            seated: opts.seat === "yes"
        };

        sessionStorage.setItem("screeningRoute", JSON.stringify(route));
        sessionStorage.setItem("preColor", plan.color);
        sessionStorage.setItem("planType", "quick-10");
    }

    // =============================================================
    // Build button
    // =============================================================
    buildBtn.addEventListener("click", () => {
        const opts = {
            state: stateEl.value,
            env: envEl.value,
            seat: seatEl.value
        };

        const plan = buildPlan(opts);
        renderPlan(plan);
        saveSession(plan, opts);

        printBtn.disabled = false;
        outEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // =============================================================
    // Print
    // =============================================================
    printBtn.addEventListener("click", () => {
        window.print();
    });

    // =============================================================
    // Feedback buttons
    // =============================================================
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener("click", () => {
            fbNote.textContent = `Noted: "${btn.dataset.fb}".`;
        });
    });

})();
