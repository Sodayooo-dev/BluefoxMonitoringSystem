document.addEventListener("DOMContentLoaded", function() {
    // 1. Security Check
    fetch('api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=check_session'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.loggedIn) {
            window.location.replace('index.html');
        } else {
            // Setup Profile Details
            document.getElementById('sidebar-user-name').innerText = data.name;
            document.getElementById('sidebar-user-role').innerHTML = `<i class="fa-solid fa-award"></i> ${data.role || 'Agent'}`;
            document.getElementById('sidebar-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&rounded=true`;
            
            // 2. Fetch Appointments
            loadAppointments();
        }
    })
    .catch(error => {
        console.error('Auth Check Error:', error);
        window.location.replace('index.html');
    });

    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        fetch('api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=logout'
        }).then(() => window.location.replace('index.html'));
    });
});

function formatTime(timeString) {
    if (!timeString) return '';
    const [hourString, minute] = timeString.split(':');
    const hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function loadAppointments() {
    fetch('api/dashboard_api.php?action=appointments_list')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update Top Stats
            document.getElementById('stat-total-appts').innerText = data.stats.total;
            document.getElementById('stat-confirmed-appts').innerText = data.stats.confirmed;
            document.getElementById('stat-pending-appts').innerText = data.stats.pending;
            
            document.getElementById('pag-total').innerText = data.stats.total;
            document.getElementById('pag-showing').innerText = Math.min(5, data.stats.total);

            const tbody = document.getElementById('appointments-table-body');
            const upcomingList = document.getElementById('upcoming-today-list');
            
            tbody.innerHTML = ''; 
            upcomingList.innerHTML = '';

            if (data.appointments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No appointments found.</td></tr>';
                upcomingList.innerHTML = '<p style="text-align: center; color: #8a8a8a; padding: 1rem 0;">No appointments today</p>';
                return;
            }

            // Populate Main Table
            data.appointments.slice(0, 5).forEach(app => {
                let statusClass = 'badge-pending';
                if (app.status.toLowerCase() === 'confirmed') statusClass = 'badge-confirmed';
                if (app.status.toLowerCase() === 'completed') statusClass = 'badge-confirmed';

                let clientName = app.client_name || 'Unknown Client';
                let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=random`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="client-info-cell">
                            <img src="${avatarUrl}" alt="Avatar">
                            <div class="client-details">
                                <strong>${clientName}</strong>
                                <span>${app.client_mobile || 'No Number'}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="date-info-cell">
                            <i class="fa-solid fa-calendar"></i>
                            <div class="client-details">
                                <strong>${formatDate(app.appointment_date)}</strong>
                                <span>${formatTime(app.appointment_time)}</span>
                            </div>
                        </div>
                    </td>
                    <td><strong>${app.treatment || 'General Consultation'}</strong></td>
                    <td><span class="badge ${statusClass}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></td>
                `;
                tbody.appendChild(row);
            });

            // Populate Upcoming Today (Mocking "Today" using the first 3 active appointments for display purposes)
            const todaySim = data.appointments.filter(a => a.status.toLowerCase() !== 'completed').slice(0, 3);
            if(todaySim.length === 0) {
                upcomingList.innerHTML = '<p style="text-align: center; color: #8a8a8a; padding: 1rem 0;">No appointments today</p>';
            } else {
                todaySim.forEach(app => {
                    let statusClass = 'badge-pending';
                    if (app.status.toLowerCase() === 'confirmed') statusClass = 'badge-confirmed';
                    
                    let clientName = app.client_name || 'Unknown Client';
                    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=random`;

                    upcomingList.innerHTML += `
                        <div class="upcoming-card">
                            <div class="client-info-cell">
                                <img src="${avatarUrl}" alt="Avatar">
                                <div class="client-details">
                                    <span style="color: #1800ad; font-weight: 700;">${formatTime(app.appointment_time)}</span>
                                    <strong>${clientName}</strong>
                                    <span style="font-weight: 500;">${app.treatment || 'Consultation'}</span>
                                </div>
                            </div>
                            <span class="badge ${statusClass}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                        </div>
                    `;
                });
            }
            
        } else {
            console.error("Error loading appointments: ", data.error);
        }
    })
    .catch(error => console.error("Fetch Error: ", error));
}