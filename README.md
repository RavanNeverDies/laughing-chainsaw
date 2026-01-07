# Dental Institute Web Application

A comprehensive, modern, responsive web application for dental institute management and patient services. Built with vanilla HTML, CSS, and JavaScript.

## Live Demo

Visit the live site at: `https://ravanneverdies.github.io/laughing-chainsaw/`

## Features Overview

### Patient-Facing Features

#### Core Pages
- **Home Page**: Professional showcase of dental services with testimonials
- **About Us**: Information about the dental institute, team, and achievements
- **Services**: Comprehensive list of all dental procedures and treatments
- **Contact Us**: Contact form, location map, and FAQ section

#### Patient Portal
- **User Authentication**: Secure login/registration system
- **Dashboard**: Overview of appointments, prescriptions, and billing
- **Medical Records**: Treatment history, dental chart, X-rays
- **Prescriptions**: View and request prescription refills
- **Billing**: Transaction history and online payment options
- **Account Settings**: Profile management and notification preferences

#### Appointment System
- **Online Booking**: Easy appointment scheduling with doctor selection
- **Virtual Consultation**: Video consultation booking with ₹300 fee
- **Real-time Availability**: View available time slots
- **Appointment Management**: View, reschedule, or cancel appointments

#### Additional Features
- **Emergency Services**: 24/7 hotline, first-aid guides, emergency process
- **Smile Gallery**: Before/after transformations with filtering
- **Dental Blog**: Educational content on oral health topics
- **Insurance & Payments**: Insurance providers, EMI options, cost calculator
- **Live Chat Widget**: Instant support with quick action buttons

### Admin Panel Features

Access at `/admin.html` with demo credentials:
- **Username**: admin
- **Password**: admin123

#### Dashboard
- Statistics overview with charts
- Recent appointments and today's schedule
- Real-time data updates

#### Management
- **Appointments**: View, add, edit, delete, filter, and search
- **Patients**: Complete patient records management
- **Services**: Service catalog with pricing and duration
- **Staff**: Staff profiles and specializations
- **Reports**: Revenue reports and analytics
- **Messages**: Contact form inquiries management
- **Settings**: Clinic info, working hours, security settings

## Technical Features

### Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker for offline functionality
- **Push Notifications**: Appointment reminders (when implemented)
- **Background Sync**: Sync appointments when back online

### Real-Time Features
- **Live Data Updates**: Automatic refresh of dashboard data
- **Cross-Tab Sync**: Changes sync across browser tabs
- **Notification System**: Real-time alerts for new appointments/messages

### User Experience
- **Responsive Design**: Mobile-first approach, works on all devices
- **Smooth Animations**: CSS transitions and scroll animations
- **Dark Mode**: Available in admin panel
- **Accessibility**: ARIA labels and keyboard navigation support

## File Structure

```
├── index.html              # Home page
├── about.html              # About page
├── services.html           # Services page
├── appointments.html       # Appointment booking
├── contact.html            # Contact page
├── patient-portal.html     # Patient login & dashboard
├── emergency.html          # Emergency services
├── virtual-consultation.html # Video consultation booking
├── gallery.html            # Smile gallery
├── blog.html               # Dental tips blog
├── insurance.html          # Insurance & payment plans
├── admin.html              # Admin panel
├── offline.html            # Offline fallback page
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── favicon.svg             # Site favicon
├── css/
│   └── style.css           # Main stylesheet (3000+ lines)
├── js/
│   ├── script.js           # Main JavaScript
│   ├── admin.js            # Admin panel JavaScript
│   ├── patient-portal.js   # Patient portal JavaScript
│   └── chat-widget.js      # Live chat widget
└── icons/                  # PWA icons
```

## Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, Flexbox, Grid, animations
- **JavaScript (ES6+)**: Modules, async/await, localStorage
- **PWA**: Service workers, manifest, offline support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/ravanneverdies/laughing-chainsaw.git
cd laughing-chainsaw
```

2. Start a local server (any of these options):
```bash
# Python 3
python -m http.server 8000

# Node.js (if http-server is installed)
npx http-server

# PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser

### Demo Accounts

**Admin Panel:**
- URL: `/admin.html`
- Username: `admin`
- Password: `admin123`

**Patient Portal:**
- URL: `/patient-portal.html`
- Email: `patient@demo.com`
- Password: `patient123`

## Key Functionalities

### Appointment Booking Flow
1. Select service and preferred doctor
2. Choose date and time slot
3. Enter personal information
4. Receive confirmation (stored in localStorage)
5. View appointment in patient portal

### Patient Registration Flow
1. Fill registration form with required details
2. Account created and auto-logged in
3. Access dashboard with all features
4. Manage appointments, records, and billing

### Virtual Consultation
1. Book video consultation slot
2. Pay ₹300 consultation fee
3. Receive video call link via email
4. Join consultation at scheduled time

## Data Storage

This demo uses **localStorage** for data persistence:
- `appointments`: All booked appointments
- `patients`: Registered patient profiles
- `contactMessages`: Contact form submissions
- `registeredPatients`: Patient credentials
- `chatMessages`: Live chat history

**Note**: Data is stored locally in the browser and will be lost if localStorage is cleared.

## Customization

### Changing Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #00d4aa;
    /* ... */
}
```

### Adding New Services
Edit the services array in `js/admin.js` or update `services.html`.

### Modifying Clinic Info
Update footer sections across all HTML files and settings in admin panel.

## Future Enhancements

- [ ] Backend API integration
- [ ] Database connectivity (MySQL/MongoDB)
- [ ] SMS/Email notifications
- [ ] Payment gateway integration
- [ ] Multi-language support (Hindi)
- [ ] Doctor availability calendar
- [ ] Prescription PDF generation
- [ ] Insurance claim processing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own dental institute or healthcare application.

## Support

For questions or support:
- 📧 Email: info@dentalinstitute.com
- 📞 Phone: +91 9876543210
- 🚨 Emergency: +91 98765 43211

---

**Made with ❤️ for healthy smiles**
