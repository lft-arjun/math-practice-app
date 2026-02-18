const state = {
  tab: 'practice',
  current: null,
  progress: JSON.parse(localStorage.getItem('math-progress') || '{"attempted":0,"correct":0}'),
  worksheets: JSON.parse(localStorage.getItem('worksheets') || '[]'),
  syncQueue: JSON.parse(localStorage.getItem('sync-queue') || '[]'),
  haptics: JSON.parse(localStorage.getItem('haptics') || 'true')
};

const els = {
  tabs: document.querySelectorAll('.tab'),
  navBtns: document.querySelectorAll('.bottom-nav button'),
  questionText: document.getElementById('questionText'),
  answerInput: document.getElementById('answerInput'),
  feedback: document.getElementById('feedback'),
  startBtn: document.getElementById('startBtn'),
  submitBtn: document.getElementById('submitBtn'),
  worksheetList: document.getElementById('worksheetList'),
  statAttempted: document.getElementById('statAttempted'),
  statCorrect: document.getElementById('statCorrect'),
  statAccuracy: document.getElementById('statAccuracy'),
  statQueue: document.getElementById('statQueue'),
  generateWorksheetBtn: document.getElementById('generateWorksheetBtn'),
  shareWorksheetBtn: document.getElementById('shareWorksheetBtn'),
  printWorksheetBtn: document.getElementById('printWorksheetBtn'),
  menuButton: document.getElementById('menuButton'),
  drawer: document.getElementById('drawer'),
  installButton: document.getElementById('installButton'),
  pullToRefresh: document.getElementById('pullToRefresh'),
  reducedMotionToggle: document.getElementById('reducedMotionToggle'),
  hapticsToggle: document.getElementById('hapticsToggle'),
  materialToggle: document.getElementById('materialToggle'),
  voiceBtn: document.getElementById('voiceBtn')
};

const ua = navigator.userAgent.toLowerCase();
const isIOS = /iphone|ipad|ipod/.test(ua);
const isAndroid = /android/.test(ua);
if (isIOS) document.body.classList.add('ios');
if (isAndroid) document.body.classList.add('android');

function setTab(tabName, pushHistory = true) {
  state.tab = tabName;
  els.tabs.forEach((tab) => tab.classList.toggle('active', tab.id === tabName));
  els.navBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabName));
  if (pushHistory) history.pushState({ tab: tabName }, '', `#${tabName}`);
}

function generateQuestion() {
  const a = 1 + Math.floor(Math.random() * 12);
  const b = 1 + Math.floor(Math.random() * 12);
  state.current = { a, b, answer: a * b };
  els.questionText.textContent = `${a} × ${b} = ?`;
  els.feedback.textContent = '';
  els.answerInput.value = '';
  els.answerInput.focus();
}

function vibrate(pattern) {
  if (!state.haptics) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function submitAnswer() {
  if (!state.current) return;
  const value = Number(els.answerInput.value);
  const correct = value === state.current.answer;
  state.progress.attempted += 1;
  if (correct) {
    state.progress.correct += 1;
    els.feedback.textContent = '✅ Correct!';
    vibrate([15]);
  } else {
    els.feedback.textContent = `❌ Correct answer: ${state.current.answer}`;
    vibrate([25, 40, 25]);
  }
  state.syncQueue.push({
    timestamp: Date.now(),
    question: `${state.current.a}x${state.current.b}`,
    correct
  });
  saveState();
  renderStats();
  triggerSync();
  setTimeout(generateQuestion, 400);
}

function generateWorksheet() {
  const createdAt = new Date().toLocaleString();
  const rows = Array.from({ length: 12 }, () => {
    const a = 1 + Math.floor(Math.random() * 12);
    const b = 1 + Math.floor(Math.random() * 12);
    return `${a} × ${b} = ____`;
  });
  const sheet = { id: Date.now(), createdAt, rows };
  state.worksheets.unshift(sheet);
  state.worksheets = state.worksheets.slice(0, 10);
  saveState();
  renderWorksheets();
}

function renderWorksheets() {
  if (!state.worksheets.length) {
    els.worksheetList.innerHTML = '<p class="muted">No worksheets yet. Generate one.</p>';
    return;
  }
  els.worksheetList.innerHTML = state.worksheets
    .map((sheet) => `<article class="worksheet-item"><strong>${sheet.createdAt}</strong><br>${sheet.rows.join('<br>')}</article>`)
    .join('');
}

function renderStats() {
  const { attempted, correct } = state.progress;
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  els.statAttempted.textContent = attempted;
  els.statCorrect.textContent = correct;
  els.statAccuracy.textContent = `${accuracy}%`;
  els.statQueue.textContent = state.syncQueue.length;
}

function saveState() {
  localStorage.setItem('math-progress', JSON.stringify(state.progress));
  localStorage.setItem('worksheets', JSON.stringify(state.worksheets));
  localStorage.setItem('sync-queue', JSON.stringify(state.syncQueue));
  localStorage.setItem('haptics', JSON.stringify(state.haptics));
}

async function triggerSync() {
  if (!navigator.onLine || !state.syncQueue.length) return;
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register('sync-results');
    } catch {
      state.syncQueue = [];
      saveState();
      renderStats();
    }
  }
}

function getLatestWorksheetText() {
  const latest = state.worksheets[0];
  if (!latest) return 'No worksheet generated yet.';
  return `Math Worksheet (${latest.createdAt})\n${latest.rows.join('\n')}`;
}

async function shareLatestWorksheet() {
  const text = getLatestWorksheetText();
  if (navigator.share) {
    await navigator.share({ title: 'Math Worksheet', text });
  } else {
    await navigator.clipboard.writeText(text);
    alert('Worksheet copied to clipboard.');
  }
}

function printLatestWorksheet() {
  const text = getLatestWorksheetText().replaceAll('\n', '<br>');
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<html><body style="font-family: sans-serif;">${text}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function setupPullToRefresh() {
  let startY = 0;
  let pulling = false;
  window.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 70 && state.tab === 'worksheets') {
      els.pullToRefresh.textContent = '↻ Refreshing...';
      generateWorksheet();
      pulling = false;
      setTimeout(() => { els.pullToRefresh.textContent = '↻ Pull to refresh worksheets'; }, 1000);
    }
  }, { passive: true });
  window.addEventListener('touchend', () => { pulling = false; });
}

function setupSwipeNavigation() {
  let startX = 0;
  window.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  window.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;
    if (Math.abs(delta) < 60) return;
    const tabs = ['practice', 'worksheets', 'progress', 'settings'];
    const idx = tabs.indexOf(state.tab);
    if (delta < 0 && idx < tabs.length - 1) setTab(tabs[idx + 1]);
    if (delta > 0 && idx > 0) setTab(tabs[idx - 1]);
  }, { passive: true });
}

function setupVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    els.voiceBtn.disabled = true;
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.onresult = (event) => {
    const result = event.results[0][0].transcript.replace(/\D/g, '');
    if (result) els.answerInput.value = result;
  };
  els.voiceBtn.addEventListener('click', () => recognition.start());
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  els.installButton.classList.remove('hidden');
});

els.installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  els.installButton.classList.add('hidden');
});

els.navBtns.forEach((btn) => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
els.startBtn.addEventListener('click', generateQuestion);
els.submitBtn.addEventListener('click', submitAnswer);
els.generateWorksheetBtn.addEventListener('click', generateWorksheet);
els.shareWorksheetBtn.addEventListener('click', shareLatestWorksheet);
els.printWorksheetBtn.addEventListener('click', printLatestWorksheet);
els.answerInput.addEventListener('keydown', (e) => e.key === 'Enter' && submitAnswer());

els.menuButton.addEventListener('click', () => {
  const open = els.drawer.classList.toggle('open');
  els.drawer.setAttribute('aria-hidden', String(!open));
});
els.drawer.addEventListener('click', async (e) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  const action = e.target.dataset.action;
  if (action === 'new-worksheet') generateWorksheet();
  if (action === 'share-latest') await shareLatestWorksheet();
  if (action === 'print-latest') printLatestWorksheet();
  if (action === 'clear-progress') {
    state.progress = { attempted: 0, correct: 0 };
    state.syncQueue = [];
    saveState();
    renderStats();
  }
});

els.hapticsToggle.checked = state.haptics;
els.hapticsToggle.addEventListener('change', () => {
  state.haptics = els.hapticsToggle.checked;
  saveState();
});
els.materialToggle.addEventListener('change', () => {
  document.body.classList.toggle('android', els.materialToggle.checked && isAndroid);
});
els.reducedMotionToggle.addEventListener('change', () => {
  document.documentElement.style.scrollBehavior = els.reducedMotionToggle.checked ? 'auto' : 'smooth';
});

window.addEventListener('online', triggerSync);
window.addEventListener('popstate', (event) => {
  if (event.state?.tab) {
    setTab(event.state.tab, false);
  } else if (state.tab !== 'practice') {
    setTab('practice', false);
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_DONE') {
      state.syncQueue = [];
      saveState();
      renderStats();
    }
  });
}

renderWorksheets();
renderStats();
setupPullToRefresh();
setupSwipeNavigation();
setupVoiceInput();
setTab(location.hash.replace('#', '') || 'practice', false);
