// app.js - navbar component loader
const baseUrl = window.location.origin;

const navbarUrl = `${baseUrl}/components/navbar/navbar.html`;
// const doroScriptUrl = `${baseUrl}/assets/navbar/doro.js`;
// const doroAssetBaseUrl = `${baseUrl}/assets/navbar/doro/`;
// const doroStyleId = 'doro-fixed-style';
// const doroScriptId = 'doro-script';

// function ensureDoroStyles() {
//   if (document.getElementById(doroStyleId)) return;
//
//   const style = document.createElement('style');
//   style.id = doroStyleId;
//   style.textContent = `
//     .dorororo,
//     .doro-scream,
//     .doro-eat,
//     .doro-explosion {
//       position: fixed !important;
//     }
//   `;
//   document.head.appendChild(style);
// }

// function ensureDoroScript() {
//   const existingScript = document.getElementById(doroScriptId);
//   if (existingScript) {
//     return existingScript.dataset.loaded === 'true'
//       ? Promise.resolve()
//       : new Promise((resolve, reject) => {
//           existingScript.addEventListener('load', () => resolve(), { once: true });
//           existingScript.addEventListener('error', reject, { once: true });
//         });
//   }
//
//   return new Promise((resolve, reject) => {
//     const script = document.createElement('script');
//     script.id = doroScriptId;
//     script.src = doroScriptUrl;
//     script.addEventListener(
//       'load',
//       () => {
//         script.dataset.loaded = 'true';
//         resolve();
//       },
//       { once: true }
//     );
//     script.addEventListener('error', reject, { once: true });
//     document.body.appendChild(script);
//   });
// }

function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const url = new URL(anchor.href, window.location.href);
      const isSamePage = url.origin === window.location.origin
        && url.pathname === window.location.pathname;

      if (!url.hash || !isSamePage) {
        return;
      }

      const target = document.querySelector(url.hash);
      if (!target) {
        return;
      }

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function loadNavbar() {
  return fetch(navbarUrl)
    .then((response) => response.text())
    .then(async (html) => {
      // 尝试header容器（首页用）
      let container = document.getElementById('header');
      // 如果没有header，尝试navbar-placeholder（blog页面用）
      if (!container) {
        container = document.getElementById('navbar-placeholder');
      }
      
      if (container) {
        container.innerHTML = html;
        initMobileMenu();
        initSmoothScroll();
      }
    })
    .catch((error) => {
      console.error('Error loading navbar:', error);
    });
}

// async function initDoroAnimation() {
//   ensureDoroStyles();
//
//   document.querySelectorAll('doro-doro').forEach((element) => {
//     if (!element.getAttribute('doro-asset-path')) {
//       element.setAttribute('doro-asset-path', doroAssetBaseUrl);
//     }
//   });
//
//   await ensureDoroScript();
// }

async function init() {
  // ensureDoroStyles();
  await loadNavbar();
  // await initDoroAnimation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
