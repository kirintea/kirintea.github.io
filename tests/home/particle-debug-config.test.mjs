import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_PARTICLE_DEBUG_CONFIG,
    loadParticleDebugConfig,
    normalizeParticleDebugConfig,
    PARTICLE_DEBUG_STORAGE_KEY,
    saveParticleDebugConfig
} from '../../js/home/particle-debug-config.js';
import { PARTICLE_DEBUG_LOCAL_PRESET } from '../../js/home/particle-debug-preset.js';
import { applyParticleDebugConfig, attachParticleDebug } from '../../js/home/particle-debug-runtime.js';

function createStorage(initialValue) {
    const storage = new Map();

    if (initialValue !== undefined) {
        storage.set(PARTICLE_DEBUG_STORAGE_KEY, initialValue);
    }

    return {
        getItem(key) {
            return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
            storage.set(key, String(value));
        }
    };
}

test('normalizeParticleDebugConfig merges partial values with defaults', () => {
    const normalized = normalizeParticleDebugConfig({
        camera: { z: 96 },
        center: { y: -12 }
    });

    assert.deepEqual(normalized, {
        camera: { x: 0, y: 0, z: 96 },
        center: { x: 0, y: -12, z: 0 }
    });
});

test('DEFAULT_PARTICLE_DEBUG_CONFIG is seeded from the local preset file', () => {
    assert.deepEqual(DEFAULT_PARTICLE_DEBUG_CONFIG, PARTICLE_DEBUG_LOCAL_PRESET);
});

test('loadParticleDebugConfig creates and persists defaults when storage is empty', () => {
    const storage = createStorage();

    const loaded = loadParticleDebugConfig(storage);

    assert.deepEqual(loaded, DEFAULT_PARTICLE_DEBUG_CONFIG);
    assert.equal(
        storage.getItem(PARTICLE_DEBUG_STORAGE_KEY),
        JSON.stringify(DEFAULT_PARTICLE_DEBUG_CONFIG, null, 2)
    );
});

test('loadParticleDebugConfig falls back to normalized defaults when stored json is invalid', () => {
    const storage = createStorage('{not valid json');
    const originalWarn = console.warn;
    console.warn = () => {};

    try {
        const loaded = loadParticleDebugConfig(storage);

        assert.deepEqual(loaded, DEFAULT_PARTICLE_DEBUG_CONFIG);
    } finally {
        console.warn = originalWarn;
    }
});

test('saveParticleDebugConfig writes normalized json back to storage', () => {
    const storage = createStorage();

    saveParticleDebugConfig(
        {
            camera: { x: 10, z: 90 },
            center: { x: 4, z: -8 }
        },
        storage
    );

    assert.equal(
        storage.getItem(PARTICLE_DEBUG_STORAGE_KEY),
        JSON.stringify(
            {
                camera: { x: 10, y: 0, z: 90 },
                center: { x: 4, y: 0, z: -8 }
            },
            null,
            2
        )
    );
});

test('applyParticleDebugConfig updates camera position on a particle system', () => {
    const calls = [];
    const particleSystem = {
        camera: {
            position: {
                set(x, y, z) {
                    calls.push([x, y, z]);
                }
            }
        }
    };

    applyParticleDebugConfig(particleSystem, {
        camera: { x: 12, y: -6, z: 90 },
        center: { x: 0, y: 0, z: 0 }
    });

    assert.deepEqual(calls, [[12, -6, 90]]);
});

test('attachParticleDebug patches target.set so center offset is applied even when debug ui is off', () => {
    const positionCalls = [];
    const storage = createStorage();
    saveParticleDebugConfig(
        {
            camera: { x: 0, y: 0, z: 80 },
            center: { x: 3, y: -2, z: 7 }
        },
        storage
    );

    const previousWindow = global.window;
    global.window = { localStorage: storage };

    try {
        const particleSystem = {
            target: {
                set(x, y, z) {
                    positionCalls.push([x, y, z]);
                }
            },
            camera: {
                position: {
                    set() {}
                }
            },
            dispose() {}
        };

        attachParticleDebug(particleSystem, { debugEnabled: false });
        particleSystem.target.set(10, 20, 30);

        assert.deepEqual(positionCalls, [[13, 18, 37]]);
    } finally {
        global.window = previousWindow;
    }
});
