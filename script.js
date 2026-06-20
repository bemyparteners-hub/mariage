/* ─── NAVBAR ────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  navToggle.classList.toggle('active', open);
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

/* ─── SCROLL REVEAL ─────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-late').forEach(el => observer.observe(el));

/* ─── PARALLAX HERO ─────────────────────────────────────── */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `translateY(${y * 0.35}px)`;
    }
  }, { passive: true });
}

/* ─── COUNTDOWN ─────────────────────────────────────────── */
function updateCountdown() {
  const target = new Date('2026-07-04T11:00:00');
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(u => {
      const el = document.getElementById(`cd-${u}`);
      if (el) el.textContent = '00';
    });
    const label = document.querySelector('.countdown-label');
    if (label) label.textContent = '🎉 C\'est le grand jour !';
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const pad = n => String(n).padStart(2, '0');

  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');

  if (elDays) elDays.textContent = days;
  if (elHours) elHours.textContent = pad(hours);
  if (elMinutes) elMinutes.textContent = pad(minutes);
  if (elSeconds) elSeconds.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ─── ACTIVE NAV LINK ───────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ─── MULTI-STEP RSVP FORM ──────────────────────────────── */
const form = document.getElementById('rsvpForm');
if (form) {
  const pages = form.querySelectorAll('.form-page');
  const steps = document.querySelectorAll('.form-step');
  const presenceRadios = form.querySelectorAll('input[name="presence"]');
  const presenceDetails = document.getElementById('presenceDetails');
  const allergiesGroup = document.getElementById('allergiesGroup');

  function goToPage(n) {
    pages.forEach(p => p.classList.remove('form-page--active'));
    const target = document.getElementById(`page${n}`);
    if (target) target.classList.add('form-page--active');

    steps.forEach((s, i) => {
      s.classList.remove('form-step--active', 'form-step--done');
      if (i + 1 === n) s.classList.add('form-step--active');
      if (i + 1 < n) s.classList.add('form-step--done');
    });
  }

  form.querySelectorAll('.btn-form-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentPage = btn.closest('.form-page');
      if (!validatePage(currentPage)) return;
      goToPage(parseInt(btn.dataset.next));
    });
  });

  form.querySelectorAll('.btn-form-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      goToPage(parseInt(btn.dataset.prev));
    });
  });

  presenceRadios.forEach(r => {
    r.addEventListener('change', () => {
      const yes = r.value === 'oui';
      presenceDetails.classList.toggle('visible', yes);
      allergiesGroup.classList.toggle('visible', yes);
    });
  });

  function validatePage(page) {
    let valid = true;
    page.querySelectorAll('[required]').forEach(field => {
      if (field.type === 'radio') {
        const name = field.name;
        const checked = page.querySelector(`input[name="${name}"]:checked`);
        if (!checked) { valid = false; highlightError(field.closest('.radio-group')); }
      } else if (!field.value.trim()) {
        valid = false;
        highlightError(field);
      }
    });
    return valid;
  }

  function highlightError(el) {
    el.classList.add('field-error');
    el.addEventListener('input', () => el.classList.remove('field-error'), { once: true });
    el.addEventListener('change', () => el.classList.remove('field-error'), { once: true });
    setTimeout(() => el.classList.remove('field-error'), 3000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.textContent = 'Envoi en cours…';
    btn.disabled = true;

    try {
      const data = new FormData(form);
      const action = form.action;

      if (action.includes('VOTRE_ID')) {
        await new Promise(r => setTimeout(r, 800));
      } else {
        const res = await fetch(action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Erreur réseau');
      }

      pages.forEach(p => p.classList.remove('form-page--active'));
      steps.forEach(s => { s.classList.remove('form-step--active'); s.classList.add('form-step--done'); });
      document.getElementById('formSuccess').classList.add('visible');

    } catch {
      btn.textContent = 'Une erreur est survenue — réessayez';
      btn.disabled = false;
    }
  });
}

/* ─── FIELD ERROR STYLE (injected) ─────────────────────── */
const style = document.createElement('style');
style.textContent = `
  .field-error { border-color: #E8956D !important; box-shadow: 0 0 0 3px rgba(232,149,109,0.2) !important; }
  .nav-links a.active { color: var(--gold-dark) !important; }
  #navbar.scrolled .nav-links a.active { color: var(--gold-dark) !important; background: rgba(201,168,76,0.1) !important; }
  .nav-toggle.active span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .nav-toggle.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-toggle.active span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
`;
document.head.appendChild(style);
