// StaticMind — content.js
// Runs on every page, checks if URL is blocked, injects overlay

(async () => {
  const { sites = [], apiKey = '' } = await chrome.storage.local.get(['sites', 'apiKey']);
  const currentDomain = location.hostname.replace(/^www\./, '');

  const matched = sites.find(s => {
    const clean = s.domain.replace(/^www\./, '');
    return currentDomain === clean || currentDomain.endsWith('.' + clean);
  });

  if (!matched) return;

  // Full Block — no overlay, just stop
  if (matched.fullBlock) {
    document.documentElement.innerHTML = '';
    document.body = document.createElement('body');
    document.body.style.cssText = 'background:#000;margin:0;display:flex;align-items:center;justify-content:center;height:100vh;';
    const msg = document.createElement('div');
    msg.style.cssText = `
      font-family: 'Century Gothic', sans-serif;
      font-weight: 700;
      font-size: 26px;
      color: #B9D1EB;
      text-align: center;
      letter-spacing: 2px;
    `;
    msg.textContent = 'FULL BLOCK ENABLED';
    document.body.appendChild(msg);
    return;
  }

  // Inject Shadow DOM overlay
  injectOverlay(matched.domain);
})();

function injectOverlay(domain) {
  // Freeze scroll
  document.documentElement.style.overflow = 'hidden';

  // Host element
  const host = document.createElement('div');
  host.id = 'staticmind-host';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;';
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'closed' });

  shadow.innerHTML = `
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :host { all: initial; }

      .sm-overlay {
        position: fixed;
        inset: 0;
        background: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Century Gothic', 'AppleGothic', sans-serif;
        font-weight: 700;
        overflow: hidden;
      }

      canvas {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .sm-card {
        position: relative;
        z-index: 10;
        background: rgba(6, 4, 10, 0.88);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border-radius: 6px;
        padding: 52px 52px 44px;
        max-width: 520px;
        width: calc(100vw - 48px);
        text-align: center;
        border: 1px solid rgba(185, 209, 235, 0.15);
      }

      .sm-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 6px;
        padding: 1.5px;
        background: linear-gradient(135deg, #B9D1EB, #F876DE);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }

      .sm-wordmark {
        font-size: 12px;
        letter-spacing: 4px;
        text-transform: uppercase;
        background: linear-gradient(90deg, #B9D1EB, #F876DE);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 36px;
        display: block;
      }

      .sm-headline {
        font-size: 34px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.2;
        margin-bottom: 16px;
        letter-spacing: -0.3px;
      }

      .sm-subline {
        font-size: 26px;
        font-weight: 700;
        color: rgba(232, 228, 223, 0.75);
        line-height: 1.4;
        margin-bottom: 40px;
      }

      .sm-timer-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 40px;
      }

      .sm-timer-ring {
        width: 72px;
        height: 72px;
        transform: rotate(-90deg);
      }

      .sm-ring-bg {
        fill: none;
        stroke: rgba(255,255,255,0.06);
        stroke-width: 2.5;
      }

      .sm-ring-fill {
        fill: none;
        stroke: url(#tw-grad);
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-dasharray: 188.5;
        stroke-dashoffset: 0;
        transition: stroke-dashoffset 1s linear;
      }

      .sm-timer-label {
        font-size: 23px;
        font-weight: 700;
        color: rgba(232, 228, 223, 0.5);
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      .sm-choice {
        font-size: 23px;
        font-weight: 700;
        color: rgba(232, 228, 223, 0.55);
        margin-bottom: 24px;
        letter-spacing: 0.5px;
      }

      .sm-buttons {
        display: flex;
        gap: 14px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .sm-btn {
        font-family: 'Century Gothic', 'AppleGothic', sans-serif;
        font-weight: 700;
        font-size: 23px;
        padding: 14px 28px;
        border-radius: 3px;
        border: none;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.2s;
        letter-spacing: 0.3px;
      }

      .sm-btn:disabled {
        opacity: 0.25;
        cursor: not-allowed;
        transform: none !important;
      }

      .sm-btn-continue {
        background: transparent;
        color: #B9D1EB;
        border: 1.5px solid rgba(185, 209, 235, 0.4);
      }

      .sm-btn-continue:not(:disabled):hover {
        border-color: #B9D1EB;
        opacity: 0.85;
        transform: translateY(-1px);
      }

      .sm-btn-refocus {
        background: linear-gradient(90deg, #B9D1EB, #F876DE);
        color: #000;
      }

      .sm-btn-refocus:not(:disabled):hover {
        opacity: 0.85;
        transform: translateY(-1px);
      }
    </style>

    <div class="sm-overlay">
      <canvas id="sm-canvas"></canvas>

      <div class="sm-card">
        <span class="sm-wordmark">StaticMind</span>

        <div class="sm-headline">This tab can wait. Can you?</div>
        <div class="sm-subline">Take a breath. What brought you here right now?</div>

        <div class="sm-timer-wrap">
          <svg class="sm-timer-ring" viewBox="0 0 72 72">
            <defs>
              <linearGradient id="tw-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#B9D1EB"/>
                <stop offset="100%" stop-color="#F876DE"/>
              </linearGradient>
            </defs>
            <circle class="sm-ring-bg" cx="36" cy="36" r="30"/>
            <circle class="sm-ring-fill" id="sm-ring" cx="36" cy="36" r="30"/>
          </svg>
          <div class="sm-timer-label">Sit with it.</div>
        </div>

        <div class="sm-choice">What does your better self choose?</div>

        <div class="sm-buttons">
          <button class="sm-btn sm-btn-continue" id="sm-continue" disabled>Continue mindfully</button>
          <button class="sm-btn sm-btn-refocus" id="sm-refocus" disabled>Help me refocus</button>
        </div>
      </div>
    </div>
  `;

  // ── Ghost shapes canvas ────────────────────────────────
  const canvas = shadow.getElementById('sm-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, shapes = [];
  const COLORS = ['#B9D1EB', '#F876DE'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function hexAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function makeShape(i) {
    const types = ['circle','square','rectangle','circle','square','rectangle','square','circle','rectangle'];
    const type = types[i % types.length];
    const color = COLORS[i % 2];
    const size = 180 + Math.random() * 260;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * W; y = -size * 0.3; }
    else if (edge === 1) { x = W + size * 0.3; y = Math.random() * H; }
    else if (edge === 2) { x = Math.random() * W; y = H + size * 0.3; }
    else { x = -size * 0.3; y = Math.random() * H; }
    const speed = 0.03 + Math.random() * 0.05;
    const angle = Math.random() * Math.PI * 2;
    return {
      type, color, size, x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.0003,
      phase: Math.random() * Math.PI * 2,
      aspect: type === 'rectangle' ? 0.5 + Math.random() * 0.4 : 1
    };
  }

  function drawShape(s, t) {
    const opacity = 0.28 + 0.1 * Math.sin(s.phase + t * 0.0004);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = hexAlpha(s.color, opacity);
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 10;
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
    ctx.shadowBlur = 18;
    ctx.globalAlpha = 0.4;
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

  resize();
  shapes = Array.from({ length: 9 }, (_, i) => makeShape(i));
  animateCanvas();
  window.addEventListener('resize', resize);

  // ── Timer ──────────────────────────────────────────────
  const ring = shadow.getElementById('sm-ring');
  const continueBtn = shadow.getElementById('sm-continue');
  const refocusBtn = shadow.getElementById('sm-refocus');
  const TOTAL = 20;
  const CIRCUMFERENCE = 188.5;
  let remaining = TOTAL;

  const countdown = setInterval(() => {
    remaining--;
    const offset = CIRCUMFERENCE * (remaining / TOTAL);
    ring.style.strokeDashoffset = offset;

    if (remaining <= 0) {
      clearInterval(countdown);
      continueBtn.disabled = false;
      refocusBtn.disabled = false;
    }
  }, 1000);

  // ── Buttons ────────────────────────────────────────────
  continueBtn.addEventListener('click', () => {
    document.documentElement.style.overflow = '';
    host.remove();
  });

  refocusBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_CHATPAGE', site: domain });
    document.documentElement.style.overflow = '';
    host.remove();
  });
}
