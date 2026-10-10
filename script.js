/* MindMate: frontend demo. Data is stored locally in this browser only. */
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const STORE = { moods: "mindmate_moods_v1", tasks: "mindmate_tasks_v1", journal: "mindmate_journal_v1" };
const read = key => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let moods = read(STORE.moods), tasks = read(STORE.tasks), journal = read(STORE.journal);
let selectedMood = "", selectedReason = "", editingJournalId = null;
let timerSeconds = 25 * 60, timerInterval = null, timerRunning = false, timerMode = 25;
let breathInterval = null, breathRunning = false, breathPhase = 0;

function escapeHTML(value="") {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function formatDate(dateString, options={month:"short",day:"numeric"}) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, options);
}
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(showToast.timeout); showToast.timeout = setTimeout(()=>toast.classList.remove("show"), 2600);
}
const moodEmoji = {Happy:"😊", Calm:"😌", Okay:"😐", Stressed:"😟", Low:"😔"};
function goToPage(page) {
  const target = $(`#page-${page}`); if (!target) return;
  $$(".page").forEach(p=>p.classList.toggle("active",p===target));
  $$(".nav-item[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const navLabel = $(`.nav-item[data-page="${page}"]`);
  $("#pageCrumb").textContent = navLabel ? navLabel.textContent.trim() : page;
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  if(page==="insights") renderInsights();
}
$$("[data-page]").forEach(button=>button.addEventListener("click", e=>{e.preventDefault();goToPage(button.dataset.page)}));
$$("[data-goto]").forEach(button=>button.addEventListener("click",()=>goToPage(button.dataset.goto)));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
document.addEventListener("click",e=>{if(window.innerWidth<=760 && $("#sidebar").classList.contains("open") && !$("#sidebar").contains(e.target) && !$("#mobileMenu").contains(e.target))$("#sidebar").classList.remove("open")});

$$(".mood-option").forEach(button=>button.addEventListener("click",()=>{
  selectedMood=button.dataset.mood;
  $$(".mood-option").forEach(b=>b.classList.toggle("selected",b===button));
  $("#moodFeedback").textContent="";
}));
$$("#reasonOptions button").forEach(button=>button.addEventListener("click",()=>{
  selectedReason=selectedReason===button.dataset.reason?"":button.dataset.reason;
  $$("#reasonOptions button").forEach(b=>b.classList.toggle("selected",b.dataset.reason===selectedReason));
}));
$("#saveMood").addEventListener("click",()=>{
  if(!selectedMood){$("#moodFeedback").textContent="Choose the mood that feels closest to you first.";return;}
  moods.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),mood:selectedMood,reason:selectedReason,note:$("#moodNote").value.trim(),date:new Date().toISOString()});
  write(STORE.moods,moods); $("#moodFeedback").textContent="Your check-in has been saved in this browser. Thank you for taking a moment for yourself.";
  $("#moodNote").value=""; selectedMood=""; selectedReason="";
  $$(".mood-option").forEach(b=>b.classList.remove("selected")); $$("#reasonOptions button").forEach(b=>b.classList.remove("selected"));
  renderRecentMoods(); renderInsights(); showToast("Check-in saved 💜");
});
function renderRecentMoods(){
  const host=$("#recentMoods");
  if(!moods.length){host.innerHTML='<p class="empty-note">Your check-ins will appear here when you are ready to add one.</p>';return;}
  host.innerHTML=moods.slice(0,5).map(m=>`<div class="recent-mood"><span>${moodEmoji[m.mood]||"💜"}</span><strong>${escapeHTML(m.mood)}</strong><small>${formatDate(m.date)}</small></div>`).join("");
}
function renderInsights(){
  $("#statTotal").textContent=moods.length;
  $("#statJournal").textContent=journal.length;
  $("#statLatest").textContent=moods[0]?.mood||"—";
  $("#statLatestDate").textContent=moods[0]?formatDate(moods[0].date,{month:"short",day:"numeric",year:"numeric"}):"Whenever you're ready";
  const counts={Happy:0,Calm:0,Okay:0,Stressed:0,Low:0}; moods.slice(0,7).forEach(m=>{if(counts[m.mood]!==undefined)counts[m.mood]++});
  const max=Math.max(1,...Object.values(counts));
  $("#moodChart").innerHTML=moods.length?Object.entries(counts).map(([name,count])=>`<div class="chart-row"><span class="chart-label">${moodEmoji[name]} ${name}</span><div class="chart-track"><div class="chart-fill" style="width:${count/max*100}%"></div></div><span class="chart-count">${count}</span></div>`).join(""):'<p class="empty-note">No check-ins yet. When you record a mood, your reflections will appear here.</p>';
}

$("#groundingBtn").addEventListener("click",()=>$("#groundingPrompt").classList.toggle("hidden"));
$("#breathStart").addEventListener("click",()=>{
  if(breathRunning)return; breathRunning=true; $("#breathStart").textContent="Breathing gently…";
  const ring=$(".breath-ring");
  const phase=()=>{if(!breathRunning)return; const inhale=breathPhase%2===0; ring.classList.toggle("breathing-in",inhale);ring.classList.toggle("breathing-out",!inhale);$("#breathInstruction").textContent=inhale?"Breathe in":"Breathe out";$("#breathSub").textContent=inhale?"Gently, for 4 seconds":"Slowly, for 6 seconds";breathPhase++;};
  phase(); breathInterval=setInterval(phase,5000);
});
$("#breathStop").addEventListener("click",()=>{breathRunning=false;clearInterval(breathInterval);$(".breath-ring").classList.remove("breathing-in","breathing-out");$("#breathInstruction").textContent="Ready?";$("#breathSub").textContent="When you're ready";$("#breathStart").textContent="Start breathing";});

$("#taskForm").addEventListener("submit",e=>{
  e.preventDefault();const title=$("#taskInput").value.trim();if(!title)return;
  tasks.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title,priority:$("#taskPriority").value,done:false,created:new Date().toISOString()});
  write(STORE.tasks,tasks);$("#taskInput").value="";renderTasks();showToast("One small step added.");
});
function renderTasks(){
  $("#taskCount").textContent=`${tasks.filter(t=>!t.done).length} left · ${tasks.length} total`;
  const host=$("#taskList");
  if(!tasks.length){host.innerHTML='<p class="empty-note">Your list is a blank page. Add one small task to get started.</p>';return;}
  host.innerHTML=tasks.map(t=>`<div class="task-item ${t.done?"done":""}"><input class="task-check" type="checkbox" data-task-toggle="${t.id}" ${t.done?"checked":""} aria-label="Complete ${escapeHTML(t.title)}"><div class="task-copy"><strong>${escapeHTML(t.title)}</strong><small>Added ${formatDate(t.created,{month:"short",day:"numeric"})}</small></div><span class="priority ${escapeHTML(t.priority)}">${escapeHTML(t.priority)}</span><button class="delete-btn" data-task-delete="${t.id}" aria-label="Delete task">×</button></div>`).join("");
}
$("#taskList").addEventListener("change",e=>{const id=e.target.dataset.taskToggle;if(!id)return;tasks=tasks.map(t=>t.id===id?{...t,done:e.target.checked}:t);write(STORE.tasks,tasks);renderTasks()});
$("#taskList").addEventListener("click",e=>{const id=e.target.dataset.taskDelete;if(!id)return;tasks=tasks.filter(t=>t.id!==id);write(STORE.tasks,tasks);renderTasks();showToast("Task removed.")});

function formatTimer(seconds){const mins=Math.floor(seconds/60),secs=seconds%60;return `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`}
function renderTimer(){$("#timerDisplay").textContent=formatTimer(timerSeconds)}
$$(".timer-mode button").forEach(button=>button.addEventListener("click",()=>{
  stopTimer();timerMode=Number(button.dataset.minutes);timerSeconds=timerMode*60;renderTimer();
  $$(".timer-mode button").forEach(b=>b.classList.toggle("active",b===button));
  $("#timerToggle").textContent=timerMode===25?"Start focus":timerMode===5?"Start break":"Start reset";$("#timerStatus").textContent="Ready when you are.";
}));
function stopTimer(){clearInterval(timerInterval);timerRunning=false;$("#timerToggle").textContent=timerMode===25?"Start focus":timerMode===5?"Start break":"Start reset"}
$("#timerToggle").addEventListener("click",()=>{
  if(timerRunning){stopTimer();$("#timerStatus").textContent="Paused. Take your time.";return;}
  timerRunning=true;$("#timerToggle").textContent="Pause";$("#timerStatus").textContent="Session in progress.";
  timerInterval=setInterval(()=>{timerSeconds--;renderTimer();if(timerSeconds<=0){stopTimer();timerSeconds=0;renderTimer();$("#timerStatus").textContent="Session complete. Nice work—take a break if you can.";showToast("Your timer is complete!");}},1000);
});
$("#timerReset").addEventListener("click",()=>{stopTimer();timerSeconds=timerMode*60;renderTimer();$("#timerStatus").textContent="Timer reset."});

$("#journalForm").addEventListener("submit",e=>{
  e.preventDefault();const body=$("#journalBody").value.trim(),title=$("#journalTitle").value.trim();
  if(!body){$("#journalFeedback").textContent="Write a few words before saving your page.";return;}
  if(editingJournalId){journal=journal.map(entry=>entry.id===editingJournalId?{...entry,title:title||"A page for today",body,updated:new Date().toISOString()}:entry);$("#journalFeedback").textContent="Your entry has been updated.";}
  else{journal.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:title||"A page for today",body,date:new Date().toISOString()});$("#journalFeedback").textContent="Your page has been saved in this browser.";}
  write(STORE.journal,journal);resetJournalForm();renderJournal();renderInsights();showToast("Journal page saved.");
});
function resetJournalForm(){$("#journalTitle").value="";$("#journalBody").value="";editingJournalId=null;$("#journalFormTitle").textContent="A page for today";$("#journalSave").textContent="Save entry"}
function renderJournal(){
  $("#journalCount").textContent=`${journal.length} ${journal.length===1?"entry":"entries"}`;
  const host=$("#journalList");
  if(!journal.length){host.innerHTML='<p class="empty-note">Your pages will live here. This is a private space to begin whenever you want.</p>';return;}
  host.innerHTML=journal.map(entry=>`<article class="journal-entry"><div class="journal-entry-head"><div><h4>${escapeHTML(entry.title)}</h4><time>${formatDate(entry.date,{month:"long",day:"numeric",year:"numeric"})}</time></div><div class="journal-entry-actions"><button data-journal-edit="${entry.id}">Edit</button><button data-journal-delete="${entry.id}">Delete</button></div></div><p>${escapeHTML(entry.body.length>220?entry.body.slice(0,220)+"…":entry.body)}</p></article>`).join("");
}
$("#journalList").addEventListener("click",e=>{
  const edit=e.target.dataset.journalEdit,del=e.target.dataset.journalDelete;
  if(edit){const entry=journal.find(j=>j.id===edit);if(!entry)return;editingJournalId=edit;$("#journalTitle").value=entry.title;$("#journalBody").value=entry.body;$("#journalFormTitle").textContent="Edit your page";$("#journalSave").textContent="Update entry";$("#journalFeedback").textContent="";$("#journalTitle").focus();window.scrollTo({top:0,behavior:"smooth"});}
  if(del){if(!confirm("Delete this journal entry from this browser?"))return;journal=journal.filter(j=>j.id!==del);write(STORE.journal,journal);renderJournal();renderInsights();showToast("Entry deleted.");}
});
$("#trustedTips").addEventListener("click",()=>{$("#trustedText").classList.toggle("hidden");$("#trustedTips").textContent=$("#trustedText").classList.contains("hidden")?"What could I say?":"Hide example"});
$("#clearData").addEventListener("click",()=>{
  if(!confirm("This will permanently clear MindMate demo entries in this browser. Continue?"))return;
  moods=[];tasks=[];journal=[];Object.values(STORE).forEach(k=>localStorage.removeItem(k));renderRecentMoods();renderTasks();renderJournal();renderInsights();$("#settingsFeedback").textContent="Your MindMate demo data has been cleared from this browser.";showToast("Demo data cleared.");
});
renderRecentMoods();renderTasks();renderJournal();renderInsights();renderTimer();
