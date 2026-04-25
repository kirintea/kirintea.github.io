/**
 * 粒子系统初始化模块
 * 用于在英雄区域创建和管理粒子效果
 */

import { ParticlesSwarm } from './kh_m.js';

// 粒子系统实例
let particlesSwarm = null;

/**
 * 初始化粒子系统
 * @param {HTMLElement} container - 粒子系统容器元素
 */
export function initParticles(container) {
    if (!container) {
        console.error('粒子系统容器不存在');
        return;
    }

    // 强制设置容器样式，确保在所有浏览器中都能正确显示
    Object.assign(container.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '0',
        overflow: 'hidden',
        margin: '0',
        padding: '0',
        border: 'none',
        boxSizing: 'border-box',
        display: 'block'
    });

    // 使用 requestAnimationFrame 确保容器完全渲染后再初始化
    requestAnimationFrame(() => {
        // 再次检查容器尺寸
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        if (containerWidth > 0 && containerHeight > 0) {
            // 创建粒子系统实例
            particlesSwarm = new ParticlesSwarm(container, 20000);

            // 监听窗口大小变化，调整粒子系统大小
            window.addEventListener('resize', handleResize);

            console.log('粒子系统初始化完成');
        } else {
            // 如果容器尺寸为 0，再次尝试
            setTimeout(() => initParticles(container), 100);
        }
    });
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
    if (particlesSwarm && particlesSwarm.renderer && particlesSwarm.container) {
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
}

/**
 * 销毁粒子系统
 */
export function disposeParticles() {
    if (particlesSwarm) {
        particlesSwarm.dispose();
        particlesSwarm = null;
    }
    window.removeEventListener('resize', handleResize);
    console.log('粒子系统已销毁');
}