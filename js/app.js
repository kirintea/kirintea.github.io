// app.js
const appScriptUrl = document.currentScript
  ? new URL(document.currentScript.getAttribute('src'), window.location.href)
  : new URL('./js/app.js', window.location.href);

const navbarUrl = new URL('../partials/navbar.html', appScriptUrl).href;
const doroScriptUrl = new URL('./doro.js', appScriptUrl).href;
const doroAssetBaseUrl = new URL('../assets/doro/', appScriptUrl).href;
const doroStyleId = 'doro-fixed-style';
const doroScriptId = 'doro-script';

function ensureDoroStyles() {
  if (document.getElementById(doroStyleId)) return;

  const style = document.createElement('style');
  style.id = doroStyleId;
  style.textContent = `
    .dorororo,
    .doro-scream,
    .doro-eat,
    .doro-explosion {
      position: fixed !important;
    }
  `;
  document.head.appendChild(style);
}

function ensureDoroScript() {
  const existingScript = document.getElementById(doroScriptId);
  if (existingScript) {
    return existingScript.dataset.loaded === 'true'
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existingScript.addEventListener('load', () => resolve(), { once: true });
          existingScript.addEventListener('error', reject, { once: true });
        });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = doroScriptId;
    script.src = doroScriptUrl.href || doroScriptUrl;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    script.addEventListener('error', reject, { once: true });
    document.body.appendChild(script);
  });
}

fetch(navbarUrl)
  .then((response) => response.text())
  .then(async (html) => {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    navbarPlaceholder.innerHTML = html;

    navbarPlaceholder.querySelectorAll('doro-doro').forEach((element) => {
      element.setAttribute('doro-asset-path', doroAssetBaseUrl);
    });

    ensureDoroStyles();
    await ensureDoroScript();
  })
  .catch((error) => {
    console.error('Error loading navbar:', error);
  });

// 平滑滚动
function smoothScroll(event) {
  event.preventDefault();
  const targetId = event.target.getAttribute('href').substring(1);
  const targetElement = document.getElementById(targetId);
  targetElement.scrollIntoView({ behavior: 'smooth' });
}
