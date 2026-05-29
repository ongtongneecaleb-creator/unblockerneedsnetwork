// Admin PIN
const ADMIN_PIN = '788728';

// Data structure for links
let links = [];
let isAdminLoggedIn = false;

// DOM Elements
const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const closeAdmin = document.getElementById('closeAdmin');
const adminPin = document.getElementById('adminPin');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const adminPanel = document.getElementById('adminPanel');
const logoutBtn = document.getElementById('logoutBtn');
const userView = document.getElementById('userView');

const linkUrl = document.getElementById('linkUrl');
const blockerType = document.getElementById('blockerType');
const proxyType = document.getElementById('proxyType');
const addLinkBtn = document.getElementById('addLinkBtn');
const addMessage = document.getElementById('addMessage');
const adminLinksList = document.getElementById('adminLinksList');
const userLinksList = document.getElementById('userLinksList');

const filterBlocker = document.getElementById('filterBlocker');
const filterProxy = document.getElementById('filterProxy');

// Event Listeners
adminBtn.addEventListener('click', () => adminModal.classList.remove('hidden'));
closeAdmin.addEventListener('click', () => adminModal.classList.add('hidden'));
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
addLinkBtn.addEventListener('click', handleAddLink);
filterBlocker.addEventListener('change', renderUserLinks);
filterProxy.addEventListener('change', renderUserLinks);

// Close modal when clicking outside
adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        adminModal.classList.add('hidden');
    }
});

// Enter key to login
adminPin.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

// Handle admin login
function handleLogin() {
    loginError.textContent = '';
    
    if (adminPin.value === ADMIN_PIN) {
        isAdminLoggedIn = true;
        adminModal.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        adminBtn.style.display = 'none';
        adminPin.value = '';
        renderAdminLinks();
    } else {
        loginError.textContent = 'Invalid PIN';
        adminPin.value = '';
    }
}

// Handle admin logout
function handleLogout() {
    isAdminLoggedIn = false;
    adminPanel.classList.add('hidden');
    adminBtn.style.display = 'inline-block';
    addMessage.textContent = '';
}

// Handle add link
function handleAddLink() {
    addMessage.textContent = '';
    addMessage.classList.remove('error');
    
    const url = linkUrl.value.trim();
    const blocker = blockerType.value;
    const proxy = proxyType.value;
    
    if (!url) {
        addMessage.textContent = 'Please enter a URL';
        addMessage.classList.add('error');
        return;
    }
    
    if (!blocker) {
        addMessage.textContent = 'Please select a blocker type';
        addMessage.classList.add('error');
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        addMessage.textContent = 'Invalid URL format';
        addMessage.classList.add('error');
        return;
    }
    
    // Create link object
    const linkObj = {
        id: Date.now(),
        url: url,
        blocker: blocker,
        proxy: proxy || null,
        createdAt: new Date().toISOString()
    };
    
    // Add to links array
    links.push(linkObj);
    
    // Save to localStorage
    saveLinkData();
    
    // Reset form
    linkUrl.value = '';
    blockerType.value = '';
    proxyType.value = '';
    
    // Show success message
    addMessage.textContent = 'Link added successfully!';
    addMessage.classList.remove('error');
    
    // Render lists
    renderAdminLinks();
    renderUserLinks();
}

// Delete link
function deleteLink(id) {
    if (confirm('Are you sure you want to delete this link?')) {
        links = links.filter(link => link.id !== id);
        saveLinkData();
        renderAdminLinks();
        renderUserLinks();
    }
}

// Copy to clipboard
function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy link');
    });
}

// Render admin links list
function renderAdminLinks() {
    adminLinksList.innerHTML = '';
    
    if (links.length === 0) {
        adminLinksList.innerHTML = '<p class="empty-message">No links added yet</p>';
        return;
    }
    
    links.forEach(link => {
        const card = createLinkCard(link, true);
        adminLinksList.appendChild(card);
    });
}

// Render user links list with filters
function renderUserLinks() {
    userLinksList.innerHTML = '';
    
    const selectedBlocker = filterBlocker.value;
    const selectedProxy = filterProxy.value;
    
    let filteredLinks = links.filter(link => {
        const blockerMatch = !selectedBlocker || link.blocker === selectedBlocker;
        const proxyMatch = !selectedProxy || link.proxy === selectedProxy;
        return blockerMatch && proxyMatch;
    });
    
    if (filteredLinks.length === 0) {
        userLinksList.innerHTML = '<p class="empty-message">No links match your filters</p>';
        return;
    }
    
    filteredLinks.forEach(link => {
        const card = createLinkCard(link, false);
        userLinksList.appendChild(card);
    });
}

// Create link card element
function createLinkCard(link, isAdmin) {
    const card = document.createElement('div');
    card.className = 'link-card';
    
    const blockerLabel = getBlockerLabel(link.blocker);
    const proxyLabel = getProxyLabel(link.proxy);
    
    let badgesHTML = `<span class="badge">${blockerLabel}</span>`;
    if (link.proxy) {
        badgesHTML += `<span class="badge proxy">${proxyLabel}</span>`;
    }
    
    const urlDisplay = new URL(link.url).hostname || link.url;
    
    if (isAdmin) {
        card.innerHTML = `
            <h4 title="${link.url}">${urlDisplay}</h4>
            <p style="word-break: break-all; font-size: 0.9em; color: var(--text-secondary);">URL: ${link.url}</p>
            <div>${badgesHTML}</div>
            <div class="actions">
                <button class="copy-btn" onclick="copyLink('${link.url.replace(/'/g, "\\'")})">Copy</button>
                <button class="delete-btn" onclick="deleteLink(${link.id})">Delete</button>
            </div>
        `;
    } else {
        card.innerHTML = `
            <h4 title="${link.url}">${urlDisplay}</h4>
            <div>${badgesHTML}</div>
            <div class="actions">
                <button class="copy-btn" onclick="copyLink('${link.url.replace(/'/g, "\\'")})">Copy Link</button>
            </div>
        `;
    }
    
    return card;
}

// Get blocker label from value
function getBlockerLabel(value) {
    const labels = {
        'lightspeed': 'Lightspeed',
        'lightspeed_ai': 'Lightspeed AI',
        'blocksi_ai': 'Blocksi AI',
        'blocksi_web': 'Blocksi Web',
        'contentkeeper': 'ContentKeeper',
        'cisco': 'Cisco',
        'deledao': 'Deledao',
        'fortinet': 'Fortinet/FortiGuard',
        'securely': 'Securely',
        'linewize': 'Linewize'
    };
    return labels[value] || value;
}

// Get proxy label from value
function getProxyLabel(value) {
    const labels = {
        'zinko_space': 'Zinko Space',
        'infamous': 'Infamous',
        'axiom': 'Axiom',
        'alura': 'Alura',
        'arctic': 'Arctic'
    };
    return labels[value] || value;
}

// Save link data to localStorage
function saveLinkData() {
    localStorage.setItem('unblockerneedsnetwork_links', JSON.stringify(links));
}

// Load link data from localStorage
function loadLinkData() {
    const savedData = localStorage.getItem('unblockerneedsnetwork_links');
    if (savedData) {
        try {
            links = JSON.parse(savedData);
        } catch (e) {
            console.error('Error loading link data:', e);
            links = [];
        }
    }
}

// Initialize application
function init() {
    loadLinkData();
    renderUserLinks();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
