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
        this.initHeroSwiper();
        this.initGallerySwiper();
    }

    initHeroSwiper() {
        const heroElement = document.querySelector('.hero-swiper');
        if (!heroElement || typeof Swiper === 'undefined') return;

        try {
            new Swiper('.hero-swiper', {
                slidesPerView: 1,
                spaceBetween: 0,
                loop: true,
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                },
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },
                pagination: {
                    el: '.hero-swiper .swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.hero-swiper .swiper-button-next',
                    prevEl: '.hero-swiper .swiper-button-prev',
                },
                keyboard: {
                    enabled: true,
                },
                a11y: {
                    enabled: true,
                    prevSlideMessage: 'Slide trước',
                    nextSlideMessage: 'Slide tiếp theo',
                }
            });
        } catch (error) {
            console.error('Error initializing hero Swiper:', error);
        }
    }

    initGallerySwiper() {
        const galleryElement = document.querySelector('.gallery-swiper');
        if (!galleryElement || typeof Swiper === 'undefined') return;

        try {
            new Swiper('.gallery-swiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },
                pagination: {
                    el: '.gallery-swiper .swiper-pagination',
                    clickable: true,
                    dynamicBullets: true,
                },
                navigation: {
                    nextEl: '.gallery-swiper .swiper-button-next',
                    prevEl: '.gallery-swiper .swiper-button-prev',
                },
                keyboard: {
                    enabled: true,
                },
                breakpoints: {
                    640: {
                        slidesPerView: 2,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                }
            });
        } catch (error) {
            console.error('Error initializing gallery Swiper:', error);
        }
    }
}

// ==========================================
// Search Modal Handler
// ==========================================
class SearchModalHandler {
    constructor() {
        this.searchBtn = document.querySelector('.nav__search-btn');
        this.searchModal = document.getElementById('searchModal');
        this.closeBtn = document.querySelector('.search-modal__close');
        this.searchInput = document.querySelector('.search-form input');
        
        if (this.searchBtn && this.searchModal) {
            this.init();
        }
    }

    init() {
        this.searchBtn.addEventListener('click', () => this.openModal());
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => this.searchInput?.focus(), 100);
    }

    closeModal() {
        this.searchModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==========================================
// Form Handler
// ==========================================
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('.booking-form, .contact-form');
        if (this.forms.length > 0) {
            this.init();
        }
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        });
    }

    handleSubmit(e, form) {
        e.preventDefault();
        
        if (!this.validateForm(form)) {
            return false;
        }

        // Show success message
        this.showSuccessMessage(form);
        
        // Reset form
        setTimeout(() => form.reset(), 1000);
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'Vui lòng điền thông tin này');
                isValid = false;
            } else if (input.type === 'email' && !this.validateEmail(input.value)) {
                this.showError(input, 'Email không hợp lệ');
                isValid = false;
            } else if (input.type === 'tel' && !this.validatePhone(input.value)) {
                this.showError(input, 'Số điện thoại không hợp lệ');
                isValid = false;
            } else {
                this.clearError(input);
            }
        });

        return isValid;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[0-9]{10,11}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    showError(input, message) {
        this.clearError(input);
        
        input.classList.add('input-error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }

    clearError(input) {
        input.classList.remove('input-error');
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    }

    showSuccessMessage(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = 'Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm.';
        form.prepend(successDiv);

        setTimeout(() => successDiv.remove(), 5000);
    }
}

// ==========================================
// Gallery/Swiper Handler (Legacy support)
// ==========================================

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
            this.components.push(new SearchModalHandler());
            this.components.push(new FormHandler());
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
