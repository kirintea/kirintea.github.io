/**
 * 主脚本文件
 * 作为JavaScript的入口点，初始化所有模块
 */

import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initContactForm } from './contact-form.js';
import { initParticles } from './particles.js';
import { initHomeBlog } from './blog.js';

/**
 * 组件加载函数
 * 用于动态加载HTML组件
 */
async function loadComponents() {
    const components = [
        { id: 'oc-role', path: './components/home/oc-role.html' },
        { id: 'process', path: './components/home/process.html' },
        { id: 'projects', path: './components/home/projects.html' },
        { id: 'skills', path: './components/home/skills.html' },
        { id: 'blog', path: './components/home/blog.html' },
        { id: 'experience', path: './components/home/experience.html' },
        { id: 'contact', path: './components/home/contact.html' },
        { id: 'publications', path: './components/home/publications.html' },
        { id: 'services', path: './components/home/services.html' },
        { id: 'cta', path: './components/home/cta.html' },
        { id: 'footer', path: './components/home/footer.html' }
    ];

    for (const component of components) {
        try {
            const response = await fetch(component.path);
            const html = await response.text();
            const container = document.getElementById(component.id);
            if (container) {
                container.innerHTML = html;
            }
        } catch (error) {
            console.error(`Failed to load component ${component.id}:`, error);
        }
    }

    await initFunctions();
}

/**
 * 初始化所有功能
 */
async function initFunctions() {
    initNavigation();
    await initHomeBlog();
    initAnimations();
    initContactForm();

    setTimeout(() => {
        const particlesContainer = document.getElementById('particles-container');
        if (particlesContainer) {
            initParticles(particlesContainer);
        }
    }, 100);
}

document.addEventListener('DOMContentLoaded', function() {
    loadComponents();
});
