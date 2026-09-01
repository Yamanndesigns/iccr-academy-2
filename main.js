/* ICCR Academy — main.js
   Scroll reveals, FAQ accordion, faculty modal, newsletter form, tabs,
   and the small render* helpers that turn data/*.json into markup.
   Each render* function is written so a future Sanity-backed fetch can
   drop straight in without touching the markup templates. */

/* ---------- Scroll-triggered reveals (call after dynamic content renders) ---------- */
function initReveals() {
  const revealEls = document.querySelectorAll('.reveal:not([data-observed])');
  if (!revealEls.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => { el.dataset.observed = 'true'; observer.observe(el); });
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }
}

/* ---------- FAQ accordion (works on static or freshly-rendered items) ---------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item:not([data-bound])');
  faqItems.forEach(item => {
    item.dataset.bound = 'true';
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function renderFaq(faqItems, mountSelector) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;
  mount.innerHTML = faqItems.map(item => `
    <div class="faq-item">
      <button class="faq-question" aria-expanded="false">
        ${item.question}
        <span class="faq-icon" aria-hidden="true"></span>
      </button>
      <div class="faq-answer"><p>${item.answer}</p></div>
    </div>
  `).join('');
  initFaqAccordion();
}

/* ---------- Faculty modal ---------- */
function initFacultyModal() {
  const overlay = document.getElementById('facultyModal');
  if (!overlay) return;

  const closeBtn = overlay.querySelector('.modal-close');
  const body = overlay.querySelector('.modal-body-content');
  const photo = overlay.querySelector('.modal-photo');

  function open(person) {
    photo.innerHTML = person.photo
      ? `<img src="${person.photo}" alt="${person.name}">`
      : `<div class="avatar" aria-hidden="true">${person.initials}</div>`;
    body.innerHTML = `
      <h3>${person.name}</h3>
      <p class="role">${person.role}</p>
      ${person.credentials ? `<p class="credentials">${person.credentials}</p>` : ''}
      <p class="bio">${person.bio}</p>
    `;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  document.addEventListener('faculty:open', (e) => open(e.detail));
}

function bindFacultyCards() {
  document.querySelectorAll('[data-person]').forEach(card => {
    card.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('faculty:open', { detail: JSON.parse(card.dataset.person) }));
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
}

/* ---------- Newsletter (front-end only — wire to ESP/CMS on submit) ---------- */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.closest('.newsletter').classList.add('submitted');
    });
  });
}

/* ---------- Tabs (used on the Calendar page) ---------- */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        tabGroup.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        tabGroup.querySelector(`#${btn.dataset.tab}`).classList.add('active');
      });
    });
  });
}

/* ---------- Testimonials ---------- */
function renderTestimonials(items, featureSelector, sideSelector) {
  const featureMount = document.querySelector(featureSelector);
  const sideMount = document.querySelector(sideSelector);
  const featured = items.find(t => t.featured) || items[0];
  const rest = items.filter(t => t !== featured);

  if (featureMount) {
    featureMount.innerHTML = `<p>&ldquo;${featured.quote}&rdquo;</p><footer>${featured.attribution}</footer>`;
  }
  if (sideMount) {
    sideMount.innerHTML = rest.slice(0, 3).map(t => `
      <blockquote class="testimonial-small">
        <p>&ldquo;${t.quote}&rdquo;</p>
        <footer>${t.attribution}</footer>
      </blockquote>
    `).join('');
  }
}

/* ---------- Global init: call once site chrome has rendered ---------- */
document.addEventListener('chrome:ready', () => {
  initReveals();
  initFaqAccordion();
  initNewsletterForms();
  initTabs();
});
