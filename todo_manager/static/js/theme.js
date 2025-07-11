/**
 * Theme management and animations for TODO Manager
 * Handles theme switching, animations, and visual effects
 */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.autoTheme = localStorage.getItem('auto-theme') === 'true';
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.updateThemeIcon();
        this.watchSystemTheme();
    }

    bindEvents() {
        // Theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Auto theme checkbox
        const autoThemeCheckbox = document.getElementById('autoTheme');
        if (autoThemeCheckbox) {
            autoThemeCheckbox.checked = this.autoTheme;
            autoThemeCheckbox.addEventListener('change', (e) => {
                this.setAutoTheme(e.target.checked);
            });
        }
    }

    watchSystemTheme() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.systemTheme = e.matches ? 'dark' : 'light';
            if (this.autoTheme) {
                this.applyTheme();
            }
        });
    }

    toggleTheme() {
        if (this.autoTheme) {
            this.setAutoTheme(false);
        }
        
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.saveTheme();
        this.applyTheme();
        this.animateThemeTransition();
    }

    setAutoTheme(enabled) {
        this.autoTheme = enabled;
        localStorage.setItem('auto-theme', enabled.toString());
        
        if (enabled) {
            this.currentTheme = this.systemTheme;
            this.saveTheme();
        }
        
        this.applyTheme();
    }

    getActiveTheme() {
        return this.autoTheme ? this.systemTheme : this.currentTheme;
    }

    applyTheme() {
        const theme = this.getActiveTheme();
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
        }
        
        this.updateThemeIcon();
        this.updateThemeClasses();
    }

    updateThemeClasses() {
        const theme = this.getActiveTheme();
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
    }

    updateThemeIcon() {
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            const theme = this.getActiveTheme();
            themeIcon.className = this.autoTheme ? 'fas fa-adjust' : 
                                  (theme === 'light' ? 'fas fa-moon' : 'fas fa-sun');
        }
    }

    animateThemeTransition() {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // Create ripple effect
        this.createThemeRipple();
        
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    createThemeRipple() {
        const ripple = document.createElement('div');
        ripple.className = 'theme-ripple';
        document.body.appendChild(ripple);
        
        // Animate ripple
        setTimeout(() => {
            ripple.classList.add('animate');
        }, 10);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    saveTheme() {
        localStorage.setItem('theme', this.currentTheme);
    }
}

// Animation classes
class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.bindAnimationEvents();
        this.animateInitialElements();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observe elements with animation classes
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
        
        this.observers.set('intersection', observer);
    }

    bindAnimationEvents() {
        // Animate elements on hover
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('hover-animate')) {
                this.addHoverAnimation(e.target);
            }
        });

        // Animate form interactions
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.animateFormFocus(e.target);
            }
        }, true);

        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.animateFormBlur(e.target);
            }
        }, true);
    }

    animateInitialElements() {
        // Animate page load
        document.body.classList.add('page-loaded');
        
        // Stagger animate todo items
        const todoItems = document.querySelectorAll('.todo-item');
        todoItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate-in');
            }, index * 100);
        });

        // Animate stats cards
        const statsCards = document.querySelectorAll('.stat-card');
        statsCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 150 + 200);
        });
    }

    animateElement(element) {
        const animationType = element.dataset.animate;
        
        switch (animationType) {
            case 'fade-in':
                element.classList.add('fade-in');
                break;
            case 'slide-up':
                element.classList.add('slide-up');
                break;
            case 'slide-down':
                element.classList.add('slide-down');
                break;
            case 'slide-left':
                element.classList.add('slide-left');
                break;
            case 'slide-right':
                element.classList.add('slide-right');
                break;
            case 'zoom-in':
                element.classList.add('zoom-in');
                break;
            case 'bounce':
                element.classList.add('bounce');
                break;
            default:
                element.classList.add('animate-in');
        }
    }

    addHoverAnimation(element) {
        element.style.transform = 'translateY(-2px)';
        element.style.transition = 'transform 0.2s ease';
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
        }, { once: true });
    }

    animateFormFocus(element) {
        const parent = element.closest('.form-group, .mb-3');
        if (parent) {
            parent.classList.add('focused');
        }
        
        element.style.transform = 'scale(1.02)';
        element.style.transition = 'transform 0.2s ease';
    }

    animateFormBlur(element) {
        const parent = element.closest('.form-group, .mb-3');
        if (parent) {
            parent.classList.remove('focused');
        }
        
        element.style.transform = '';
    }

    // Animation utilities
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    fadeOut(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        const targetHeight = element.scrollHeight + 'px';
        
        setTimeout(() => {
            element.style.height = targetHeight;
        }, 10);
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    slideUp(element, duration = 300) {
        element.style.height = element.scrollHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.height = '0';
        }, 10);
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    pulse(element, duration = 600) {
        element.style.animation = `pulse ${duration}ms ease`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }

    bounce(element, duration = 600) {
        element.style.animation = `bounce ${duration}ms ease`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }

    shake(element, duration = 600) {
        element.style.animation = `shake ${duration}ms ease`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }
}

// Particle system for background effects
class ParticleSystem {
    constructor(container) {
        this.container = container || document.body;
        this.particles = [];
        this.maxParticles = 50;
        this.animationFrame = null;
        this.isRunning = false;
    }

    init() {
        this.createCanvas();
        this.bindEvents();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.resize();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        // Start/stop based on page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.1,
            life: 1,
            decay: Math.random() * 0.01 + 0.005
        };
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        }
        
        // Add new particles
        while (this.particles.length < this.maxParticles) {
            this.particles.push(this.createParticle());
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity * particle.life;
            this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#667eea';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    animate() {
        if (!this.isRunning) return;
        
        this.updateParticles();
        this.drawParticles();
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Performance monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            memory: 0,
            timing: {}
        };
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.init();
    }

    init() {
        this.startFPSMonitoring();
        this.monitorMemory();
        this.monitorTiming();
    }

    startFPSMonitoring() {
        const updateFPS = () => {
            this.frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= this.lastTime + 1000) {
                this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.frameCount = 0;
                this.lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
    }

    monitorMemory() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
            }, 5000);
        }
    }

    monitorTiming() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.timing = {
                domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
                loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
                firstPaint: 0,
                firstContentfulPaint: 0
            };
            
            // Get paint timings
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    this.metrics.timing.firstPaint = Math.round(entry.startTime);
                } else if (entry.name === 'first-contentful-paint') {
                    this.metrics.timing.firstContentfulPaint = Math.round(entry.startTime);
                }
            });
        });
    }

    getMetrics() {
        return this.metrics;
    }

    log() {
        console.group('Performance Metrics');
        console.log('FPS:', this.metrics.fps);
        console.log('Memory Usage:', this.metrics.memory + ' MB');
        console.log('Timing:', this.metrics.timing);
        console.groupEnd();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme manager
    window.themeManager = new ThemeManager();
    
    // Initialize animation manager
    window.animationManager = new AnimationManager();
    
    // Initialize particle system (only on non-mobile devices)
    if (window.innerWidth > 768 && !navigator.userAgent.match(/Mobi/)) {
        window.particleSystem = new ParticleSystem();
        window.particleSystem.init();
        window.particleSystem.start();
    }
    
    // Initialize performance monitor (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.performanceMonitor = new PerformanceMonitor();
        
        // Log performance metrics every 30 seconds
        setInterval(() => {
            window.performanceMonitor.log();
        }, 30000);
    }
});

// Export for global access
window.ThemeManager = ThemeManager;
window.AnimationManager = AnimationManager;
window.ParticleSystem = ParticleSystem;
