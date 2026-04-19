const SPINE_PLAYER_SCRIPT_URL = '/js/vendor/spine-player-4.1.56.min.js';
const SPINE_PLAYER_STYLE_URL = '/css/vendor/spine-player-4.1.56.min.css';
const SPINE_ASSET_PATHS = {
    skeleton: '/assets/Spine/Silphir.skel',
    atlas: '/assets/Spine/Silphir.atlas'
};

let assistantInitPromise = null;

function normalizeAnimationName(name) {
    return String(name || '').toLowerCase();
}

function pickAnimationName(animationNames, priorities, excludedNames = []) {
    const excluded = new Set(excludedNames);

    for (const matcher of priorities) {
        const match = animationNames.find((name) => !excluded.has(name) && matcher(normalizeAnimationName(name), name));
        if (match) {
            return match;
        }
    }

    return animationNames.find((name) => !excluded.has(name)) || null;
}

function getAnimationNames(spineInstance) {
    return spineInstance.spineData.animations.map((animation) => animation.name);
}

function getIdleAnimationName(animationNames) {
    return pickAnimationName(animationNames, [
        (normalized) => normalized.includes('blank'),
        (normalized) => normalized.includes('idle'),
        (normalized) => normalized.includes('close')
    ]);
}

function getReactionAnimationName(animationNames, idleAnimationName) {
    return pickAnimationName(animationNames, [
        (_, original) => original === 'Character_Pat',
        (normalized) => normalized.includes('pat'),
        (normalized) => normalized.includes('angry'),
        (normalized) => normalized.includes('eat'),
        (normalized) => normalized.includes('dance')
    ], idleAnimationName ? [idleAnimationName] : []);
}

function loadExternalScript(src) {
    const existingScript = document.querySelector(`script[data-runtime-script="${src}"]`);

    if (existingScript) {
        if (existingScript.dataset.loaded === 'true') {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            existingScript.addEventListener('load', resolve, { once: true });
            existingScript.addEventListener('error', reject, { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.runtimeScript = src;

        script.addEventListener('load', () => {
            script.dataset.loaded = 'true';
            resolve();
        }, { once: true });

        script.addEventListener('error', () => {
            reject(new Error(`Failed to load external runtime: ${src}`));
        }, { once: true });

        document.head.appendChild(script);
    });
}

function loadExternalStyle(href) {
    const existingLink = document.querySelector(`link[data-runtime-style="${href}"]`);

    if (existingLink) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.dataset.runtimeStyle = href;

        link.addEventListener('load', resolve, { once: true });
        link.addEventListener('error', () => {
            reject(new Error(`Failed to load external style: ${href}`));
        }, { once: true });

        document.head.appendChild(link);
    });
}

async function ensureRuntimeReady() {
    await loadExternalStyle(SPINE_PLAYER_STYLE_URL);
    await loadExternalScript(SPINE_PLAYER_SCRIPT_URL);

    if (!window.spine || !window.spine.SpinePlayer) {
        throw new Error('Spine Player runtime is unavailable after script load.');
    }
}

async function buildAssistantSpine(stageElement) {
    stageElement.innerHTML = '';
    stageElement.dataset.assistantReady = 'true';

    return new Promise((resolve, reject) => {
        let reactionPlaying = false;
        let idleAnimationName = null;
        let reactionAnimationName = null;

        const player = new window.spine.SpinePlayer(stageElement, {
            binaryUrl: SPINE_ASSET_PATHS.skeleton,
            atlasUrl: SPINE_ASSET_PATHS.atlas,
            showControls: false,
            alpha: true,
            premultipliedAlpha: true,
            backgroundColor: '#00000000',
            success: (instance) => {
                const animationNames = instance.skeleton.data.animations.map((animation) => animation.name);

                if (!animationNames.length) {
                    reject(new Error('No Spine animations were found for Silphir.'));
                    return;
                }

                idleAnimationName = getIdleAnimationName(animationNames) || animationNames[0];
                reactionAnimationName = getReactionAnimationName(animationNames, idleAnimationName);

                const playIdle = () => {
                    instance.animationState.setAnimation(0, idleAnimationName, true);
                    instance.play();
                };

                const playReaction = () => {
                    if (reactionPlaying || !reactionAnimationName) {
                        return;
                    }

                    reactionPlaying = true;
                    const entry = instance.animationState.setAnimation(0, reactionAnimationName, false);
                    entry.listener = {
                        complete: () => {
                            reactionPlaying = false;
                            playIdle();
                        }
                    };
                    instance.play();
                };

                playIdle();
                stageElement.addEventListener('click', playReaction);

                resolve({
                    player: instance,
                    animationNames,
                    idleAnimationName,
                    reactionAnimationName
                });
            },
            error: (playerError) => {
                reject(playerError instanceof Error ? playerError : new Error(String(playerError)));
            }
        });

        if (!player) {
            reject(new Error('Failed to create Spine Player.'));
        }
    });
}

window.initAssistantSpine = async function initAssistantSpine() {
    if (assistantInitPromise) {
        return assistantInitPromise;
    }

    assistantInitPromise = (async () => {
        const stageElement = document.getElementById('assistant-stage');

        if (!stageElement) {
            return null;
        }

        try {
            await ensureRuntimeReady();
            return await buildAssistantSpine(stageElement);
        } catch (error) {
            console.error('Error initializing assistant spine:', error);
            stageElement.dataset.assistantState = 'error';
            return null;
        }
    })();

    return assistantInitPromise;
};
