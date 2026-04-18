// about.js - Interactive features for About page with JSON data

document.addEventListener('DOMContentLoaded', async () => {
    await loadAboutData();
    initScrollAnimations();
});

// Load all about data from JSON files
async function loadAboutData() {
    try {
        const [skillsData, timelineData, statsData] = await Promise.all([
            fetch('../data/about/skills.json').then(res => res.json()),
            fetch('../data/about/timeline.json').then(res => res.json()),
            fetch('../data/about/stats.json').then(res => res.json())
        ]);

        renderSkills(skillsData);
        renderTimeline(timelineData);
        renderStats(statsData);
    } catch (error) {
        console.error('Error loading about data:', error);
    }
}

// Render skills section
function renderSkills(data) {
    const titleEl = document.getElementById('skills-title');
    const containerEl = document.getElementById('skills-container');

    if (titleEl && data.title) {
        titleEl.textContent = data.title;
    }

    if (!containerEl || !data.categories) return;

    containerEl.innerHTML = data.categories.map(category => `
        <div class="skill-category" data-category="${category.category}">
            <h3 class="category-title">${category.name}</h3>
            <div class="skill-bars">
                ${category.skills.map(skill => `
                    <div class="skill-bar" data-progress="${skill.progress}">
                        <div class="skill-info">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-percent">${skill.progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    initSkillBars();
}

// Render timeline section
function renderTimeline(data) {
    const titleEl = document.getElementById('timeline-title');
    const containerEl = document.getElementById('timeline-container');

    if (titleEl && data.title) {
        titleEl.textContent = data.title;
    }

    if (!containerEl || !data.items) return;

    const timelineLine = containerEl.querySelector('.timeline-line');
    containerEl.innerHTML = '';
    containerEl.appendChild(timelineLine);

    data.items.forEach((item, index) => {
        const position = item.position || (index % 2 === 0 ? 'left' : 'right');
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${position}`;
        timelineItem.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-date">${item.date}</div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
            <div class="timeline-dot"></div>
        `;
        containerEl.appendChild(timelineItem);
    });
}

// Render stats section
function renderStats(data) {
    const containerEl = document.getElementById('stats-container');

    if (!containerEl || !data.stats) return;

    const iconPaths = {
        github: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
        commits: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-2h2v2zm-9-4h2v-2H5v2zm0-4h2V7H5v2zm14 4h-2v-2h2v2zm0-4h-2V7h2v2z',
        stars: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        followers: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'
    };

    containerEl.innerHTML = data.stats.map(stat => {
        const icon = iconPaths[stat.icon] || iconPaths.github;
        return `
            <div class="stat-card">
                <div class="stat-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48">
                        <path fill="currentColor" d="${icon}"/>
                    </svg>
                </div>
                <div class="stat-number" data-count="${stat.count}">0</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `;
    }).join('');

    initStatsCounter();
}

// Skill bars animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                const progressFill = entry.target.querySelector('.progress-fill');
                
                setTimeout(() => {
                    progressFill.style.width = progress + '%';
                }, 200);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

// Stats counter animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// Scroll animations
function initScrollAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transition = 'all 0.6s ease-out';
        if (item.classList.contains('left')) {
            item.style.transform = 'translateX(-50px)';
        } else {
            item.style.transform = 'translateX(50px)';
        }
        observer.observe(item);
    });
}

// Add glitch effect to name on hover
const nameMain = document.querySelector('.name-main');
if (nameMain) {
    nameMain.addEventListener('mouseenter', () => {
        nameMain.style.textShadow = '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.5), 5px 0 0 rgba(255, 0, 0, 0.5), -5px 0 0 rgba(0, 255, 255, 0.5)';
    });
    
    nameMain.addEventListener('mouseleave', () => {
        nameMain.style.textShadow = '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)';
    });
}

// Parallax effect for hero section
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const heroSection = document.querySelector('.hero-section');
            if (heroSection && scrolled < window.innerHeight) {
                heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Interactive particles for hero background (canvas)
function createParticles() {
    const hero = document.querySelector('.hero-section');
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
    `;
    hero.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    function initParticles() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    resize();
    initParticles();
    animate();
    
    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });
}

// Initialize particles after a short delay
setTimeout(createParticles, 500);
