## 背景

网站首页想放个动态背景。一开始用 Canvas2D 画粒子，数量多了之后明显卡顿。切到 Three.js 之后，靠 WebGL 渲染，粒子多也能跑得动。

Three.js 上手不算难，但官方文档例子太散了，真正往项目里怼的时候踩了不少坑。

## 核心实现

### ParticlesSwarm 类

粒子系统封装在 `ParticlesSwarm` 类里，构造函数接收容器和粒子数量：

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

### 渲染器配置

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

相机用的透视相机，FOV 60，粒子在 -50 到 50 的空间里随机撒点。

### InstancedMesh

大量粒子如果每个都创建一个 Mesh，draw call 会爆炸。`InstancedMesh` 允许共用同一个几何体和材质，通过 instance 矩阵控制每个实例的位置。一个 draw call 全搞定。

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

`DynamicDrawUsage` 让 Three.js 知道矩阵会频繁更新，省点内存。

### 动画

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

粒子位置用相位变化计算颜色，HSL 空间转彩虹色。lerp 让粒子平滑移动，而不是一卡一卡地跳。

### 后期处理

加了一层 UnrealBloomPass：

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

## 性能

几个有效的优化：

1. InstancedMesh 减少 draw call
2. 远裁剪平面别设太大
3. DynamicDrawUsage 省内存
4. 四面体比球体顶点少

实际用起来 Chrome 跑起来挺流畅的，GPU 占用也能接受。

## 响应式

窗口缩放时要更新尺寸：

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

## 踩过的坑

1. InstancedMesh 是性能关键，不用的话粒子多了肯定卡
2. Bloom 效果有开销，差设备上可能要关掉或调低
3. 动画用 `clock.getElapsedTime()` 比依赖帧率稳定
4. 移动端 Safari 有时候会有奇怪问题，多测试