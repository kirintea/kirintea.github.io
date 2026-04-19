import * as THREE from 'three';
import { generateEarthLayeredPointCloud, getEarthConfig } from './EPCE_earth_model.js';

const POINT_SIZE_SCALE = 3.0;
const CAMERA_DISTANCE = 400;

let renderer, scene, camera;
let earthMesh, earthConfig;
let moonMesh;
let moonOrbitEcho;
let moonAngle = 0;
const MOON_ORBIT_RADIUS = 250;
const MOON_ORBIT_SPEED = 0.015;
const EARTH_ROTATION_SPEED = 0.002;
let observatoryState = {
    target: 'EARTH / LOCKED',
    orbit: 'LUNAR SYNC',
    scan: 'ACTIVE',
    rotation: `${EARTH_ROTATION_SPEED.toFixed(3)} RAD`,
    signal: 'STABLE',
    active: false
};
let observatoryListeners = [];
let lastInteractionAt = 0;

const vertexShader = `
    attribute float pointSize;
    varying float vAlpha;
    uniform float pointSizeScale;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float distanceAlpha = 1.0 - clamp((-mvPosition.z - 200.0) / 800.0, 0.0, 1.0);
        vAlpha = 0.7 * distanceAlpha;

        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = pointSize * pointSizeScale * distanceAlpha + 2.0;
    }
`;

const fragmentShader = `
    varying float vAlpha;

    void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;

        float alpha = vAlpha;
        if (dist > 0.15) {
            float fadeOut = smoothstep(0.5, 0.15, dist);
            alpha = vAlpha * fadeOut * (1.0 - dist * 1.5);
        }

        vec3 color = vec3(0.75, 0.75, 0.75);
        gl_FragColor = vec4(color, alpha);
    }
`;

function createLatitudeLines(radius) {
    const latitudes = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75];
    const group = new THREE.Group();

    latitudes.forEach(lat => {
        const points = [];
        const latRad = lat * Math.PI / 180;
        const r = radius * Math.cos(latRad);
        const y = radius * Math.sin(latRad);

        for (let i = 0; i <= 64; i++) {
            const theta = (i / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x89b9e8,
            transparent: true,
            opacity: 0.62
        });
        const line = new THREE.Line(geometry, material);
        group.add(line);
    });

    return group;
}

function createLongitudeLines(radius) {
    const group = new THREE.Group();
    const count = 12;

    for (let l = 0; l < count; l++) {
        const lonRad = (l / count) * Math.PI * 2;
        const points = [];

        for (let i = 0; i <= 64; i++) {
            const t = (i / 64) * Math.PI;
            const phi = t;
            points.push(new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(lonRad),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(lonRad)
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x74a7d9,
            transparent: true,
            opacity: 0.52
        });
        const line = new THREE.Line(geometry, material);
        group.add(line);
    }

    return group;
}

function createPointCloudLayer(points, options = {}) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));

    const pointCount = points.length / 3;
    const pointSizes = new Float32Array(pointCount);
    const baseSize = options.baseSize ?? 1.6;
    const variance = options.variance ?? 1.2;

    for (let i = 0; i < pointCount; i++) {
        pointSizes[i] = baseSize + Math.random() * variance;
    }

    geometry.setAttribute('pointSize', new THREE.BufferAttribute(pointSizes, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            pointSizeScale: { value: options.scale ?? POINT_SIZE_SCALE }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    material.colorWrite = true;
    return new THREE.Points(geometry, material);
}

function createEarthMesh() {
    const layers = generateEarthLayeredPointCloud(12000);
    const earthGroup = new THREE.Group();

    const core = createPointCloudLayer(layers.core, { baseSize: 1.4, variance: 1.4, scale: 3.2 });
    const atmosphere = createPointCloudLayer(layers.atmosphere, { baseSize: 2.4, variance: 1.8, scale: 3.8 });
    const polarGlow = createPointCloudLayer(layers.polarGlow, { baseSize: 2.8, variance: 2.2, scale: 4.0 });
    const cloudShell = createPointCloudLayer(layers.cloudShell, { baseSize: 1.8, variance: 1.5, scale: 3.4 });
    const sampleBands = createPointCloudLayer(layers.sampleBands, { baseSize: 2.3, variance: 1.9, scale: 3.6 });

    atmosphere.material.opacity = 0.45;
    polarGlow.material.opacity = 0.55;
    cloudShell.material.opacity = 0.28;
    sampleBands.material.opacity = 0.5;

    earthGroup.add(core);
    earthGroup.add(atmosphere);
    earthGroup.add(polarGlow);
    earthGroup.add(cloudShell);
    earthGroup.add(sampleBands);

    return earthGroup;
}

function generateMoonPoints(pointCount, radius) {
    const points = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius + (Math.random() - 0.5) * 2.5;
        points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        points[i * 3 + 1] = r * Math.cos(phi);
        points[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return points;
}

function createMoonMesh() {
    const moonGroup = new THREE.Group();

    const core = createPointCloudLayer(generateMoonPoints(1800, 15), {
        baseSize: 1.4,
        variance: 1.0,
        scale: 2.8
    });
    core.material.opacity = 0.46;

    const shellGeometry = new THREE.SphereGeometry(18, 18, 18, 0, Math.PI * 1.65, 0.2, Math.PI * 0.75);
    const shellMaterial = new THREE.MeshBasicMaterial({
        color: 0x7f93a8,
        wireframe: true,
        transparent: true,
        opacity: 0.22
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);

    moonGroup.add(core);
    moonGroup.add(shell);
    return moonGroup;
}

function createMoonOrbit() {
    const points = [];
    for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
            MOON_ORBIT_RADIUS * Math.cos(theta),
            0,
            MOON_ORBIT_RADIUS * Math.sin(theta)
        ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0x58708a,
        transparent: true,
        opacity: 0.18
    });
    return new THREE.Line(geometry, material);
}

function createMoonOrbitEcho() {
    const geometry = new THREE.RingGeometry(MOON_ORBIT_RADIUS - 1.5, MOON_ORBIT_RADIUS + 1.5, 96);
    const material = new THREE.MeshBasicMaterial({
        color: 0x79b7ff,
        transparent: true,
        opacity: 0.035,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI / 2;
    return ring;
}

function publishObservatoryState() {
    observatoryListeners.forEach(listener => listener({ ...observatoryState }));
}

function updateObservatoryState(partialState) {
    observatoryState = { ...observatoryState, ...partialState };
    publishObservatoryState();
}

window.attachOrbitalObservatory = function(listener) {
    if (typeof listener !== 'function') return;
    observatoryListeners.push(listener);
    listener({ ...observatoryState });
};

function init() {
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('Canvas container not found!');
        return;
    }
    console.log('EPCE: Canvas container found', container);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    console.log('EPCE: Renderer created');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 200, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);

    earthConfig = getEarthConfig();
    console.log('EPCE: Earth config:', earthConfig);

    earthMesh = createEarthMesh();
    console.log('EPCE: Earth mesh created:', earthMesh);

    const latLines = createLatitudeLines(earthConfig.baseRadius);
    const lonLines = createLongitudeLines(earthConfig.baseRadius);
    latLines.children.forEach(line => {
        line.material.color.setHex(0x9bc8f2);
        line.material.opacity = 0.7;
    });
    lonLines.children.forEach(line => {
        line.material.color.setHex(0x83b7ea);
        line.material.opacity = 0.58;
    });

    const earthGroup = new THREE.Group();
    earthGroup.add(earthMesh);
    earthGroup.add(latLines);
    earthGroup.add(lonLines);

    scene.add(earthGroup);

    moonMesh = createMoonMesh();
    const moonOrbit = createMoonOrbit();
    moonOrbitEcho = createMoonOrbitEcho();
    scene.add(moonOrbit);
    scene.add(moonOrbitEcho);
    scene.add(moonMesh);

    console.log('EPCE: Scene setup complete');

    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let targetTheta = 0, targetPhi = Math.PI / 3;
    let currentTheta = 0, currentPhi = Math.PI / 3;

    container.addEventListener('mousedown', e => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        lastInteractionAt = performance.now();
        updateObservatoryState({
            scan: 'TRACKING',
            signal: 'ADJUSTING',
            active: true
        });
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        targetTheta -= dx * 0.003;
        targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, targetPhi - dy * 0.003));
        lastInteractionAt = performance.now();
        updateObservatoryState({
            orbit: 'MANUAL SWEEP',
            scan: 'TRACKING',
            signal: 'LIVE',
            active: true
        });
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        updateObservatoryState({
            orbit: 'LUNAR SYNC',
            scan: 'ACTIVE',
            signal: 'STABLE',
            active: false
        });
    });

    function animate() {
        requestAnimationFrame(animate);

        earthGroup.rotation.y += EARTH_ROTATION_SPEED;
        if (earthMesh.children[1]) {
            earthMesh.children[1].rotation.y -= 0.0008;
        }
        if (earthMesh.children[2]) {
            earthMesh.children[2].rotation.y += 0.0012;
        }
        if (earthMesh.children[4]) {
            earthMesh.children[4].rotation.y -= 0.0015;
        }

        moonAngle += MOON_ORBIT_SPEED;
        moonMesh.position.x = MOON_ORBIT_RADIUS * Math.cos(moonAngle);
        moonMesh.position.z = MOON_ORBIT_RADIUS * Math.sin(moonAngle);
        moonMesh.position.y = Math.sin(moonAngle * 3) * 20;
        moonMesh.rotation.y += 0.01;
        moonOrbitEcho.material.opacity = 0.03 + (Math.sin(moonAngle * 2.0) + 1) * 0.012;

        currentTheta += (targetTheta - currentTheta) * 0.05;
        currentPhi += (targetPhi - currentPhi) * 0.05;

        camera.position.x = CAMERA_DISTANCE * Math.sin(currentPhi) * Math.sin(currentTheta);
        camera.position.y = CAMERA_DISTANCE * Math.cos(currentPhi);
        camera.position.z = CAMERA_DISTANCE * Math.sin(currentPhi) * Math.cos(currentTheta);
        camera.lookAt(0, 0, 0);

        const now = performance.now();
        if (!isDragging && now - lastInteractionAt > 1600) {
            updateObservatoryState({
                orbit: 'LUNAR SYNC',
                scan: 'ACTIVE',
                signal: 'STABLE',
                active: false
            });
        }

        updateObservatoryState({
            target: 'EARTH / LOCKED',
            rotation: `${EARTH_ROTATION_SPEED.toFixed(3)} RAD`
        });

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

init();
