# Quyền Hair Website

Modern, responsive website for Quyền Hair - a high-quality wig salon in Hanoi, Vietnam.

## 🌟 Features

### **Industry Best Practices Implemented**

✅ **SEO Optimized**
- Semantic HTML5 markup
- Meta tags (description, keywords, author)
- Open Graph tags for social media sharing
- Structured data (JSON-LD) for search engines
- Descriptive alt tags for all images
- Clean URL structure

✅ **Accessibility (A11Y)**
- ARIA labels and roles
- Skip navigation link
- Keyboard navigation support
- Screen reader friendly
- Focus visible states
- Semantic landmarks
- High contrast mode support

✅ **Performance Optimized**
- External CSS and JavaScript files
- Lazy loading for images
- Preconnect for external resources
- Minified assets ready
- Responsive images
- Efficient CSS with custom properties
- Debounced and throttled event handlers

✅ **Progressive Web App (PWA)**
- Service Worker for offline functionality
- Web App Manifest
- Installable on mobile devices
- Caching strategy for fast load times

✅ **Responsive Design**
- Mobile-first approach
- Tablet and desktop breakpoints
- Touch-friendly navigation
- Hamburger menu for mobile
- Flexible grid layouts

✅ **Modern JavaScript (ES6+)**
- Class-based architecture
- Modular code organization
- Error handling
- Performance monitoring ready
- Analytics integration ready

✅ **UX Enhancements**
- Smooth scrolling
- Animated elements on scroll
- Interactive navigation
- Quick contact buttons (WhatsApp/Phone)
- Scroll-to-top button
- Image carousel with Swiper.js

## 📁 Project Structure

```
Quyenhair/
├── index.html          # Main HTML file (use index-new.html)
├── index-new.html      # Enhanced HTML (rename to index.html)
├── styles.css          # External CSS with modern practices
├── script.js           # External JavaScript with ES6+ features
├── manifest.json       # PWA manifest file
├── sw.js               # Service Worker for offline support
├── robots.txt          # SEO robots file
├── .gitignore          # Git ignore file
├── README.md           # This file
└── public/
    ├── favicon.png     # Website icon
    └── models/         # Product images (1.jpg - 10.jpg)
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for testing PWA features)

### Installation

1. **Clone or download the repository**

2. **Replace the old index.html**
   ```bash
   mv index-new.html index.html
   ```

3. **Serve the website**
   
   **Option A: Using Python (recommended for testing)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option B: Using Node.js**
   ```bash
   npx serve
   ```
   
   **Option C: Using PHP**
   ```bash
   php -S localhost:8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎨 Customization

### Colors
Edit CSS custom properties in `styles.css`:
```css
:root {
    --color-primary: #4a90e2;
    --color-primary-dark: #2c3e50;
    /* ... more color variables */
}
```

### Typography
Update font family in `styles.css`:
```css
:root {
    --font-family-primary: 'Poppins', sans-serif;
}
```

### Content
- Update text in `index.html`
- Replace images in `public/models/`
- Update contact information

### Adding New Sections
Follow the existing structure:
```html
<section id="new-section" class="section section--white">
    <div class="container">
        <h2 class="section__title">Section Title</h2>
        <!-- Your content -->
    </div>
</section>
```

## 📱 PWA Installation

### Enable Service Worker
Add to your `index.html` before closing `</body>`:
```html
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) => console.log('Service Worker registration failed', err));
}
</script>
```

### Testing PWA
1. Serve over HTTPS (required for PWA)
2. Open DevTools → Application → Service Workers
3. Check "Offline" to test offline functionality

## 🔍 SEO Checklist

- [x] Meta description
- [x] Title tag optimization
- [x] Open Graph tags
- [x] Structured data (JSON-LD)
- [x] Semantic HTML
- [x] Alt tags for images
- [x] robots.txt file
- [x] Sitemap.xml (create if needed)
- [ ] Google Search Console verification
- [ ] Google Analytics integration
- [ ] Submit to search engines

## ♿ Accessibility Checklist

- [x] Skip navigation link
- [x] ARIA labels
- [x] Keyboard navigation
- [x] Focus indicators
- [x] Semantic HTML
- [x] Alt text for images
- [x] Color contrast
- [x] Reduced motion support
- [x] Screen reader tested

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Modern JavaScript features
- **Swiper.js** - Touch-enabled slider
- **Font Awesome** - Icons
- **Google Fonts** - Poppins font family

## 📊 Performance Tips

1. **Optimize Images**
   - Compress images before upload
   - Use WebP format for better compression
   - Implement responsive images with `srcset`

2. **Minify Assets**
   ```bash
   # CSS minification
   npx clean-css-cli styles.css -o styles.min.css
   
   # JavaScript minification
   npx terser script.js -o script.min.js
   ```

3. **Enable GZIP Compression**
   - Configure on your web server
   - Reduces file transfer size by ~70%

4. **Use a CDN**
   - Serve static assets from CDN
   - Improves load times globally

## 🔒 Security Best Practices

- Keep dependencies updated
- Use HTTPS in production
- Implement Content Security Policy (CSP)
- Sanitize user inputs (if forms are added)
- Regular security audits

## 📈 Analytics Integration

### Google Analytics 4
Add before closing `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (limited support)

## 📝 License

Copyright © 2024 Quyền Hair. All rights reserved.

## 👥 Contact

- **Phone**: +84 966 856 191
- **Email**: info@quyenhair.com
- **Address**: CC 101B, Khu đô thị Mailand, Sơn Đồng, Hà Nội

## 🤝 Contributing

This is a private business website. For suggestions or bug reports, please contact the owner.

## 📚 Additional Resources

- [HTML5 Semantic Elements](https://www.w3schools.com/html/html5_semantic_elements.asp)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Performance Best Practices](https://web.dev/fast/)

---

**Built with ❤️ following industry best practices**
