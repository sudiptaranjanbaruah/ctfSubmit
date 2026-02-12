// Global state
let ctfs = [];
let currentCTF = null;
let solvedCTFs = new Set();

// Check authentication on page load
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = 'login.html';
            return false;
        }
        const data = await response.json();
        document.getElementById('username').textContent = data.username;
        return true;
    } catch (error) {
        window.location.href = 'login.html';
        return false;
    }
}

// Load CTFs
async function loadCTFs() {
    try {
        const response = await fetch('/api/ctfs');
        const data = await response.json();
        ctfs = data;
        renderCTFs();
    } catch (error) {
        console.error('Failed to load CTFs:', error);
    }
}

// Load leaderboard
// Load solved CTFs
async function loadSolvedStatus() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();

        // Update solved CTFs for current user
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();

        // Data structure changed: data.overall is the array
        const currentUser = data.overall.find(u => u.username === userData.username);

        if (currentUser) {
            solvedCTFs = new Set(currentUser.solvedCTFs);
            renderCTFs(); // Re-render to show checkmarks
        }
    } catch (error) {
        console.error('Failed to load status:', error);
    }
}

// Render CTFs
function renderCTFs() {
    const grid = document.getElementById('ctfGrid');
    grid.innerHTML = '';

    ctfs.forEach(ctf => {
        const card = document.createElement('div');
        card.className = 'ctf-card';
        if (solvedCTFs.has(ctf.id)) {
            card.classList.add('solved');
        }
        card.innerHTML = `<h3>${ctf.title}</h3>`;
        card.addEventListener('click', () => openModal(ctf));
        grid.appendChild(card);
    });
}

// Open modal
function openModal(ctf) {
    currentCTF = ctf;
    document.getElementById('modalTitle').textContent = ctf.title;
    document.getElementById('modalDescription').textContent = ctf.description || '';
    document.getElementById('flagInput').value = '';
    document.getElementById('modalMessage').className = 'modal-message';
    document.getElementById('modalMessage').style.display = 'none';
    document.getElementById('submitModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('submitModal').classList.remove('active');
    currentCTF = null;
}

// Submit flag
async function submitFlag() {
    const flag = document.getElementById('flagInput').value.trim();
    const messageEl = document.getElementById('modalMessage');

    if (!flag) {
        messageEl.textContent = 'Please enter a flag';
        messageEl.className = 'modal-message error';
        return;
    }

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ctfId: currentCTF.id,
                submittedFlag: flag
            })
        });

        const data = await response.json();

        if (data.success) {
            messageEl.textContent = data.message;
            messageEl.className = 'modal-message success';
            solvedCTFs.add(currentCTF.id);
            renderCTFs();
            loadSolvedStatus();

            setTimeout(() => {
                closeModal();
            }, 2000);
        } else {
            messageEl.textContent = data.message;
            // Handle specific cases if needed, but message comes from server
            if (data.message === 'Already entered') {
                messageEl.className = 'modal-message warning'; // You might want to style warning differently
                messageEl.style.backgroundColor = '#fff3cd';
                messageEl.style.color = '#856404';
                messageEl.style.borderColor = '#ffeeba';
            } else {
                messageEl.className = 'modal-message error';
            }
            messageEl.style.display = 'block';
        }
    } catch (error) {
        messageEl.textContent = 'Submission failed. Please try again.';
        messageEl.className = 'modal-message error';
        messageEl.style.display = 'block';
    }
}

// Logout
async function logout() {
    try {
        await fetch('/logout', { method: 'POST' });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        await loadCTFs();
        await loadSolvedStatus();
    }
});

document.getElementById('hamburger').addEventListener('click', toggleSidebar);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('submitBtn').addEventListener('click', submitFlag);
document.getElementById('cancelBtn').addEventListener('click', closeModal);

// Close modal when clicking outside
document.getElementById('submitModal').addEventListener('click', (e) => {
    if (e.target.id === 'submitModal') {
        closeModal();
    }
});

// Submit on Enter key
document.getElementById('flagInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitFlag();
    }
});
