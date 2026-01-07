/* ===========================================
   Dental Institute - Main JavaScript
   =========================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initFormValidation();
    initActiveNavigation();
    initAppointmentForm();
    initContactForm();
    initPatientPortal();
});

/* ===========================================
   Mobile Menu Toggle
   =========================================== */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

/* ===========================================
   Smooth Scroll
   =========================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/* ===========================================
   Scroll Animations
   =========================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .service-card, .team-card, .feature-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add staggered animation delay for grid items
                const siblings = entry.target.parentElement.children;
                const index = Array.from(siblings).indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/* ===========================================
   Active Navigation
   =========================================== */
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}` || 
                        link.getAttribute('href').includes(sectionId)) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
    
    // Set active state based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* ===========================================
   Form Validation
   =========================================== */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
    field.classList.remove('error');
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Required validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-+()]{10,}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Show error
    if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = errorMessage;
        errorElement.style.cssText = 'color: #dc3545; font-size: 0.85rem; margin-top: 0.25rem; display: block;';
        field.parentElement.appendChild(errorElement);
    }
    
    return isValid;
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/* ===========================================
   Appointment Form Handler
   =========================================== */
function initAppointmentForm() {
    const appointmentForm = document.getElementById('appointment-form');
    
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm(this)) {
                showAlert('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner"></span> Booking...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Get form data
                const formData = new FormData(this);
                const appointmentData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    service: formData.get('service'),
                    date: formData.get('date'),
                    time: formData.get('time'),
                    message: formData.get('message')
                };
                
                // Store appointment in localStorage (for demo)
                saveAppointment(appointmentData);
                
                // Reset form and show success
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                this.reset();
                
                showAlert('Appointment booked successfully! We will contact you shortly to confirm.', 'success');
            }, 1500);
        });
        
        // Set minimum date to today
        const dateInput = appointmentForm.querySelector('input[type="date"]');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    }
}

function saveAppointment(appointmentData) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointmentData.id = Date.now();
    appointmentData.status = 'Pending';
    appointmentData.createdAt = new Date().toISOString();
    appointments.unshift(appointmentData); // Add to beginning for latest first
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Trigger storage event for real-time sync with admin panel
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'appointments',
        newValue: JSON.stringify(appointments)
    }));
    
    // Also sync patient data
    syncPatientData(appointmentData);
}

function syncPatientData(appointmentData) {
    let patients = JSON.parse(localStorage.getItem('patients')) || [];
    
    // Check if patient exists
    const existingPatient = patients.find(
        p => p.email.toLowerCase() === appointmentData.email.toLowerCase()
    );
    
    if (existingPatient) {
        // Update existing patient
        existingPatient.lastVisit = appointmentData.date;
        existingPatient.totalVisits = (existingPatient.totalVisits || 0) + 1;
        existingPatient.phone = appointmentData.phone || existingPatient.phone;
    } else {
        // Create new patient
        const newPatient = {
            id: Date.now() + 1,
            name: appointmentData.name,
            email: appointmentData.email,
            phone: appointmentData.phone,
            dob: '',
            address: '',
            history: '',
            lastVisit: appointmentData.date,
            totalVisits: 1,
            createdAt: new Date().toISOString()
        };
        patients.unshift(newPatient);
    }
    
    localStorage.setItem('patients', JSON.stringify(patients));
    
    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'patients',
        newValue: JSON.stringify(patients)
    }));
}

/* ===========================================
   Contact Form Handler
   =========================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm(this)) {
                showAlert('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(this);
            const messageData = {
                id: Date.now(),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || '',
                subject: formData.get('subject') || 'General Inquiry',
                message: formData.get('message'),
                date: new Date().toISOString(),
                read: false
            };
            
            // Save message
            setTimeout(() => {
                saveContactMessage(messageData);
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                this.reset();
                
                showAlert('Thank you for your message! We will get back to you within 24 hours.', 'success');
            }, 1500);
        });
    }
}

function saveContactMessage(messageData) {
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.unshift(messageData);
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    
    // Trigger storage event for real-time sync with admin panel
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'contactMessages',
        newValue: JSON.stringify(messages)
    }));
}

/* ===========================================
   Patient Portal
   =========================================== */
function initPatientPortal() {
    const appointmentList = document.getElementById('appointment-list');
    
    if (appointmentList) {
        loadAppointments();
        initRealTimePatientUpdates();
    }
}

function loadAppointments() {
    const appointmentList = document.getElementById('appointment-list');
    if (!appointmentList) return;
    
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    if (appointments.length === 0) {
        appointmentList.innerHTML = `
            <div class="no-appointments">
                <p>No appointments found. <a href="appointments.html">Book your first appointment</a></p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    appointmentList.innerHTML = appointments.map(apt => `
        <div class="appointment-item ${apt.status ? apt.status.toLowerCase() : ''}">
            <div class="date">${formatDate(apt.date)} at ${apt.time || 'TBD'}</div>
            <div class="service">${apt.service}</div>
            <div class="status">${getStatusBadge(apt.status)}</div>
        </div>
    `).join('');
}

// Real-time updates for patient portal
function initRealTimePatientUpdates() {
    // Listen for storage changes
    window.addEventListener('storage', function(event) {
        if (event.key === 'appointments') {
            loadAppointments();
        }
    });
    
    // Refresh data periodically
    setInterval(loadAppointments, 30000); // Every 30 seconds
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getStatusBadge(status) {
    const colors = {
        'Pending': '#ffc107',
        'Confirmed': '#28a745',
        'Completed': '#17a2b8',
        'Cancelled': '#dc3545'
    };
    return `<span style="color: ${colors[status] || '#666'}">${status}</span>`;
}

/* ===========================================
   Alert System
   =========================================== */
function showAlert(message, type = 'success') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">&times;</button>
    `;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        max-width: 90%;
        width: 500px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

/* ===========================================
   Utility Functions
   =========================================== */

// Debounce function
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

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/* ===========================================
   Service Worker Registration (PWA Support)
   =========================================== */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker can be added later for offline support
        console.log('Dental Institute App loaded successfully');
    });
}

/* ===========================================
   Keyboard Navigation Support
   =========================================== */
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('nav ul');
        if (menuToggle && navMenu) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});

/* ===========================================
   Window Scroll Effects
   =========================================== */
window.addEventListener('scroll', throttle(function() {
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 100) {
            nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
        } else {
            nav.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        }
    }
}, 100));

/* ===========================================
   Export functions for external use
   =========================================== */
window.DentalInstitute = {
    showAlert,
    loadAppointments,
    saveAppointment,
    saveContactMessage,
    syncPatientData,
    validateForm
};
