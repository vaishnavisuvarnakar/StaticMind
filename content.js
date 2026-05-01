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
    document.body.style.cssText = 'background:#020005;margin:0;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden;';

    // Create a more visually striking full block page
    const container = document.createElement('div');
    container.style.cssText = 'text-align:center;position:relative;';

    // Ambient glow
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; overflow: hidden;
    `;
    const orb1 = document.createElement('div');
    orb1.style.cssText = `
      position: absolute; width: 400px; height: 400px; border-radius: 50%;
      background: #B9D1EB; filter: blur(120px); opacity: 0.06;
      top: -150px; right: -100px;
      animation: orbFloat 16s ease-in-out infinite alternate;
    `;
    const orb2 = document.createElement('div');
    orb2.style.cssText = `
      position: absolute; width: 350px; height: 350px; border-radius: 50%;
      background: #F876DE; filter: blur(120px); opacity: 0.05;
      bottom: -120px; left: -80px;
      animation: orbFloat 20s ease-in-out infinite alternate-reverse;
    `;
    glow.appendChild(orb1);
    glow.appendChild(orb2);

    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&display=swap');
      @keyframes orbFloat {
        0% { transform: translate(0,0) scale(1); }
        50% { transform: translate(30px,-20px) scale(1.1); }
        100% { transform: translate(-20px,15px) scale(0.95); }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes breathe {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 0.8; }
      }
    `;

    const wordmark = document.createElement('div');
    wordmark.style.cssText = `
      font-family: 'Outfit', 'Century Gothic', sans-serif;
      font-weight: 700; font-size: 11px; letter-spacing: 5px;
      text-transform: uppercase; margin-bottom: 28px;
      background: linear-gradient(90deg, #B9D1EB, #F876DE);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: fadeUp 0.6s ease both;
    `;
    wordmark.textContent = 'STATICMIND';

    const msg = document.createElement('div');
    msg.style.cssText = `
      font-family: 'Outfit', 'Century Gothic', sans-serif;
      font-weight: 700; font-size: 28px; color: #e8e4df;
      letter-spacing: 1px; line-height: 1.4;
      animation: fadeUp 0.6s ease both 0.15s; opacity: 0;
    `;
    msg.textContent = 'Full Block Enabled';

    const sub = document.createElement('div');
    sub.style.cssText = `
      font-family: 'Outfit', 'Century Gothic', sans-serif;
      font-weight: 500; font-size: 14px; color: #6a6560;
      margin-top: 12px; letter-spacing: 0.3px;
      animation: fadeUp 0.6s ease both 0.3s; opacity: 0;
    `;
    sub.textContent = 'This site is blocked. You chose this.';

    container.appendChild(wordmark);
    container.appendChild(msg);
    container.appendChild(sub);
    document.body.appendChild(style);
    document.body.appendChild(glow);
    document.body.appendChild(container);
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
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :host { all: initial; }

      .sm-overlay {
        position: fixed;
        inset: 0;
        background: #020005;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', 'Century Gothic', 'AppleGothic', sans-serif;
        font-weight: 700;
        overflow: hidden;
      }

      canvas {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      /* Ambient aurora orbs */
      .sm-aurora {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .sm-aurora .sm-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(100px);
        animation: smOrbDrift 18s ease-in-out infinite alternate;
      }

      .sm-aurora .sm-orb:nth-child(1) {
        width: 450px; height: 450px;
        background: #B9D1EB;
        opacity: 0.06;
        top: -180px; right: -120px;
      }

      .sm-aurora .sm-orb:nth-child(2) {
        width: 380px; height: 380px;
        background: #F876DE;
        opacity: 0.05;
        bottom: -150px; left: -100px;
        animation-delay: -9s;
        animation-duration: 22s;
      }

      .sm-aurora .sm-orb:nth-child(3) {
        width: 250px; height: 250px;
        background: linear-gradient(135deg, #B9D1EB, #F876DE);
        opacity: 0.03;
        top: 45%; left: 45%;
        animation-delay: -4s;
        animation-duration: 16s;
      }

      @keyframes smOrbDrift {
        0%   { transform: translate(0, 0) scale(1); }
        33%  { transform: translate(35px, -25px) scale(1.08); }
        66%  { transform: translate(-25px, 35px) scale(0.94); }
        100% { transform: translate(15px, -15px) scale(1.03); }
      }

      /* Floating CSS particles */
      .sm-particles {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .sm-mote {
        position: absolute;
        width: 2px; height: 2px;
        border-radius: 50%;
        opacity: 0;
        animation: smMoteDrift 11s ease-in-out infinite;
      }

      .sm-mote:nth-child(1) { left: 10%; top: 20%; background: #B9D1EB; animation-delay: 0s; }
      .sm-mote:nth-child(2) { left: 35%; top: 65%; background: #F876DE; animation-delay: 2.5s; }
      .sm-mote:nth-child(3) { left: 70%; top: 30%; background: #B9D1EB; animation-delay: 5s; }
      .sm-mote:nth-child(4) { left: 85%; top: 75%; background: #F876DE; animation-delay: 1.5s; }
      .sm-mote:nth-child(5) { left: 50%; top: 15%; background: #B9D1EB; animation-delay: 4s; }
      .sm-mote:nth-child(6) { left: 20%; top: 85%; background: #F876DE; animation-delay: 7s; }

      @keyframes smMoteDrift {
        0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
        15%  { opacity: 0.5; }
        50%  { opacity: 0.2; transform: translateY(-40px) scale(1.6); }
        85%  { opacity: 0.45; }
      }

      .sm-card {
        position: relative;
        z-index: 10;
        background: rgba(6, 4, 12, 0.82);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 18px;
        padding: 52px 52px 44px;
        max-width: 520px;
        width: calc(100vw - 48px);
        text-align: center;
        border: 1px solid rgba(185, 209, 235, 0.08);
        animation: smCardReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        animation-delay: 0.1s;
      }

      @keyframes smCardReveal {
        from { opacity: 0; transform: translateY(30px) scale(0.94); filter: blur(6px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
      }

      .sm-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 18px;
        padding: 1px;
        background: linear-gradient(135deg, #B9D1EB, #F876DE, #B9D1EB);
        background-size: 200% 200%;
        animation: smBorderGradient 6s ease infinite;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        opacity: 0.5;
      }

      @keyframes smBorderGradient {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* Top edge highlight */
      .sm-card::after {
        content: '';
        position: absolute;
        top: 0; left: 15%; right: 15%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(185,209,235,0.2), transparent);
        pointer-events: none;
        border-radius: 1px;
      }

      .sm-wordmark {
        font-size: 11px;
        letter-spacing: 5px;
        text-transform: uppercase;
        background: linear-gradient(90deg, #B9D1EB, #F876DE);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 32px;
        display: block;
        font-weight: 700;
        animation: smTextReveal 0.6s ease both 0.3s;
        opacity: 0;
      }

      @keyframes smTextReveal {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .sm-headline {
        font-size: 32px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.25;
        margin-bottom: 14px;
        letter-spacing: -0.3px;
        animation: smTextReveal 0.6s ease both 0.4s;
        opacity: 0;
      }

      .sm-subline {
        font-size: 18px;
        font-weight: 500;
        color: rgba(232, 228, 223, 0.6);
        line-height: 1.5;
        margin-bottom: 36px;
        animation: smTextReveal 0.6s ease both 0.5s;
        opacity: 0;
      }

      .sm-timer-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        margin-bottom: 36px;
        animation: smTextReveal 0.6s ease both 0.6s;
        opacity: 0;
      }

      .sm-timer-ring {
        width: 76px;
        height: 76px;
        transform: rotate(-90deg);
        filter: drop-shadow(0 0 8px rgba(185,209,235,0.15));
      }

      .sm-ring-bg {
        fill: none;
        stroke: rgba(255,255,255,0.04);
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
        font-size: 15px;
        font-weight: 600;
        color: rgba(232, 228, 223, 0.4);
        letter-spacing: 2px;
        text-transform: uppercase;
        animation: smBreathe 5s ease-in-out infinite;
      }

      @keyframes smBreathe {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.7; }
      }

      .sm-choice {
        font-size: 16px;
        font-weight: 600;
        color: rgba(232, 228, 223, 0.45);
        margin-bottom: 22px;
        letter-spacing: 0.5px;
        animation: smTextReveal 0.6s ease both 0.7s;
        opacity: 0;
      }

      .sm-buttons {
        display: flex;
        gap: 14px;
        justify-content: center;
        flex-wrap: wrap;
        animation: smTextReveal 0.6s ease both 0.8s;
        opacity: 0;
      }

      .sm-btn {
        font-family: 'Outfit', 'Century Gothic', 'AppleGothic', sans-serif;
        font-weight: 700;
        font-size: 15px;
        padding: 14px 28px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        letter-spacing: 0.3px;
        position: relative;
        overflow: hidden;
      }

      .sm-btn:disabled {
        opacity: 0.2;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }

      .sm-btn-continue {
        background: rgba(185, 209, 235, 0.06);
        color: #B9D1EB;
        border: 1.5px solid rgba(185, 209, 235, 0.2);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .sm-btn-continue:not(:disabled):hover {
        border-color: rgba(185, 209, 235, 0.5);
        background: rgba(185, 209, 235, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 6px 24px -6px rgba(185,209,235,0.2);
      }

      .sm-btn-continue:not(:disabled):active {
        transform: translateY(0) scale(0.97);
      }

      .sm-btn-refocus {
        background: linear-gradient(135deg, #B9D1EB, #F876DE);
        background-size: 150% 150%;
        color: #000;
      }

      .sm-btn-refocus::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent 60%);
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
        border-radius: 12px;
      }

      .sm-btn-refocus:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px -6px rgba(248,118,222,0.3);
      }

      .sm-btn-refocus:not(:disabled):hover::after { opacity: 1; }

      .sm-btn-refocus:not(:disabled):active {
        transform: translateY(0) scale(0.97);
      }

      /* ── Responsive ── */
      @media (max-width: 560px) {
        .sm-card {
          padding: 40px 28px 36px;
          border-radius: 16px;
        }
        .sm-headline { font-size: 26px; }
        .sm-subline { font-size: 16px; }
        .sm-btn { font-size: 14px; padding: 12px 22px; }
      }

      @media (max-width: 380px) {
        .sm-card {
          padding: 32px 20px 28px;
          width: calc(100vw - 24px);
        }
        .sm-headline { font-size: 22px; }
        .sm-subline { font-size: 14px; }
        .sm-buttons { flex-direction: column; gap: 10px; }
        .sm-btn { width: 100%; }
      }
    </style>

    <div class="sm-overlay">
      <div class="sm-aurora">
        <div class="sm-orb"></div>
        <div class="sm-orb"></div>
        <div class="sm-orb"></div>
      </div>
      <div class="sm-particles">
        <div class="sm-mote"></div>
        <div class="sm-mote"></div>
        <div class="sm-mote"></div>
        <div class="sm-mote"></div>
        <div class="sm-mote"></div>
        <div class="sm-mote"></div>
      </div>
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
    const types = ['circle','square','rectangle','triangle','circle','square','rectangle','triangle','circle'];
    const type = types[i % types.length];
    const color = COLORS[i % 2];
    const size = 150 + Math.random() * 280;
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * W; y = -size * 0.3; }
    else if (edge === 1) { x = W + size * 0.3; y = Math.random() * H; }
    else if (edge === 2) { x = Math.random() * W; y = H + size * 0.3; }
    else { x = -size * 0.3; y = Math.random() * H; }
    const speed = 0.025 + Math.random() * 0.045;
    const angle = Math.random() * Math.PI * 2;
    return {
      type, color, size, x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.0004,
      phase: Math.random() * Math.PI * 2,
      aspect: type === 'rectangle' ? 0.5 + Math.random() * 0.4 : 1
    };
  }

  function drawShape(s, t) {
    const opacity = 0.22 + 0.1 * Math.sin(s.phase + t * 0.0003);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = hexAlpha(s.color, opacity);
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    if (s.type === 'circle') {
      ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
    } else if (s.type === 'square') {
      const h = s.size / 2;
      ctx.rect(-h, -h, s.size, s.size);
    } else if (s.type === 'triangle') {
      const r = s.size / 2;
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.866, r * 0.5);
      ctx.lineTo(-r * 0.866, r * 0.5);
      ctx.closePath();
    } else {
      const hw = s.size / 2, hh = (s.size * s.aspect) / 2;
      ctx.rect(-hw, -hh, s.size, s.size * s.aspect);
    }
    ctx.stroke();
    ctx.shadowBlur = 22;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.restore();
  }

  // Connection lines between nearby shapes
  function drawConnections(t) {
    const maxDist = 300;
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const dx = shapes[i].x - shapes[j].x;
        const dy = shapes[i].y - shapes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.05;
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.0005 + i + j);
          ctx.beginPath();
          ctx.moveTo(shapes[i].x, shapes[i].y);
          ctx.lineTo(shapes[j].x, shapes[j].y);
          ctx.strokeStyle = hexAlpha(COLORS[(i + j) % 2], alpha * pulse);
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }
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
    drawConnections(t);
  }

  resize();
  shapes = Array.from({ length: 10 }, (_, i) => makeShape(i));
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
