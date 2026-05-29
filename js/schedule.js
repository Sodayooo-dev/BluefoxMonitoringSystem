document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. MODAL TOGGLE LOGIC
    // ==========================================
    const addScheduleBtn = document.getElementById('open-add-schedule-btn');
    const scheduleModal = document.getElementById('add-schedule-modal');
    const closeModalX = document.getElementById('close-modal-x');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const scheduleForm = document.getElementById('add-schedule-form');

    function openModal() {
        if(scheduleModal) scheduleModal.classList.add('active');
    }

    function closeModal() {
        if(scheduleModal) scheduleModal.classList.remove('active');
    }

    if (addScheduleBtn) addScheduleBtn.addEventListener('click', openModal);
    if (closeModalX) closeModalX.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    // Close modal if user clicks on the dark overlay outside the box
    window.addEventListener('click', (e) => {
        if (e.target === scheduleModal) {
            closeModal();
        }
    });

    // Prevent form submission from reloading page (for now)
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Schedule Saved!");
            closeModal();
            scheduleForm.reset(); 
        });
    }

    // ==========================================
    // 2. CALENDAR GRID LOGIC
    // ==========================================
    const appointments = [
        { day: 'Monday', time: '11:00 am', title: 'Kent Peralta', desc: 'General Consultation' },
        { day: 'Tuesday', time: '8:00 pm', title: 'BYB Meeting', desc: '' }
    ];

    const weekDays = [
        { name: 'Mon', suffix: 'day', date: 'June 1, 2026' },
        { name: 'Tues', suffix: 'day', date: 'June 2, 2026' },
        { name: 'Wednes', suffix: 'day', date: 'June 3, 2026' },
        { name: 'Thurs', suffix: 'day', date: 'June 4, 2026' },
        { name: 'Fri', suffix: 'day', date: 'June 5, 2026' },
        { name: 'Satur', suffix: 'day', date: 'June 6, 2026', isWeekend: true },
        { name: 'Sun', suffix: 'day', date: 'June 7, 2026', isWeekend: true }
    ];

    const gridContainer = document.getElementById('weekly-grid');

    function renderWeek() {
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';
        
        weekDays.forEach(dayInfo => {
            const dayCol = document.createElement('div');
            dayCol.className = `calendar-day ${dayInfo.isWeekend ? 'weekend' : ''}`;
            
            let html = `
                <div class="day-header">
                    <span class="day-name">${dayInfo.name}<span>${dayInfo.suffix}</span></span>
                    <span class="day-date">${dayInfo.date}</span>
                </div>
                <div class="day-events">
            `;

            const fullDayName = dayInfo.name + dayInfo.suffix;
            const dayEvents = appointments.filter(app => app.day === fullDayName);

            dayEvents.forEach(event => {
                html += `
                    <div class="event-card">
                        <div class="event-time">${event.time}</div>
                        <div class="event-title">${event.title}</div>
                        ${event.desc ? `<div class="event-desc">${event.desc}</div>` : ''}
                    </div>
                `;
            });

            html += `</div>`;
            dayCol.innerHTML = html;
            gridContainer.appendChild(dayCol);
        });
    }

    renderWeek();
});