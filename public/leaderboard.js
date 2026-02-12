// State
let leaderboardData = null;
let ctfs = [];

// Fetch Data
async function init() {
    try {
        const [lbResponse, ctfsResponse] = await Promise.all([
            fetch('/api/leaderboard'),
            fetch('/api/ctfs')
        ]);

        if (!lbResponse.ok) {
            // likely unauth
            window.location.href = 'login.html';
            return;
        }

        leaderboardData = await lbResponse.json();
        ctfs = await ctfsResponse.json();

        renderTabs();
        renderLeaderboard('overall'); // Default view
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Render Tabs
function renderTabs() {
    const tabsContainer = document.getElementById('leaderboardTabs');

    ctfs.forEach(ctf => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.textContent = ctf.title;
        btn.onclick = () => switchTab(ctf.id.toString(), btn);
        tabsContainer.appendChild(btn);
    });

    // Add click handler for Overall tab
    const overallBtn = tabsContainer.querySelector('[data-tab="overall"]');
    overallBtn.onclick = () => switchTab('overall', overallBtn);
}

// Switch Tab
function switchTab(tabId, btnElement) {
    // Update active state
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    renderLeaderboard(tabId);
}

// Render Leaderboard Table
function renderLeaderboard(type) {
    const container = document.getElementById('leaderboardContent');
    let html = `
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>${type === 'overall' ? 'Solved' : 'Solved At'}</th>
                </tr>
            </thead>
            <tbody>
    `;

    let data = [];

    if (type === 'overall') {
        data = leaderboardData.overall;
    } else {
        data = leaderboardData.ctfs[type] || [];
    }

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#7f8c8d; font-size:1.2rem; padding:20px;">No submissions yet</p>';
        return;
    }

    data.forEach((entry, index) => {
        const value = type === 'overall'
            ? `${entry.solvedCount} challenges`
            : new Date(entry.timestamp).toLocaleString();

        html += `
            <tr>
                <td class="rank-cell">#${index + 1}</td>
                <td>${entry.username}</td>
                <td>${value}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
