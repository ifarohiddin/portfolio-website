// Main JS for interactions
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

// Theme toggle
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') { root.classList.add('light'); }
themeToggle.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

// Mobile menu
hamburger.addEventListener('click', () => {
  nav.classList.toggle('active');
});

// Simple number "count-up" effect for stats
document.querySelectorAll('.stat-num').forEach(el => {
  const target = parseInt(el.getAttribute('data-count'), 10);
  if (!isNaN(target)) {
    let val = 0;
    const step = Math.max(1, Math.floor(target / 50));
    const timer = setInterval(() => {
      val += step;
      if (val >= target) { val = target; clearInterval(timer); }
      el.textContent = el.textContent.includes('%') ? val + '%' : val + '+';
    }, 20);
  }
});

// Contact form (front-end only)
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    // rudimentary validation
    if (!payload.name || !payload.email || !payload.message) {
      formStatus.textContent = 'Please fill in all fields.';
      formStatus.style.color = '#ef4444';
      return;
    }
    const emailOk = /.+@.+\..+/.test(payload.email);
    if (!emailOk) {
      formStatus.textContent = 'Please enter a valid email.';
      formStatus.style.color = '#ef4444';
      return;
    }

    // success stub
    form.reset();
    formStatus.textContent = 'Thanks! Your message has been prepared (demo only).';
    formStatus.style.color = '#22c55e';
    setTimeout(() => { formStatus.textContent = ''; }, 4000);
  });
}

// Language toggle and Persistence
const savedLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
  document.querySelectorAll('[data-en]').forEach(element => {
    element.textContent = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
  });
  document.documentElement.lang = lang;
  langToggle.value = lang;
  localStorage.setItem('lang', lang);
}

// Initialize language
setLanguage(savedLang);

langToggle.addEventListener('change', (e) => {
  setLanguage(e.target.value);
});