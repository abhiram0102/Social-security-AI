/**
 * AI Assistant Frontend App
 * 
 * This file contains all the frontend functionality for the AI Assistant:
 * - Chat interface with message history
 * - Voice input and output
 * - File uploading
 * - System resource monitoring
 * - Theme switching
 * - Language selection
 * - Authentication (Login/Register)
 */

// Configuration
const CONFIG = {
    // Backend API endpoint
    API_URL: 'http://localhost:5001',
    
    // Polling interval for system resources (in ms)
    SYSTEM_RESOURCES_INTERVAL: 2000,
    
    // Speech synthesis configuration
    SPEECH: {
        enabled: true,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
    },
    
    // Voice recognition configuration
    VOICE_RECOGNITION: {
        enabled: true,
        continuous: false,
        interimResults: true,
        lang: 'en-US'
    }
};

// DOM Elements
const DOM = {
    // Chat elements
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    voiceBtn: document.getElementById('voice-btn'),
    suggestedQueries: document.getElementById('suggested-queries'),
    
    // File upload elements
    uploadBtn: document.getElementById('upload-btn'),
    fileInput: document.getElementById('file-input'),
    uploadModal: document.getElementById('upload-modal'),
    uploadArea: document.getElementById('upload-area'),
    uploadFileInput: document.getElementById('upload-file-input'),
    fileCommand: document.getElementById('file-command'),
    uploadSubmitBtn: document.getElementById('upload-submit-btn'),
    
    // System stats elements
    systemStatsBtn: document.getElementById('system-stats-btn'),
    systemStatsPanel: document.getElementById('system-stats-panel'),
    cpuBar: document.getElementById('cpu-bar'),
    cpuText: document.getElementById('cpu-text'),
    memoryBar: document.getElementById('memory-bar'),
    memoryText: document.getElementById('memory-text'),
    memoryDetails: document.getElementById('memory-details'),
    diskBar: document.getElementById('disk-bar'),
    diskText: document.getElementById('disk-text'),
    diskDetails: document.getElementById('disk-details'),
    batterySection: document.getElementById('battery-section'),
    batteryBar: document.getElementById('battery-bar'),
    batteryText: document.getElementById('battery-text'),
    batteryDetails: document.getElementById('battery-details'),
    
    // Theme toggle
    toggleThemeBtn: document.getElementById('toggle-theme-btn'),
    
    // Language selector
    languageSelector: document.getElementById('language-selector'),
    
    // Login elements
    loginBtn: document.getElementById('login-btn'),
    loginPanel: document.getElementById('login-panel'),
    loginForm: document.getElementById('login-form'),
    registerBtn: document.getElementById('register-btn'),
    
    // Close buttons
    closeButtons: document.querySelectorAll('.close-panel-btn, .close-modal-btn')
};

// State
const STATE = {
    messages: [],
    isListening: false,
    isLoggedIn: false,
    currentUser: null,
    darkMode: true,
    currentLanguage: 'en',
    systemResourcesInterval: null,
    recognition: null
};

// Initialize the app
function initApp() {
    // Load preferences from localStorage
    loadPreferences();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize the speech recognition if supported
    initSpeechRecognition();
    
    // Fetch suggested queries
    fetchSuggestedQueries();
    
    // Start system resources monitoring
    startSystemResourcesMonitoring();
    
    // Add initial welcome message
    addSystemMessage('Hello! I\'m your AI Assistant. How can I help you today?');
    
    console.log('AI Assistant initialized successfully!');
}

// Load preferences from localStorage
function loadPreferences() {
    // Check for dark mode preference
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode !== null) {
        STATE.darkMode = darkMode === 'true';
        updateTheme();
    }
    
    // Check for language preference
    const language = localStorage.getItem('language');
    if (language) {
        STATE.currentLanguage = language;
        DOM.languageSelector.value = language;
    }
    
    // Check if logged in
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            STATE.currentUser = JSON.parse(userData);
            STATE.isLoggedIn = true;
            updateLoginState();
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('userData');
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Chat input
    DOM.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    DOM.sendBtn.addEventListener('click', sendMessage);
    
    // Voice input
    DOM.voiceBtn.addEventListener('click', toggleVoiceInput);
    
    // Suggested queries
    DOM.suggestedQueries.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggested-query')) {
            DOM.chatInput.value = e.target.textContent;
            sendMessage();
        }
    });
    
    // File upload
    DOM.uploadBtn.addEventListener('click', () => {
        DOM.uploadModal.classList.remove('hidden');
    });
    
    DOM.uploadArea.addEventListener('click', () => {
        DOM.uploadFileInput.click();
    });
    
    DOM.uploadFileInput.addEventListener('change', handleFileSelect);
    
    DOM.uploadSubmitBtn.addEventListener('click', uploadFile);
    
    // Drag and drop for file upload
    DOM.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.uploadArea.classList.add('active');
    });
    
    DOM.uploadArea.addEventListener('dragleave', () => {
        DOM.uploadArea.classList.remove('active');
    });
    
    DOM.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.uploadArea.classList.remove('active');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            DOM.uploadFileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });
    
    // System stats panel
    DOM.systemStatsBtn.addEventListener('click', () => {
        DOM.systemStatsPanel.classList.toggle('hidden');
        if (!DOM.systemStatsPanel.classList.contains('hidden')) {
            fetchSystemResources();
        }
    });
    
    // Theme toggle
    DOM.toggleThemeBtn.addEventListener('click', () => {
        STATE.darkMode = !STATE.darkMode;
        updateTheme();
        localStorage.setItem('darkMode', STATE.darkMode);
    });
    
    // Language selector
    DOM.languageSelector.addEventListener('change', (e) => {
        STATE.currentLanguage = e.target.value;
        localStorage.setItem('language', STATE.currentLanguage);
        
        // Update speech recognition language if active
        if (STATE.recognition) {
            stopSpeechRecognition();
            initSpeechRecognition();
        }
    });
    
    // Login panel
    DOM.loginBtn.addEventListener('click', () => {
        if (STATE.isLoggedIn) {
            logout();
        } else {
            DOM.loginPanel.classList.remove('hidden');
        }
    });
    
    DOM.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
    
    DOM.registerBtn.addEventListener('click', () => {
        // Would typically switch to a registration form
        alert('Registration functionality would be implemented here');
    });
    
    // Close buttons
    DOM.closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target.closest('.panel, .modal');
            if (target) {
                target.classList.add('hidden');
            }
        });
    });
}

// Initialize speech recognition
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        DOM.voiceBtn.style.display = 'none';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    STATE.recognition = new SpeechRecognition();
    
    // Set recognition properties
    STATE.recognition.continuous = CONFIG.VOICE_RECOGNITION.continuous;
    STATE.recognition.interimResults = CONFIG.VOICE_RECOGNITION.interimResults;
    
    // Set language based on current selection
    STATE.recognition.lang = getMappedLanguageCode(STATE.currentLanguage);
    
    // Recognition events
    STATE.recognition.onstart = () => {
        STATE.isListening = true;
        DOM.voiceBtn.classList.add('active');
        DOM.voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        
        // Show listening indicator
        addSystemMessage('Listening...', true);
    };
    
    STATE.recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        
        // Update the chat input with the transcript
        DOM.chatInput.value = transcript;
        
        // If we're confident it's a final result, send the message
        if (event.results[last].isFinal) {
            sendMessage();
        }
    };
    
    STATE.recognition.onend = () => {
        STATE.isListening = false;
        DOM.voiceBtn.classList.remove('active');
        DOM.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        
        // Remove the listening indicator
        removeListeningIndicator();
    };
    
    STATE.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
            addSystemMessage('No speech detected. Please try again.', true);
        } else {
            addSystemMessage(`Error: ${event.error}. Please try typing instead.`, true);
        }
        
        STATE.isListening = false;
        DOM.voiceBtn.classList.remove('active');
        DOM.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    };
}

// Start speech recognition
function startSpeechRecognition() {
    if (STATE.recognition) {
        try {
            STATE.recognition.start();
        } catch (error) {
            console.error('Speech recognition error:', error);
        }
    }
}

// Stop speech recognition
function stopSpeechRecognition() {
    if (STATE.recognition) {
        try {
            STATE.recognition.stop();
        } catch (error) {
            console.error('Speech recognition error:', error);
        }
    }
}

// Toggle voice input
function toggleVoiceInput() {
    if (STATE.isListening) {
        stopSpeechRecognition();
    } else {
        startSpeechRecognition();
    }
}

// Get the appropriate language code for speech recognition
function getMappedLanguageCode(languageCode) {
    const languageMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'bn': 'bn-IN',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'de': 'de-DE',
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'ar': 'ar-SA',
        'ru': 'ru-RU'
    };
    
    return languageMap[languageCode] || 'en-US';
}

// Fetch suggested queries from the API
function fetchSuggestedQueries() {
    fetch(`${CONFIG.API_URL}/api/suggestions`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Clear existing suggestions
            DOM.suggestedQueries.innerHTML = '';
            
            // Add new suggestions
            data.suggestions.forEach(suggestion => {
                const span = document.createElement('span');
                span.className = 'suggested-query';
                span.textContent = suggestion;
                DOM.suggestedQueries.appendChild(span);
            });
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
            // Add some default suggestions if API fails
            const defaultSuggestions = [
                'Generate a Python script',
                'Show system resources',
                'What time is it?',
                'Tell me a joke'
            ];
            
            DOM.suggestedQueries.innerHTML = '';
            
            defaultSuggestions.forEach(suggestion => {
                const span = document.createElement('span');
                span.className = 'suggested-query';
                span.textContent = suggestion;
                DOM.suggestedQueries.appendChild(span);
            });
        });
}

// Start monitoring system resources
function startSystemResourcesMonitoring() {
    // Clear any existing interval
    if (STATE.systemResourcesInterval) {
        clearInterval(STATE.systemResourcesInterval);
    }
    
    // Fetch resources immediately
    fetchSystemResources();
    
    // Set up interval to fetch resources
    STATE.systemResourcesInterval = setInterval(fetchSystemResources, CONFIG.SYSTEM_RESOURCES_INTERVAL);
}

// Fetch system resources from the API
function fetchSystemResources() {
    fetch(`${CONFIG.API_URL}/api/system/resources`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateSystemResourcesUI(data);
        })
        .catch(error => {
            console.error('Error fetching system resources:', error);
            // Set some default values if API fails
            updateSystemResourcesUI({
                cpu: {
                    percent: 0
                },
                memory: {
                    percent: 0,
                    used_gb: 0,
                    total_gb: 0
                },
                disk: {
                    percent: 0,
                    used_gb: 0,
                    total_gb: 0
                },
                battery: {
                    percent: null,
                    plugged: null
                }
            });
        });
}

// Update the UI with system resources data
function updateSystemResourcesUI(data) {
    // CPU
    DOM.cpuBar.style.width = `${data.cpu.percent}%`;
    DOM.cpuText.textContent = `${data.cpu.percent}%`;
    
    // Set color based on usage
    if (data.cpu.percent > 90) {
        DOM.cpuBar.style.backgroundColor = 'var(--error)';
    } else if (data.cpu.percent > 70) {
        DOM.cpuBar.style.backgroundColor = 'var(--warning)';
    } else {
        DOM.cpuBar.style.backgroundColor = 'var(--accent)';
    }
    
    // Memory
    DOM.memoryBar.style.width = `${data.memory.percent}%`;
    DOM.memoryText.textContent = `${data.memory.percent}%`;
    DOM.memoryDetails.textContent = `${data.memory.used_gb} GB / ${data.memory.total_gb} GB`;
    
    if (data.memory.percent > 90) {
        DOM.memoryBar.style.backgroundColor = 'var(--error)';
    } else if (data.memory.percent > 70) {
        DOM.memoryBar.style.backgroundColor = 'var(--warning)';
    } else {
        DOM.memoryBar.style.backgroundColor = 'var(--accent)';
    }
    
    // Disk
    DOM.diskBar.style.width = `${data.disk.percent}%`;
    DOM.diskText.textContent = `${data.disk.percent}%`;
    DOM.diskDetails.textContent = `${data.disk.used_gb} GB / ${data.disk.total_gb} GB`;
    
    if (data.disk.percent > 90) {
        DOM.diskBar.style.backgroundColor = 'var(--error)';
    } else if (data.disk.percent > 70) {
        DOM.diskBar.style.backgroundColor = 'var(--warning)';
    } else {
        DOM.diskBar.style.backgroundColor = 'var(--accent)';
    }
    
    // Battery
    if (data.battery.percent !== null) {
        DOM.batterySection.classList.remove('hidden');
        DOM.batteryBar.style.width = `${data.battery.percent}%`;
        DOM.batteryText.textContent = `${data.battery.percent}%`;
        
        if (data.battery.plugged) {
            DOM.batteryDetails.textContent = 'Status: Charging';
        } else {
            DOM.batteryDetails.textContent = 'Status: Discharging';
        }
        
        if (data.battery.percent < 20 && !data.battery.plugged) {
            DOM.batteryBar.style.backgroundColor = 'var(--error)';
        } else if (data.battery.percent < 50 && !data.battery.plugged) {
            DOM.batteryBar.style.backgroundColor = 'var(--warning)';
        } else {
            DOM.batteryBar.style.backgroundColor = 'var(--success)';
        }
    } else {
        DOM.batterySection.classList.add('hidden');
    }
}

// Update the UI theme
function updateTheme() {
    if (STATE.darkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        DOM.toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        DOM.toggleThemeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Update login state in the UI
function updateLoginState() {
    if (STATE.isLoggedIn && STATE.currentUser) {
        DOM.loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
        DOM.loginBtn.title = 'Logout';
    } else {
        DOM.loginBtn.innerHTML = '<i class="fas fa-user"></i>';
        DOM.loginBtn.title = 'Login';
    }
}

// Handle file selection
function handleFileSelect() {
    const file = DOM.uploadFileInput.files[0];
    if (file) {
        DOM.uploadArea.innerHTML = `
            <i class="fas fa-file"></i>
            <p>${file.name} (${formatFileSize(file.size)})</p>
            <p class="file-type">${file.type || 'Unknown type'}</p>
        `;
    }
}

// Format file size in a human-readable format
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload a file to the server
function uploadFile() {
    const file = DOM.uploadFileInput.files[0];
    if (!file) {
        alert('Please select a file to upload');
        return;
    }
    
    const command = DOM.fileCommand.value;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('command', command);
    
    // Show loading state
    DOM.uploadSubmitBtn.disabled = true;
    DOM.uploadSubmitBtn.textContent = 'Uploading...';
    
    // Upload the file
    fetch(`${CONFIG.API_URL}/api/upload`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('File uploaded successfully:', data);
            
            // Close the modal
            DOM.uploadModal.classList.add('hidden');
            
            // Reset the upload form
            DOM.uploadFileInput.value = '';
            DOM.uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop file here or click to select</p>
            `;
            
            // Add a message to the chat
            addSystemMessage(`File "${data.filename}" uploaded successfully and ${data.command} operation queued.`);
            
            // Reset button state
            DOM.uploadSubmitBtn.disabled = false;
            DOM.uploadSubmitBtn.textContent = 'Upload';
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            
            // Show error message
            alert(`Error uploading file: ${error.message}`);
            
            // Reset button state
            DOM.uploadSubmitBtn.disabled = false;
            DOM.uploadSubmitBtn.textContent = 'Upload';
        });
}

// Send a message to the AI assistant
function sendMessage() {
    const message = DOM.chatInput.value.trim();
    if (!message) return;
    
    // Clear the input
    DOM.chatInput.value = '';
    
    // Add the message to the chat
    addUserMessage(message);
    
    // Send the message to the server
    const payload = {
        query: message,
        language: STATE.currentLanguage,
        voice_mode: CONFIG.SPEECH.enabled
    };
    
    fetch(`${CONFIG.API_URL}/api/assistant`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                addSystemMessage(`Error: ${data.error}`);
                return;
            }
            
            // Handle different response types
            if (data.intent === 'code_generation') {
                // For code generation, show the code in a formatted way
                addAssistantMessage(data.response.explanation);
                addCodeBlock(data.response.code, data.response.language);
            } else {
                // For other responses, just show the text
                addAssistantMessage(data.response);
            }
            
            // Speak the response if speech is enabled
            if (CONFIG.SPEECH.enabled) {
                speakText(typeof data.response === 'string' ? data.response : data.response.explanation);
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            addSystemMessage(`Sorry, I encountered an error processing your request: ${error.message}`);
        });
}

// Add a user message to the chat
function addUserMessage(text) {
    const message = {
        type: 'user',
        text,
        timestamp: new Date()
    };
    
    STATE.messages.push(message);
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${escapeHTML(text)}</p>
            <div class="timestamp">
                <span class="time">${formatTime(message.timestamp)}</span>
            </div>
        </div>
    `;
    
    DOM.chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// Add an assistant message to the chat
function addAssistantMessage(text) {
    const message = {
        type: 'assistant',
        text,
        timestamp: new Date()
    };
    
    STATE.messages.push(message);
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message assistant';
    
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="typing-animation">
                <p>${escapeHTML(text)}</p>
            </div>
            <div class="timestamp">
                <span class="time">${formatTime(message.timestamp)}</span>
            </div>
        </div>
    `;
    
    DOM.chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// Add a system message to the chat
function addSystemMessage(text, isTemporary = false) {
    // Only add the message to state if it's not temporary
    if (!isTemporary) {
        const message = {
            type: 'system',
            text,
            timestamp: new Date()
        };
        
        STATE.messages.push(message);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message system';
    if (isTemporary) {
        messageElement.classList.add('temporary');
    }
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${escapeHTML(text)}</p>
            <div class="timestamp">
                <span class="time">${formatTime(new Date())}</span>
            </div>
        </div>
    `;
    
    DOM.chatMessages.appendChild(messageElement);
    scrollToBottom();
}

// Add a code block to the chat
function addCodeBlock(code, language) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message assistant';
    
    // Generate a random ID for the code block
    const codeBlockId = `code-block-${Date.now()}`;
    
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="code-block">
                <div class="code-header">
                    <span>${language || 'code'}</span>
                    <div class="code-actions">
                        <button class="copy-code-btn" data-code-id="${codeBlockId}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
                <div class="code-content">
                    <pre><code id="${codeBlockId}" class="language-${language || 'plaintext'}">${escapeHTML(code)}</code></pre>
                </div>
            </div>
            <div class="timestamp">
                <span class="time">${formatTime(new Date())}</span>
            </div>
        </div>
    `;
    
    DOM.chatMessages.appendChild(messageElement);
    
    // Add event listener for copy button
    const copyBtn = messageElement.querySelector('.copy-code-btn');
    copyBtn.addEventListener('click', () => {
        const codeElement = document.getElementById(codeBlockId);
        navigator.clipboard.writeText(codeElement.textContent)
            .then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            });
    });
    
    // Highlight the code
    if (window.hljs) {
        window.hljs.highlightElement(document.getElementById(codeBlockId));
    }
    
    scrollToBottom();
}

// Remove the temporary listening indicator
function removeListeningIndicator() {
    const temporaryMessages = DOM.chatMessages.querySelectorAll('.message.system.temporary');
    temporaryMessages.forEach(message => {
        message.remove();
    });
}

// Format time for display
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Speak text using the Web Speech API
function speakText(text) {
    if (!('speechSynthesis' in window)) {
        console.log('Speech synthesis not supported');
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set speech properties
    utterance.rate = CONFIG.SPEECH.rate;
    utterance.pitch = CONFIG.SPEECH.pitch;
    utterance.volume = CONFIG.SPEECH.volume;
    
    // Set language based on current selection
    utterance.lang = getMappedLanguageCode(STATE.currentLanguage);
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
}

// Login functionality
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    // In a real application, this would call the backend API
    // For demonstration, we'll simulate a login
    simulateLogin(username, password);
}

// Simulate login (for demonstration purposes)
function simulateLogin(username, password) {
    // Simulated successful login
    STATE.currentUser = {
        id: 1,
        username,
        displayName: username,
        email: `${username}@example.com`
    };
    
    STATE.isLoggedIn = true;
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(STATE.currentUser));
    
    // Update UI
    updateLoginState();
    
    // Close the login panel
    DOM.loginPanel.classList.add('hidden');
    
    // Add success message
    addSystemMessage(`Logged in successfully as ${username}`);
}

// Logout functionality
function logout() {
    STATE.currentUser = null;
    STATE.isLoggedIn = false;
    
    // Remove from localStorage
    localStorage.removeItem('userData');
    
    // Update UI
    updateLoginState();
    
    // Add message
    addSystemMessage('Logged out successfully');
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll to the bottom of the chat
function scrollToBottom() {
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);