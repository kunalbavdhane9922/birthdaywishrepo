/* ============================================================
   BIRTHDAY YAAR — INTERACTIVE ENGINE
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- DOM REFS ---------- */
  const scenes  = [...document.querySelectorAll('.scene')];
  const dots    = [...document.querySelectorAll('.dot')];
  const bar     = document.getElementById('progressFill');
  const soundBtn = document.getElementById('soundBtn');
  let cur = 0;
  let soundOn = true;

  /* ============================================================
     1. WEB AUDIO SYNTH — no external files needed
     ============================================================ */
  let ac = null;
  const initAC = () => {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ac = new AC();
    }
  };

  const pop = () => {
    if (!soundOn) return; initAC(); if (!ac) return;
    try {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(420, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(160, ac.currentTime + 0.07);
      g.gain.setValueAtTime(0.25, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + 0.07);
    } catch (_) {}
  };

  const chime = () => {
    if (!soundOn) return; initAC(); if (!ac) return;
    try {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle';
        const t = ac.currentTime + i * 0.055;
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.14, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.connect(g); g.connect(ac.destination);
        o.start(t); o.stop(t + 0.35);
      });
    } catch (_) {}
  };

  const whoosh = () => {
    if (!soundOn) return; initAC(); if (!ac) return;
    try {
      const sz = Math.floor(ac.sampleRate * 0.45);
      const buf = ac.createBuffer(1, sz, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
      const s = ac.createBufferSource(); s.buffer = buf;
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(700, ac.currentTime);
      f.frequency.linearRampToValueAtTime(180, ac.currentTime + 0.45);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.35, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
      s.connect(f); f.connect(g); g.connect(ac.destination);
      s.start(); s.stop(ac.currentTime + 0.45);
    } catch (_) {}
  };

  const fanfare = () => {
    if (!soundOn) return; initAC(); if (!ac) return;
    try {
      const notes = [
        { f: 392, d: 0.22 }, { f: 392, d: 0.22 },
        { f: 440, d: 0.44 }, { f: 392, d: 0.44 },
        { f: 523.25, d: 0.44 }, { f: 493.88, d: 0.7 }
      ];
      let t = ac.currentTime;
      notes.forEach(n => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(n.f, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.025);
        g.gain.exponentialRampToValueAtTime(0.001, t + n.d);
        o.connect(g); g.connect(ac.destination);
        o.start(t); o.stop(t + n.d);
        t += n.d * 0.82;
      });
    } catch (_) {}
  };

  /* Sound toggle */
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? '🔊' : '🔇';
    if (soundOn) pop();
  });

  /* ============================================================
     2. SCENE NAVIGATION
     ============================================================ */
  function go(idx) {
    if (idx < 0 || idx >= scenes.length) return;
    scenes[cur].classList.remove('active');
    cur = idx;
    scenes[cur].classList.add('active');
    // Reset scroll
    scenes[cur].scrollTop = 0;
    // Progress
    bar.style.width = `${((cur + 1) / scenes.length) * 100}%`;
    // Dots
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    chime();
    // Scene hooks
    if (cur === 3) spawnHearts();
  }

  /* Next buttons */
  document.querySelectorAll('.next-btn').forEach(b =>
    b.addEventListener('click', () => go(cur + 1))
  );

  /* Gift click */
  document.getElementById('giftWrap')?.addEventListener('click', () => { pop(); go(1); });
  document.getElementById('enterBtn')?.addEventListener('click', () => { pop(); go(1); });

  /* Replay */
  document.getElementById('replayBtn')?.addEventListener('click', () => {
    resetCandles();
    go(0);
  });

  /* Dot clicks */
  dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.idx)));

  /* Keyboard */
  window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });

  /* Swipe */
  let sx = 0;
  window.addEventListener('touchstart', e => { sx = e.touches?.[0]?.clientX || 0; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 55) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ============================================================
     3. BACKGROUND PARTICLE CANVAS
     ============================================================ */
  const cv = document.getElementById('bgCanvas');
  const cx = cv.getContext('2d');
  let W = cv.width = window.innerWidth;
  let H = cv.height = window.innerHeight;
  window.addEventListener('resize', () => { W = cv.width = innerWidth; H = cv.height = innerHeight; });

  const pts = [];
  for (let i = 0; i < 35; i++) pts.push({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 2.5 + 0.8,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    a: Math.random() * 0.5 + 0.15,
    h: Math.random() > 0.5 ? 340 : 42
  });

  (function loop() {
    cx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      cx.beginPath();
      cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fillStyle = `hsla(${p.h},75%,68%,${p.a})`;
      cx.shadowBlur = 10;
      cx.shadowColor = `hsl(${p.h},75%,68%)`;
      cx.fill();
    });
    requestAnimationFrame(loop);
  })();

  /* ============================================================
     4. FORGIVENESS GAUGE
     ============================================================ */
  const slider  = document.getElementById('gaugeSlider');
  const gFill   = document.getElementById('gaugeFill');
  const gVal    = document.getElementById('gaugeVal');
  const gHint   = document.getElementById('gaugeHint');
  const reactions = [
    { m: 20,  s: '😡 Abhi toh gussa hai (15%)',           h: 'Slider ko right kheench ke maaf kar 👉' },
    { m: 40,  s: '😒 Hmm... excuses acche nahi the (35%)', h: 'Aur kheench!' },
    { m: 65,  s: '🙂 Thoda mood theek ho raha hai (60%)',  h: 'Bass thoda aur...' },
    { m: 90,  s: '😊 Lagbhag maaf kiya (85%)',             h: 'Ek push aur!' },
    { m: 100, s: '🎉 100% MAAF! Best Friend Status Bahal! ❤️', h: 'Yayy! Maafi mil gayi!' }
  ];

  slider?.addEventListener('input', () => {
    const v = +slider.value;
    gFill.style.width = v + '%';
    const r = reactions.find(x => v <= x.m) || reactions[reactions.length - 1];
    gVal.textContent = r.s;
    gHint.textContent = r.h;
    if (v >= 100) { gVal.style.color = '#ff4e79'; pop(); }
  });

  /* ============================================================
     5. FLIP CARDS
     ============================================================ */
  document.querySelectorAll('.flip-card').forEach(c =>
    c.addEventListener('click', () => { c.classList.toggle('flipped'); pop(); })
  );

  /* ============================================================
     6. LIGHTBOX — for memory images
     ============================================================ */
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');

  document.querySelectorAll('.memory-img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lbCap.textContent = img.alt || '';
      lb.classList.add('open');
      pop();
    });
  });

  document.getElementById('lbClose')?.addEventListener('click', () => lb.classList.remove('open'));
  lb?.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });

  /* ============================================================
     7. HEARTS — Scene 3
     ============================================================ */
  function spawnHearts() {
    const pool = document.getElementById('heartsFloat');
    if (!pool) return;
    pool.innerHTML = '';
    const emojis = ['❤️', '💛', '✨', '💫', '🌟'];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.className = 'hf';
      s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      s.style.left = Math.random() * 90 + '%';
      s.style.animationDelay = Math.random() * 3.5 + 's';
      s.style.animationDuration = (3 + Math.random() * 3) + 's';
      pool.appendChild(s);
    }
  }

  /* ============================================================
     8. CAKE CANDLES
     ============================================================ */
  let blown = 0;
  const totalC = 3;

  function blowCandle(n) {
    const f = document.getElementById('f' + n);
    const s = document.getElementById('s' + n);
    if (f && !f.classList.contains('out')) {
      f.classList.add('out');
      if (s) s.classList.add('puff');
      blown++;
      whoosh();
      if (blown >= totalC) allBlown();
    }
  }

  document.querySelectorAll('.cndl').forEach(c =>
    c.addEventListener('click', () => blowCandle(c.dataset.c))
  );

  document.getElementById('blowBtn')?.addEventListener('click', () => {
    for (let i = 1; i <= totalC; i++) blowCandle(i);
  });

  function resetCandles() {
    blown = 0;
    for (let i = 1; i <= totalC; i++) {
      document.getElementById('f' + i)?.classList.remove('out');
      document.getElementById('s' + i)?.classList.remove('puff');
    }
    const l = document.getElementById('blowLabel');
    if (l) l.textContent = 'Candles Blow Kar';
  }

  function allBlown() {
    const l = document.getElementById('blowLabel');
    if (l) l.textContent = 'Blown! 🎉';
    fanfare();
    burstConfetti();
    launchFW();
  }

  /* ============================================================
     9. CONFETTI
     ============================================================ */
  function burstConfetti() {
    const box = document.getElementById('confettiBox');
    if (!box) return;
    box.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('div');
      p.className = 'cfp';
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px');
      p.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
      p.style.animationDelay = Math.random() * 0.8 + 's';
      p.style.background = `hsl(${Math.random() * 360},80%,65%)`;
      box.appendChild(p);
    }
  }

  /* ============================================================
     10. FIREWORKS CANVAS
     ============================================================ */
  function launchFW() {
    const fc = document.getElementById('fwCanvas');
    const fx = fc?.getContext('2d');
    if (!fc || !fx) return;
    fc.width = window.innerWidth;
    fc.height = window.innerHeight;
    const colors = ['#ff4e79', '#ffc256', '#9d4edd', '#00f2fe', '#4facfe'];
    const sparks = [];

    for (let i = 0; i < 5; i++) {
      const ox = Math.random() * fc.width;
      const oy = Math.random() * fc.height * 0.45;
      const col = colors[Math.floor(Math.random() * colors.length)];
      for (let j = 0; j < 35; j++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5.5 + 1.5;
        sparks.push({ x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, a: 1, c: col });
      }
    }

    (function render() {
      fx.clearRect(0, 0, fc.width, fc.height);
      let alive = false;
      sparks.forEach(s => {
        if (s.a > 0.01) {
          alive = true;
          s.x += s.vx; s.y += s.vy; s.vy += 0.07; s.a *= 0.96;
          fx.beginPath();
          fx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
          fx.fillStyle = s.c;
          fx.globalAlpha = s.a;
          fx.fill();
        }
      });
      if (alive) requestAnimationFrame(render);
      else fx.clearRect(0, 0, fc.width, fc.height);
    })();
  }

  /* ============================================================
     INIT
     ============================================================ */
  go(0);
});
