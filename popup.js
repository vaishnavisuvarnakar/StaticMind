// StaticMind — popup.js

// ── Ghost shapes canvas ────────────────────────────────
const canvas = document.getElementById('popup-canvas');
const ctx = canvas.getContext('2d');
let W, H, shapes = [];
const COLORS = ['#B9D1EB', '#F876DE'];

function resizeCanvas() {
  W = canvas.width = document.documentElement.offsetWidth || 420;
  H = canvas.height = document.body.scrollHeight || 560;
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeShape(i) {
  const types = ['circle','square','rectangle','circle','square'];
  const type = types[i % types.length];
  const color = COLORS[i % 2];
  const size = 120 + Math.random() * 160;
  const x = Math.random() * (W || 420);
  const y = Math.random() * (H || 560);
  const speed = 0.02 + Math.random() * 0.04;
  const angle = Math.random() * Math.PI * 2;
  return {
    type, color, size, x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.0002,
    phase: Math.random() * Math.PI * 2,
    aspect: type === 'rectangle' ? 0.5 + Math.random() * 0.4 : 1
  };
}

function drawShape(s, t) {
  const opacity = 0.22 + 0.08 * Math.sin(s.phase + t * 0.0004);
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rotation);
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = hexAlpha(s.color, opacity);
  ctx.shadowColor = s.color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  if (s.type === 'circle') {
    ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
  } else if (s.type === 'square') {
    const h = s.size / 2;
    ctx.rect(-h, -h, s.size, s.size);
  } else {
    const hw = s.size / 2, hh = (s.size * s.aspect) / 2;
    ctx.rect(-hw, -hh, s.size, s.size * s.aspect);
  }
  ctx.stroke();
  ctx.shadowBlur = 14;
  ctx.globalAlpha = 0.35;
  ctx.stroke();
  ctx.restore();
}

function animateCanvas(t = 0) {
  requestAnimationFrame(animateCanvas);
  ctx.clearRect(0, 0, W, H);
  shapes.forEach(s => {
    s.x += s.vx; s.y += s.vy; s.rotation += s.vr;
    const pad = s.size;
    if (s.x > W + pad) s.x = -pad;
    if (s.x < -pad) s.x = W + pad;
    if (s.y > H + pad) s.y = -pad;
    if (s.y < -pad) s.y = H + pad;
    drawShape(s, t);
  });
}

resizeCanvas();
shapes = Array.from({ length: 6 }, (_, i) => makeShape(i));
animateCanvas();

// ── Storage & UI ───────────────────────────────────────
let sites = [];

async function load() {
  const data = await chrome.storage.local.get(['sites', 'apiKey']);
  sites = data.sites || [];
  if (data.apiKey) {
    document.getElementById('key-input').value = data.apiKey;
  }
  renderList();
}

function renderList() {
  const list = document.getElementById('sites-list');
  const empty = document.getElementById('empty-state');
  list.querySelectorAll('.site-row').forEach(r => r.remove());

  if (sites.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  sites.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'site-row';

    const name = document.createElement('div');
    name.className = 'site-name';
    name.textContent = s.domain;

    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'toggle-wrap';

    const label = document.createElement('div');
    label.className = 'toggle-label';
    label.textContent = 'Full Block';

    const toggle = document.createElement('div');
    toggle.className = 'toggle' + (s.fullBlock ? ' on' : '');

    const knob = document.createElement('div');
    knob.className = 'toggle-knob';
    toggle.appendChild(knob);

    toggle.addEventListener('click', () => {
      sites[i].fullBlock = !sites[i].fullBlock;
      toggle.classList.toggle('on', sites[i].fullBlock);
      chrome.storage.local.set({ sites });
    });

    toggleWrap.appendChild(label);
    toggleWrap.appendChild(toggle);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      sites.splice(i, 1);
      chrome.storage.local.set({ sites });
      renderList();
    });

    row.appendChild(name);
    row.appendChild(toggleWrap);
    row.appendChild(removeBtn);
    list.appendChild(row);
  });

  setTimeout(resizeCanvas, 100);
}

function saveKey() {
  const val = document.getElementById('key-input').value.trim();
  if (!val) return;
  chrome.storage.local.set({ apiKey: val });
  const saved = document.getElementById('key-saved');
  saved.classList.add('show');
  setTimeout(() => saved.classList.remove('show'), 2000);
}

function addSite() {
  const input = document.getElementById('site-input');
  let val = input.value.trim().toLowerCase();
  if (!val) return;
  val = val.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!val) return;
  if (sites.find(s => s.domain === val)) {
    input.value = '';
    return;
  }
  sites.push({ domain: val, fullBlock: false });
  chrome.storage.local.set({ sites });
  input.value = '';
  renderList();
}

// ── Event listeners — NO inline handlers ──────────────
document.getElementById('save-key-btn').addEventListener('click', saveKey);
document.getElementById('key-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveKey();
});
document.getElementById('add-site-btn').addEventListener('click', addSite);
document.getElementById('site-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addSite();
});

load();
