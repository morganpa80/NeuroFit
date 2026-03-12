/* -------------------------------------------------------------
   NeuroFit — App Engine (Shared Across All Pages)
   -------------------------------------------------------------
   Provides:
   ✔ 40-question screening data
   ✔ Official CORE‑12 set (teacher + pupil)
   ✔ Routing + tagging engine
   ✔ Pre‑Workout Colour scoring (0–10)
   ✔ Plan generator (30‑minute)
   ✔ Triage generator (10‑minute)
   ✔ Feedback saving + CSV export
   ✔ Optional POST webhook
------------------------------------------------------------- */

window.App = (() => {

  /* ============================================================
     1) FULL 40-QUESTION SET
     ============================================================ */
  const Q = [
    // ---------- A: CURRENT STATE ----------
    {id:'A1',  group:'A', label:'Energy right now', options:['Low','OK','High'], star:true},
    {id:'A2',  group:'A', label:'Focus right now', options:['Drifting','Steady','Fidgety'], star:true},
    {id:'A3',  group:'A', label:'Motivation to move', options:['Not up for it','Could try','Ready'], star:true},
    {id:'A4',  group:'A', label:'Body feeling', options:['Sluggish','Balanced','Tense']},
    {id:'A5',  group:'A', label:'Emotional state', options:['Flat','Neutral','Worried/Overwired']},
    {id:'A6',  group:'A', label:'Startle/overwhelm risk if things go fast', options:['Low','Medium','High']},
    {id:'A7',  group:'A', label:'Can follow a short sequence (3 steps) now?', options:['No','Maybe','Yes']},
    {id:'A8',  group:'A', label:'Comfort with being observed', options:['Prefer private','OK small group','OK whole class']},
    {id:'A9',  group:'A', label:'Preferred pace today', options:['Slow','Moderate','Lively']},
    {id:'A10', group:'A', label:'Pain/discomfort today', options:['None','Mild','Noticeable']},

    // ---------- B: SENSORY ----------
    {id:'B11', group:'B', label:'Sound tolerance', options:['Prefer quiet','Neutral','Like a beat'], star:true},
    {id:'B12', group:'B', label:'Voice‑over tolerance', options:['Prefer minimal words','Neutral','Prefer guidance']},
    {id:'B13', group:'B', label:'Visual complexity', options:['Low visuals','Neutral','OK with dynamic visuals']},
    {id:'B14', group:'B', label:'Light sensitivity', options:['Low','Medium','High']},
    {id:'B15', group:'B', label:'Touch/proprioceptive input preference', options:['Gentle','Neutral','Strong ("heavy work")']},
    {id:'B16', group:'B', label:'Vestibular input (turns/rocking)', options:['Avoid','Neutral','Enjoy']},
    {id:'B17', group:'B', label:'Rhythm patterns', options:['Prefer steady','Neutral','Like varied patterns']},
    {id:'B18', group:'B', label:'Breathing work', options:['Dislike','Neutral','Like it']},
    {id:'B19', group:'B', label:'Background noise tolerance (classroom)', options:['Low','Medium','High']},
    {id:'B20', group:'B', label:'Screen sensitivity', options:['Short bursts only','OK moderate','Fine long']},

    // ---------- C: MOTOR ----------
    {id:'C21', group:'C', label:'Balance confidence (standing, 10s)', options:['Not confident','OK','Confident'], star:true},
    {id:'C22', group:'C', label:'Upper body strength tolerance (push/pull)', options:['Low','Medium','High']},
    {id:'C23', group:'C', label:'Lower body tolerance (squats/steps)', options:['Low','Medium','High']},
    {id:'C24', group:'C', label:'Crossing midline comfort (cross crawl)', options:['Hard','OK','Easy']},
    {id:'C25', group:'C', label:'Sequencing 3–4 moves', options:['Hard','OK','Easy'], star:true},
    {id:'C26', group:'C', label:'Impact tolerance (small hops)', options:['Avoid','Maybe','OK']},
    {id:'C27', group:'C', label:'Range of motion limits (shoulders/hips)', options:['Yes','No']},
    {id:'C28', group:'C', label:'Assistive/orthotic use today', options:['Yes','No']},

    // ---------- D: ENGAGEMENT ----------
    {id:'D29', group:'D', label:'Instruction style', options:['Visual cards','Audio prompts','Live demo']},
    {id:'D30', group:'D', label:'Choice level', options:['Prefer being given a plan','Prefer picking steps']},
    {id:'D31', group:'D', label:'Group context', options:['Solo','Partner','Small group','Whole class']},
    {id:'D32', group:'D', label:'Reward style', options:['Stars/points','Verbal praise','Quiet acknowledgement']},
    {id:'D33', group:'D', label:'Device access', options:['Own device','Shared screen','No device (teacher led)']},

    // ---------- E: SAFETY ----------
    {id:'E35', group:'E', label:'Dizziness when turning', options:['Never','Sometimes','Often'], star:true},
    {id:'E36', group:'E', label:'Breathlessness with mild activity', options:['No','Sometimes','Often']},
    {id:'E37', group:'E', label:'Recent injury/strain', options:['No','Upper','Lower','Back/Neck']},
    {id:'E38', group:'E', label:'History of discomfort with breathing exercises', options:['No','Yes']},
    {id:'E39', group:'E', label:'Need seated options', options:['No','Sometimes','Yes'], star:true},
    {id:'E40', group:'E', label:'Adult support available right now', options:['No','Maybe','Yes']}
  ];

  /* ============================================================
     2) OFFICIAL CORE‑12 SET (used by pupil + teacher‑12 screens)
     ============================================================ */
  const CORE12_IDS = [
    'A1','A2','A3','A4','A5',   // arousal & emotion
    'B11','B15','B16',          // sensory
    'C21','C25',                // motor
    'E35','E39'                 // safety
  ];
  const CORE12 = Q.filter(q => CORE12_IDS.includes(q.id));

  /* ============================================================
     3) RENDER QUESTIONS (for teacher forms)
     ============================================================ */
  function renderQuestions(container, mode='full'){
    container.innerHTML = '';

    const groups = [
      {key:'A', title:'A) Current State'},
      {key:'B', title:'B) Sensory Preferences'},
      {key:'C', title:'C) Motor & Coordination'},
      {key:'D', title:'D) Engagement & Delivery'},
      {key:'E', title:'E) Safety & Contraindications'}
    ];

    groups.forEach(g=>{
      const sec = document.createElement('section');
      const h = document.createElement('h3');
      h.textContent = g.title;
      sec.appendChild(h);

      Q.filter(q=>q.group===g.key).forEach(q=>{
        const row = document.createElement('div');
        row.className='q';
        row.dataset.id = q.id;
        row.innerHTML = `<label>${q.id}. ${q.label}${q.star?' ⭐':''}</label>`;

        const opts = document.createElement('div'); opts.className='opts';
        q.options.forEach(opt=>{
          const lab = document.createElement('label');
          lab.className='opt';
          lab.innerHTML = `<input type="radio" name="${q.id}" value="${opt}"><span>${opt}</span>`;
          lab.onclick = ()=>{
            [...opts.children].forEach(x=>x.classList.remove('selected'));
            lab.classList.add('selected');
            lab.querySelector('input').checked = true;
          };
          opts.appendChild(lab);
        });

        row.appendChild(opts);
        sec.appendChild(row);
      });

      container.appendChild(sec);
    });

    if(mode === 'core12'){
      Q.forEach(q=>{
        const row = container.querySelector(`[data-id="${q.id}"]`);
        if(row) row.style.display = CORE12_IDS.includes(q.id) ? '' : 'none';
      });
    }
  }

  /* ============================================================
     4) READ ANSWERS
     ============================================================ */
  function readAnswers(){
    const v = {};
    Q.forEach(q=>{
      const el = document.querySelector(`input[name="${q.id}"]:checked`);
      v[q.id] = el ? el.value : null;
    });
    return v;
  }

  /* ============================================================
     5) ROUTING (Primary type + tags)
     ============================================================ */
  function route(v){
    const tags = new Set();

    if(['Sometimes','Often'].includes(v.E35)) tags.add('no-vestibular');
    if(v.E39 === 'Yes') tags.add('chair-mode');
    if(v.B11 === 'Prefer quiet' || v.B19 === 'Low') tags.add('low-noise');
    if(v.B13 === 'Low visuals') tags.add('low-visual');
    if(v.B15?.includes('Strong') && v.C22 === 'High') tags.add('heavy-work');
    if(v.B18 === 'Dislike' || v.E38 === 'Yes') tags.add('no-breath-cues');
    if(v.B20 === 'Short bursts only' || v.A3 === 'Not up for it') tags.add('short-bursts');

    let primary = 'Calm';
    if(v.A1 === 'Low' || v.A4 === 'Sluggish') primary='Wake Up';
    else if(v.A2 === 'Drifting') primary='Focus';
    else if(v.A2 === 'Fidgety' || v.A4 === 'Tense' || v.A6 === 'High') primary='Reset';
    if(v.A5 === 'Worried/Overwired') primary='Calm';

    return {primary, tags:[...tags]};
  }

  /* ============================================================
     6) PRE‑WORKOUT COLOUR SCORING (0–10 → Green/Yellow/Amber/Red)
     ============================================================ */
  function computePreColor(v){
    let score = 0;

    if(v.A1 === 'Low' || v.A4 === 'Sluggish' || v.A4 === 'Tense') score+=2;
    if(v.A2 === 'Drifting' || v.A2 === 'Fidgety') score+=2;
    if(v.A6 === 'High') score+=2;

    if(v.B11 === 'Prefer quiet') score++;
    if(v.B13 === 'Low visuals') score++;
    if(v.B19 === 'Low') score++;

    if(v.C21 === 'Not confident') score++;

    if(v.B18 === 'Dislike' || v.E38 === 'Yes') score++;

    if(v.E35 !== 'Never' || v.E36 !== 'No') score++;

    let color='yellow', label='Yellow';
    if(score<=2){ color='green'; label='Green'; }
    else if(score<=4){ color='yellow'; label='Yellow'; }
    else if(score<=7){ color='amber'; label='Amber'; }
    else { color='red'; label='Red'; }

    return {score,color,label};
  }

  /* ============================================================
     7) EXERCISE BANK (COMPLETE)
     ============================================================ */
  const BANK = {
    warmup:{
      common:[
        {name:'Forearm press + slow exhale (5×)', cues:'Strong hands, long slow exhale.', chair:'Same seated'},
        {name:'Shoulder roll + shake out (8–10s)', cues:'Release neck & jaw.', chair:'Same seated'},
        {name:'Slow step backs ×10', cues:'Soft feet.', chair:'Seated march ×20'}
      ],
      wake:[
        {name:'Power march (60s)', cues:'Steady arms.', chair:'Seated march', quiet:true}
      ],
      focus:[
        {name:'Cross‑crawl slow (30–45s)', cues:'Opp hand to knee.', chair:'Seated cross‑crawl'}
      ],
      reset:[
        {name:'Wall angels (5–6)', cues:'Slide + slow breath.', chair:'Seated wall slides'}
      ],
      calm:[
        {name:'Hand‑press thighs (5×5s)', cues:'Press–release.', chair:'Same seated'}
      ]
    },

    main:{
      "Wake Up":[
        {
          title:'Energise Circuit (×2)',
          suggestion:'Goal: Lift energy without chaos.',
          list:[
            {name:'Power march / step‑ups (60–90s)', cues:'Steady, not bouncy.', chair:'Sit‑to‑stand or march'},
            {name:'Wall push‑ups (8–12)', cues:'Strong & steady.', chair:'Incline variant'},
            {name:'Glute bridge hold (15–20s)', cues:'Drive heels.', chair:'Seated band pull‑apart ×10'}
          ]
        },
        {
          title:'Steady Strength',
          suggestion:'Goal: Activate large muscles.',
          list:[
            {name:'Hip hinge ×10', cues:'Long spine.', chair:'Seated hinge'},
            {name:'Carry: backpack/tote (60s)', cues:'Walk tall.', chair:'Seated thigh press 5×5s'}
          ]
        }
      ],
      "Focus":[
        {
          title:'Pattern Ladder (×2)',
          suggestion:'Goal: Steady beat for attention.',
          list:[
            {name:'3‑move combo ×4', cues:'Keep rhythm.', chair:'Seated march→press→twist'},
            {name:'Isometric squat (10–20s)', cues:'Track toes.', chair:'Knee squeeze'},
            {name:'Wall plank (20–30s)', cues:'Push floor.', chair:'Desk push'}
          ]
        },
        {
          title:'Heavy Work Focus',
          suggestion:'Goal: Organise via muscle pressure.',
          list:[
            {name:'Towel row ×10', cues:'Elbows back.', chair:'Same seated'},
            {name:'Slow climbers (20–30s)', cues:'Controlled.', chair:'Seated knee lifts'}
          ]
        }
      ],
      "Reset":[
        {
          title:'Grounded Power Circuit (×2)',
          suggestion:'Goal: Heavy + slow grounding.',
          list:[
            {name:'Slow bear walk (6–8)', cues:'Heavy limbs.', chair:'Cross‑press 5×5s'},
            {name:'Wall push‑ups (8–10)', cues:'Exhale on push.', chair:'Incline variant'},
            {name:'Glute bridge hold (10–15s)', cues:'Strong heels.', chair:'Hamstring press 5×5s'}
          ]
        },
        {
          title:'Controlled Strength + Breath',
          suggestion:'Goal: Strong body → calmer mind.',
          list:[
            {name:'Slow climbers (20–30s)', cues:'Slow pace.', chair:'Seated lifts ×20'},
            {name:'Isometric squat (10–15s)', cues:'Steady.', chair:'Quad set 5×5s'}
          ]
        },
        {
          title:'Down‑shift Movement',
          suggestion:'Goal: Signal calming.',
          list:[
            {name:'Forward fold (20s)', cues:'Soft knees.', chair:'Seated fold'},
            {name:'Figure‑four stretch', cues:'Gentle.', chair:'Seated version'}
          ]
        }
      ],
      "Calm":[
        {
          title:'Slow Flow (×2)',
          suggestion:'Goal: Down‑shift pacing.',
          list:[
            {name:'Cat‑cow (60–90s)', cues:'Move with breath.', chair:'Seated cat‑cow'},
            {name:'Wall slide (5–6)', cues:'Smooth.', chair:'Seated wall slide'},
            {name:'Towel squeeze (5×5s)', cues:'Press‑release.', chair:'Same seated'}
          ]
        },
        {
          title:'Lengthen + Ground',
          suggestion:'Goal: Longer muscles = calmer system.',
          list:[
            {name:'Lunge rocks (30–45s)', cues:'Small range.', chair:'Seated ankle pump'},
            {name:'Chest opener 20s', cues:'Ease shoulders.', chair:'Seated open‑book'}
          ]
        }
      ]
    },

    cooldown:{
      common:[
        {name:'Slow wall slides (5–6)', cues:'Smooth lower–lift.', chair:'Seated wall slide'}
      ],
      breath:[
        {name:'4–7–8 breathing ×2', cues:'In4•Hold7•Out8', chair:'Same seated'}
      ],
      movement:[
        {name:'Box reach ×2', cues:'Wide slow reach.', chair:'Seated reach'},
        {name:'Neck ease (5× each)', cues:'Gentle.', chair:'Same seated'}
      ]
    }
  };

  /* ============================================================
     8) BUILD 30-MINUTE PLAN
     ============================================================ */
  function buildPlanDOM({primary, tags}) {
    const chair = tags.includes('chair-mode');
    const noBreath = tags.includes('no-breath-cues');

    const wrap = document.createElement('div');
    const head = document.createElement('div');
    head.className='notes';
    head.innerHTML = `<b>Primary:</b> ${primary}` +
      (tags.length ? ` &nbsp; <b>Tags:</b> ${tags.join(', ')}` : '');
    wrap.appendChild(head);

    function block(title, mins, items){
      const b = document.createElement('div');
      b.className='block';
      b.innerHTML = `<div class="title"><span>${title}</span><span>${mins} min</span></div>`;
      const ul=document.createElement('ul'); ul.className='ex';
      items.forEach(i=>{
        let nm=i.name;
        if(chair && i.chair) nm+=` (chair: ${i.chair})`;
        ul.innerHTML += `<li>${nm}${i.cues?' — '+i.cues:''}</li>`;
      });
      b.appendChild(ul);
      return b;
    }

    // WARM‑UP
    wrap.appendChild(block('Warm‑up — Regulate', 5, [
      ...BANK.warmup.common,
      ...(BANK.warmup[primary==='Wake Up'?'wake':primary.toLowerCase()]||[])
    ]));

    // MAIN
    const m = document.createElement('div');
    m.className='block';
    m.innerHTML = `<div class="title"><span>Main — Regulate + Fitness</span><span>20 min</span></div>`;
    BANK.main[primary].forEach(sec=>{
      const h3=document.createElement('h3'); h3.textContent=sec.title; m.appendChild(h3);
      const s=document.createElement('div'); s.className='notes'; s.textContent=sec.suggestion; m.appendChild(s);
      const ul=document.createElement('ul'); ul.className='ex';
      sec.list.forEach(i=>{
        let nm=i.name; if(chair && i.chair) nm+=` (chair: ${i.chair})`;
        ul.innerHTML+=`<li>${nm}${i.cues?' — '+i.cues:''}</li>`;
      });
      m.appendChild(ul);
    });
    wrap.appendChild(m);

    // COOL‑DOWN
    const cool = noBreath
      ? [...BANK.cooldown.common, ...BANK.cooldown.movement]
      : [...BANK.cooldown.common, ...BANK.cooldown.breath];
    wrap.appendChild(block('Cool‑down — Balance', 5, cool));

    return wrap;
  }

  /* ============================================================
     9) 10‑MIN TRIAGE
     ============================================================ */
  function triagePlan({state, quiet=false, chair=false}){
    let primary = state==='overloaded' ? 'Calm'
                 : state==='low'       ? 'Wake Up'
                 : 'Focus';

    const tags=[];
    if(quiet) tags.push('low-noise');
    if(chair) tags.push('chair-mode');

    function map(i){ const o={...i}; if(chair&&i.chair) o.name+=` (chair: ${i.chair})`; return o; }

    const warm = [
      ...BANK.warmup.common.slice(0,2),
      ...(BANK.warmup[primary==='Wake Up'?'wake':primary.toLowerCase()]||[]).slice(0,1)
    ].map(map);

    const main = (BANK.main[primary]||[]).slice(0,1).map(sec=>({
      title:sec.title+' (short)',
      suggestion:sec.suggestion,
      list:sec.list.slice(0,2).map(map)
    }));

    const cool = (tags.includes('no-breath-cues') ? BANK.cooldown.movement : BANK.cooldown.breath)
      .slice(0,1).map(map);

    return {primary, tags, warm, main, cool};
  }

  function renderTriagePlan(target, t){
    target.innerHTML='';
    const hdr=document.createElement('div');
    hdr.className='notes';
    hdr.innerHTML=`<b>Primary:</b> ${t.primary}`+(t.tags.length?` &nbsp; <b>Tags:</b> ${t.tags.join(', ')}`:'');
    target.appendChild(hdr);

    function block(title, mins, list){
      const b=document.createElement('div'); b.className='block';
      b.innerHTML=`<div class="title"><span>${title}</span><span>${mins} min</span></div>`;
      const ul=document.createElement('ul'); ul.className='ex';
      list.forEach(i=> ul.innerHTML+=`<li>${i.name}${i.cues?' — '+i.cues:''}</li>`);
      b.appendChild(ul); target.appendChild(b);
    }

    block('Warm‑up',2,t.warm);
    t.main.forEach(sec=>{
      const b=document.createElement('div'); b.className='block';
      b.innerHTML=`<div class="title"><span>Main</span><span>6 min</span></div>`;
      const h3=document.createElement('h3'); h3.textContent=sec.title; b.appendChild(h3);
      const s=document.createElement('div'); s.className='notes'; s.textContent=sec.suggestion; b.appendChild(s);
      const ul=document.createElement('ul'); ul.className='ex';
      sec.list.forEach(i=> ul.innerHTML+=`<li>${i.name}${i.cues?' — '+i.cues:''}</li>`);
      b.appendChild(ul); target.appendChild(b);
    });
    block('Cool‑down',2,t.cool);
  }

  /* ============================================================
     10) FEEDBACK STORAGE
     ============================================================ */
  function saveFeedback({rating, comment, primary, tags}){
    const key='neurofitFeedback';
    const arr=JSON.parse(localStorage.getItem(key)||'[]');
    arr.push({
      ts:new Date().toISOString(),
      rating,
      comment,
      primary,
      tags: tags.join('|')
    });
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function exportFeedbackCSV(){
    const key='neurofitFeedback';
    const arr=JSON.parse(localStorage.getItem(key)||'[]');
    const header=['timestamp','rating','comment','primary','tags'];
    const lines=[header.join(',')];
    arr.forEach(r=>{
      const esc=s=> `"${String(s||'').replace(/"/g,'""')}"`;
      lines.push([r.ts,r.rating,r.comment,r.primary,r.tags].map(esc).join(','));
    });
    const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='neurofit_feedback.csv';
    a.click();
  }

  async function postFeedback(url, payload){
    try{
      const res = await fetch(url,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      return res.ok;
    }catch(e){ return false; }
  }

  /* ============================================================
     EXPORTS
     ============================================================ */
  return {
    Q,
    CORE12,
    renderQuestions,
    readAnswers,
    route,
    computePreColor,
    BANK,
    buildPlanDOM,
    triagePlan,
    renderTriagePlan,
    saveFeedback,
    exportFeedbackCSV,
    postFeedback
  };

})();
