/* ===========================================
   Live Chat Widget
   =========================================== */

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.loadMessages();
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <button class="chat-button" id="chat-toggle" aria-label="Open chat">
                💬
            </button>
            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <div class="chat-status">
                        <span class="status-dot online"></span>
                        <div>
                            <h4>Dental Institute Support</h4>
                            <span class="status-text">We typically reply within minutes</span>
                        </div>
                    </div>
                    <button class="chat-close" id="chat-close">&times;</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <!-- Messages will be populated here -->
                </div>
                <div class="chat-quick-actions" id="chat-quick-actions">
                    <button class="quick-action" data-action="appointment">📅 Book Appointment</button>
                    <button class="quick-action" data-action="emergency">🚨 Emergency</button>
                    <button class="quick-action" data-action="hours">⏰ Working Hours</button>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Type your message..." />
                    <button class="chat-send" id="chat-send">📤</button>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }

    attachEventListeners() {
        const toggle = document.getElementById('chat-toggle');
        const close = document.getElementById('chat-close');
        const send = document.getElementById('chat-send');
        const input = document.getElementById('chat-input');
        const quickActions = document.querySelectorAll('.quick-action');

        toggle.addEventListener('click', () => this.toggle());
        close.addEventListener('click', () => this.close());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleQuickAction(btn.dataset.action);
            });
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chat-window');
        const button = document.getElementById('chat-toggle');
        
        if (this.isOpen) {
            window.classList.add('open');
            button.innerHTML = '✖️';
            this.showWelcomeMessage();
        } else {
            window.classList.remove('open');
            button.innerHTML = '💬';
        }
    }

    open() {
        if (!this.isOpen) {
            this.toggle();
        }
    }

    close() {
        if (this.isOpen) {
            this.toggle();
        }
    }

    showWelcomeMessage() {
        if (this.messages.length === 0) {
            this.addBotMessage("Hello! 👋 Welcome to Dental Institute. How can I help you today?");
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        
        if (!text) return;
        
        this.addUserMessage(text);
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            this.generateBotResponse(text);
        }, 1000);
    }

    addUserMessage(text) {
        this.messages.push({ type: 'outgoing', text, time: new Date() });
        this.renderMessages();
        this.saveMessages();
    }

    addBotMessage(text) {
        this.messages.push({ type: 'incoming', text, time: new Date() });
        this.renderMessages();
        this.saveMessages();
    }

    renderMessages() {
        const container = document.getElementById('chat-messages');
        container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.type}">
                <div class="chat-bubble">${msg.text}</div>
                <span class="chat-time">${this.formatTime(msg.time)}</span>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
        
        // Hide quick actions after messages
        const quickActions = document.getElementById('chat-quick-actions');
        if (quickActions && this.messages.length > 1) {
            quickActions.style.display = 'none';
        }
    }

    formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    generateBotResponse(userMessage) {
        const lower = userMessage.toLowerCase();
        let response = '';

        if (lower.includes('appointment') || lower.includes('book')) {
            response = "I'd be happy to help you book an appointment! You can:\n\n1. Book online: <a href='appointments.html'>Click here</a>\n2. Call us: +91 9876543210\n\nOur available times are Mon-Sat, 9 AM - 8 PM.";
        } else if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('pain')) {
            response = "🚨 For dental emergencies, please call our 24/7 hotline immediately:\n\n📞 <strong>+91 98765 43211</strong>\n\nIf you're experiencing severe pain, bleeding, or trauma, please seek care right away!";
        } else if (lower.includes('hour') || lower.includes('time') || lower.includes('open')) {
            response = "Our working hours are:\n\n📅 Monday - Friday: 9:00 AM - 8:00 PM\n📅 Saturday: 9:00 AM - 6:00 PM\n📅 Sunday: Emergency Only\n\n🚨 Emergency Hotline: Available 24/7";
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee')) {
            response = "Our consultation fee is ₹500. Treatment costs vary by procedure. Visit our <a href='insurance.html'>Insurance & Payments</a> page for pricing details and EMI options.\n\nWould you like a specific treatment quote?";
        } else if (lower.includes('location') || lower.includes('address') || lower.includes('where')) {
            response = "📍 We're located at:\n\n123 Health Street\nNear City Hospital\nVaranasi, UP 221001\n\n<a href='https://maps.google.com/?q=Dental+Institute+Varanasi' target='_blank'>Get Directions</a>";
        } else if (lower.includes('insurance')) {
            response = "We accept most major insurance providers including Star Health, ICICI Lombard, Max Bupa, and more. Visit our <a href='insurance.html'>Insurance page</a> for the full list.\n\nBring your insurance card and we'll verify your coverage!";
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            response = "Hello! 😊 Welcome to Dental Institute. How can I assist you today? You can ask about appointments, services, prices, or anything else!";
        } else if (lower.includes('thank')) {
            response = "You're welcome! 😊 Is there anything else I can help you with?";
        } else {
            response = "Thanks for your message! A member of our team will respond shortly.\n\nIn the meantime, you might find these helpful:\n• <a href='appointments.html'>Book Appointment</a>\n• <a href='services.html'>Our Services</a>\n• <a href='contact.html'>Contact Us</a>";
        }

        this.addBotMessage(response);
    }

    handleQuickAction(action) {
        switch(action) {
            case 'appointment':
                this.addUserMessage("I'd like to book an appointment");
                setTimeout(() => this.generateBotResponse('appointment'), 500);
                break;
            case 'emergency':
                this.addUserMessage("I have a dental emergency");
                setTimeout(() => this.generateBotResponse('emergency'), 500);
                break;
            case 'hours':
                this.addUserMessage("What are your working hours?");
                setTimeout(() => this.generateBotResponse('hours'), 500);
                break;
        }
    }

    saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }

    loadMessages() {
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
            this.messages = JSON.parse(saved);
            // Only keep messages from last 24 hours
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            this.messages = this.messages.filter(msg => new Date(msg.time) > dayAgo);
        }
    }
}

// Add additional styles for chat
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .chat-status {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #28a745;
        animation: pulse 2s infinite;
    }
    
    .status-text {
        font-size: 0.75rem;
        opacity: 0.8;
    }
    
    .chat-quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0.75rem;
        border-top: 1px solid #eee;
    }
    
    .quick-action {
        padding: 0.5rem 0.75rem;
        border: 1px solid #ddd;
        border-radius: 20px;
        background: transparent;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .quick-action:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .chat-time {
        font-size: 0.7rem;
        color: #999;
        margin-top: 0.25rem;
    }
    
    .chat-bubble a {
        color: inherit;
        text-decoration: underline;
    }
    
    .chat-message.incoming .chat-bubble a {
        color: var(--primary-color);
    }
`;
document.head.appendChild(chatStyles);

// Initialize chat widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ChatWidget = new ChatWidget();
});
