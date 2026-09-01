/* ICCR Academy — partials.js
   Renders the shared header and footer from data/site.json so nav links,
   contact info, and social links live in one place. Swap the fetch() call
   below for a Sanity client query when the CMS is wired up — the shape
   of site.json mirrors a single "siteSettings" document. */

async function loadSiteSettings() {
  const res = await fetch('data/site.json');
  if (!res.ok) throw new Error('Could not load site settings');
  return res.json();
}

const SOCIAL_ICON_PATHS = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/>',
  facebook: '<path d="M14.5 8.5h2V5.3c-.35-.05-1.55-.15-2.95-.15-2.92 0-4.92 1.83-4.92 5.2v2.65H6.1v3.6h3.53V21h3.62v-4.4h3.38l.54-3.6h-3.92v-2.3c0-1.04.28-1.75 1.75-1.75Z" fill="currentColor"/>'
};

function socialIcon(item) {
  const path = SOCIAL_ICON_PATHS[item.icon];
  if (!path) return '';
  return `
    <a class="social-icon" href="${item.href}" target="_blank" rel="noopener" aria-label="${item.label}">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${path}</svg>
    </a>`;
}

function renderHeader(site, activePage) {
  const root = document.getElementById('site-header');
  if (!root) return;

  const navLinks = site.primaryNav.map(item => {
    const isActive = item.href.replace('.html', '') === activePage;
    return `<a href="${item.href}" class="${isActive ? 'active' : ''}">${item.label}</a>`;
  }).join('');

  const utilityLinks = site.utilityNav.map(item => `
    <a class="portal-link" href="${item.href}" ${item.external ? 'target="_blank" rel="noopener"' : ''}>
      <span class="dot" aria-hidden="true"></span>${item.label}
    </a>`).join('');

  const socialLinks = (site.headerSocial || []).map(socialIcon).join('');

  root.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="brand">
        <img src="${site.logo}" alt="${site.orgName} logo" class="brand-mark">
        <span class="brand-text">
          <span class="brand-name">${site.academyName}</span>
          <span class="brand-sub">${site.orgName}</span>
        </span>
      </a>

      <nav class="main-nav" aria-label="Primary">${navLinks}</nav>

      <div class="header-cta">
        <div class="social-icons" aria-label="Follow us">${socialLinks}</div>
        ${utilityLinks}
        <a href="admissions.html" class="btn btn-primary">Apply Today</a>
      </div>

      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="mobileNav" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="mobile-nav" id="mobileNav">
      ${site.primaryNav.map(item => `<a href="${item.href}">${item.label}</a>`).join('')}
      ${site.utilityNav.map(item => `<a href="${item.href}" ${item.external ? 'target="_blank" rel="noopener"' : ''}>${item.label}</a>`).join('')}
      <div class="social-icons mobile-social">${socialLinks}</div>
      <a href="admissions.html" class="btn btn-primary mobile-apply">Apply Today</a>
    </div>
  `;

  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (navToggle && header) {
    navToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

function renderFooter(site) {
  const root = document.getElementById('site-footer');
  if (!root) return;

  const columns = site.footerNav.map(col => `
    <div class="footer-col">
      <h4>${col.heading}</h4>
      ${col.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
    </div>`).join('');

  const socialCol = `
    <div class="footer-col">
      <h4>Connect</h4>
      ${site.social.map(s => `<a href="${s.href}" target="_blank" rel="noopener">${s.label}</a>`).join('')}
      <a href="${site.utilityNav[0].href}" target="_blank" rel="noopener">${site.utilityNav[0].label}</a>
    </div>`;

  root.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="${site.logo}" alt="${site.orgName} logo">
        <p>${site.orgName}</p>
        <p style="font-family: var(--font-body); font-size: 0.85rem; color: rgba(255,255,255,0.55); margin-top: 10px;">
          ${site.contact.address}<br>${site.contact.phone}
        </p>
      </div>
      ${columns}
      ${socialCol}
    </div>
    <div class="footer-bottom">
      <p>© 2026 ${site.orgName}. All Rights Reserved.</p>
    </div>
  `;
}

async function initChrome(activePage) {
  try {
    const site = await loadSiteSettings();
    renderHeader(site, activePage);
    renderFooter(site);
    document.dispatchEvent(new CustomEvent('chrome:ready', { detail: site }));
  } catch (err) {
    console.error('Failed to render site chrome:', err);
  }
}
