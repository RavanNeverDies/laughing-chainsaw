/* ===========================================
   SEO Enhancements & Core Features
   =========================================== */

document.addEventListener('DOMContentLoaded', function() {
    initCookieConsent();
    initStickyMobileCta();
    initBackToTop();
    initAnnouncementBar();
    initTestimonialsCarousel();
    initCountUpAnimation();
    initExitIntentPopup();
    initLazyLoading();
    initSocialProof();
    trackScrollDepth();
});

/* ===========================================
   Cookie Consent Banner
   =========================================== */
function initCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    if (!cookieConsent) return;
    
    // Check if user has already accepted/declined cookies
    const cookieChoice = localStorage.getItem('cookieConsent');
    
    if (!cookieChoice) {
        // Show cookie banner after 2 seconds
        setTimeout(() => {
            cookieConsent.classList.add('show');
        }, 2000);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    const cookieConsent = document.getElementById('cookieConsent');
    if (cookieConsent) {
        cookieConsent.classList.remove('show');
        cookieConsent.classList.add('hide');
        setTimeout(() => cookieConsent.remove(), 300);
    }
    // You can initialize analytics here
    console.log('Cookies accepted - Analytics can be initialized');
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    const cookieConsent = document.getElementById('cookieConsent');
    if (cookieConsent) {
        cookieConsent.classList.remove('show');
        cookieConsent.classList.add('hide');
        setTimeout(() => cookieConsent.remove(), 300);
    }
}

// Make functions globally available
window.acceptCookies = acceptCookies;
window.declineCookies = declineCookies;

/* ===========================================
   Sticky Mobile CTA
   =========================================== */
function initStickyMobileCta() {
    const stickyCta = document.getElementById('stickyCta');
    if (!stickyCta) return;
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateStickyCta() {
        if (window.scrollY > 300) {
            stickyCta.classList.add('visible');
            
            // Hide when scrolling up, show when scrolling down
            if (window.scrollY < lastScrollY) {
                stickyCta.classList.add('hidden');
            } else {
                stickyCta.classList.remove('hidden');
            }
        } else {
            stickyCta.classList.remove('visible');
        }
        lastScrollY = window.scrollY;
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateStickyCta);
            ticking = true;
        }
    });
}

/* ===========================================
   Back to Top Button
   =========================================== */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ===========================================
   Announcement Bar
   =========================================== */
function initAnnouncementBar() {
    const announcementBar = document.querySelector('.announcement-bar');
    if (!announcementBar) return;
    
    // Check if user has dismissed it today
    const dismissedDate = localStorage.getItem('announcementDismissed');
    const today = new Date().toDateString();
    
    if (dismissedDate === today) {
        announcementBar.style.display = 'none';
        return;
    }
    
    // Add close button functionality if needed
    const closeBtn = announcementBar.querySelector('.announcement-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            announcementBar.style.display = 'none';
            localStorage.setItem('announcementDismissed', today);
        });
    }
}

/* ===========================================
   Testimonials Carousel
   =========================================== */
function initTestimonialsCarousel() {
    const testimonialGrid = document.querySelector('.testimonial-grid');
    if (!testimonialGrid || window.innerWidth > 768) return;
    
    const testimonials = testimonialGrid.querySelectorAll('.testimonial-card');
    if (testimonials.length <= 1) return;
    
    let currentIndex = 0;
    
    // Auto-rotate testimonials on mobile
    setInterval(() => {
        testimonials[currentIndex].classList.remove('active-testimonial');
        currentIndex = (currentIndex + 1) % testimonials.length;
        testimonials[currentIndex].classList.add('active-testimonial');
    }, 5000);
}

/* ===========================================
   Count Up Animation for Stats
   =========================================== */
function initCountUpAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const match = text.match(/(\d+)/);
                
                if (match) {
                    const finalNumber = parseInt(match[0]);
                    const suffix = text.replace(/[\d,]/g, '');
                    animateCount(target, 0, finalNumber, suffix);
                }
                
                observer.unobserve(target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCount(element, start, end, suffix) {
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        element.textContent = current.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

/* ===========================================
   Exit Intent Popup
   =========================================== */
function initExitIntentPopup() {
    // Only show exit popup once per session
    if (sessionStorage.getItem('exitPopupShown')) return;
    
    let popupShown = false;
    
    document.addEventListener('mouseout', function(e) {
        if (popupShown) return;
        
        // Check if mouse is leaving the viewport from the top
        if (e.clientY < 10 && e.relatedTarget === null) {
            showExitPopup();
            popupShown = true;
            sessionStorage.setItem('exitPopupShown', 'true');
        }
    });
}

function showExitPopup() {
    // Create popup if it doesn't exist
    if (document.getElementById('exitPopup')) return;
    
    const popup = document.createElement('div');
    popup.id = 'exitPopup';
    popup.className = 'exit-popup';
    popup.innerHTML = `
        <div class="exit-popup-overlay" onclick="closeExitPopup()"></div>
        <div class="exit-popup-content">
            <button class="exit-popup-close" onclick="closeExitPopup()" aria-label="Close popup">&times;</button>
            <div class="exit-popup-icon">🦷</div>
            <h3>Wait! Don't Leave Without Your Gift!</h3>
            <p>Get a <strong>FREE Dental Checkup + X-Ray</strong> (Worth ₹1,500) when you book your first appointment today!</p>
            <a href="appointments.html" class="btn btn-primary btn-large" style="width: 100%; margin-top: 1rem;">Claim My FREE Checkup</a>
            <p class="exit-popup-note">No credit card required. Limited spots available.</p>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);
}

function closeExitPopup() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }
}

window.closeExitPopup = closeExitPopup;

/* ===========================================
   Lazy Loading for Images
   =========================================== */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (!lazyImages.length) return;
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

/* ===========================================
   Social Proof Notifications
   =========================================== */
function initSocialProof() {
    // Only show on specific pages
    const currentPage = window.location.pathname;
    if (!currentPage.includes('index') && currentPage !== '/' && !currentPage.endsWith('/')) return;
    
    const socialProofData = [
        { name: 'Priya S.', city: 'Varanasi', action: 'just booked a teeth whitening appointment', time: '2 minutes ago' },
        { name: 'Rahul K.', city: 'Lucknow', action: 'completed their smile makeover', time: '5 minutes ago' },
        { name: 'Anita P.', city: 'Varanasi', action: 'scheduled a dental checkup', time: '8 minutes ago' },
        { name: 'Vikram M.', city: 'Allahabad', action: 'got their braces consultation', time: '12 minutes ago' },
        { name: 'Sneha T.', city: 'Varanasi', action: 'booked an emergency appointment', time: '15 minutes ago' }
    ];
    
    let currentIndex = 0;
    
    function showSocialProofNotification() {
        const data = socialProofData[currentIndex];
        
        // Remove existing notification
        const existing = document.querySelector('.social-proof-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'social-proof-notification';
        notification.innerHTML = `
            <div class="social-proof-avatar">${data.name.charAt(0)}</div>
            <div class="social-proof-content">
                <p><strong>${data.name}</strong> from ${data.city}</p>
                <p class="social-proof-action">${data.action}</p>
                <p class="social-proof-time">${data.time}</p>
            </div>
            <button class="social-proof-close" onclick="this.parentElement.remove()" aria-label="Close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        currentIndex = (currentIndex + 1) % socialProofData.length;
    }
    
    // Show first notification after 10 seconds
    setTimeout(showSocialProofNotification, 10000);
    
    // Show subsequent notifications every 30 seconds
    setInterval(showSocialProofNotification, 30000);
}

/* ===========================================
   Scroll Depth Tracking (for Analytics)
   =========================================== */
function trackScrollDepth() {
    let scrolled25 = false;
    let scrolled50 = false;
    let scrolled75 = false;
    let scrolled100 = false;
    
    function getScrollPercent() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return Math.round((scrollTop / scrollHeight) * 100);
    }
    
    window.addEventListener('scroll', function() {
        const scrollPercent = getScrollPercent();
        
        if (scrollPercent >= 25 && !scrolled25) {
            scrolled25 = true;
            console.log('Scroll Depth: 25%');
            // Send to analytics
        }
        if (scrollPercent >= 50 && !scrolled50) {
            scrolled50 = true;
            console.log('Scroll Depth: 50%');
        }
        if (scrollPercent >= 75 && !scrolled75) {
            scrolled75 = true;
            console.log('Scroll Depth: 75%');
        }
        if (scrollPercent >= 90 && !scrolled100) {
            scrolled100 = true;
            console.log('Scroll Depth: 100%');
        }
    });
}

/* ===========================================
   Performance Monitoring
   =========================================== */
if ('PerformanceObserver' in window) {
    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
}

/* ===========================================
   Utility: Debounce function
   =========================================== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
