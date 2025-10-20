/**
 * Quyền Hair - Enhanced JavaScript
 * Following Industry Best Practices
 * - Modern ES6+ syntax
 * - Performance optimizations
 * - Accessibility features
 * - Error handling
 * - Progressive enhancement
 */

'use strict';

// ==========================================
// Utility Functions
// ==========================================

const debounce = (func, wait = 150) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit = 150) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ==========================================
// Navigation Handler
// ==========================================
class NavigationHandler {
    constructor() {
        this.nav = document.querySelector('.nav') || document.querySelector('nav');
        this.navToggle = document.querySelector('.nav__toggle');
        this.navMenu = document.querySelector('.nav__menu') || document.querySelector('nav ul');
        this.navLinks = document.querySelectorAll('.nav__link, nav ul li a');
        this.lastScrollTop = 0;
        this.scrollThreshold = 100;

        this.init();
    }

    init() {
        if (!this.nav) return;

        this.initSmoothScroll();
        this.handleScroll();

        if (this.navToggle && this.navMenu) {
            this.initMobileMenu();
        }

        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768 && this.navMenu) {
                this.navMenu.classList.remove('active');
                if (this.navToggle) {
                    this.navToggle.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        }, 250));
    }

    initSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    
                    if (target) {
                        if (this.navMenu && this.navMenu.classList.contains('active')) {
                            this.navMenu.classList.remove('active');
                            if (this.navToggle) {
                                this.navToggle.classList.remove('active');
                            }
                            document.body.style.overflow = '';
                        }

                        const navHeight = this.nav?.offsetHeight || 70;
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        history.pushState(null, '', href);
                        target.setAttribute('tabindex', '-1');
                        target.focus();
                    }
                }
            });
        });
    }

    initMobileMenu() {
        this.navToggle.addEventListener('click', () => {
            this.navToggle.classList.toggle('active');
            this.navMenu.classList.toggle('active');
            
            if (this.navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }

            const isExpanded = this.navMenu.classList.contains('active');
            this.navToggle.setAttribute('aria-expanded', isExpanded);
        });

        document.addEventListener('click', (e) => {
            if (this.navMenu.classList.contains('active') &&
                !this.navMenu.contains(e.target) &&
                !this.navToggle.contains(e.target)) {
                this.navMenu.classList.remove('active');
                this.navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                this.navMenu.classList.remove('active');
                this.navToggle.classList.remove('active');
                this.navToggle.focus();
                document.body.style.overflow = '';
            }
        });
    }

    handleScroll() {
        window.addEventListener('scroll', throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 50) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }

            if (scrollTop > this.scrollThreshold) {
                if (scrollTop > this.lastScrollTop) {
                    this.nav.classList.add('hidden');
                } else {
                    this.nav.classList.remove('hidden');
                }
            } else {
                this.nav.classList.remove('hidden');
            }

            this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, 100));
    }
}

// ==========================================
// Gallery/Swiper Handler
// ==========================================
class GalleryHandler {
    constructor() {
        this.swiperElement = document.querySelector('.swiper');
        this.swiper = null;
        
        if (this.swiperElement && typeof Swiper !== 'undefined') {
            this.init();
        }
    }

    init() {
        try {
            this.swiper = new Swiper('.swiper', {
                slidesPerView: 1,
                spaceBetween: 0,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    dynamicBullets: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                keyboard: {
                    enabled: true,
                },
                a11y: {
                    enabled: true,
                    prevSlideMessage: 'Ảnh trước',
                    nextSlideMessage: 'Ảnh tiếp theo',
                },
                lazy: {
                    loadPrevNext: true,
                },
                on: {
                    slideChange: function() {
                        const activeSlide = this.slides[this.activeIndex];
                        if (activeSlide) {
                            activeSlide.style.animation = 'slideIn 0.6s ease forwards';
                        }
                    }
                }
            });

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.swiper?.autoplay?.stop();
                } else {
                    this.swiper?.autoplay?.start();
                }
            });

        } catch (error) {
            console.error('Error initializing Swiper:', error);
        }
    }
}

// ==========================================
// Scroll to Top Button
// ==========================================
class ScrollToTop {
    constructor() {
        this.button = document.querySelector('.scroll-top');
        this.threshold = 300;

        if (this.button) {
            this.init();
        }
    }

    init() {
        window.addEventListener('scroll', throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > this.threshold) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        }, 150));

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ==========================================
// Intersection Observer for Animations
// ==========================================
class AnimationObserver {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);

            const contactCards = document.querySelectorAll('.contact-card');
            contactCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(card);
            });
        }
    }
}

// ==========================================
// Application Initialization
// ==========================================
class App {
    constructor() {
        this.components = [];
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            this.components.push(new NavigationHandler());
            this.components.push(new GalleryHandler());
            this.components.push(new ScrollToTop());
            this.components.push(new AnimationObserver());

            console.log('✓ Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }
}

// ==========================================
// Start Application
// ==========================================
const app = new App();
app.init();

if (typeof window !== 'undefined') {
    window.QuyenHairApp = app;
}
