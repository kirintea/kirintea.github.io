import {
    loadParticleDebugConfig,
    saveParticleDebugConfig
} from './particle-debug-config.js';

function setCameraPosition(particleSystem, cameraConfig) {
    if (!particleSystem?.camera?.position?.set) {
        return;
    }

    particleSystem.camera.position.set(cameraConfig.x, cameraConfig.y, cameraConfig.z);
}

function patchTargetSet(particleSystem, getConfig) {
    if (!particleSystem?.target?.set || particleSystem.__particleDebugTargetPatched) {
        return;
    }

    const originalSet = particleSystem.target.set.bind(particleSystem.target);

    particleSystem.target.set = (x = 0, y = 0, z = 0) => {
        const config = getConfig();
        const center = config.center;
        return originalSet(x + center.x, y + center.y, z + center.z);
    };

    particleSystem.__particleDebugTargetPatched = true;
}

function createInput(sectionKey, axis, config, onChange) {
    const row = document.createElement('label');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '40px 1fr';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.fontSize = '12px';
    row.style.color = '#d6fff0';

    const label = document.createElement('span');
    label.textContent = `${sectionKey}.${axis}`;

    const input = document.createElement('input');
    input.type = 'number';
    input.step = '1';
    input.value = String(config[sectionKey][axis]);
    input.style.width = '100%';
    input.style.padding = '6px 8px';
    input.style.border = '1px solid rgba(0, 245, 160, 0.35)';
    input.style.borderRadius = '8px';
    input.style.background = 'rgba(7, 14, 17, 0.95)';
    input.style.color = '#f5fffb';
    input.style.outline = 'none';

    input.addEventListener('input', () => {
        const parsed = Number.parseFloat(input.value);
        onChange(sectionKey, axis, Number.isFinite(parsed) ? parsed : 0);
    });

    row.append(label, input);

    return { row, input };
}

function createPanel(config, handleValueChange) {
    const panel = document.createElement('aside');
    panel.setAttribute('data-particle-debug-panel', 'oc-role');
    Object.assign(panel.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        width: '320px',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        zIndex: '9999',
        padding: '14px',
        borderRadius: '14px',
        border: '1px solid rgba(0, 245, 160, 0.25)',
        background: 'rgba(6, 10, 12, 0.92)',
        boxShadow: '0 18px 48px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(14px)',
        fontFamily: 'Consolas, Monaco, monospace'
    });

    const title = document.createElement('div');
    title.textContent = 'OC-Role Particle Debug';
    title.style.fontSize = '13px';
    title.style.fontWeight = '700';
    title.style.letterSpacing = '0.04em';
    title.style.textTransform = 'uppercase';
    title.style.color = '#90ffd5';
    title.style.marginBottom = '12px';

    const hint = document.createElement('p');
    hint.textContent = 'Camera and center values save automatically to localStorage.';
    hint.style.margin = '0 0 12px';
    hint.style.fontSize = '12px';
    hint.style.lineHeight = '1.5';
    hint.style.color = 'rgba(220, 255, 244, 0.78)';

    const controls = document.createElement('div');
    controls.style.display = 'grid';
    controls.style.gap = '12px';

    const inputs = new Map();

    ['camera', 'center'].forEach((sectionKey) => {
        const section = document.createElement('section');
        section.style.display = 'grid';
        section.style.gap = '8px';

        const heading = document.createElement('div');
        heading.textContent = sectionKey;
        heading.style.fontSize = '12px';
        heading.style.fontWeight = '700';
        heading.style.color = '#f5fffb';
        heading.style.textTransform = 'capitalize';

        section.appendChild(heading);

        ['x', 'y', 'z'].forEach((axis) => {
            const control = createInput(sectionKey, axis, config, handleValueChange);
            section.appendChild(control.row);
            inputs.set(`${sectionKey}.${axis}`, control.input);
        });

        controls.appendChild(section);
    });

    const jsonTitle = document.createElement('div');
    jsonTitle.textContent = 'Live JSON';
    jsonTitle.style.marginTop = '14px';
    jsonTitle.style.marginBottom = '8px';
    jsonTitle.style.fontSize = '12px';
    jsonTitle.style.fontWeight = '700';
    jsonTitle.style.color = '#f5fffb';

    const jsonPreview = document.createElement('pre');
    Object.assign(jsonPreview.style, {
        margin: '0',
        padding: '12px',
        borderRadius: '10px',
        background: 'rgba(0, 0, 0, 0.32)',
        color: '#83ffd0',
        fontSize: '11px',
        lineHeight: '1.55',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
    });

    panel.append(title, hint, controls, jsonTitle, jsonPreview);
    document.body.appendChild(panel);

    return { panel, inputs, jsonPreview };
}

export function applyParticleDebugConfig(particleSystem, config) {
    setCameraPosition(particleSystem, config.camera);
}

export function attachParticleDebug(particleSystem, options = {}) {
    if (!particleSystem) {
        return null;
    }

    const debugEnabled = Boolean(options.debugEnabled);
    let config = loadParticleDebugConfig();

    patchTargetSet(particleSystem, () => config);
    applyParticleDebugConfig(particleSystem, config);

    const state = {
        panel: null,
        inputs: new Map(),
        jsonPreview: null
    };

    const sync = () => {
        applyParticleDebugConfig(particleSystem, config);

        if (!state.panel) {
            return;
        }

        for (const [path, input] of state.inputs.entries()) {
            const [sectionKey, axis] = path.split('.');
            if (document.activeElement !== input) {
                input.value = String(config[sectionKey][axis]);
            }
        }

        state.jsonPreview.textContent = JSON.stringify(config, null, 2);
    };

    const persist = () => {
        config = saveParticleDebugConfig(config);
        sync();
    };

    if (debugEnabled) {
        const panelState = createPanel(config, (sectionKey, axis, value) => {
            config[sectionKey][axis] = value;
            persist();
        });

        state.panel = panelState.panel;
        state.inputs = panelState.inputs;
        state.jsonPreview = panelState.jsonPreview;
        sync();
    }

    const originalDispose = typeof particleSystem.dispose === 'function'
        ? particleSystem.dispose.bind(particleSystem)
        : null;

    particleSystem.dispose = () => {
        if (state.panel) {
            state.panel.remove();
            state.panel = null;
        }

        if (originalDispose) {
            originalDispose();
        }
    };

    return {
        getConfig() {
            return config;
        },
        sync
    };
}
