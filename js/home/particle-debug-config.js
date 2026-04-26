import { PARTICLE_DEBUG_LOCAL_PRESET } from './particle-debug-preset.js';

export const PARTICLE_DEBUG_STORAGE_KEY = 'ocRoleParticleDebugConfig';

export const DEFAULT_PARTICLE_DEBUG_CONFIG = Object.freeze({
    camera: Object.freeze({ ...PARTICLE_DEBUG_LOCAL_PRESET.camera }),
    center: Object.freeze({ ...PARTICLE_DEBUG_LOCAL_PRESET.center })
});

function toFiniteNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
}

function normalizeVector(vector, fallback) {
    const source = vector && typeof vector === 'object' ? vector : {};

    return {
        x: toFiniteNumber(source.x, fallback.x),
        y: toFiniteNumber(source.y, fallback.y),
        z: toFiniteNumber(source.z, fallback.z)
    };
}

export function normalizeParticleDebugConfig(config) {
    const source = config && typeof config === 'object' ? config : {};

    return {
        camera: normalizeVector(source.camera, DEFAULT_PARTICLE_DEBUG_CONFIG.camera),
        center: normalizeVector(source.center, DEFAULT_PARTICLE_DEBUG_CONFIG.center)
    };
}

export function saveParticleDebugConfig(config, storage = window.localStorage) {
    const normalized = normalizeParticleDebugConfig(config);
    storage.setItem(
        PARTICLE_DEBUG_STORAGE_KEY,
        JSON.stringify(normalized, null, 2)
    );

    return normalized;
}

export function loadParticleDebugConfig(storage = window.localStorage) {
    const raw = storage.getItem(PARTICLE_DEBUG_STORAGE_KEY);

    if (!raw) {
        return saveParticleDebugConfig(DEFAULT_PARTICLE_DEBUG_CONFIG, storage);
    }

    try {
        return saveParticleDebugConfig(JSON.parse(raw), storage);
    } catch (error) {
        console.warn('Failed to parse particle debug config. Falling back to defaults.', error);
        return saveParticleDebugConfig(DEFAULT_PARTICLE_DEBUG_CONFIG, storage);
    }
}
