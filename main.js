/**
 * Yash Maurya Portfolio — main.js
 * Clean, production-ready JavaScript
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initHamburger();
  initSmoothScroll();
  initTypingAnimation();
  initParticles();
  initScrollProgress();
  initScrollAnimations();
  initSkillBars();
  initStatCounters();
  initProjectFilter();
  initBackToTop();
  initContactForm();
});

/* ── 1. DARK / LIGHT THEME ─────────────────────────── */
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const icon   = toggle?.querySelector('.theme-icon');

  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (icon) icon.textContent = '☀️';
  }

  toggle?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const light = document.body.classList.contains('light-mode');
    if (icon) icon.textContent = light ? '☀️' : '🌙';
    localStorage.setItem('theme', light ? 'light' : 'dark');
    initParticles(); // re-draw particles with correct colours
  });
}

/* ── 2. NAVBAR — scroll glass + active link ────────── */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const links    = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    const y = window.scrollY;
    sections.forEach(s => {
      const top = s.offsetTop - 110;
      if (y >= top && y < top + s.offsetHeight) {
        links.forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-link[href="#${s.id}"]`)?.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── 3. HAMBURGER MENU ──────────────────────────────── */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const menu  = document.getElementById('navLinks');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('active', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) closeMenu();
  });

  function closeMenu() {
    menu.classList.remove('open');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  }
}

/* ── 4. SMOOTH SCROLL ───────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 75;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── 5. TYPING ANIMATION ────────────────────────────── */
function initTypingAnimation() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'Frontend Web Developer',
    'MERN Stack Trainee',
    'BCA Final Year Student',
    'UI/UX Enthusiast'
  ];

  let pi = 0, ci = 0, deleting = false;

  (function type() {
    const phrase = phrases[pi];
    el.textContent = deleting
      ? phrase.slice(0, --ci)
      : phrase.slice(0, ++ci);

    if (!deleting && ci === phrase.length) {
      deleting = true;
      setTimeout(type, 2000);
    } else if (deleting && ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      setTimeout(type, 400);
    } else {
      setTimeout(type, deleting ? 45 : 85);
    }
  })();
}

/* ── 6. CANVAS PARTICLES ────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  if (canvas._raf) cancelAnimationFrame(canvas._raf);

  const ctx     = canvas.getContext('2d');
  const light   = document.body.classList.contains('light-mode');
  const pc      = light ? 'rgba(79,70,229,' : 'rgba(99,102,241,';
  const lc      = 'rgba(99,102,241,';
  const mouse   = { x: null, y: null };
  let particles = [];

  const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };

  const spawn = () => {
    particles = Array.from({ length: light ? 55 : 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: 1.5 + Math.random() * (light ? 2.5 : 2),
      o: (light ? 0.25 : 0.3) + Math.random() * 0.4
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = lc + ((1 - d / 120) * 0.25) + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Mouse lines
    if (mouse.x !== null) {
      particles.forEach(p => {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = (light ? 'rgba(79,70,229,' : 'rgba(6,182,212,') + ((1 - d / 110) * 0.45) + ')';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      });
    }

    // Particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = pc + p.o + ')';
      ctx.fill();

      // Move
      p.x += p.vx; p.y += p.vy;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 75) {
          const f = (75 - d) / 75;
          p.vx += (dx / d) * f * 0.25;
          p.vy += (dy / d) * f * 0.25;
        }
      }

      // Speed cap
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > 1.4) { p.vx = (p.vx / spd) * 1.4; p.vy = (p.vy / spd) * 1.4; }

      // Bounce
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));
    });

    canvas._raf = requestAnimationFrame(draw);
  };

  resize(); spawn(); draw();

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  new ResizeObserver(() => { resize(); spawn(); }).observe(canvas);
}

/* ── 7. SCROLL PROGRESS BAR ─────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(100, pct) + '%';
  }, { passive: true });
}

/* ── 8. SCROLL ANIMATIONS ───────────────────────────── */
function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-in,.fade-in-up,.fade-in-left,.fade-in-right');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ── 9. SKILL BARS ──────────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  if (!bars.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        bars.forEach((b, i) => setTimeout(() => { b.style.width = b.dataset.width + '%'; }, i * 55));
        io.disconnect();
      }
    });
  }, { threshold: 0.15 });

  const sec = document.getElementById('skills');
  if (sec) io.observe(sec);
}

/* ── 10. STAT COUNTERS ──────────────────────────────── */
function initStatCounters() {
  const nums = document.querySelectorAll('.stat-number');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseInt(el.dataset.target);
      let cur   = 0;
      const inc = end / 60;
      const t   = setInterval(() => {
        cur += inc;
        if (cur >= end) { el.textContent = end; clearInterval(t); }
        else el.textContent = Math.floor(cur);
      }, 30);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));
}

/* ── 11. PROJECT FILTER ─────────────────────────────── */
function initProjectFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!btns.length) return;

  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.category === f;
      c.style.display = show ? '' : 'none';
      if (show) { c.classList.remove('visible'); void c.offsetWidth; setTimeout(() => c.classList.add('visible'), 50); }
    });
  }));
}

/* ── 12. PROJECT MODALS ─────────────────────────────── */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('active');
  document.body.style.overflow = 'hidden';
  m.querySelector('.modal-close')?.focus();
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

/* ── 13. BACK TO TOP ────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── 14. CONTACT FORM → WHATSAPP ────────────────────── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.querySelector('[name="name"]')?.value.trim();
    const email   = form.querySelector('[name="email"]')?.value.trim();
    const subject = form.querySelector('[name="subject"]')?.value.trim();
    const message = form.querySelector('[name="message"]')?.value.trim();
    const resp    = document.getElementById('formResponse');

    // Validation
    if (!name || !email || !message) {
      showResp('error', '⚠️ Please fill in Name, Email and Message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showResp('error', '⚠️ Please enter a valid email address.');
      return;
    }

    // Build WhatsApp message
    const text = `Hi Yash! 👋

*Name:* ${name}
*Email:* ${email}
*Subject:* ${subject || 'No subject'}

*Message:*
${message}

---
_Sent from yashmaurya.dev portfolio_`;

    const waURL = `https://wa.me/918960793990?text=${encodeURIComponent(text)}`;

    showResp('success', '✅ Opening WhatsApp...');

    // Show loading state briefly then redirect
    const btn  = document.getElementById('submitBtn');
    const txt  = document.getElementById('submitBtnText');
    const load = document.getElementById('submitBtnLoading');
    if (btn) btn.disabled = true;
    if (txt)  txt.classList.add('hidden');
    if (load) load.classList.remove('hidden');

    setTimeout(() => {
      window.open(waURL, '_blank');
      form.reset();
      if (btn)  btn.disabled = false;
      if (txt)  txt.classList.remove('hidden');
      if (load) load.classList.add('hidden');
    }, 800);

    function showResp(type, msg) {
      if (!resp) return;
      resp.textContent = msg;
      resp.className = `form-response ${type}`;
      resp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

/* ── EXPOSE GLOBALS ─────────────────────────────────── */
window.openModal  = openModal;
window.closeModal = closeModal;

/* ── 15. LIGHT MODE ANIMATED DECORATORS ─────────────── */
(function injectLightDecorators() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Orbs
  const orbs = [
    { cls: 'lm-orb lm-orb-1' },
    { cls: 'lm-orb lm-orb-2' },
    { cls: 'lm-orb lm-orb-3' },
    { cls: 'lm-orb lm-orb-4' },
  ];

  // Geometric shapes
  const shapes = [
    { cls: 'lm-shape lm-shape-square' },
    { cls: 'lm-shape lm-shape-triangle' },
    { cls: 'lm-shape lm-shape-circle' },
    { cls: 'lm-shape lm-shape-ring' },
    { cls: 'lm-shape lm-shape-dot-grid' },
  ];

  // Tech badges
  const badges = [
    { cls: 'lm-tech-badge lm-badge-react', html: '⚛️ ReactJS' },
    { cls: 'lm-tech-badge lm-badge-mern',  html: '🟢 MERN Stack' },
    { cls: 'lm-tech-badge lm-badge-php',   html: '🐘 PHP' },
    { cls: 'lm-tech-badge lm-badge-node',  html: '🚀 Node.js' },
    { cls: 'lm-tech-badge lm-badge-html',  html: '🌐 HTML/CSS' },
  ];

  [...orbs, ...shapes, ...badges].forEach(item => {
    const el = document.createElement('div');
    el.className = item.cls;
    if (item.html) el.innerHTML = item.html;
    hero.appendChild(el);
  });
})();
