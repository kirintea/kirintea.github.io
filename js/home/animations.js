/**
 * 动画效果模块
 * 处理页面动画与滚动触发的动画
 */

/**
 * 初始化动画
 */
export function initAnimations() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    if (typeof gsap === 'undefined') {
        return;
    }

    const heroContainer = document.querySelector('.oc-role-bg .container, .hero-bg .container');
    const skillBars = document.querySelectorAll('.skill-bar');
    const projectCards = document.querySelectorAll('#projects .project-card');

    if (heroContainer) {
        gsap.from(heroContainer, {
            opacity: 0,
            y: 50,
            duration: 1,
            delay: 0.2
        });
    }

    if (skillBars.length > 0) {
        gsap.from('.skill-bar', {
            width: 0,
            duration: 1.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.skills-section',
                start: 'top 70%'
            }
        });
    }

    if (projectCards.length > 0) {
        gsap.from('#projects .project-card', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: {
                trigger: '#projects',
                start: 'top 80%'
            }
        });
    }
}
