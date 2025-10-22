/**
 * Quyền Hair - Enhanced JavaScript
 * Based on Nam Hair Studio features
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
// Search Modal Handler
// ==========================================
class SearchModalHandler {
    constructor() {
        this.searchBtn = document.querySelector('.nav__search-btn');
        this.searchModal = document.getElementById('searchModal');
        this.closeBtn = document.querySelector('.search-modal__close');
        this.searchInput = document.querySelector('.search-form input');
        
        this.init();
    }

    init() {
        if (!this.searchBtn || !this.searchModal) return;

        this.searchBtn.addEventListener('click', () => this.openModal());
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        
        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) this.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
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
// Enhanced Navigation Handler
// ==========================================
class EnhancedNavigationHandler {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.navToggle = document.querySelector('.nav__toggle');
        this.navMenu = document.querySelector('.nav__menu');
        this.navLinks = document.querySelectorAll('.nav__link');
        this.dropdowns = document.querySelectorAll('.nav__item--dropdown');
        this.lastScrollTop = 0;
        
        this.init();
    }

    init() {
        if (!this.nav) return;

        this.initSmoothScroll();
        this.handleScroll();
        this.initMobileMenu();
        this.initDropdowns();
    }

    initSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    
                    if (target) {
                        this.closeMobileMenu();
                        const navHeight = this.nav?.offsetHeight || 70;
                        const topBarHeight = document.querySelector('.top-bar')?.offsetHeight || 0;
                        const totalOffset = navHeight + topBarHeight;
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - totalOffset;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        history.pushState(null, '', href);
                    }
                }
            });
        });
    }

    initMobileMenu() {
        if (!this.navToggle || !this.navMenu) return;

        this.navToggle.addEventListener('click', () => {
            this.navToggle.classList.toggle('active');
            this.navMenu.classList.toggle('active');
            
            const isExpanded = this.navMenu.classList.contains('active');
            this.navToggle.setAttribute('aria-expanded', isExpanded);
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.navMenu.classList.contains('active') &&
                !this.navMenu.contains(e.target) &&
                !this.navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    closeMobileMenu() {
        if (this.navMenu && this.navMenu.classList.contains('active')) {
            this.navMenu.classList.remove('active');
            this.navToggle?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    initDropdowns() {
        this.dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav__link');
            const submenu = dropdown.querySelector('.nav__dropdown');
            
            if (!link || !submenu) return;

            // Mobile: toggle on click
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });
    }

    handleScroll() {
        window.addEventListener('scroll', throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Hide/show nav on scroll
            if (scrollTop > this.lastScrollTop && scrollTop > 100) {
                this.nav.style.transform = 'translateY(-100%)';
            } else {
                this.nav.style.transform = 'translateY(0)';
            }
            
            // Add shadow on scroll
            if (scrollTop > 50) {
                this.nav.classList.add('nav--scrolled');
            } else {
                this.nav.classList.remove('nav--scrolled');
            }
            
            this.lastScrollTop = scrollTop;
        }, 100));
    }
}

// ==========================================
// Hero Slider Handler
// ==========================================
class HeroSliderHandler {
    constructor() {
        this.sliderElement = document.querySelector('.hero-swiper');
        this.slider = null;
        
        this.init();
    }

    init() {
        if (!this.sliderElement || typeof Swiper === 'undefined') return;

        this.slider = new Swiper('.hero-swiper', {
            loop: true,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            keyboard: {
                enabled: true,
            },
        });
    }
}

// ==========================================
// Gallery Handler
// ==========================================
class GalleryHandler {
    constructor() {
        this.sliderElement = document.querySelector('.gallery-swiper');
        this.slider = null;
        
        this.init();
    }

    init() {
        if (!this.sliderElement || typeof Swiper === 'undefined') return;

        this.slider = new Swiper('.gallery-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
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
            breakpoints: {
                640: {
                    slidesPerView: 2,
                },
                768: {
                    slidesPerView: 3,
                },
            }
        });
    }
}

// ==========================================
// Form Validation Handler
// ==========================================
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('.booking-form, .contact-form');
        this.init();
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
// Scroll to Top Handler
// ==========================================
class ScrollToTopHandler {
    constructor() {
        this.button = document.querySelector('.scroll-top');
        this.init();
    }

    init() {
        if (!this.button) return;

        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 300) {
                this.button.classList.add('active');
            } else {
                this.button.classList.remove('active');
            }
        }, 200));

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ==========================================
// Animation Observer
// ==========================================
class AnimationObserver {
    constructor() {
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, this.options);

        const elements = document.querySelectorAll('.service-card, .product-card, .team-card, .blog-card, .contact-card');
        elements.forEach(el => {
            el.classList.add('animate-element');
            observer.observe(el);
        });
    }
}

// ==========================================
// Quick Contact Buttons
// ==========================================
class QuickContactHandler {
    constructor() {
        this.buttons = document.querySelector('.quick-contact');
        this.init();
    }

    init() {
        if (!this.buttons) return;

        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 200) {
                this.buttons.classList.add('active');
            } else {
                this.buttons.classList.remove('active');
            }
        }, 200));
    }
}

// ==========================================
// App Initialization
// ==========================================
class App {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            new EnhancedNavigationHandler();
            new SearchModalHandler();
            new HeroSliderHandler();
            new GalleryHandler();
            new FormHandler();
            new ScrollToTopHandler();
            new AnimationObserver();
            new QuickContactHandler();

            console.log('✅ All components initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing components:', error);
        }
    }
}

// Start the application
new App();
