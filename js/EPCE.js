import * as THREE from 'three';
import { generateEarthPointCloud, getEarthConfig } from './EPCE_earth_model.js';

const POINT_SIZE_SCALE = 3.0;
const CAMERA_DISTANCE = 400;

let renderer, scene, camera;
let earthMesh, earthConfig;
let moonMesh;
let moonAngle = 0;
const MOON_ORBIT_RADIUS = 250;
const MOON_ORBIT_SPEED = 0.015;
const EARTH_ROTATION_SPEED = 0.002;

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
            color: 0x555555,
            transparent: true,
            opacity: 0.4
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
            color: 0x555555,
            transparent: true,
            opacity: 0.4
        });
        const line = new THREE.Line(geometry, material);
        group.add(line);
    }

    return group;
}

function createEarthMesh() {
    const points = generateEarthPointCloud(8000);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));

    const pointSizes = new Float32Array(points.length / 3);
    for (let i = 0; i < pointSizes.length; i++) {
        pointSizes[i] = 1.0 + Math.random() * 2.0;
    }
    geometry.setAttribute('pointSize', new THREE.BufferAttribute(pointSizes, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            pointSizeScale: { value: POINT_SIZE_SCALE }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Points(geometry, material);
    return mesh;
}

function createMoonMesh() {
    const moonGeometry = new THREE.SphereGeometry(15, 16, 16);
    const moonMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    return new THREE.Mesh(moonGeometry, moonMaterial);
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
        color: 0x333333,
        transparent: true,
        opacity: 0.3
    });
    return new THREE.Line(geometry, material);
}

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

    const earthGroup = new THREE.Group();
    earthGroup.add(earthMesh);
    earthGroup.add(latLines);
    earthGroup.add(lonLines);

    scene.add(earthGroup);

    moonMesh = createMoonMesh();
    const moonOrbit = createMoonOrbit();
    scene.add(moonOrbit);
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
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        targetTheta -= dx * 0.003;
        targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, targetPhi - dy * 0.003));
    });

    window.addEventListener('mouseup', () => isDragging = false);

    function animate() {
        requestAnimationFrame(animate);

        earthGroup.rotation.y += EARTH_ROTATION_SPEED;

        moonAngle += MOON_ORBIT_SPEED;
        moonMesh.position.x = MOON_ORBIT_RADIUS * Math.cos(moonAngle);
        moonMesh.position.z = MOON_ORBIT_RADIUS * Math.sin(moonAngle);
        moonMesh.position.y = Math.sin(moonAngle * 3) * 20;
        moonMesh.rotation.y += 0.01;

        currentTheta += (targetTheta - currentTheta) * 0.05;
        currentPhi += (targetPhi - currentPhi) * 0.05;

        camera.position.x = CAMERA_DISTANCE * Math.sin(currentPhi) * Math.sin(currentTheta);
        camera.position.y = CAMERA_DISTANCE * Math.cos(currentPhi);
        camera.position.z = CAMERA_DISTANCE * Math.sin(currentPhi) * Math.cos(currentTheta);
        camera.lookAt(0, 0, 0);

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