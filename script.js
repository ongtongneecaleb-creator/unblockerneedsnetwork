// Admin PIN
const ADMIN_PIN = '788728';

// Data structure for links
let links = [];
let isAdminLoggedIn = false;

// Current page state
let currentPage = 'dispenser';

// DOM Elements - Navigation
const dispenserNavBtn = document.getElementById('dispenserNavBtn');
const proxyNavBtn = document.getElementById('proxyNavBtn');
const adminNavBtn = document.getElementById('adminNavBtn');
const dispenserPage = document.getElementById('dispenserPage');
const proxyPage = document.getElementById('proxyPage');

// DOM Elements - Admin
const adminModal = document.getElementById('adminModal');
const closeAdmin = document.getElementById('closeAdmin');
const adminPin = document.getElementById('adminPin');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const adminPanel = document.getElementById('adminPanel');
const logoutBtn = document.getElementById('logoutBtn');
const userView = document.getElementById('userView');

// DOM Elements - Link Dispenser
const linkUrl = document.getElementById('linkUrl');
const blockerType = document.getElementById('blockerType');
const proxyType = document.getElementById('proxyType');
const addLinkBtn = document.getElementById('addLinkBtn');
const addMessage = document.getElementById('addMessage');
const adminLinksList = document.getElementById('adminLinksList');
const userLinksList = document.getElementById('userLinksList');

const filterBlocker = document.getElementById('filterBlocker');
const filterProxy = document.getElementById('filterProxy');

// DOM Elements - Proxy
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const proxyResults = document.getElementById('proxyResults');

// Event Listeners - Navigation
dispenserNavBtn.addEventListener('click', () => switchPage('dispenser'));
proxyNavBtn.addEventListener('click', () => switchPage('proxy'));
adminNavBtn.addEventListener('click', () => adminModal.classList.remove('hidden'));

// Event Listeners - Admin
closeAdmin.addEventListener('click', () => adminModal.classList.add('hidden'));
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
addLinkBtn.addEventListener('click', handleAddLink);

// Event Listeners - Link Dispenser
filterBlocker.addEventListener('change', renderUserLinks);
filterProxy.addEventListener('change', renderUserLinks);

// Event Listeners - Proxy
if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (searchInput) searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

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

// Page Switching
function switchPage(page) {
    currentPage = page;
    
    // Update pages
    if (page === 'dispenser') {
        dispenserPage.classList.add('active');
        proxyPage.classList.remove('active');
        dispenserNavBtn.classList.add('active');
        proxyNavBtn.classList.remove('active');
    } else if (page === 'proxy') {
        dispenserPage.classList.remove('active');
        proxyPage.classList.add('active');
        dispenserNavBtn.classList.remove('active');
        proxyNavBtn.classList.add('active');
    }
}

// Handle DuckDuckGo Search
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        proxyResults.innerHTML = '<p class="empty-message">Please enter a search query</p>';
        return;
    }
    
    proxyResults.innerHTML = '<div class="loading"></div><p>Searching...</p>';
    
    try {
        // Using DuckDuckGo's API endpoint
        const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
        
        // Since we can't directly fetch from DuckDuckGo API due to CORS, we'll use a proxy
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`);
        const data = await response.json();
        
        if (data.status === 200) {
            const results = JSON.parse(data.contents);
            displaySearchResults(results, query);
        } else {
            throw new Error('Failed to fetch results');
        }
    } catch (error) {
        console.error('Search error:', error);
        proxyResults.innerHTML = `
            <p class="empty-message">
                <strong>⚠️ Unable to fetch results</strong><br>
                <small>Try using this direct search link:<br>
                <a href="https://duckduckgo.com/?q=${encodeURIComponent(searchInput.value)}" target="_blank" class="result-link-btn">
                    Search on DuckDuckGo
                </a></small>
            </p>
        `;
    }
}

// Display Search Results
function displaySearchResults(results, query) {
    if (!results.RelatedTopics || results.RelatedTopics.length === 0) {
        proxyResults.innerHTML = '<p class="empty-message">No results found. Try a different search.</p>';
        return;
    }
    
    let html = '';
    
    // Display abstract if available
    if (results.AbstractText) {
        html += `
            <div class="search-result">
                <div class="result-title">${results.AbstractTitle || 'Result'}</div>
                <div class="result-snippet">${results.AbstractText}</div>
                ${results.AbstractURL ? `<a href="${results.AbstractURL}" target="_blank" class="result-link-btn">View More</a>` : ''}
            </div>
        `;
    }
    
    // Display related topics (limited to 10)
    results.RelatedTopics.slice(0, 10).forEach(topic => {
        if (topic.Text) {
            const title = topic.FirstURL ? extractDomain(topic.FirstURL) : 'Result';
            html += `
                <div class="search-result">
                    <div class="result-title">${topic.Text.substring(0, 100)}</div>
                    ${topic.FirstURL ? `<div class="result-url">${topic.FirstURL}</div>` : ''}
                    <div class="result-snippet">${topic.Description || 'No description available'}</div>
                    ${topic.FirstURL ? `<a href="${topic.FirstURL}" target="_blank" class="result-link-btn">Visit Site</a>` : ''}
                </div>
            `;
        }
    });
    
    proxyResults.innerHTML = html || '<p class="empty-message">No results found.</p>';
}

// Extract domain from URL
function extractDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

// Handle admin login
function handleLogin() {
    loginError.textContent = '';
    
    if (adminPin.value === ADMIN_PIN) {
        isAdminLoggedIn = true;
        adminModal.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        userView.style.display = 'none';
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
    userView.style.display = 'block';
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
        'axiom': 'Axiom',
        'arctic': 'Arctic',
        'aspen': 'Aspen',
        'alura': 'Alura',
        'axis': 'Axis',
        'awp': 'AWP',
        'bolt': 'Bolt',
        'boredom': 'Boredom',
        'best_spark': 'Best Spark',
        'bromine_lite': 'Bromine Lite',
        'cherri': 'Cherri',
        'classroom_spot_os': 'Classroom Spot OS',
        'cheesy': 'Cheesy',
        'celestial': 'Celestial',
        'chicken_king_vault': 'Chicken King Vault',
        'daydream': 'Daydream',
        'dogeub': 'DogeUB',
        'edu_rocks': 'EDU Rocks',
        'epicway': 'Epicway',
        'endless_proxy': 'Endless Proxy',
        'elite_gamez': 'Elite Gamez',
        'everest': 'Everest',
        'fern': 'Fern',
        'frost_chicken': 'Frost Chicken',
        'froggies_arcade': 'Froggies Arcade',
        'flux': 'Flux',
        'frosted': 'Frosted',
        'g_gui': 'G.GUI',
        'galaxy': 'Galaxy',
        'ghost': 'Ghost',
        'hustle_empire': 'Hustle Empire',
        'imp': 'Imp',
        'infamous': 'Infamous',
        'kraken_network': 'Kraken Network',
        'lunaar': 'Lunaar',
        'lich_games': 'Lich Games',
        'lucide': 'Lucide',
        'misu_math': 'Misu Math',
        'mist': 'Mist',
        'nebuli_os': 'Nebuli OS',
        'nexora': 'Nexora',
        'nautilus_os': 'Nautilus OS',
        'noahs_tutoring': "Noah's Tutoring",
        'neo': 'Neo',
        'over_cloaked': 'Over Cloaked',
        'otonic': 'Otonic',
        'petezah': 'Petezah',
        'rosin': 'Rosin',
        'rus': 'RUS',
        'relic_network': 'Relic Network',
        'study_hub': 'Study Hub',
        'splash': 'Splash',
        'space': 'Space',
        'shadow': 'Shadow',
        'strong_dog': 'Strong Dog',
        'truffled': 'Truffled',
        'void_network': 'Void Network',
        'vapor': 'Vapor',
        'velera': 'Velera',
        'virdians_learning_node': 'Virdians Learning Node',
        'weslack': 'Weslack',
        'waves': 'Waves',
        'xylora': 'Xylora',
        'zodiac': 'Zodiac',
        'z_kit': 'Z-Kit'
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
