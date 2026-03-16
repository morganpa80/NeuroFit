-----START-JS-----
const QUESTIONS = [
  {
    id: "A1",
    text: "How would you describe your general energy level most weeks?",
    type: "likert5",
    options: ["Very low","Low","Moderate","High","Very high"]
  },
  {
    id: "B2",
    text: "How important is improving balance & stability to you?",
    type: "likert5",
    options: ["Not at all","Low","Moderate","High","Very high"]
  },
  {
    id: "F2",
    text: "Do you experience dizziness with turning or rising quickly?",
    type: "boolean",
    options: ["No","Yes"],
    safety: true
  }
];

const state = { step:0, answers:{}, path:[...QUESTIONS] };

const qCard=document.getElementById("qCard");
const progress=document.getElementById("progressText");
const back=document.getElementById("backBtn");
const next=document.getElementById("nextBtn");
const finish=document.getElementById("finishBtn");

function render(){
  const item=state.path[state.step];
  progress.textContent = `Step ${state.step+1} of ~40ish`;
  qCard.innerHTML = `
    <h3 class="title">${item.text}</h3>
    <div class="sub">${item.type==="likert5"?"Choose the option that fits your usual week":"Please choose one option."}</div>
    <div class="nf-options" style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin-top:12px;">
      ${renderOptions(item)}
    </div>
  `;
  restore(item);
  next.hidden = state.step === state.path.length-1 ? true : false;
  finish.hidden = !next.hidden;
}

function renderOptions(item){
  if(item.type==="likert5"){
    return item.options.map((l,i)=>pill(item.id,i+1,l)).join("");
  }
  if(item.type==="boolean"){
    return item.options.map((l,i)=>pill(item.id,i,l)).join("");
  }
}

function pill(qid,val,label){
  return `
  <label class="nf-option" data-qid="${qid}" data-value="${val}"
    style="display:flex;align-items:center;justify-content:center;padding:10px;border:1px solid #ddd;border-radius:999px;cursor:pointer;">
    <input type="radio" name="${qid}" value="${val}" style="opacity:0;position:absolute;">
    <span>${label}</span>
  </label>`;
}

qCard.addEventListener("click",e=>{
  const opt=e.target.closest(".nf-option");
  if(!opt)return;
  const qid=opt.dataset.qid;
  const val=opt.dataset.value;
  qCard.querySelectorAll(`.nf-option[data-qid="${qid}"]`).forEach(x=>x.classList.remove("selected"));
  opt.classList.add("selected");
  state.answers[qid]=Number(val);
  next.disabled=false;
});

back.addEventListener("click",()=>{
  if(state.step>0) { state.step--; render(); }
});

next.addEventListener("click",()=>{
  state.step++;
  render();
});

finish.addEventListener("click",()=>{
  alert("Finished demo! Collected answers: "+JSON.stringify(state.answers,null,2));
});

function restore(item){
  const existing = state.answers[item.id];
  if(existing!==undefined){
    const el=qCard.querySelector(`.nf-option[data-value="${existing}"]`);
    if(el)el.classList.add("selected");
    next.disabled=false;
  } else {
    next.disabled=true;
  }
}

render();
-----END-JS-----
