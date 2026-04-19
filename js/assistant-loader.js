const ASSISTANT_PARTIAL_PATH = '/partials/assistant.html';
const ASSISTANT_SPINE_SCRIPT_PATH = '/js/assistant-spine.js';

async function loadScriptOnce(src) {
    const existingScript = document.querySelector(`script[data-assistant-script="${src}"]`);

    if (existingScript) {
        if (existingScript.dataset.loaded === 'true') {
            return;
        }

        await new Promise((resolve, reject) => {
            existingScript.addEventListener('load', resolve, { once: true });
            existingScript.addEventListener('error', reject, { once: true });
        });
        return;
    }

    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.assistantScript = src;

        script.addEventListener('load', () => {
            script.dataset.loaded = 'true';
            resolve();
        }, { once: true });

        script.addEventListener('error', () => {
            reject(new Error(`Failed to load script: ${src}`));
        }, { once: true });

        document.head.appendChild(script);
    });
}

async function mountAssistantShell() {
    if (document.getElementById('assistant-shell')) {
        return;
    }

    const response = await fetch(ASSISTANT_PARTIAL_PATH);

    if (!response.ok) {
        throw new Error(`Failed to load assistant partial: ${response.status}`);
    }

    const html = await response.text();
    document.body.insertAdjacentHTML('beforeend', html);
}

async function loadAssistant() {
    try {
        await mountAssistantShell();
        await loadScriptOnce(ASSISTANT_SPINE_SCRIPT_PATH);

        if (typeof window.initAssistantSpine === 'function') {
            await window.initAssistantSpine();
        }
    } catch (error) {
        console.error('Error loading assistant:', error);
    }
}

loadAssistant();
