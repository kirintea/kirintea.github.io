## Background

Wanted a dynamic background for the homepage. First tried Canvas2D for particles, but it started lagging once the count went up. Switched to Three.js, and WebGL rendering handles it fine even with lots of particles.

Three.js isn't hard to pick up, but the official docs are scattered. Actually integrating it into a project means hitting a bunch of walls.

## Core Implementation

### ParticlesSwarm Class

Particle system is wrapped in a `ParticlesSwarm` class. Constructor takes a container and particle count:

```javascript
export class ParticlesSwarm {
    constructor(container, count = 20000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
        // ...
    }
}
```

### Renderer Config

```javascript
this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});
this.renderer.setSize(width, height);

const rendererStyle = this.renderer.domElement.style;
rendererStyle.position = 'absolute';
rendererStyle.top = '0';
rendererStyle.left = '0';
rendererStyle.width = '100%';
rendererStyle.height = '100%';
this.container.appendChild(this.renderer.domElement);
```

Camera is perspective, FOV 60. Particles scattered randomly in a -50 to 50 cube.

### InstancedMesh

If you create one Mesh per particle, draw calls explode. `InstancedMesh` lets you share geometry and material, controlling each instance via instance matrix. One draw call for everything.

```javascript
this.geometry = new THREE.TetrahedronGeometry(0.25);
this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });

this.mesh = new THREE.InstancedMesh(
    this.geometry,
    this.material,
    this.count
);
this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
this.scene.add(this.mesh);
```

`DynamicDrawUsage` tells Three.js the matrix updates frequently, saving some memory.

### Animation

```javascript
animate() {
    requestAnimationFrame(this.animate);
    const time = this.clock.getElapsedTime() * this.speedMult;

    for(let i = 0; i < this.count; i++) {
        const target = this.calculateParticlePosition(i, time);
        this.positions[i].lerp(target, 0.1);
        this.dummy.position.copy(this.positions[i]);
        this.dummy.updateMatrix();
        this.mesh.setMatrixAt(i, this.dummy.matrix);
        this.mesh.setColorAt(i, this.pColor);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;

    this.composer.render();
}
```

Particle positions calculated with phase changes, HSL space for rainbow colors. lerp makes movement smooth instead of jumpy.

### Post-processing

Added UnrealBloomPass:

```javascript
this.composer = new EffectComposer(this.renderer);
this.composer.addPass(new RenderPass(this.scene, this.camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.5, 0.4, 0.85
);
bloomPass.strength = 1.8;
bloomPass.radius = 0.4;
bloomPass.threshold = 0;
this.composer.addPass(bloomPass);
```

## Performance

What actually helped:

1. InstancedMesh reduces draw calls
2. Don't set far clip plane too large
3. DynamicDrawUsage saves memory
4. Tetrahedron has fewer vertices than sphere

Chrome runs it pretty smoothly in practice, GPU usage is acceptable.

## Responsive

Window resize needs dimension updates:

```javascript
function handleResize() {
    const containerWidth = particlesSwarm.container.clientWidth;
    const containerHeight = particlesSwarm.container.clientHeight;

    particlesSwarm.renderer.setSize(containerWidth, containerHeight);

    if (particlesSwarm.composer) {
        particlesSwarm.composer.setSize(containerWidth, containerHeight);
    }

    if (particlesSwarm.camera) {
        particlesSwarm.camera.aspect = containerWidth / containerHeight;
        particlesSwarm.camera.updateProjectionMatrix();
    }
}

window.addEventListener('resize', handleResize);
```

## Lessons Learned

1. InstancedMesh is critical for performance, won't work without it once particle count grows
2. Bloom adds overhead, might need to disable or lower it on weak devices
3. Using `clock.getElapsedTime()` for animation is more stable than frame-rate dependent code
4. Mobile Safari sometimes acts weird, test thoroughly