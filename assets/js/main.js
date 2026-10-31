// Farohiddin Isomidinov — Portfolio interactions
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
const yearEl = document.getElementById('year');
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const langToggle = document.getElementById('langToggle');

// Year
yearEl.textContent = new Date().getFullYear();

// ---- Theme toggle (saved) ----
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') root.classList.add('light');
themeToggle.textContent = root.classList.contains('light') ? '☀️' : '🌙';
themeToggle.addEventListener('click', () => {
  root.classList.toggle('light');
  const isLight = root.classList.contains('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
});

// ---- Mobile menu ----
hamburger.addEventListener('click', () => {
  nav.classList.toggle('active');
  hamburger.classList.toggle('active');
});
nav.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('active');
    hamburger.classList.remove('active');
  })
);

// ---- Language toggle (text + placeholders, saved) ----
const savedLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
  document.querySelectorAll('[data-en]').forEach((el) => {
    const val = el.getAttribute('data-' + lang);
    if (val !== null) el.textContent = val;
  });
  document.querySelectorAll('[data-en-ph]').forEach((el) => {
    const ph = el.getAttribute('data-' + lang + '-ph');
    if (ph !== null) el.setAttribute('placeholder', ph);
  });
  document.documentElement.lang = lang;
  langToggle.value = lang;
  localStorage.setItem('lang', lang);
}
setLanguage(savedLang);
langToggle.addEventListener('change', (e) => setLanguage(e.target.value));

// ---- Count-up stats (runs once on view) ----
function runCount(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  if (isNaN(target)) return;
  let val = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const timer = setInterval(() => {
    val += step;
    if (val >= target) { val = target; clearInterval(timer); }
    el.textContent = val + '+';
  }, 30);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { runCount(e.target); statObserver.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach((el) => statObserver.observe(el));

// ---- Scrollspy (active nav link) ----
const sections = document.querySelectorAll('section[id]');
const navLinks = nav.querySelectorAll('a');
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { threshold: 0.5 });
sections.forEach((s) => spy.observe(s));

// ---- Project cards: 3D tilt on hover (pointer + motion aware) ----
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!reduceMotion && finePointer) {
  document.querySelectorAll('.project-card').forEach((card) => {
    const MAX = 8; // degrees
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `translateY(-5px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

// ---- Contact form: opens the visitor's email app with the message pre-filled ----
const CONTACT_EMAIL = 'isomiddinovfarohiddin53@gmail.com';

function buildMailto(name, email, message) {
  const subject = `Portfolio: ${name}`;
  const body = `${message}\n\n— ${name} (${email})`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const lang = localStorage.getItem('lang') || 'en';
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();

    const msg = {
      empty: { en: 'Please fill in all fields.', uz: "Iltimos, barcha maydonlarni to'ldiring." },
      bademail: { en: 'Please enter a valid email.', uz: "To'g'ri email kiriting." },
      ok: { en: 'Your email app is opening — press Send there to deliver the message.', uz: "Email ilovangiz ochilmoqda — xabarni yetkazish uchun u yerda «Yuborish» tugmasini bosing." },
    };

    if (!name || !email || !message) {
      formStatus.textContent = msg.empty[lang]; formStatus.style.color = '#ef4444'; return;
    }
    if (!/.+@.+\..+/.test(email)) {
      formStatus.textContent = msg.bademail[lang]; formStatus.style.color = '#ef4444'; return;
    }
    window.location.href = buildMailto(name, email, message);
    form.reset();
    formStatus.textContent = msg.ok[lang]; formStatus.style.color = '#22c55e';
    setTimeout(() => { formStatus.textContent = ''; }, 8000);
  });
}
