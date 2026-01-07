/* ===========================================
   Dental Institute - Admin Panel JavaScript
   =========================================== */

// Global Admin State
const AdminState = {
    isLoggedIn: false,
    currentUser: null,
    currentSection: 'dashboard',
    appointments: [],
    patients: [],
    services: [],
    staff: [],
    messages: []
};

// Demo Credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

/* ===========================================
   Initialization
   =========================================== */
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initAdminEventListeners();
    initSidebarToggle();
    initDarkMode();
});

function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    const rememberMe = localStorage.getItem('adminRememberMe') === 'true';
    
    if (isLoggedIn || rememberMe) {
        AdminState.isLoggedIn = true;
        AdminState.currentUser = JSON.parse(sessionStorage.getItem('adminUser') || localStorage.getItem('adminUser') || '{}');
        showDashboard();
    } else {
        showLoginModal();
    }
}

function initAdminEventListeners() {
    // Login Form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Navigation Links
    const navLinks = document.querySelectorAll('.admin-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // Appointment Form
    const appointmentForm = document.getElementById('admin-appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }
    
    // Patient Form
    const patientForm = document.getElementById('admin-patient-form');
    if (patientForm) {
        patientForm.addEventListener('submit', handlePatientSubmit);
    }
    
    // Search inputs
    const appointmentSearch = document.getElementById('appointment-search');
    if (appointmentSearch) {
        appointmentSearch.addEventListener('input', debounceSearch(filterAppointments, 300));
    }
    
    const patientSearch = document.getElementById('patient-search');
    if (patientSearch) {
        patientSearch.addEventListener('input', debounceSearch(filterPatients, 300));
    }
    
    // Filter dropdown
    const appointmentFilter = document.getElementById('appointment-filter');
    if (appointmentFilter) {
        appointmentFilter.addEventListener('change', filterAppointments);
    }
    
    // Notification dropdown
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotifications);
    }
    
    // Close dropdowns on outside click
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.admin-notifications')) {
            const dropdown = document.getElementById('notification-dropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
    });
    
    // Settings forms
    const clinicForm = document.getElementById('clinic-settings-form');
    if (clinicForm) {
        clinicForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showAdminAlert('Clinic settings saved successfully!', 'success');
        });
    }
    
    const securityForm = document.getElementById('security-settings-form');
    if (securityForm) {
        securityForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
}

/* ===========================================
   Authentication
   =========================================== */
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        AdminState.isLoggedIn = true;
        AdminState.currentUser = {
            username: username,
            name: 'Admin User',
            role: 'Administrator',
            loginTime: new Date().toISOString()
        };
        
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify(AdminState.currentUser));
        
        if (rememberMe) {
            localStorage.setItem('adminRememberMe', 'true');
            localStorage.setItem('adminUser', JSON.stringify(AdminState.currentUser));
        }
        
        showDashboard();
    } else {
        showAdminAlert('Invalid username or password!', 'error');
        document.getElementById('admin-password').value = '';
    }
}

function adminLogout() {
    AdminState.isLoggedIn = false;
    AdminState.currentUser = null;
    
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    localStorage.removeItem('adminRememberMe');
    localStorage.removeItem('adminUser');
    
    showLoginModal();
}

function showLoginModal() {
    const loginModal = document.getElementById('admin-login-modal');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginModal) loginModal.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
}

function showDashboard() {
    const loginModal = document.getElementById('admin-login-modal');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginModal) loginModal.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
    
    // Update admin name
    const adminName = document.getElementById('admin-name');
    if (adminName && AdminState.currentUser) {
        adminName.textContent = AdminState.currentUser.name || 'Admin';
    }
    
    // Load initial data
    loadDashboardData();
    loadNotifications();
}

/* ===========================================
   Dashboard Data
   =========================================== */
function loadDashboardData() {
    loadAppointmentsData();
    loadPatientsData();
    loadServicesData();
    loadStaffData();
    loadMessagesData();
    updateDashboardStats();
    renderBarChart();
    renderDonutChart();
    renderRecentAppointments();
    renderTodaySchedule();
    loadReportData();
}

function loadAppointmentsData() {
    // Load from localStorage
    const stored = localStorage.getItem('appointments');
    if (stored) {
        AdminState.appointments = JSON.parse(stored);
    } else {
        // Generate demo data
        AdminState.appointments = generateDemoAppointments();
        localStorage.setItem('appointments', JSON.stringify(AdminState.appointments));
    }
    renderAppointmentsTable();
}

function loadPatientsData() {
    const stored = localStorage.getItem('patients');
    if (stored) {
        AdminState.patients = JSON.parse(stored);
    } else {
        AdminState.patients = generateDemoPatients();
        localStorage.setItem('patients', JSON.stringify(AdminState.patients));
    }
    renderPatientsTable();
}

function loadServicesData() {
    AdminState.services = [
        { id: 1, name: 'General Checkup', price: 500, duration: 30, description: 'Complete dental examination and consultation', active: true },
        { id: 2, name: 'Teeth Cleaning', price: 1000, duration: 45, description: 'Professional teeth cleaning and polishing', active: true },
        { id: 3, name: 'Teeth Whitening', price: 5000, duration: 60, description: 'Professional teeth whitening treatment', active: true },
        { id: 4, name: 'Dental Filling', price: 1500, duration: 45, description: 'Cavity filling with quality materials', active: true },
        { id: 5, name: 'Root Canal', price: 8000, duration: 90, description: 'Root canal treatment', active: true },
        { id: 6, name: 'Tooth Extraction', price: 1000, duration: 30, description: 'Safe tooth extraction procedure', active: true },
        { id: 7, name: 'Orthodontics Consultation', price: 1000, duration: 45, description: 'Braces and aligners consultation', active: true },
        { id: 8, name: 'Dental Implant', price: 25000, duration: 120, description: 'Permanent dental implant procedure', active: true },
        { id: 9, name: 'Pediatric Dentistry', price: 600, duration: 30, description: 'Child-friendly dental care', active: true }
    ];
    renderServicesGrid();
}

function loadStaffData() {
    AdminState.staff = [
        { id: 1, name: 'Dr. Vikram Verma', role: 'Senior Dentist', email: 'vikram@dental.com', phone: '+91 9876543210', specialization: 'General Dentistry', experience: '15 years', active: true },
        { id: 2, name: 'Dr. Priya Sharma', role: 'Orthodontist', email: 'priya@dental.com', phone: '+91 9876543211', specialization: 'Orthodontics', experience: '10 years', active: true },
        { id: 3, name: 'Dr. Amit Patel', role: 'Cosmetic Dentist', email: 'amit@dental.com', phone: '+91 9876543212', specialization: 'Cosmetic Dentistry', experience: '8 years', active: true },
        { id: 4, name: 'Dr. Sneha Kumar', role: 'Pediatric Dentist', email: 'sneha@dental.com', phone: '+91 9876543213', specialization: 'Pediatric Dentistry', experience: '6 years', active: true },
        { id: 5, name: 'Riya Singh', role: 'Dental Hygienist', email: 'riya@dental.com', phone: '+91 9876543214', specialization: 'Dental Hygiene', experience: '5 years', active: true },
        { id: 6, name: 'Arun Gupta', role: 'Receptionist', email: 'arun@dental.com', phone: '+91 9876543215', specialization: 'Administration', experience: '3 years', active: true }
    ];
    renderStaffGrid();
}

function loadMessagesData() {
    const stored = localStorage.getItem('contactMessages');
    if (stored) {
        AdminState.messages = JSON.parse(stored);
    } else {
        AdminState.messages = generateDemoMessages();
        localStorage.setItem('contactMessages', JSON.stringify(AdminState.messages));
    }
    renderMessagesList();
}

/* ===========================================
   Demo Data Generators
   =========================================== */
function generateDemoAppointments() {
    const names = ['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Patel', 'Vikash Gupta', 'Anita Roy', 'Suresh Verma', 'Kavita Jain'];
    const services = ['General Checkup', 'Teeth Cleaning', 'Teeth Whitening', 'Dental Filling', 'Root Canal', 'Tooth Extraction'];
    const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];
    
    const appointments = [];
    const today = new Date();
    
    for (let i = 0; i < 25; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 15);
        
        appointments.push({
            id: Date.now() + i,
            name: names[Math.floor(Math.random() * names.length)],
            email: `patient${i + 1}@email.com`,
            phone: `+91 98765${String(i).padStart(5, '0')}`,
            service: services[Math.floor(Math.random() * services.length)],
            date: date.toISOString().split('T')[0],
            time: times[Math.floor(Math.random() * times.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            notes: '',
            createdAt: new Date(date.getTime() - 86400000 * Math.floor(Math.random() * 7)).toISOString()
        });
    }
    
    return appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateDemoPatients() {
    const names = ['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Patel', 'Vikash Gupta', 'Anita Roy', 'Suresh Verma', 'Kavita Jain', 'Mohit Agarwal', 'Pooja Desai'];
    
    return names.map((name, index) => ({
        id: Date.now() + index,
        name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
        phone: `+91 98765${String(index).padStart(5, '0')}`,
        dob: `199${index % 10}-0${(index % 9) + 1}-${10 + index}`,
        address: `${100 + index} Main Street, Varanasi, UP`,
        history: index % 3 === 0 ? 'No known allergies' : '',
        lastVisit: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 60)).toISOString().split('T')[0],
        totalVisits: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 365)).toISOString()
    }));
}

function generateDemoMessages() {
    return [
        { id: 1, name: 'Raj Malhotra', email: 'raj@email.com', subject: 'Appointment Inquiry', message: 'I would like to know about your dental implant services and pricing.', date: new Date().toISOString(), read: false },
        { id: 2, name: 'Sunita Devi', email: 'sunita@email.com', subject: 'Emergency Dental Care', message: 'My child has a toothache. Is there any emergency slot available today?', date: new Date(Date.now() - 86400000).toISOString(), read: false },
        { id: 3, name: 'Aakash Verma', email: 'aakash@email.com', subject: 'Insurance Coverage', message: 'Do you accept health insurance? What are the procedures covered?', date: new Date(Date.now() - 172800000).toISOString(), read: true },
        { id: 4, name: 'Meena Sharma', email: 'meena@email.com', subject: 'Feedback', message: 'Great experience with Dr. Verma. The staff was very helpful!', date: new Date(Date.now() - 259200000).toISOString(), read: true }
    ];
}

/* ===========================================
   Dashboard Stats & Charts
   =========================================== */
function updateDashboardStats() {
    const appointments = AdminState.appointments;
    const patients = AdminState.patients;
    
    // Update stat cards
    document.getElementById('total-appointments').textContent = appointments.length;
    document.getElementById('total-patients').textContent = patients.length;
    document.getElementById('pending-appointments').textContent = appointments.filter(a => a.status === 'Pending').length;
    
    // Calculate revenue (demo)
    const revenue = appointments.filter(a => a.status === 'Completed').length * 2500;
    document.getElementById('total-revenue').textContent = formatCurrency(revenue);
}

function renderBarChart() {
    const container = document.getElementById('bar-chart');
    if (!container) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(() => ({
        confirmed: Math.floor(Math.random() * 10) + 5,
        pending: Math.floor(Math.random() * 5) + 2,
        cancelled: Math.floor(Math.random() * 3)
    }));
    
    const maxValue = Math.max(...data.map(d => d.confirmed + d.pending + d.cancelled));
    
    container.innerHTML = days.map((day, index) => {
        const d = data[index];
        const total = d.confirmed + d.pending + d.cancelled;
        const height = (total / maxValue) * 100;
        
        return `
            <div class="bar-group">
                <div class="bar" style="height: ${height}%">
                    <div class="bar-segment confirmed" style="height: ${(d.confirmed / total) * 100}%"></div>
                    <div class="bar-segment pending" style="height: ${(d.pending / total) * 100}%"></div>
                    <div class="bar-segment cancelled" style="height: ${(d.cancelled / total) * 100}%"></div>
                </div>
                <span class="bar-label">${day}</span>
            </div>
        `;
    }).join('');
}

function renderDonutChart() {
    const container = document.getElementById('donut-chart');
    if (!container) return;
    
    const services = [
        { name: 'General Checkup', value: 30, color: '#667eea' },
        { name: 'Teeth Cleaning', value: 25, color: '#764ba2' },
        { name: 'Teeth Whitening', value: 15, color: '#00d4aa' },
        { name: 'Root Canal', value: 10, color: '#ffc107' },
        { name: 'Others', value: 20, color: '#6c757d' }
    ];
    
    let cumulativePercent = 0;
    const segments = services.map(service => {
        const start = cumulativePercent;
        cumulativePercent += service.value;
        return { ...service, start, end: cumulativePercent };
    });
    
    const gradientStops = segments.map(seg => 
        `${seg.color} ${seg.start}% ${seg.end}%`
    ).join(', ');
    
    container.innerHTML = `
        <div class="donut" style="background: conic-gradient(${gradientStops})">
            <div class="donut-hole">
                <span class="donut-total">${AdminState.appointments.length}</span>
                <span class="donut-label">Total</span>
            </div>
        </div>
        <div class="donut-legend">
            ${services.map(s => `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${s.color}"></span>
                    <span>${s.name} (${s.value}%)</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRecentAppointments() {
    const container = document.getElementById('recent-appointments');
    if (!container) return;
    
    const recent = AdminState.appointments.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">No appointments found</p>';
        return;
    }
    
    container.innerHTML = recent.map(apt => `
        <div class="recent-item">
            <div class="recent-avatar">${apt.name.charAt(0)}</div>
            <div class="recent-info">
                <h4>${apt.name}</h4>
                <p>${apt.service}</p>
            </div>
            <div class="recent-meta">
                <span class="recent-date">${formatDate(apt.date)}</span>
                <span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span>
            </div>
        </div>
    `).join('');
}

function renderTodaySchedule() {
    const container = document.getElementById('today-schedule');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = AdminState.appointments
        .filter(a => a.date === today && a.status !== 'Cancelled')
        .sort((a, b) => a.time.localeCompare(b.time));
    
    if (todayAppointments.length === 0) {
        container.innerHTML = '<p class="no-data">No appointments scheduled for today</p>';
        return;
    }
    
    container.innerHTML = todayAppointments.map(apt => `
        <div class="schedule-item">
            <div class="schedule-time">${formatTime(apt.time)}</div>
            <div class="schedule-info">
                <h4>${apt.name}</h4>
                <p>${apt.service}</p>
            </div>
            <span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span>
        </div>
    `).join('');
}

/* ===========================================
   Section Navigation
   =========================================== */
function switchSection(sectionId) {
    AdminState.currentSection = sectionId;
    
    // Update nav links
    document.querySelectorAll('.admin-nav .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    
    // Show/hide sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionId}`);
    });
    
    // Close sidebar on mobile
    const sidebar = document.getElementById('admin-sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

/* ===========================================
   Appointments Management
   =========================================== */
function renderAppointmentsTable() {
    const tbody = document.getElementById('appointments-tbody');
    if (!tbody) return;
    
    const appointments = AdminState.appointments;
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No appointments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = appointments.map(apt => `
        <tr>
            <td>#${String(apt.id).slice(-6)}</td>
            <td>
                <div class="patient-cell">
                    <span class="patient-avatar">${apt.name.charAt(0)}</span>
                    <div>
                        <strong>${apt.name}</strong>
                        <small>${apt.email}</small>
                    </div>
                </div>
            </td>
            <td>${apt.service}</td>
            <td>${formatDate(apt.date)} at ${formatTime(apt.time)}</td>
            <td><span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editAppointment(${apt.id})" title="Edit">✏️</button>
                    <button class="action-btn view" onclick="viewAppointment(${apt.id})" title="View">👁️</button>
                    <button class="action-btn delete" onclick="deleteAppointment(${apt.id})" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showAddAppointmentModal() {
    document.getElementById('appointment-modal-title').textContent = 'Add New Appointment';
    document.getElementById('admin-appointment-form').reset();
    document.getElementById('edit-appointment-id').value = '';
    
    // Set minimum date to today
    const dateInput = document.getElementById('apt-date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
    
    openModal('appointment-modal');
}

function editAppointment(id) {
    const appointment = AdminState.appointments.find(a => a.id === id);
    if (!appointment) return;
    
    document.getElementById('appointment-modal-title').textContent = 'Edit Appointment';
    document.getElementById('edit-appointment-id').value = id;
    document.getElementById('apt-patient-name').value = appointment.name;
    document.getElementById('apt-email').value = appointment.email;
    document.getElementById('apt-phone').value = appointment.phone;
    document.getElementById('apt-service').value = appointment.service;
    document.getElementById('apt-date').value = appointment.date;
    document.getElementById('apt-time').value = appointment.time;
    document.getElementById('apt-status').value = appointment.status;
    document.getElementById('apt-notes').value = appointment.notes || '';
    
    openModal('appointment-modal');
}

function viewAppointment(id) {
    const appointment = AdminState.appointments.find(a => a.id === id);
    if (!appointment) return;
    
    showAdminAlert(`Viewing appointment for ${appointment.name} on ${formatDate(appointment.date)}`, 'info');
}

function deleteAppointment(id) {
    showConfirmModal(
        'Delete Appointment',
        'Are you sure you want to delete this appointment? This action cannot be undone.',
        () => {
            AdminState.appointments = AdminState.appointments.filter(a => a.id !== id);
            localStorage.setItem('appointments', JSON.stringify(AdminState.appointments));
            renderAppointmentsTable();
            updateDashboardStats();
            showAdminAlert('Appointment deleted successfully!', 'success');
        }
    );
}

function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const editId = document.getElementById('edit-appointment-id').value;
    const appointmentData = {
        name: document.getElementById('apt-patient-name').value,
        email: document.getElementById('apt-email').value,
        phone: document.getElementById('apt-phone').value,
        service: document.getElementById('apt-service').value,
        date: document.getElementById('apt-date').value,
        time: document.getElementById('apt-time').value,
        status: document.getElementById('apt-status').value,
        notes: document.getElementById('apt-notes').value
    };
    
    if (editId) {
        // Update existing
        const index = AdminState.appointments.findIndex(a => a.id === parseInt(editId));
        if (index !== -1) {
            AdminState.appointments[index] = { ...AdminState.appointments[index], ...appointmentData };
        }
        showAdminAlert('Appointment updated successfully!', 'success');
    } else {
        // Add new
        appointmentData.id = Date.now();
        appointmentData.createdAt = new Date().toISOString();
        AdminState.appointments.unshift(appointmentData);
        showAdminAlert('Appointment created successfully!', 'success');
    }
    
    localStorage.setItem('appointments', JSON.stringify(AdminState.appointments));
    renderAppointmentsTable();
    updateDashboardStats();
    renderRecentAppointments();
    closeModal('appointment-modal');
}

function filterAppointments() {
    const searchTerm = document.getElementById('appointment-search').value.toLowerCase();
    const statusFilter = document.getElementById('appointment-filter').value;
    
    const filtered = AdminState.appointments.filter(apt => {
        const matchesSearch = apt.name.toLowerCase().includes(searchTerm) ||
                            apt.email.toLowerCase().includes(searchTerm) ||
                            apt.service.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    const tbody = document.getElementById('appointments-tbody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No appointments match your search</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(apt => `
        <tr>
            <td>#${String(apt.id).slice(-6)}</td>
            <td>
                <div class="patient-cell">
                    <span class="patient-avatar">${apt.name.charAt(0)}</span>
                    <div>
                        <strong>${apt.name}</strong>
                        <small>${apt.email}</small>
                    </div>
                </div>
            </td>
            <td>${apt.service}</td>
            <td>${formatDate(apt.date)} at ${formatTime(apt.time)}</td>
            <td><span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editAppointment(${apt.id})" title="Edit">✏️</button>
                    <button class="action-btn view" onclick="viewAppointment(${apt.id})" title="View">👁️</button>
                    <button class="action-btn delete" onclick="deleteAppointment(${apt.id})" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/* ===========================================
   Patients Management
   =========================================== */
function renderPatientsTable() {
    const tbody = document.getElementById('patients-tbody');
    if (!tbody) return;
    
    const patients = AdminState.patients;
    
    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No patients found</td></tr>';
        return;
    }
    
    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td>#${String(patient.id).slice(-6)}</td>
            <td>
                <div class="patient-cell">
                    <span class="patient-avatar">${patient.name.charAt(0)}</span>
                    <strong>${patient.name}</strong>
                </div>
            </td>
            <td>${patient.email}</td>
            <td>${patient.phone}</td>
            <td>${formatDate(patient.lastVisit)}</td>
            <td>${patient.totalVisits}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editPatient(${patient.id})" title="Edit">✏️</button>
                    <button class="action-btn view" onclick="viewPatientHistory(${patient.id})" title="History">📋</button>
                    <button class="action-btn delete" onclick="deletePatient(${patient.id})" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showAddPatientModal() {
    document.getElementById('patient-modal-title').textContent = 'Add New Patient';
    document.getElementById('admin-patient-form').reset();
    document.getElementById('edit-patient-id').value = '';
    openModal('patient-modal');
}

function editPatient(id) {
    const patient = AdminState.patients.find(p => p.id === id);
    if (!patient) return;
    
    document.getElementById('patient-modal-title').textContent = 'Edit Patient';
    document.getElementById('edit-patient-id').value = id;
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-email').value = patient.email;
    document.getElementById('patient-phone').value = patient.phone;
    document.getElementById('patient-dob').value = patient.dob || '';
    document.getElementById('patient-address').value = patient.address || '';
    document.getElementById('patient-history').value = patient.history || '';
    
    openModal('patient-modal');
}

function viewPatientHistory(id) {
    const patient = AdminState.patients.find(p => p.id === id);
    if (!patient) return;
    
    showAdminAlert(`Viewing history for ${patient.name} - Total visits: ${patient.totalVisits}`, 'info');
}

function deletePatient(id) {
    showConfirmModal(
        'Delete Patient',
        'Are you sure you want to delete this patient record? This action cannot be undone.',
        () => {
            AdminState.patients = AdminState.patients.filter(p => p.id !== id);
            localStorage.setItem('patients', JSON.stringify(AdminState.patients));
            renderPatientsTable();
            updateDashboardStats();
            showAdminAlert('Patient deleted successfully!', 'success');
        }
    );
}

function handlePatientSubmit(e) {
    e.preventDefault();
    
    const editId = document.getElementById('edit-patient-id').value;
    const patientData = {
        name: document.getElementById('patient-name').value,
        email: document.getElementById('patient-email').value,
        phone: document.getElementById('patient-phone').value,
        dob: document.getElementById('patient-dob').value,
        address: document.getElementById('patient-address').value,
        history: document.getElementById('patient-history').value
    };
    
    if (editId) {
        const index = AdminState.patients.findIndex(p => p.id === parseInt(editId));
        if (index !== -1) {
            AdminState.patients[index] = { ...AdminState.patients[index], ...patientData };
        }
        showAdminAlert('Patient updated successfully!', 'success');
    } else {
        patientData.id = Date.now();
        patientData.createdAt = new Date().toISOString();
        patientData.lastVisit = new Date().toISOString().split('T')[0];
        patientData.totalVisits = 0;
        AdminState.patients.unshift(patientData);
        showAdminAlert('Patient added successfully!', 'success');
    }
    
    localStorage.setItem('patients', JSON.stringify(AdminState.patients));
    renderPatientsTable();
    updateDashboardStats();
    closeModal('patient-modal');
}

function filterPatients() {
    const searchTerm = document.getElementById('patient-search').value.toLowerCase();
    
    const filtered = AdminState.patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm) ||
        patient.phone.includes(searchTerm)
    );
    
    const tbody = document.getElementById('patients-tbody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No patients match your search</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(patient => `
        <tr>
            <td>#${String(patient.id).slice(-6)}</td>
            <td>
                <div class="patient-cell">
                    <span class="patient-avatar">${patient.name.charAt(0)}</span>
                    <strong>${patient.name}</strong>
                </div>
            </td>
            <td>${patient.email}</td>
            <td>${patient.phone}</td>
            <td>${formatDate(patient.lastVisit)}</td>
            <td>${patient.totalVisits}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editPatient(${patient.id})" title="Edit">✏️</button>
                    <button class="action-btn view" onclick="viewPatientHistory(${patient.id})" title="History">📋</button>
                    <button class="action-btn delete" onclick="deletePatient(${patient.id})" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/* ===========================================
   Services Management
   =========================================== */
function renderServicesGrid() {
    const container = document.getElementById('services-grid');
    if (!container) return;
    
    container.innerHTML = AdminState.services.map(service => `
        <div class="service-admin-card ${!service.active ? 'inactive' : ''}">
            <div class="service-admin-header">
                <h3>${service.name}</h3>
                <label class="toggle-switch small">
                    <input type="checkbox" ${service.active ? 'checked' : ''} onchange="toggleService(${service.id})">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <p class="service-description">${service.description}</p>
            <div class="service-details">
                <span class="service-price">${formatCurrency(service.price)}</span>
                <span class="service-duration">${service.duration} mins</span>
            </div>
            <div class="service-actions">
                <button class="btn btn-sm btn-secondary" onclick="editService(${service.id})">Edit</button>
            </div>
        </div>
    `).join('');
}

function toggleService(id) {
    const service = AdminState.services.find(s => s.id === id);
    if (service) {
        service.active = !service.active;
        renderServicesGrid();
        showAdminAlert(`Service ${service.active ? 'activated' : 'deactivated'} successfully!`, 'success');
    }
}

function showAddServiceModal() {
    showAdminAlert('Service management modal - Coming soon!', 'info');
}

function editService(id) {
    const service = AdminState.services.find(s => s.id === id);
    if (service) {
        showAdminAlert(`Editing service: ${service.name}`, 'info');
    }
}

/* ===========================================
   Staff Management
   =========================================== */
function renderStaffGrid() {
    const container = document.getElementById('staff-grid');
    if (!container) return;
    
    container.innerHTML = AdminState.staff.map(member => `
        <div class="staff-card">
            <div class="staff-avatar">${member.name.split(' ').map(n => n[0]).join('')}</div>
            <h3>${member.name}</h3>
            <p class="staff-role">${member.role}</p>
            <p class="staff-specialization">${member.specialization}</p>
            <div class="staff-details">
                <p>📧 ${member.email}</p>
                <p>📞 ${member.phone}</p>
                <p>🏆 ${member.experience}</p>
            </div>
            <div class="staff-actions">
                <button class="btn btn-sm btn-secondary" onclick="editStaff(${member.id})">Edit</button>
                <button class="btn btn-sm btn-secondary" onclick="viewStaffSchedule(${member.id})">Schedule</button>
            </div>
        </div>
    `).join('');
}

function showAddStaffModal() {
    showAdminAlert('Staff management modal - Coming soon!', 'info');
}

function editStaff(id) {
    const member = AdminState.staff.find(s => s.id === id);
    if (member) {
        showAdminAlert(`Editing staff: ${member.name}`, 'info');
    }
}

function viewStaffSchedule(id) {
    const member = AdminState.staff.find(s => s.id === id);
    if (member) {
        showAdminAlert(`Viewing schedule for: ${member.name}`, 'info');
    }
}

/* ===========================================
   Reports
   =========================================== */
function loadReportData() {
    const appointments = AdminState.appointments;
    
    document.getElementById('report-total').textContent = appointments.length;
    document.getElementById('report-completed').textContent = appointments.filter(a => a.status === 'Completed').length;
    document.getElementById('report-cancelled').textContent = appointments.filter(a => a.status === 'Cancelled').length;
    
    // Revenue calculations (demo)
    const completedCount = appointments.filter(a => a.status === 'Completed').length;
    document.getElementById('revenue-month').textContent = formatCurrency(completedCount * 2500);
    document.getElementById('revenue-last-month').textContent = formatCurrency(Math.floor(completedCount * 2500 * 0.85));
    document.getElementById('revenue-ytd').textContent = formatCurrency(completedCount * 2500 * 8);
    
    // Popular services
    renderPopularServices();
}

function renderPopularServices() {
    const container = document.getElementById('popular-services');
    if (!container) return;
    
    const serviceCounts = {};
    AdminState.appointments.forEach(apt => {
        serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
    });
    
    const sorted = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const maxCount = sorted[0] ? sorted[0][1] : 1;
    
    container.innerHTML = sorted.map(([service, count]) => `
        <div class="popular-service-item">
            <div class="service-info">
                <span class="service-name">${service}</span>
                <span class="service-count">${count} appointments</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(count / maxCount) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

function exportReport(format) {
    showAdminAlert(`Exporting report as ${format.toUpperCase()}... (Demo)`, 'info');
}

/* ===========================================
   Messages
   =========================================== */
function renderMessagesList() {
    const container = document.getElementById('messages-list');
    if (!container) return;
    
    if (AdminState.messages.length === 0) {
        container.innerHTML = '<p class="no-data">No messages found</p>';
        return;
    }
    
    container.innerHTML = AdminState.messages.map(msg => `
        <div class="message-item ${!msg.read ? 'unread' : ''}" onclick="viewMessage(${msg.id})">
            <div class="message-avatar">${msg.name.charAt(0)}</div>
            <div class="message-info">
                <div class="message-header">
                    <strong>${msg.name}</strong>
                    <span class="message-date">${formatDateTime(msg.date)}</span>
                </div>
                <p class="message-subject">${msg.subject}</p>
                <p class="message-preview">${msg.message.substring(0, 50)}...</p>
            </div>
        </div>
    `).join('');
}

function viewMessage(id) {
    const message = AdminState.messages.find(m => m.id === id);
    if (!message) return;
    
    // Mark as read
    message.read = true;
    localStorage.setItem('contactMessages', JSON.stringify(AdminState.messages));
    renderMessagesList();
    updateNotificationCount();
    
    const detailContainer = document.getElementById('message-detail');
    detailContainer.innerHTML = `
        <div class="message-full">
            <div class="message-full-header">
                <div class="message-full-avatar">${message.name.charAt(0)}</div>
                <div class="message-full-info">
                    <h3>${message.name}</h3>
                    <p>${message.email}</p>
                    <span class="message-full-date">${formatDateTime(message.date)}</span>
                </div>
            </div>
            <h4 class="message-full-subject">${message.subject}</h4>
            <div class="message-full-body">
                <p>${message.message}</p>
            </div>
            <div class="message-actions">
                <button class="btn btn-primary" onclick="replyMessage(${message.id})">Reply</button>
                <button class="btn btn-secondary" onclick="deleteMessage(${message.id})">Delete</button>
            </div>
        </div>
    `;
}

function replyMessage(id) {
    const message = AdminState.messages.find(m => m.id === id);
    if (message) {
        showAdminAlert(`Opening email client to reply to ${message.email}...`, 'info');
    }
}

function deleteMessage(id) {
    showConfirmModal(
        'Delete Message',
        'Are you sure you want to delete this message?',
        () => {
            AdminState.messages = AdminState.messages.filter(m => m.id !== id);
            localStorage.setItem('contactMessages', JSON.stringify(AdminState.messages));
            renderMessagesList();
            document.getElementById('message-detail').innerHTML = `
                <div class="no-message-selected">
                    <span>📬</span>
                    <p>Select a message to view details</p>
                </div>
            `;
            showAdminAlert('Message deleted successfully!', 'success');
        }
    );
}

/* ===========================================
   Notifications
   =========================================== */
function loadNotifications() {
    const notifications = [
        { id: 1, message: 'New appointment request from Raj Malhotra', time: '5 mins ago', type: 'appointment' },
        { id: 2, message: 'Dr. Priya is on leave tomorrow', time: '1 hour ago', type: 'staff' },
        { id: 3, message: 'Monthly report is ready for review', time: '2 hours ago', type: 'report' }
    ];
    
    const container = document.getElementById('notification-list');
    if (container) {
        container.innerHTML = notifications.map(notif => `
            <div class="notification-item">
                <span class="notification-type-icon">${getNotificationIcon(notif.type)}</span>
                <div class="notification-content">
                    <p>${notif.message}</p>
                    <span class="notification-time">${notif.time}</span>
                </div>
            </div>
        `).join('');
    }
    
    updateNotificationCount();
}

function getNotificationIcon(type) {
    const icons = {
        appointment: '📅',
        staff: '👨‍⚕️',
        report: '📊',
        message: '💬'
    };
    return icons[type] || '🔔';
}

function updateNotificationCount() {
    const unreadMessages = AdminState.messages.filter(m => !m.read).length;
    const badge = document.getElementById('notification-count');
    if (badge) {
        badge.textContent = unreadMessages + 3; // +3 for demo notifications
        badge.style.display = unreadMessages > 0 ? 'flex' : 'none';
    }
}

function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.classList.toggle('show');
}

/* ===========================================
   Settings
   =========================================== */
function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (currentPassword !== ADMIN_CREDENTIALS.password) {
        showAdminAlert('Current password is incorrect!', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAdminAlert('New passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAdminAlert('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // In real app, update password on server
    showAdminAlert('Password updated successfully! (Demo - not actually changed)', 'success');
    e.target.reset();
}

function saveWorkingHours() {
    showAdminAlert('Working hours saved successfully!', 'success');
}

function showSettings() {
    switchSection('settings');
}

function showProfile() {
    showAdminAlert('Profile settings - Coming soon!', 'info');
}

/* ===========================================
   UI Helpers
   =========================================== */
function initSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            toggle.classList.toggle('active');
        });
    }
}

function initDarkMode() {
    const isDarkMode = localStorage.getItem('adminDarkMode') === 'true';
    const toggle = document.getElementById('dark-mode-toggle');
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (toggle) toggle.checked = true;
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('adminDarkMode', isDarkMode);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
    }
}

function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const confirmBtn = document.getElementById('confirm-btn');
    confirmBtn.onclick = () => {
        closeModal('confirm-modal');
        onConfirm();
    };
    
    openModal('confirm-modal');
}

function showAdminAlert(message, type = 'info') {
    const existingAlerts = document.querySelectorAll('.admin-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `admin-alert admin-alert-${type}`;
    
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
   Utility Functions
   =========================================== */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

function formatTime(timeString) {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-IN', options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

function debounceSearch(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/* ===========================================
   Export Admin Functions
   =========================================== */
window.AdminPanel = {
    switchSection,
    showAddAppointmentModal,
    editAppointment,
    deleteAppointment,
    showAddPatientModal,
    editPatient,
    deletePatient,
    adminLogout,
    showAdminAlert
};
