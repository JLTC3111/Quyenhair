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
// Theme Manager
// ==========================================
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        // Setup toggle button
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle button icon
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fas fa-sun';
                    this.themeToggle.setAttribute('aria-label', 'Chuyển sang chế độ sáng');
                } else {
                    icon.className = 'fas fa-moon';
                    this.themeToggle.setAttribute('aria-label', 'Chuyển sang chế độ tối');
                }
            }
        }
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    getTheme() {
        return this.currentTheme;
    }
}

// ==========================================
// Navigation Handler
// ==========================================
class NavigationHandler {
    constructor() {
        this.nav = document.querySelector('.nav') || document.querySelector('nav');
        this.navToggle = document.querySelector('.nav__toggle');
        this.navMenu = document.querySelector('.nav__menu') || document.querySelector('nav ul');
        this.navOverlay = document.querySelector('.nav__overlay') || document.getElementById('navOverlay');
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

        // Close drawer on resize if needed
        window.addEventListener('resize', debounce(() => {
            // Optional: You can remove this entirely if you want drawer to persist
            // Currently keeping it but with no auto-close on desktop
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
                            this.closeDrawer();
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

    closeDrawer() {
        if (this.navMenu) {
            this.navMenu.classList.remove('active');
        }
        if (this.navToggle) {
            this.navToggle.classList.remove('active');
        }
        if (this.navOverlay) {
            this.navOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
        
        if (this.navToggle) {
            this.navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    openDrawer() {
        if (this.navMenu) {
            this.navMenu.classList.add('active');
        }
        if (this.navToggle) {
            this.navToggle.classList.add('active');
        }
        if (this.navOverlay) {
            this.navOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
        
        if (this.navToggle) {
            this.navToggle.setAttribute('aria-expanded', 'true');
        }
    }

    initMobileMenu() {
        // Toggle button click
        this.navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = this.navMenu.classList.contains('active');
            
            if (isActive) {
                this.closeDrawer();
            } else {
                this.openDrawer();
            }
        });

        // Overlay click to close drawer
        if (this.navOverlay) {
            this.navOverlay.addEventListener('click', () => {
                this.closeDrawer();
            });
        }

        // Close drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (this.navMenu && this.navMenu.classList.contains('active') &&
                !this.navMenu.contains(e.target) &&
                !this.navToggle.contains(e.target)) {
                this.closeDrawer();
            }
        });

        // Close drawer with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
                this.closeDrawer();
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
            this.components.push(new ThemeManager());
            this.components.push(new NavigationHandler());
            this.components.push(new GalleryHandler());
            this.components.push(new SearchModalHandler());
            this.components.push(new FormHandler());
            this.components.push(new ScrollToTop());
            this.components.push(new AnimationObserver());
            this.components.push(new AuthHandler());
            this.components.push(new CommentsHandler());

            console.log('✓ Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }
}

// ==========================================
// Comments Handler
// ==========================================
class CommentsHandler {
    constructor() {
        // API Configuration - Change to your backend URL
        this.API_BASE_URL = 'http://localhost:3001/api';
        this.USE_API = false; // Set to true when backend is running
        
        this.comments = this.loadComments();
        this.currentFilter = 'all';
        this.commentsPerPage = 5;
        this.currentPage = 1;
        this.init();
    }

    async init() {
        this.setupStarRating();
        this.setupCommentForm();
        this.setupFilters();
        
        // Load data from API or localStorage
        if (this.USE_API) {
            await this.loadStatisticsFromAPI();
            await this.loadFeaturedReviewsFromAPI();
        } else {
            this.renderComments();
            this.updateStats();
        }
        
        this.setupLoadMore();
    }

    // ==========================================
    // API Methods
    // ==========================================
    
    async loadStatisticsFromAPI() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/comments/stats`);
            const { data } = await response.json();
            
            this.displayStatistics(data);
        } catch (error) {
            console.error('Error loading statistics:', error);
            // Fallback to localStorage
            this.updateStats();
        }
    }
    
    displayStatistics(stats) {
        // Update average rating
        const avgRatingEl = document.getElementById('averageRating');
        if (avgRatingEl) {
            avgRatingEl.textContent = stats.averageRating.toFixed(1);
        }
        
        // Update total reviews
        const totalEl = document.getElementById('totalComments');
        if (totalEl) {
            totalEl.textContent = stats.totalReviews.toLocaleString();
        }
        
        // Update insights
        const recentEl = document.getElementById('recentReviews');
        if (recentEl) {
            recentEl.textContent = stats.recentTrend.last30Days;
        }
        
        const verifiedEl = document.getElementById('verifiedCount');
        if (verifiedEl) {
            verifiedEl.textContent = stats.verifiedReviews.toLocaleString();
        }
        
        // Update rating breakdown
        Object.entries(stats.ratingBreakdown).forEach(([rating, data]) => {
            const barEl = document.querySelector(`.rating-bar[data-rating="${rating}"]`);
            if (barEl) {
                const fillEl = barEl.querySelector('.rating-bar__fill');
                const percentageEl = barEl.querySelector('.rating-bar__percentage');
                const countEl = barEl.querySelector('.rating-bar__count');
                
                if (fillEl) fillEl.style.width = `${data.percentage}%`;
                if (percentageEl) percentageEl.textContent = `${data.percentage}%`;
                if (countEl) countEl.textContent = `(${data.count})`;
            }
        });
        
        // Update stars display
        const starsEl = document.getElementById('averageStars');
        if (starsEl) {
            starsEl.innerHTML = this.renderStars(stats.averageRating);
        }
    }
    
    async loadFeaturedReviewsFromAPI() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/comments/featured?limit=3`);
            const { data } = await response.json();
            
            this.displayFeaturedReviews(data);
        } catch (error) {
            console.error('Error loading featured reviews:', error);
            document.getElementById('featuredReviewsGrid').innerHTML = 
                '<p style="text-align: center; color: var(--color-text-secondary);">Không thể tải đánh giá nổi bật</p>';
        }
    }
    
    displayFeaturedReviews(reviews) {
        const gridEl = document.getElementById('featuredReviewsGrid');
        if (!gridEl) return;
        
        if (reviews.length === 0) {
            gridEl.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Chưa có đánh giá nổi bật</p>';
            return;
        }
        
        gridEl.innerHTML = reviews.map(review => `
            <div class="featured-review-card">
                <div class="featured-review-header">
                    <div class="featured-review-avatar">
                        ${review.user_avatar 
                            ? `<img src="${review.user_avatar}" alt="${review.user_name}">` 
                            : review.user_name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="featured-review-info">
                        <h4>${this.escapeHtml(review.user_name)}</h4>
                        ${review.user_verified 
                            ? '<div class="featured-review-verified"><i class="fas fa-check-circle"></i> Đã xác minh</div>' 
                            : ''
                        }
                    </div>
                </div>
                <div class="featured-review-rating">
                    ${this.renderStars(review.rating)}
                </div>
                <p class="featured-review-text">${this.escapeHtml(review.comment)}</p>
                <div class="featured-review-footer">
                    <span class="featured-review-helpful">
                        <i class="fas fa-thumbs-up"></i> ${review.helpful} người thấy hữu ích
                    </span>
                    <span>${this.formatDate(review.created_at)}</span>
                </div>
            </div>
        `).join('');
    }
    
    async filterReviewsByRating(rating) {
        if (!this.USE_API) {
            // Fallback to localStorage filtering
            this.currentFilter = rating.toString();
            this.currentPage = 1;
            this.renderComments();
            return;
        }
        
        try {
            const endpoint = rating === 'all' 
                ? `${this.API_BASE_URL}/comments?status=approved`
                : `${this.API_BASE_URL}/comments/by-rating?rating=${rating}`;
                
            const response = await fetch(endpoint);
            const { data } = await response.json();
            
            this.displayCommentsList(data);
        } catch (error) {
            console.error('Error filtering reviews:', error);
        }
    }
    
    async filterVerifiedReviews() {
        if (!this.USE_API) return;
        
        try {
            const response = await fetch(`${this.API_BASE_URL}/comments/verified?page=1&limit=10`);
            const { data } = await response.json();
            
            this.displayCommentsList(data);
        } catch (error) {
            console.error('Error loading verified reviews:', error);
        }
    }
    
    async filterRecentReviews() {
        if (!this.USE_API) return;
        
        try {
            const response = await fetch(`${this.API_BASE_URL}/comments/recent?limit=10&days=30`);
            const { data } = await response.json();
            
            this.displayCommentsList(data);
        } catch (error) {
            console.error('Error loading recent reviews:', error);
        }
    }
    
    displayCommentsList(comments) {
        // This would replace the current comments display
        console.log('Displaying comments:', comments);
        // TODO: Implement full comments list display
    }
    
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '<i class="fas fa-star"></i>'.repeat(fullStars) +
               (hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : '') +
               '<i class="far fa-star"></i>'.repeat(emptyStars);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return date.toLocaleDateString('vi-VN');
    }

    loadComments() {
        const stored = localStorage.getItem('quyenhair_comments');
        if (stored) {
            return JSON.parse(stored);
        }
        // Default sample comments
        return [
            {
                id: Date.now() + 1,
                name: 'Hương Giang',
                email: '',
                rating: 5,
                comment: 'Mình rất hài lòng với dịch vụ tại Quyền Hair. Tóc giả chất lượng cao, tạo kiểu đúng ý mình. Stylist rất tận tâm và chuyên nghiệp.',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                verified: true,
                helpful: 15,
                replies: []
            },
            {
                id: Date.now() + 2,
                name: 'Minh Anh',
                email: '',
                rating: 5,
                comment: 'Đội ngũ stylist rất giỏi, tư vấn kỹ lưỡng. Tóc giả mềm mại, tự nhiên như tóc thật. Showroom đẹp, sạch sẽ. Highly recommended!',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                verified: true,
                helpful: 23,
                replies: [
                    {
                        id: Date.now() + 20,
                        name: 'Quyền Hair',
                        comment: 'Cảm ơn chị Minh Anh đã tin tưởng! Chúng mình luôn cố gắng mang đến trải nghiệm tốt nhất ạ 💕',
                        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        isAdmin: true
                    }
                ]
            },
            {
                id: Date.now() + 3,
                name: 'Thu Hà',
                email: '',
                rating: 4,
                comment: 'Tóc đẹp, giá cả hợp lý. Chỉ tiếc là thời gian chờ hơi lâu vì đông khách. Nhưng nhìn chung vẫn rất ok!',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                verified: false,
                helpful: 8,
                replies: []
            }
        ];
    }

    saveComments() {
        localStorage.setItem('quyenhair_comments', JSON.stringify(this.comments));
    }

    setupStarRating() {
        const starRating = document.querySelector('.star-rating');
        if (!starRating) return;

        const stars = starRating.querySelectorAll('i');
        const ratingInput = document.getElementById('commentRating');

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const value = index + 1;
                ratingInput.value = value;
                starRating.dataset.rating = value;
                
                stars.forEach((s, i) => {
                    if (i < value) {
                        s.classList.remove('far');
                        s.classList.add('fas', 'active');
                    } else {
                        s.classList.remove('fas', 'active');
                        s.classList.add('far');
                    }
                });
            });

            star.addEventListener('mouseenter', () => {
                const value = index + 1;
                stars.forEach((s, i) => {
                    if (i < value) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });

        starRating.addEventListener('mouseleave', () => {
            const currentRating = parseInt(starRating.dataset.rating) || 0;
            stars.forEach((s, i) => {
                if (i < currentRating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
    }

    setupCommentForm() {
        const form = document.getElementById('commentForm');
        if (!form) return;

        // Auto-fill form if user is logged in
        window.addEventListener('userLoggedIn', (e) => {
            this.prefillCommentForm(e.detail);
        });

        // Check if user is already logged in
        const userData = localStorage.getItem('quyenhair_user') || sessionStorage.getItem('quyenhair_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.prefillCommentForm(user);
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        // Clear form on logout
        window.addEventListener('userLoggedOut', () => {
            document.getElementById('commentName').value = '';
            document.getElementById('commentEmail').value = '';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('commentName').value.trim();
            const email = document.getElementById('commentEmail').value.trim();
            const rating = parseInt(document.getElementById('commentRating').value);
            const comment = document.getElementById('commentText').value.trim();

            if (!name || !rating || !comment) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }

            const newComment = {
                id: Date.now(),
                name,
                email,
                rating,
                comment,
                date: new Date().toISOString(),
                verified: false,
                helpful: 0,
                replies: []
            };

            this.comments.unshift(newComment);
            this.saveComments();
            this.renderComments();
            this.updateStats();
            
            form.reset();
            document.querySelector('.star-rating').dataset.rating = 0;
            document.querySelectorAll('.star-rating i').forEach(s => {
                s.classList.remove('fas', 'active');
                s.classList.add('far');
            });

            // Scroll to new comment
            setTimeout(() => {
                const firstComment = document.querySelector('.comment-item');
                if (firstComment) {
                    firstComment.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstComment.style.animation = 'pulse 0.5s ease';
                }
            }, 100);

            alert('Cảm ơn bạn đã để lại đánh giá! 🎉');
        });
    }

    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                
                if (this.USE_API) {
                    // Use API filtering
                    if (filter === 'all') {
                        // Load all comments
                        this.currentFilter = 'all';
                        this.currentPage = 1;
                        this.renderComments();
                    } else if (filter === 'verified') {
                        await this.filterVerifiedReviews();
                    } else if (filter === 'recent') {
                        await this.filterRecentReviews();
                    } else if (['1', '2', '3', '4', '5'].includes(filter)) {
                        await this.filterReviewsByRating(filter);
                    }
                } else {
                    // Use localStorage filtering
                    this.currentFilter = filter;
                    this.currentPage = 1;
                    this.renderComments();
                }
            });
        });
    }

    setupLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreComments');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderComments(true);
            });
        }
    }

    filterComments() {
        switch (this.currentFilter) {
            case 'all':
                return this.comments;
            case 'positive':
                return this.comments.filter(c => c.rating >= 4);
            case '5':
            case '4':
            case '3':
                return this.comments.filter(c => c.rating === parseInt(this.currentFilter));
            default:
                return this.comments;
        }
    }

    renderComments(append = false) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;

        const filtered = this.filterComments();
        const startIndex = append ? (this.currentPage - 1) * this.commentsPerPage : 0;
        const endIndex = this.currentPage * this.commentsPerPage;
        const toDisplay = filtered.slice(startIndex, endIndex);

        if (!append) {
            commentsList.innerHTML = '';
        }

        if (toDisplay.length === 0 && !append) {
            commentsList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-2xl);">Chưa có đánh giá nào phù hợp với bộ lọc này.</p>';
            this.hideLoadMore();
            return;
        }

        toDisplay.forEach(comment => {
            const commentEl = this.createCommentElement(comment);
            commentsList.appendChild(commentEl);
        });

        // Show/hide load more button
        if (endIndex >= filtered.length) {
            this.hideLoadMore();
        } else {
            this.showLoadMore();
        }
    }

    createCommentElement(comment) {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.dataset.id = comment.id;

        const initials = comment.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        const date = new Date(comment.date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const stars = '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating);
        const verifiedBadge = comment.verified ? '<span class="comment-verified"><i class="fas fa-check-circle"></i> Đã xác minh</span>' : '';

        div.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">
                    <div class="comment-avatar">${initials}</div>
                    <div class="comment-author-info">
                        <h4>${this.escapeHtml(comment.name)}${verifiedBadge}</h4>
                        <div class="comment-date">${date}</div>
                    </div>
                </div>
                <div class="comment-rating">${stars}</div>
            </div>
            <div class="comment-body">${this.escapeHtml(comment.comment)}</div>
            <div class="comment-actions">
                <button class="comment-action-btn helpful-btn" data-id="${comment.id}">
                    <i class="far fa-thumbs-up"></i>
                    Hữu ích (${comment.helpful})
                </button>
                <button class="comment-action-btn reply-btn" data-id="${comment.id}">
                    <i class="far fa-comment"></i>
                    Trả lời
                </button>
            </div>
            ${comment.replies.length > 0 ? this.renderReplies(comment.replies) : ''}
            <div class="reply-form" style="display: none;" data-comment-id="${comment.id}">
                <textarea placeholder="Viết câu trả lời của bạn..."></textarea>
                <div class="reply-form-actions">
                    <button class="btn btn--primary btn--sm submit-reply">Gửi</button>
                    <button class="btn btn--outline btn--sm cancel-reply">Hủy</button>
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupCommentActions(div, comment);

        return div;
    }

    renderReplies(replies) {
        if (replies.length === 0) return '';

        const repliesHtml = replies.map(reply => {
            const initials = reply.name.split(' ').map(n => n[0]).join('').substring(0, 2);
            const date = new Date(reply.date).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const adminBadge = reply.isAdmin ? '<span class="comment-verified"><i class="fas fa-badge-check"></i> Quản trị viên</span>' : '';

            return `
                <div class="reply-item">
                    <div class="comment-header">
                        <div class="comment-author">
                            <div class="comment-avatar" style="width: 35px; height: 35px; font-size: 0.875rem;">${initials}</div>
                            <div class="comment-author-info">
                                <h4 style="font-size: 1rem;">${this.escapeHtml(reply.name)}${adminBadge}</h4>
                                <div class="comment-date">${date}</div>
                            </div>
                        </div>
                    </div>
                    <div class="comment-body" style="margin-top: var(--spacing-sm);">${this.escapeHtml(reply.comment)}</div>
                </div>
            `;
        }).join('');

        return `<div class="comment-replies">${repliesHtml}</div>`;
    }

    setupCommentActions(commentEl, comment) {
        // Helpful button
        const helpfulBtn = commentEl.querySelector('.helpful-btn');
        helpfulBtn.addEventListener('click', () => {
            const commentId = parseInt(helpfulBtn.dataset.id);
            const commentData = this.comments.find(c => c.id === commentId);
            if (commentData) {
                commentData.helpful++;
                this.saveComments();
                helpfulBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> Hữu ích (${commentData.helpful})`;
                helpfulBtn.style.color = 'var(--color-primary)';
                helpfulBtn.disabled = true;
            }
        });

        // Reply button
        const replyBtn = commentEl.querySelector('.reply-btn');
        const replyForm = commentEl.querySelector('.reply-form');
        
        replyBtn.addEventListener('click', () => {
            replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
        });

        // Cancel reply
        const cancelBtn = commentEl.querySelector('.cancel-reply');
        cancelBtn.addEventListener('click', () => {
            replyForm.style.display = 'none';
            replyForm.querySelector('textarea').value = '';
        });

        // Submit reply
        const submitBtn = commentEl.querySelector('.submit-reply');
        submitBtn.addEventListener('click', () => {
            const replyText = replyForm.querySelector('textarea').value.trim();
            if (!replyText) {
                alert('Vui lòng nhập nội dung trả lời!');
                return;
            }

            const reply = {
                id: Date.now(),
                name: 'Bạn',
                comment: replyText,
                date: new Date().toISOString(),
                isAdmin: false
            };

            comment.replies.push(reply);
            this.saveComments();
            this.renderComments();
            alert('Đã gửi câu trả lời!');
        });
    }

    updateStats() {
        const totalEl = document.getElementById('totalComments');
        if (totalEl) {
            totalEl.textContent = this.comments.length;
        }
    }

    prefillCommentForm(userData) {
        const nameInput = document.getElementById('commentName');
        const emailInput = document.getElementById('commentEmail');
        
        if (nameInput && userData.name) {
            nameInput.value = userData.name;
        }
        
        if (emailInput && userData.email) {
            emailInput.value = userData.email;
        }
    }

    showLoadMore() {
        const loadMoreSection = document.querySelector('.comments-load-more');
        if (loadMoreSection) {
            loadMoreSection.style.display = 'block';
        }
    }

    hideLoadMore() {
        const loadMoreSection = document.querySelector('.comments-load-more');
        if (loadMoreSection) {
            loadMoreSection.style.display = 'none';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ==========================================
// Authentication Handler
// ==========================================
class AuthHandler {
    constructor() {
        this.authModal = document.getElementById('authModal');
        this.userBtn = document.getElementById('userBtn');
        this.userDropdown = document.getElementById('userDropdown');
        this.loginTab = document.querySelector('[data-tab="login"]');
        this.registerTab = document.querySelector('[data-tab="register"]');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.emailLoginForm = document.getElementById('emailLoginForm');
        this.emailRegisterForm = document.getElementById('emailRegisterForm');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.currentUser = null;

        // OAuth configuration (demo - requires backend implementation)
        this.oauthConfig = {
            google: {
                clientId: 'YOUR_GOOGLE_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/google/callback',
                scope: 'profile email'
            },
            facebook: {
                appId: 'YOUR_FACEBOOK_APP_ID',
                redirectUri: window.location.origin + '/auth/facebook/callback',
                scope: 'email,public_profile'
            },
            instagram: {
                clientId: 'YOUR_INSTAGRAM_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/instagram/callback',
                scope: 'user_profile,user_media'
            }
        };

        this.init();
    }

    init() {
        if (!this.authModal || !this.userBtn) return;

        // Load user session
        this.loadUserSession();

        // Setup event listeners
        this.setupModalEvents();
        this.setupTabSwitching();
        this.setupSocialLogin();
        this.setupEmailLogin();
        this.setupEmailRegister();
        this.setupUserDropdown();
        this.setupLogout();
    }

    setupModalEvents() {
        // Open modal
        this.userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentUser) {
                this.userDropdown.classList.toggle('active');
            } else {
                this.openModal();
            }
        });

        // Close modal
        const closeBtn = this.authModal.querySelector('.auth-modal__close');
        closeBtn.addEventListener('click', () => this.closeModal());

        this.authModal.addEventListener('click', (e) => {
            if (e.target === this.authModal) {
                this.closeModal();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.userDropdown.contains(e.target) && e.target !== this.userBtn) {
                this.userDropdown.classList.remove('active');
            }
        });
    }

    setupTabSwitching() {
        this.loginTab.addEventListener('click', () => {
            this.switchTab('login');
        });

        this.registerTab.addEventListener('click', () => {
            this.switchTab('register');
        });
    }

    switchTab(tab) {
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Show corresponding form
        document.querySelectorAll('.auth-form-container').forEach(f => f.classList.remove('active'));
        document.getElementById(tab + 'Form').classList.add('active');
    }

    setupSocialLogin() {
        const socialBtns = document.querySelectorAll('.social-btn');
        
        socialBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                this.handleSocialLogin(provider);
            });
        });
    }

    handleSocialLogin(provider) {
        console.log(`Initiating ${provider} login...`);

        // Show loading state
        const btn = document.querySelector(`.social-btn[data-provider="${provider}"]`);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Đang kết nối...</span>';
        btn.disabled = true;

        // Simulate OAuth flow (in production, this would redirect to OAuth provider)
        setTimeout(() => {
            // Demo: Create mock user data
            const mockUserData = {
                id: Date.now(),
                name: provider === 'google' ? 'Nguyễn Văn A' : 
                      provider === 'facebook' ? 'Trần Thị B' : 'Lê Văn C',
                email: `user@${provider}.com`,
                provider: provider,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(provider === 'google' ? 'Nguyen Van A' : provider === 'facebook' ? 'Tran Thi B' : 'Le Van C')}&background=2874c7&color=fff`,
                verified: true
            };

            this.loginUser(mockUserData);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1500);

        // Production implementation would be:
        // window.location.href = this.getOAuthUrl(provider);
    }

    getOAuthUrl(provider) {
        const config = this.oauthConfig[provider];
        
        switch(provider) {
            case 'google':
                return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&response_type=code&scope=${config.scope}`;
            
            case 'facebook':
                return `https://www.facebook.com/v12.0/dialog/oauth?client_id=${config.appId}&redirect_uri=${config.redirectUri}&scope=${config.scope}`;
            
            case 'instagram':
                return `https://api.instagram.com/oauth/authorize?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&scope=${config.scope}&response_type=code`;
            
            default:
                console.error('Unknown provider:', provider);
                return null;
        }
    }

    setupEmailLogin() {
        this.emailLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(this.emailLoginForm);
            const email = formData.get('email');
            const password = formData.get('password');
            const remember = formData.get('remember');

            // Validate
            if (!email || !password) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            // Demo: Simulate login (in production, this would call backend API)
            const submitBtn = this.emailLoginForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
            submitBtn.disabled = true;

            setTimeout(() => {
                const userData = {
                    id: Date.now(),
                    name: email.split('@')[0],
                    email: email,
                    provider: 'email',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=2874c7&color=fff`,
                    verified: false
                };

                this.loginUser(userData, remember);
                submitBtn.innerHTML = 'Đăng nhập';
                submitBtn.disabled = false;
                this.emailLoginForm.reset();
            }, 1000);

            // Production implementation:
            // fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
        });
    }

    setupEmailRegister() {
        this.emailRegisterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(this.emailRegisterForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const terms = formData.get('terms');

            // Validate
            if (!name || !email || !password || !confirmPassword) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }

            if (password.length < 8) {
                alert('Mật khẩu phải có ít nhất 8 ký tự!');
                return;
            }

            if (!terms) {
                alert('Vui lòng đồng ý với điều khoản sử dụng!');
                return;
            }

            // Demo: Simulate registration
            const submitBtn = this.emailRegisterForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng ký...';
            submitBtn.disabled = true;

            setTimeout(() => {
                const userData = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    provider: 'email',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2874c7&color=fff`,
                    verified: false
                };

                this.loginUser(userData, true);
                submitBtn.innerHTML = 'Đăng ký';
                submitBtn.disabled = false;
                this.emailRegisterForm.reset();
                alert('Đăng ký thành công! Chào mừng bạn đến với Quyền Hair.');
            }, 1000);

            // Production: fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
        });
    }

    setupUserDropdown() {
        const dropdownLinks = this.userDropdown.querySelectorAll('a:not(#logoutBtn)');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.userDropdown.classList.remove('active');
            });
        });
    }

    setupLogout() {
        this.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logoutUser();
        });
    }

    loginUser(userData, rememberMe = false) {
        this.currentUser = userData;
        
        // Save to storage
        if (rememberMe) {
            localStorage.setItem('quyenhair_user', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('quyenhair_user', JSON.stringify(userData));
        }

        // Update UI
        this.updateUserUI();
        this.closeModal();

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userData }));
    }

    logoutUser() {
        this.currentUser = null;
        localStorage.removeItem('quyenhair_user');
        sessionStorage.removeItem('quyenhair_user');
        
        this.updateUserUI();
        this.userDropdown.classList.remove('active');

        // Dispatch custom event
        window.dispatchEvent(new Event('userLoggedOut'));
    }

    loadUserSession() {
        const userData = localStorage.getItem('quyenhair_user') || sessionStorage.getItem('quyenhair_user');
        
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUserUI();
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }

    updateUserUI() {
        if (this.currentUser) {
            // Update button
            this.userBtn.classList.add('logged-in');
            this.userBtn.setAttribute('aria-label', this.currentUser.name);

            // Update dropdown
            const avatar = this.userDropdown.querySelector('.user-dropdown__avatar');
            const nameEl = this.userDropdown.querySelector('.user-dropdown__name');
            const emailEl = this.userDropdown.querySelector('.user-dropdown__email');

            const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);
            avatar.textContent = initials;
            nameEl.textContent = this.currentUser.name;
            emailEl.textContent = this.currentUser.email;

            // Show verified badge if applicable
            if (this.currentUser.verified && !nameEl.querySelector('.fa-check-circle')) {
                nameEl.innerHTML += ' <i class="fas fa-check-circle" style="color: var(--color-primary); font-size: 0.875rem;"></i>';
            }
        } else {
            // Reset to default
            this.userBtn.classList.remove('logged-in');
            this.userBtn.setAttribute('aria-label', 'Đăng nhập');

            const avatar = this.userDropdown.querySelector('.user-dropdown__avatar');
            const nameEl = this.userDropdown.querySelector('.user-dropdown__name');
            const emailEl = this.userDropdown.querySelector('.user-dropdown__email');

            avatar.textContent = '';
            nameEl.textContent = 'Khách';
            emailEl.textContent = '';
        }
    }

    openModal() {
        this.authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.authModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    getCurrentUser() {
        return this.currentUser;
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
