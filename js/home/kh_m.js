import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ParticlesSwarm {
    constructor(container, count = 20000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        
        // SETUP
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
        
        // 使用容器尺寸初始化
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
        // 调整相机位置，拉近镜头使粒子效果放大
        this.camera.position.set(0, 0, 80);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        // 设置渲染器尺寸
        this.renderer.setSize(width, height);
        // 设置渲染器样式，确保它覆盖整个容器
        const rendererStyle = this.renderer.domElement.style;
        rendererStyle.position = 'absolute';
        rendererStyle.top = '0';
        rendererStyle.left = '0';
        rendererStyle.width = '100%';
        rendererStyle.height = '100%';
        rendererStyle.zIndex = '0';
        rendererStyle.overflow = 'hidden';
        rendererStyle.margin = '0';
        rendererStyle.padding = '0';
        rendererStyle.border = 'none';
        rendererStyle.boxSizing = 'border-box';
        rendererStyle.display = 'block';
        this.container.appendChild(this.renderer.domElement);
        
        // 强制设置容器样式，确保它不会产生溢出
        const containerStyle = this.container.style;
        containerStyle.position = 'absolute';
        containerStyle.top = '0';
        containerStyle.left = '0';
        containerStyle.width = '100%';
        containerStyle.height = '100%';
        containerStyle.zIndex = '0';
        containerStyle.overflow = 'hidden';
        containerStyle.margin = '0';
        containerStyle.padding = '0';
        containerStyle.border = 'none';
        containerStyle.boxSizing = 'border-box';
        containerStyle.display = 'block';

        // POST PROCESSING
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
        bloomPass.strength = 1.8; bloomPass.radius = 0.4; bloomPass.threshold = 0;
        this.composer.addPass(bloomPass);

        // OBJECTS
        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
        this.target = new THREE.Vector3();
        this.pColor = new THREE.Color();
        
        this.geometry = new THREE.TetrahedronGeometry(0.25);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.mesh);
        
        this.positions = [];
        for(let i=0; i<this.count; i++) {
            this.positions.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
            this.mesh.setColorAt(i, this.color.setHex(0x00ff88));
        }
        
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime() * this.speedMult;
        
        if(this.material.uniforms && this.material.uniforms.uTime) {
            this.material.uniforms.uTime.value = time;
        }

        // 强制设置渲染器的样式，确保它覆盖整个容器
        if (this.renderer && this.renderer.domElement) {
            // 强制设置渲染器样式
            const rendererStyle = this.renderer.domElement.style;
            rendererStyle.position = 'absolute';
            rendererStyle.top = '0';
            rendererStyle.left = '0';
            rendererStyle.width = '100%';
            rendererStyle.height = '100%';
            rendererStyle.zIndex = '0';
            rendererStyle.overflow = 'hidden';
            rendererStyle.margin = '0';
            rendererStyle.padding = '0';
            rendererStyle.border = 'none';
            rendererStyle.boxSizing = 'border-box';
            rendererStyle.display = 'block';
        }

        // API Stubs
        const PARAMS = {"res":40,"speed":0.8,"shatter":15,"scale":50};
        const addControl = (id, l, min, max, val) => {
             return PARAMS[id] !== undefined ? PARAMS[id] : val;
        };
        const setInfo = () => {};
        const annotate = () => {};
        let THREE_LIB = THREE;
        const count = this.count; // Alias for user code
        
        for(let i=0; i<this.count; i++) {
            let target = this.target;
            let color = this.pColor;
            
            // INJECTED CODE
            const resolution = addControl("res", "Mosaic Detail", 10.0, 100.0, 40.0);
            const speed = addControl("speed", "Time Warp", 0.1, 3.0, 0.8);
            const shatter = addControl("shatter", "Shatter Radius", 0.0, 50.0, 15.0);
            const scale = addControl("scale", "Scale", 10.0, 100.0, 50.0);
            
            const t = time * speed;
            
            const cbrt = Math.max(2.0, Math.floor(Math.pow(count, 0.333333)));
            const ix = i % cbrt;
            const iy = Math.floor(i / cbrt) % cbrt;
            const iz = Math.floor(i / (cbrt * cbrt));
            
            const nx = (ix / cbrt) * 2.0 - 1.0;
            const ny = (iy / cbrt) * 2.0 - 1.0;
            const nz = (iz / cbrt) * 2.0 - 1.0;
            
            const step = 2.0 / Math.max(1.0, resolution);
            const mx = Math.floor(nx / step) * step;
            const my = Math.floor(ny / step) * step;
            const mz = Math.floor(nz / step) * step;
            
            const lx = (nx - mx) / step;
            const ly = (ny - my) / step;
            const lz = (nz - mz) / step;
            
            const phase = Math.sin(mx * 3.0 + my * 4.0 + mz * 5.0 - t * 2.0);
            const evolve = Math.max(0.0, phase); 
            
            const mLen = Math.max(0.0001, Math.sqrt(mx * mx + my * my + mz * mz));
            const sx = (mx / mLen) * scale;
            const sy = (my / mLen) * scale;
            const sz = (mz / mLen) * scale;
            
            const formMorph = (Math.sin(t * 0.5) + 1.0) * 0.5; 
            let px = mx * scale * (1.0 - formMorph) + sx * formMorph;
            let py = my * scale * (1.0 - formMorph) + sy * formMorph;
            let pz = mz * scale * (1.0 - formMorph) + sz * formMorph;
            
            px += lx * evolve * shatter;
            py += ly * evolve * shatter;
            pz += lz * evolve * shatter;
            
            const angle = pz * 0.05 * Math.sin(t * 0.3);
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const finalX = px * cosA - py * sinA;
            const finalY = px * sinA + py * cosA;
            const finalZ = pz;
            
            target.set(finalX, finalY, finalZ);
            
            const hue = Math.abs((mx * 0.5 + my * 0.3 + mz * 0.2 + t * 0.1) % 1.0);
            const edgeDist = Math.max(Math.abs(lx), Math.abs(ly), Math.abs(lz));
            const lightness = 0.5 + 0.5 * evolve - (edgeDist * 0.3); 
            
            color.setHSL(hue, 0.8, Math.max(0.0, Math.min(1.0, lightness)));
            
            if (i === 0) {
                setInfo("Diễn Hoá Phần Khảm", "Evolution of the Mosaic: Volumetric tessellation shifting between geometric states, fracturing along spatial wave fronts.");
                annotate("center", new THREE.Vector3(0, 0, 0), "Tâm Diễn Hoá");
            }
            
            // UPDATE
            this.positions[i].lerp(this.target, 0.1);
            this.dummy.position.copy(this.positions[i]);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, this.pColor);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.instanceColor.needsUpdate = true;
        
        this.composer.render();
    }
    
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        this.renderer.dispose();
    }
}
