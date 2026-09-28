import { initHeader } from './modules/header.js';
import { requireAuth } from './modules/guard.js';
import { initNotifications } from './modules/notifications.js';
import { getMyMeetings, createMeeting, deleteMeeting } from './services/meetingService.js';
import { getUsers } from './services/usersService.js';
import { notifyMany } from './services/notifyService.js';
import { getCurrentUser } from './services/auth.js';
import { toDate, formatWhen, isPast } from './utils/dates.js';
import { esc } from './utils/esc.js';

requireAuth();
initHeader('calendar');
initNotifications();

const monthTitle = document.getElementById('monthTitle');
const calendarDays = document.getElementById('calendarDays');
const eventsList = document.getElementById('eventsList');
const eventForm = document.getElementById('eventForm');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');

let current = new Date();
current.setDate(1);

let meetings = [];
let selectedDate = null;

prevBtn.addEventListener('click', () => {
    current.setMonth(current.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    current.setMonth(current.getMonth() + 1);
    renderCalendar();
});

eventsList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;

    if (!confirm('Удалить встречу?')) return;

    try {
        await deleteMeeting(btn.dataset.id);
        await loadMeetings();
    } catch (err) {
        alert(err.message);
    }
});

loadMeetings();

async function loadMeetings() {
    try {
        const data = await getMyMeetings();

        meetings = data.sort((a, b) => toDate(a) - toDate(b));

        renderCalendar();
        renderEventsList(selectedDate);
    } catch (err) {
        eventsList.innerHTML = `<p class="empty-events">Не удалось загрузить: ${esc(err.message)}</p>`;
    }
}

function renderCalendar() {
    const year = current.getFullYear();
    const month = current.getMonth();

    monthTitle.textContent = current.toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric'
    });

    const firstDay = new Date(year, month, 1);

    let startWeekday = firstDay.getDay();
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    calendarDays.innerHTML = '';

    for (let i = 0; i < startWeekday; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        calendarDays.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.textContent = d;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
            cell.classList.add('today');
        }

        if (meetings.some(m => m.date === dateStr)) {
            cell.classList.add('has-event');
        }

        if (selectedDate === dateStr) {
            cell.classList.add('selected');
        }

        cell.addEventListener('click', () => {
            selectedDate = dateStr;
            document.getElementById('eventDate').value = dateStr;

            renderCalendar();
            renderEventsList(dateStr);
        });

        calendarDays.appendChild(cell);
    }
}

function renderEventsList(filterDate = null) {
    const list = filterDate
        ? meetings.filter(m => m.date === filterDate)
        : meetings;

    if (list.length === 0) {
        eventsList.innerHTML = '<p class="empty-events">Событий пока нет</p>';
        return;
    }

    const userId = getCurrentUser().id;

    eventsList.innerHTML = list.map(m => {
        const isAuthor = m.authorId === userId;

        return `
            <div class="event-item">
                <div class="event-info">
                    <h3>${esc(m.title)}</h3>
                    <p>${formatWhen(m)}</p>
                    <p>${esc(m.place || '')}</p>
                    ${isPast(m) ? '<p style="color:var(--text-light)">Прошло</p>' : ''}
                </div>

                <div class="event-actions">
                    <a href="meeting.html?id=${m.id}" class="delete-event event-link">Подробнее</a>
                    ${isAuthor ? `<button class="delete-event" data-id="${m.id}">Удалить</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('eventName').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const place = document.getElementById('eventAddress').value.trim();
    const inviteStr = document.getElementById('eventInvite')?.value.trim() || '';

    if (!title || !date || !time) {
        alert('Заполните название, дату и время');
        return;
    }

    if (new Date(`${date}T${time}`) < new Date()) {
        alert('Встречу нельзя назначить в прошлом');
        return;
    }

    const btn = eventForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Сохраняем...';

    try {
        const users = await getUsers();
        const me = getCurrentUser();

        const participants = [];

        if (inviteStr) {
            const emails = inviteStr
                .split(',')
                .map(s => s.trim().toLowerCase())
                .filter(Boolean);

            emails.forEach(email => {
                const found = users.find(u => u.email.toLowerCase() === email);

                if (found && found.id !== me.id) {
                    participants.push({ userId: found.id, status: 'pending' });
                }
            });
        }

        const created = await createMeeting({
            title,
            date,
            time,
            place,
            description: '',
            duration: 60,
            remindBefore: 15,
            authorId: me.id,
            participants,
            tasks: []
        });

        if (participants.length > 0) {
            await notifyMany(
                participants.map(p => p.userId),
                `${me.name} приглашает вас на «${title}»`,
                created.id
            );
        }

        eventForm.reset();
        selectedDate = date;

        await loadMeetings();
    } catch (err) {
        alert(err.message || 'Не удалось создать');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Запланировать';
    }
});