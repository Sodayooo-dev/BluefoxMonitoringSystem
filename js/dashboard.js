document.addEventListener("DOMContentLoaded", function() {
    // 1. Security Check: Verify session with the server
    fetch('api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=check_session'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.loggedIn) {
            // Kick out if not logged in
            window.location.replace('index.html'); 
        } else {
            // Update Welcome Text and Sidebar Profile with real name
            document.getElementById('welcome-name').innerText = `Welcome ${data.name}!`;
            document.getElementById('sidebar-user-name').innerText = data.name;
            
            // 2. Fetch Dashboard Stats
            loadDashboardStats();
        }
    })
    .catch(error => {
        console.error('Auth Check Error:', error);
        window.location.replace('index.html');
    });

    // 3. Setup Logout Button listener
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        fetch('api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=logout'
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.replace('index.html');
            }
        });
    });
});

function loadDashboardStats() {
    fetch('api/dashboard_api.php?action=dashboard_stats')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the UI with data from the database
            document.getElementById('stat-appointments').innerText = data.stats.todayAppointments;
            document.getElementById('stat-clients').innerText = data.stats.totalClients;
            document.getElementById('stat-plans').innerText = data.stats.ongoingPlans;
            document.getElementById('stat-recruitment').innerText = data.stats.totalRecruitment;
            
            // You can also call functions here to load the lists into 'todays-schedule-list'
            // and 'recent-appointments-list' once you create those API endpoints.
        } else {
            console.error("Error loading stats: ", data.error);
        }
    })
    .catch(error => console.error("Error fetching stats: ", error));
}