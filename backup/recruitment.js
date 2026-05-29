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
            
            // 2. Fetch Recruits
            loadRecruits();
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

function loadRecruits() {
    fetch('api/dashboard_api.php?action=recruits_list')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('recruits-container');
        container.innerHTML = ''; 

        if (data.success) {
            if (data.recruits.length === 0) {
                container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #8a8a8a;">No recruits found.</div>';
                return;
            }

            data.recruits.forEach(recruit => {
                const fullName = `${recruit.first_name} ${recruit.last_name}`;
                // Fallback to a gray UI avatar matching the mockup if no image is present
                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=8a8a8a&color=fff&rounded=true`;

                const card = document.createElement('div');
                card.className = 'recruit-card';
                card.setAttribute('data-status', recruit.status);
                
                // Matches the horizontal mockup layout
                card.innerHTML = `
                    <div class="recruit-avatar-wrapper">
                        <img src="${avatarUrl}" alt="${fullName}" class="recruit-avatar">
                    </div>
                    <div class="recruit-details">
                        <h3 class="recruit-name">${fullName}</h3>
                        <div class="recruit-status">Status: ${recruit.status}</div>
                        <button class="view-details-btn">View Details</button>
                    </div>
                `;
                container.appendChild(card);
            });
            
            // Re-initialize filter logic if you are using it
            setupStatusFilter();
        } else {
            console.error("Error loading recruits: ", data.error);
        }
    })
    .catch(error => console.error("Fetch Error: ", error));
}

// Function to handle the dropdown filtering on the client side
function setupStatusFilter() {
    const filterSelect = document.getElementById('recruit-status-filter');
    filterSelect.addEventListener('change', function() {
        const selectedValue = this.value.toLowerCase();
        const cards = document.querySelectorAll('.recruit-card');
        
        cards.forEach(card => {
            const cardStatus = (card.getAttribute('data-status') || '').toLowerCase();
            
            if (selectedValue === 'all' || cardStatus === selectedValue) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}