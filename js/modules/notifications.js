import { getMyNotifications, markAsRead, markAllAsRead } from '../services/notifyService.js';
import {esc} from '../utils/esc.js'

const bellBtn = document.getElementById('notif-btn'),
    badge = document.getElementById('notif-badge'),
    panel = document.getElementById('notif-panel'),
    listBox = document.getElementById('notif-list'),
    readAllBtn = document.getElementById('notif-read-all');

let items = [];

export function initNotifications() {
    if (!bellBtn) return;

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target)) {
            panel.classList.add('hidden');
        }
    });


    listBox.addEventListener('click', async (e) => {
        const item = e.target.closest('.notif-item');
        if (!item) return;

        const id = Number(item.dataset.id);
        const meetingId = item.dataset.meeting;

        try {
            await markAsRead(id);

            if (meetingId) {
                location.href = `meeting.html?id=${meetingId}`;
            } else {
                await load();
            }
        } catch (err) {
            console.error(err);
        }
    });

    readAllBtn.addEventListener('click', async () => {
        try {
            await markAllAsRead(items);
            await load();
        } catch (err) {
            console.error(err);
        }
    });

    setInterval(load, 60000);
}

export async function load() {
    try {
        items = await getMyNotifications();
        render();
    } catch (err) {
        console.error(err);
    }
}

function render() {
    const unread = items.filter(item => !item.read).length;

    badge.textContent = unread;
    badge.classList.toggle('hidden', unread === 0);

    if (items.length === 0) {
        listBox.innerHTML = '<p class="empty-events">Уведомлений нет</p>';
        return;
    }

    listBox.innerHTML = items.slice(0, 15).map(item => `
        <div class="notif-item ${item.read ? '' : 'notif-item--unread'}"
             data-id="${item.id}"
             data-meeting="${item.meetingId || ''}">
            <p class="notif-text">${esc(item.text)}</p>
            <span class="notif-time">${timeAgo(item.createdAt)}</span>
        </div>
    `).join('');
}

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;

    return `${Math.floor(hours / 24)} дн назад`;
}