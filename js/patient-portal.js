/* ===========================================
   Patient Portal JavaScript
   =========================================== */

// Patient State
const PatientState = {
    isLoggedIn: false,
    currentUser: null,
    appointments: [],
    records: [],
    prescriptions: [],
    transactions: [],
    notifications: []
};

// Demo Patient Credentials
const DEMO_PATIENT = {
    email: 'patient@demo.com',
    password: 'patient123',
    profile: {
        id: 1,
        fname: 'Rahul',
        lname: 'Sharma',
        email: 'patient@demo.com',
        phone: '+91 9876543210',
        dob: '1990-05-15',
        gender: 'male',
        address: '456 Park Street, Varanasi, UP 221001',
        bloodGroup: 'B+',
        emergencyContact: {
            name: 'Priya Sharma',
            relation: 'spouse',
            phone: '+91 9876543211'
        }
    }
};

/* ===========================================
   Initialization
   =========================================== */
document.addEventListener('DOMContentLoaded', function() {
    checkPatientAuth();
    initPatientEventListeners();
    initTabSwitching();
    initDashboardNavigation();
});

function checkPatientAuth() {
    const isLoggedIn = sessionStorage.getItem('patientLoggedIn') === 'true';
    const rememberMe = localStorage.getItem('patientRememberMe') === 'true';
    
    if (isLoggedIn || rememberMe) {
        PatientState.isLoggedIn = true;
        PatientState.currentUser = JSON.parse(sessionStorage.getItem('patientUser') || localStorage.getItem('patientUser') || '{}');
        showPatientDashboard();
    } else {
        showLoginModal();
    }
}

function initPatientEventListeners() {
    // Login Form
    const loginForm = document.getElementById('patient-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handlePatientLogin);
    }
    
    // Register Form
    const registerForm = document.getElementById('patient-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handlePatientRegistration);
    }
    
    // Personal Info Form
    const personalForm = document.getElementById('personal-info-form');
    if (personalForm) {
        personalForm.addEventListener('submit', handlePersonalInfoUpdate);
    }
    
    // Security Form
    const securityForm = document.getElementById('security-form');
    if (securityForm) {
        securityForm.addEventListener('submit', handlePasswordUpdate);
    }
    
    // Emergency Contact Form
    const emergencyForm = document.getElementById('emergency-contact-form');
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', handleEmergencyContactUpdate);
    }
    
    // Appointment tabs
    const aptTabs = document.querySelectorAll('.apt-tab');
    aptTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            aptTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterAppointments(this.dataset.filter);
        });
    });
}

function initTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function initDashboardNavigation() {
    const navPills = document.querySelectorAll('.nav-pill');
    navPills.forEach(pill => {
        pill.addEventListener('click', function() {
            const section = this.dataset.section;
            switchDashboardSection(section);
        });
    });
}

/* ===========================================
   Authentication
   =========================================== */
function handlePatientLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-patient').checked;
    
    // Check demo credentials or stored patients
    const patients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');
    const storedPatient = patients.find(p => p.email === email && p.password === password);
    
    if ((email === DEMO_PATIENT.email && password === DEMO_PATIENT.password) || storedPatient) {
        const userProfile = storedPatient ? storedPatient : DEMO_PATIENT.profile;
        
        PatientState.isLoggedIn = true;
        PatientState.currentUser = userProfile;
        
        sessionStorage.setItem('patientLoggedIn', 'true');
        sessionStorage.setItem('patientUser', JSON.stringify(userProfile));
        
        if (remember) {
            localStorage.setItem('patientRememberMe', 'true');
            localStorage.setItem('patientUser', JSON.stringify(userProfile));
        }
        
        showPatientDashboard();
        showPatientAlert('Welcome back! Login successful.', 'success');
    } else {
        showPatientAlert('Invalid email or password. Try demo: patient@demo.com / patient123', 'error');
    }
}

function handlePatientRegistration(e) {
    e.preventDefault();
    
    const fname = document.getElementById('register-fname').value.trim();
    const lname = document.getElementById('register-lname').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const dob = document.getElementById('register-dob').value;
    const gender = document.getElementById('register-gender').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    // Validation
    if (password !== confirm) {
        showPatientAlert('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 8) {
        showPatientAlert('Password must be at least 8 characters!', 'error');
        return;
    }
    
    // Check if email already exists
    const patients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');
    if (patients.find(p => p.email === email)) {
        showPatientAlert('Email already registered. Please login instead.', 'error');
        return;
    }
    
    // Create new patient
    const newPatient = {
        id: Date.now(),
        fname,
        lname,
        email,
        phone,
        dob,
        gender,
        password,
        address: '',
        bloodGroup: '',
        emergencyContact: {},
        createdAt: new Date().toISOString()
    };
    
    patients.push(newPatient);
    localStorage.setItem('registeredPatients', JSON.stringify(patients));
    
    // Auto login
    PatientState.isLoggedIn = true;
    PatientState.currentUser = newPatient;
    sessionStorage.setItem('patientLoggedIn', 'true');
    sessionStorage.setItem('patientUser', JSON.stringify(newPatient));
    
    showPatientDashboard();
    showPatientAlert('Registration successful! Welcome to Dental Institute.', 'success');
}

function patientLogout() {
    PatientState.isLoggedIn = false;
    PatientState.currentUser = null;
    
    sessionStorage.removeItem('patientLoggedIn');
    sessionStorage.removeItem('patientUser');
    localStorage.removeItem('patientRememberMe');
    localStorage.removeItem('patientUser');
    
    showLoginModal();
    showPatientAlert('You have been logged out successfully.', 'info');
}

/* ===========================================
   Dashboard Display
   =========================================== */
function showLoginModal() {
    const loginModal = document.getElementById('patient-login-modal');
    const dashboard = document.getElementById('patient-dashboard');
    
    if (loginModal) loginModal.style.display = 'flex';
    if (dashboard) dashboard.classList.add('hidden');
}

function showPatientDashboard() {
    const loginModal = document.getElementById('patient-login-modal');
    const dashboard = document.getElementById('patient-dashboard');
    
    if (loginModal) loginModal.style.display = 'none';
    if (dashboard) dashboard.classList.remove('hidden');
    
    // Update user info
    updateDashboardUser();
    
    // Load data
    loadPatientData();
}

function updateDashboardUser() {
    const user = PatientState.currentUser;
    if (!user) return;
    
    const nameEl = document.getElementById('patient-name');
    const avatarEl = document.getElementById('patient-avatar');
    
    if (nameEl) {
        nameEl.textContent = user.fname || user.name || 'Patient';
    }
    
    if (avatarEl) {
        avatarEl.textContent = (user.fname ? user.fname.charAt(0) : 'P').toUpperCase();
    }
    
    // Update settings form
    if (document.getElementById('settings-fname')) {
        document.getElementById('settings-fname').value = user.fname || '';
        document.getElementById('settings-lname').value = user.lname || '';
        document.getElementById('settings-email').value = user.email || '';
        document.getElementById('settings-phone').value = user.phone || '';
        document.getElementById('settings-dob').value = user.dob || '';
        document.getElementById('settings-address').value = user.address || '';
    }
    
    // Update emergency contact
    if (user.emergencyContact && document.getElementById('emergency-name')) {
        document.getElementById('emergency-name').value = user.emergencyContact.name || '';
        document.getElementById('emergency-relation').value = user.emergencyContact.relation || '';
        document.getElementById('emergency-phone').value = user.emergencyContact.phone || '';
    }
}

function loadPatientData() {
    loadPatientAppointments();
    loadPatientRecords();
    loadPatientPrescriptions();
    loadPatientTransactions();
    loadPatientNotifications();
    updateOverviewStats();
    loadRecentActivity();
}

/* ===========================================
   Dashboard Sections
   =========================================== */
function switchDashboardSection(sectionId) {
    // Update nav pills
    document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.section === sectionId);
    });
    
    // Show/hide sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionId}`);
    });
    
    // Scroll to top of content
    document.querySelector('.dashboard-content').scrollTop = 0;
}

/* ===========================================
   Appointments
   =========================================== */
function loadPatientAppointments() {
    const userEmail = PatientState.currentUser?.email;
    if (!userEmail) return;
    
    // Get appointments from storage
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    PatientState.appointments = allAppointments.filter(
        apt => apt.email && apt.email.toLowerCase() === userEmail.toLowerCase()
    );
    
    renderPatientAppointments('upcoming');
    updateNextAppointment();
}

function renderPatientAppointments(filter = 'upcoming') {
    const container = document.getElementById('patient-appointments-list');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    let filtered = [...PatientState.appointments];
    
    switch(filter) {
        case 'upcoming':
            filtered = filtered.filter(apt => 
                apt.date >= today && apt.status !== 'Cancelled'
            ).sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'past':
            filtered = filtered.filter(apt => 
                apt.date < today || apt.status === 'Completed'
            ).sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'cancelled':
            filtered = filtered.filter(apt => apt.status === 'Cancelled')
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <span class="no-data-icon">📅</span>
                <p>No ${filter} appointments found.</p>
                <a href="appointments.html" class="btn btn-primary">Book Appointment</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(apt => `
        <div class="appointment-card ${apt.status ? apt.status.toLowerCase() : ''}">
            <div class="apt-date-badge">
                <span class="apt-day">${new Date(apt.date).getDate()}</span>
                <span class="apt-month">${new Date(apt.date).toLocaleString('en', { month: 'short' })}</span>
            </div>
            <div class="apt-details">
                <h4>${apt.service}</h4>
                <p class="apt-time">🕐 ${apt.time || 'TBD'}</p>
                <p class="apt-doctor">👨‍⚕️ ${apt.doctor || 'Any Available Doctor'}</p>
            </div>
            <div class="apt-status">
                <span class="status-badge status-${(apt.status || 'pending').toLowerCase()}">${apt.status || 'Pending'}</span>
                ${apt.status !== 'Cancelled' && apt.status !== 'Completed' && apt.date >= today ? `
                    <div class="apt-actions">
                        <button class="btn-icon" onclick="rescheduleAppointment(${apt.id})" title="Reschedule">📅</button>
                        <button class="btn-icon" onclick="cancelAppointment(${apt.id})" title="Cancel">❌</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function filterAppointments(filter) {
    renderPatientAppointments(filter);
}

function updateNextAppointment() {
    const container = document.getElementById('next-appointment-details');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    const upcoming = PatientState.appointments
        .filter(apt => apt.date >= today && apt.status !== 'Cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcoming.length === 0) {
        container.innerHTML = `
            <p class="no-data">No upcoming appointments. <a href="appointments.html">Book one now!</a></p>
        `;
        return;
    }
    
    const next = upcoming[0];
    container.innerHTML = `
        <div class="next-apt-info">
            <div class="next-apt-main">
                <h4>${next.service}</h4>
                <p class="next-apt-datetime">
                    📅 ${formatDateLong(next.date)} at ${next.time || 'TBD'}
                </p>
                <p class="next-apt-doctor">👨‍⚕️ ${next.doctor || 'Any Available Doctor'}</p>
            </div>
            <div class="next-apt-status">
                <span class="status-badge status-${(next.status || 'pending').toLowerCase()}">${next.status || 'Pending'}</span>
            </div>
        </div>
        <div class="next-apt-actions">
            <a href="appointments.html" class="btn btn-secondary btn-sm">Reschedule</a>
            <button class="btn btn-secondary btn-sm" onclick="cancelAppointment(${next.id})">Cancel</button>
            <button class="btn btn-primary btn-sm" onclick="getDirections()">Get Directions</button>
        </div>
    `;
}

function rescheduleAppointment(id) {
    showPatientAlert('Redirecting to reschedule your appointment...', 'info');
    setTimeout(() => {
        window.location.href = 'appointments.html';
    }, 1000);
}

function cancelAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const index = appointments.findIndex(apt => apt.id === id);
        
        if (index !== -1) {
            appointments[index].status = 'Cancelled';
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            loadPatientAppointments();
            updateOverviewStats();
            showPatientAlert('Appointment cancelled successfully.', 'success');
        }
    }
}

/* ===========================================
   Medical Records
   =========================================== */
function loadPatientRecords() {
    // Generate demo records
    PatientState.records = generateDemoRecords();
    renderTreatmentHistory();
    renderXrayRecords();
    renderDentalChart();
}

function generateDemoRecords() {
    return [
        {
            id: 1,
            date: '2024-12-15',
            treatment: 'Root Canal Treatment',
            tooth: '16',
            doctor: 'Dr. Vikram Verma',
            notes: 'Successful root canal on upper first molar',
            cost: 8000
        },
        {
            id: 2,
            date: '2024-11-20',
            treatment: 'Teeth Cleaning',
            tooth: 'Full Mouth',
            doctor: 'Dr. Priya Sharma',
            notes: 'Routine professional cleaning completed',
            cost: 1000
        },
        {
            id: 3,
            date: '2024-10-05',
            treatment: 'Cavity Filling',
            tooth: '36',
            doctor: 'Dr. Amit Patel',
            notes: 'Composite filling on lower first molar',
            cost: 1500
        },
        {
            id: 4,
            date: '2024-08-15',
            treatment: 'General Checkup',
            tooth: 'Full Mouth',
            doctor: 'Dr. Vikram Verma',
            notes: 'Regular checkup, all clear',
            cost: 500
        }
    ];
}

function renderTreatmentHistory() {
    const container = document.getElementById('treatment-history');
    if (!container) return;
    
    if (PatientState.records.length === 0) {
        container.innerHTML = '<p class="no-data">No treatment history available</p>';
        return;
    }
    
    container.innerHTML = PatientState.records.map(record => `
        <div class="treatment-item">
            <div class="treatment-date">${formatDateShort(record.date)}</div>
            <div class="treatment-details">
                <h4>${record.treatment}</h4>
                <p><strong>Tooth:</strong> ${record.tooth}</p>
                <p><strong>Doctor:</strong> ${record.doctor}</p>
                <p class="treatment-notes">${record.notes}</p>
            </div>
            <div class="treatment-cost">₹${record.cost.toLocaleString()}</div>
        </div>
    `).join('');
}

function renderXrayRecords() {
    const container = document.getElementById('xray-records');
    if (!container) return;
    
    // Demo X-ray records
    const xrays = [
        { id: 1, date: '2024-12-15', type: 'Periapical X-Ray', tooth: '16' },
        { id: 2, date: '2024-08-15', type: 'Full Mouth X-Ray', tooth: 'All' },
        { id: 3, date: '2024-05-10', type: 'Bitewing X-Ray', tooth: '14-17' }
    ];
    
    container.innerHTML = xrays.map(xray => `
        <div class="xray-item">
            <div class="xray-icon">📷</div>
            <div class="xray-details">
                <h4>${xray.type}</h4>
                <p>Tooth: ${xray.tooth} | ${formatDateShort(xray.date)}</p>
            </div>
            <button class="btn-icon" onclick="viewXray(${xray.id})" title="View">👁️</button>
        </div>
    `).join('');
}

function renderDentalChart() {
    // Set tooth statuses based on treatment history
    const toothStatuses = {
        '16': 'treated',
        '36': 'treated',
        '18': 'missing',
        '28': 'missing',
        '38': 'missing',
        '48': 'missing',
        '45': 'needs-attention'
    };
    
    document.querySelectorAll('.tooth').forEach(tooth => {
        const toothNum = tooth.dataset.tooth;
        const status = toothStatuses[toothNum] || 'healthy';
        tooth.classList.add(status);
    });
}

function downloadRecords() {
    showPatientAlert('Preparing your medical records for download...', 'info');
    setTimeout(() => {
        showPatientAlert('Download started! (Demo - no actual file)', 'success');
    }, 1500);
}

function viewXray(id) {
    showPatientAlert('Opening X-Ray viewer... (Demo)', 'info');
}

function editAllergies() {
    const allergies = prompt('Enter your allergies (comma separated):');
    if (allergies !== null) {
        const container = document.getElementById('allergies-list');
        if (container) {
            const allergyArray = allergies.split(',').map(a => a.trim()).filter(a => a);
            if (allergyArray.length > 0) {
                container.innerHTML = allergyArray.map(a => `
                    <span class="allergy-tag">⚠️ ${a}</span>
                `).join('');
            } else {
                container.innerHTML = '<p class="no-data">No allergies recorded</p>';
            }
        }
        showPatientAlert('Allergies updated successfully!', 'success');
    }
}

/* ===========================================
   Prescriptions
   =========================================== */
function loadPatientPrescriptions() {
    PatientState.prescriptions = [
        {
            id: 1,
            date: '2024-12-15',
            doctor: 'Dr. Vikram Verma',
            medications: [
                { name: 'Amoxicillin 500mg', dosage: '1 capsule 3 times daily', duration: '7 days' },
                { name: 'Ibuprofen 400mg', dosage: '1 tablet as needed for pain', duration: 'As needed' }
            ],
            notes: 'Complete full course of antibiotics',
            status: 'Active'
        },
        {
            id: 2,
            date: '2024-10-05',
            doctor: 'Dr. Amit Patel',
            medications: [
                { name: 'Sensodyne Toothpaste', dosage: 'Use twice daily', duration: 'Ongoing' }
            ],
            notes: 'For tooth sensitivity after filling',
            status: 'Completed'
        }
    ];
    
    renderPrescriptions();
}

function renderPrescriptions() {
    const container = document.getElementById('prescriptions-list');
    if (!container) return;
    
    if (PatientState.prescriptions.length === 0) {
        container.innerHTML = '<p class="no-data">No prescriptions available</p>';
        return;
    }
    
    container.innerHTML = PatientState.prescriptions.map(rx => `
        <div class="prescription-card ${rx.status.toLowerCase()}">
            <div class="rx-header">
                <div class="rx-info">
                    <h4>Prescription #${rx.id}</h4>
                    <p>📅 ${formatDateShort(rx.date)} | 👨‍⚕️ ${rx.doctor}</p>
                </div>
                <span class="status-badge status-${rx.status.toLowerCase()}">${rx.status}</span>
            </div>
            <div class="rx-medications">
                ${rx.medications.map(med => `
                    <div class="medication-item">
                        <strong>💊 ${med.name}</strong>
                        <p>Dosage: ${med.dosage}</p>
                        <p>Duration: ${med.duration}</p>
                    </div>
                `).join('')}
            </div>
            ${rx.notes ? `<p class="rx-notes">📝 ${rx.notes}</p>` : ''}
            <div class="rx-actions">
                <button class="btn btn-secondary btn-sm" onclick="downloadPrescription(${rx.id})">📥 Download</button>
                ${rx.status === 'Active' ? `<button class="btn btn-primary btn-sm" onclick="requestRefill(${rx.id})">🔄 Request Refill</button>` : ''}
            </div>
        </div>
    `).join('');
}

function downloadPrescription(id) {
    showPatientAlert('Downloading prescription... (Demo)', 'info');
}

function requestRefill(id) {
    showPatientAlert('Refill request sent to your doctor!', 'success');
}

/* ===========================================
   Billing
   =========================================== */
function loadPatientTransactions() {
    PatientState.transactions = [
        { id: 1, date: '2024-12-15', description: 'Root Canal Treatment', amount: -8000, type: 'charge' },
        { id: 2, date: '2024-12-15', description: 'Payment - Card', amount: 5000, type: 'payment' },
        { id: 3, date: '2024-11-20', description: 'Teeth Cleaning', amount: -1000, type: 'charge' },
        { id: 4, date: '2024-11-20', description: 'Payment - UPI', amount: 1000, type: 'payment' },
        { id: 5, date: '2024-10-05', description: 'Cavity Filling', amount: -1500, type: 'charge' },
        { id: 6, date: '2024-10-05', description: 'Payment - Cash', amount: 1500, type: 'payment' }
    ];
    
    renderTransactions();
    updateBillingSummary();
}

function renderTransactions() {
    const container = document.getElementById('transactions-list');
    if (!container) return;
    
    container.innerHTML = PatientState.transactions.map(tx => `
        <div class="transaction-item ${tx.type}">
            <div class="tx-date">${formatDateShort(tx.date)}</div>
            <div class="tx-description">${tx.description}</div>
            <div class="tx-amount ${tx.amount > 0 ? 'credit' : 'debit'}">
                ${tx.amount > 0 ? '+' : ''}₹${Math.abs(tx.amount).toLocaleString()}
            </div>
        </div>
    `).join('');
}

function updateBillingSummary() {
    const charges = PatientState.transactions.filter(tx => tx.type === 'charge').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const payments = PatientState.transactions.filter(tx => tx.type === 'payment').reduce((sum, tx) => sum + tx.amount, 0);
    const balance = charges - payments;
    
    const balanceEl = document.getElementById('outstanding-balance');
    const lastPaymentEl = document.getElementById('last-payment');
    const lastPaymentDateEl = document.getElementById('last-payment-date');
    const totalPaidEl = document.getElementById('total-paid');
    
    if (balanceEl) balanceEl.textContent = `₹${balance.toLocaleString()}`;
    if (totalPaidEl) totalPaidEl.textContent = `₹${payments.toLocaleString()}`;
    
    const lastPayment = PatientState.transactions.find(tx => tx.type === 'payment');
    if (lastPayment && lastPaymentEl && lastPaymentDateEl) {
        lastPaymentEl.textContent = `₹${lastPayment.amount.toLocaleString()}`;
        lastPaymentDateEl.textContent = formatDateShort(lastPayment.date);
    }
    
    // Update overview
    const balanceDueEl = document.getElementById('balance-due');
    if (balanceDueEl) balanceDueEl.textContent = `₹${balance.toLocaleString()}`;
}

function makePayment() {
    showPatientAlert('Redirecting to payment gateway... (Demo)', 'info');
}

function addInsurance() {
    showPatientAlert('Insurance form will be available soon!', 'info');
}

/* ===========================================
   Notifications
   =========================================== */
function loadPatientNotifications() {
    PatientState.notifications = [
        { id: 1, message: 'Your appointment on Dec 20 is confirmed', date: new Date().toISOString(), read: false, type: 'appointment' },
        { id: 2, message: 'Complete your profile to get better recommendations', date: new Date(Date.now() - 86400000).toISOString(), read: false, type: 'info' },
        { id: 3, message: 'You have an outstanding balance of ₹3,000', date: new Date(Date.now() - 172800000).toISOString(), read: true, type: 'billing' }
    ];
    
    updateNotificationCount();
}

function updateNotificationCount() {
    const unread = PatientState.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('patient-notification-count');
    if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'inline-flex' : 'none';
    }
}

function showNotifications() {
    const modal = document.getElementById('patient-notifications-modal');
    const container = document.getElementById('patient-notifications-list');
    
    if (container) {
        container.innerHTML = PatientState.notifications.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead(${n.id})">
                <span class="notification-icon">${getNotificationIcon(n.type)}</span>
                <div class="notification-content">
                    <p>${n.message}</p>
                    <span class="notification-time">${formatRelativeTime(n.date)}</span>
                </div>
            </div>
        `).join('');
    }
    
    if (modal) modal.classList.remove('hidden');
}

function markNotificationRead(id) {
    const notification = PatientState.notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        updateNotificationCount();
    }
}

function getNotificationIcon(type) {
    const icons = {
        appointment: '📅',
        billing: '💳',
        info: 'ℹ️',
        reminder: '⏰'
    };
    return icons[type] || '🔔';
}

/* ===========================================
   Overview Stats
   =========================================== */
function updateOverviewStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const upcoming = PatientState.appointments.filter(
        apt => apt.date >= today && apt.status !== 'Cancelled'
    ).length;
    
    const completed = PatientState.appointments.filter(
        apt => apt.status === 'Completed' || apt.date < today
    ).length;
    
    const activePrescriptions = PatientState.prescriptions.filter(
        rx => rx.status === 'Active'
    ).length;
    
    const upcomingEl = document.getElementById('upcoming-count');
    const completedEl = document.getElementById('completed-count');
    const prescriptionEl = document.getElementById('prescription-count');
    
    if (upcomingEl) upcomingEl.textContent = upcoming;
    if (completedEl) completedEl.textContent = completed;
    if (prescriptionEl) prescriptionEl.textContent = activePrescriptions;
}

function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    const activities = [
        { icon: '📅', text: 'Appointment confirmed for Dec 20', time: '2 hours ago' },
        { icon: '💊', text: 'New prescription added', time: 'Yesterday' },
        { icon: '💳', text: 'Payment of ₹5,000 received', time: '3 days ago' },
        { icon: '✅', text: 'Treatment completed: Root Canal', time: 'Dec 15, 2024' }
    ];
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <div class="activity-details">
                <p>${activity.text}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

/* ===========================================
   Settings
   =========================================== */
function handlePersonalInfoUpdate(e) {
    e.preventDefault();
    
    const user = PatientState.currentUser;
    user.fname = document.getElementById('settings-fname').value;
    user.lname = document.getElementById('settings-lname').value;
    user.phone = document.getElementById('settings-phone').value;
    user.dob = document.getElementById('settings-dob').value;
    user.address = document.getElementById('settings-address').value;
    
    sessionStorage.setItem('patientUser', JSON.stringify(user));
    if (localStorage.getItem('patientRememberMe')) {
        localStorage.setItem('patientUser', JSON.stringify(user));
    }
    
    // Update registered patients list
    const patients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');
    const index = patients.findIndex(p => p.email === user.email);
    if (index !== -1) {
        patients[index] = { ...patients[index], ...user };
        localStorage.setItem('registeredPatients', JSON.stringify(patients));
    }
    
    updateDashboardUser();
    showPatientAlert('Personal information updated successfully!', 'success');
}

function handlePasswordUpdate(e) {
    e.preventDefault();
    
    const currentPass = document.getElementById('current-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;
    
    if (newPass !== confirmPass) {
        showPatientAlert('New passwords do not match!', 'error');
        return;
    }
    
    if (newPass.length < 8) {
        showPatientAlert('Password must be at least 8 characters!', 'error');
        return;
    }
    
    // Demo: just show success
    e.target.reset();
    showPatientAlert('Password updated successfully!', 'success');
}

function handleEmergencyContactUpdate(e) {
    e.preventDefault();
    
    const user = PatientState.currentUser;
    user.emergencyContact = {
        name: document.getElementById('emergency-name').value,
        relation: document.getElementById('emergency-relation').value,
        phone: document.getElementById('emergency-phone').value
    };
    
    sessionStorage.setItem('patientUser', JSON.stringify(user));
    showPatientAlert('Emergency contact updated successfully!', 'success');
}

function saveNotificationPrefs() {
    showPatientAlert('Notification preferences saved!', 'success');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) {
            // Remove patient data
            const email = PatientState.currentUser?.email;
            const patients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');
            const filtered = patients.filter(p => p.email !== email);
            localStorage.setItem('registeredPatients', JSON.stringify(filtered));
            
            patientLogout();
            showPatientAlert('Account deleted successfully.', 'info');
        }
    }
}

/* ===========================================
   Helper Functions
   =========================================== */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const btn = input.parentElement.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

function showForgotPassword() {
    const email = prompt('Enter your email address:');
    if (email) {
        showPatientAlert('Password reset link sent to your email!', 'success');
    }
}

function closePatientModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

function getDirections() {
    window.open('https://maps.google.com/?q=Dental+Institute+Varanasi', '_blank');
}

function formatDateLong(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

function formatDateShort(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return formatDateShort(dateString);
}

function showPatientAlert(message, type = 'info') {
    const existingAlerts = document.querySelectorAll('.patient-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `patient-alert patient-alert-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    alert.innerHTML = `
        <span class="alert-icon">${icons[type] || icons.info}</span>
        <span class="alert-message">${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentElement) {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }
    }, 4000);
}

/* ===========================================
   Export Functions
   =========================================== */
window.PatientPortal = {
    switchDashboardSection,
    cancelAppointment,
    rescheduleAppointment,
    patientLogout,
    showNotifications,
    closePatientModal,
    downloadRecords,
    editAllergies,
    makePayment,
    getDirections
};
