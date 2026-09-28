import { initHeader } from './modules/header.js';
import { requireAuth } from './modules/guard.js';
import { initNotifications } from './modules/notifications.js';
import { getMeeting, deleteMeeting, updateMeeting } from './services/meetingService.js';
import { getUsers } from './services/usersService.js';
import { createNotification } from './services/notifyService.js';
import { getCurrentUser } from './services/auth.js';
import { formatWhen, formatTimeLeft, isPast } from './utils/dates.js';
import { esc } from './utils/esc.js';

requireAuth();
initHeader('index');
initNotifications();

const box = document.getElementById('meeting-box');

const params = new URLSearchParams(location.search);
const id = params.get('id');

let currentMeeting = null;
let allUsers = [];

if (!id) {
    box.innerHTML = '<p class="empty-events">Встреча не найдена</p>';
} else {
    load();
}

async function load() {
    try {
        const [meeting, users] = await Promise.all([getMeeting(id), getUsers()]);

        currentMeeting = meeting;
        allUsers = users;

        render();
    } catch (err) {
        box.innerHTML = `<p class="empty-events">Ошибка: ${esc(err.message)}</p>`;
    }
}

function getUserName(userId) {
    const u = allUsers.find(u => u.id === userId);
    return u ? u.name : `ID ${userId}`;
}

function getUserEmail(userId) {
    const u = allUsers.find(u => u.id === userId);
    return u ? u.email : '';
}

function render() {
    const meeting = currentMeeting;
    const user = getCurrentUser();
    const isAuthor = meeting.authorId === user.id;
    const participants = meeting.participants || [];
    const myPart = participants.find(p => p.userId === user.id);
    const past = isPast(meeting);

    let roleText = 'Гость';

    if (isAuthor) {
        roleText = 'Организатор';
    } else if (myPart) {
        if (myPart.status === 'accepted') roleText = 'Участник (принял)';
        else if (myPart.status === 'declined') roleText = 'Участник (отказался)';
        else roleText = 'Участник (ожидает ответа)';
    }

    const timeLeft = past ? 'Встреча уже прошла' : formatTimeLeft(meeting);

    const statusLabel = {
        accepted: '✅ Принял',
        declined: '❌ Отказался',
        pending: '⏳ Ожидает'
    };

    const participantsHtml = participants.length === 0
        ? '<p style="color:var(--text-light);margin:0;">Пока никого не пригласили</p>'
        : participants.map(p => `
            <div class="event-item" style="padding:12px 0;">
                <div class="event-info">
                    <h3 style="margin:0 0 4px;font-size:15px;">${esc(getUserName(p.userId))}</h3>
                    <p style="margin:0;font-size:13px;">${esc(getUserEmail(p.userId))}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:var(--turquoise);">
                        ${statusLabel[p.status] || esc(p.status)}
                    </p>
                </div>

                ${isAuthor && p.userId !== user.id ? `
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        <select class="form-input status-select" data-userid="${p.userId}"
                                style="width:140px;padding:6px 8px;font-size:13px;">
                            <option value="pending"  ${p.status === 'pending'  ? 'selected' : ''}>Ожидает</option>
                            <option value="accepted" ${p.status === 'accepted' ? 'selected' : ''}>Принял</option>
                            <option value="declined" ${p.status === 'declined' ? 'selected' : ''}>Отказался</option>
                        </select>
                        <button class="delete-event btn-remove" data-userid="${p.userId}"
                                style="padding:6px 10px;font-size:13px;">Убрать</button>
                    </div>
                ` : ''}
            </div>
        `).join('');

    box.innerHTML = `
        <h2 class="event-title">${esc(meeting.title)}</h2>

        <div style="margin-bottom:25px;padding:16px;background:var(--background);border-radius:8px;">
            <div style="font-size:13px;color:var(--text-light);margin-bottom:6px;">Описание</div>
            <div style="font-size:15px;line-height:1.5;">
                ${meeting.description ? esc(meeting.description) : 'Описание не указано'}
            </div>
        </div>

        <div class="profile-row">
            <div class="profile-label">Когда запланирована</div>
            <div class="profile-value">${formatWhen(meeting)}</div>
        </div>
        <div class="profile-row">
            <div class="profile-label">Дата и время</div>
            <div class="profile-value">${esc(meeting.date)} в ${esc(meeting.time)}</div>
        </div>
        <div class="profile-row">
            <div class="profile-label">Сколько осталось</div>
            <div class="profile-value" style="color:var(--turquoise);font-weight:600;">${timeLeft}</div>
        </div>
        <div class="profile-row">
            <div class="profile-label">Длительность</div>
            <div class="profile-value">${meeting.duration ? meeting.duration + ' мин' : '—'}</div>
        </div>
        <div class="profile-row">
            <div class="profile-label">Место</div>
            <div class="profile-value">${esc(meeting.place || '—')}</div>
        </div>
        <div class="profile-row">
            <div class="profile-label">Кем ты являешься</div>
            <div class="profile-value">${roleText}</div>
        </div>
        <div class="profile-row" style="border-bottom:none;">
            <div class="profile-label">Организатор</div>
            <div class="profile-value">${esc(getUserName(meeting.authorId))}${isAuthor ? ' (это вы)' : ''}</div>
        </div>

        <div style="margin-top:30px;">
            <h3 style="margin:0 0 12px;font-size:18px;color:var(--blue-dark);">Кто приглашён</h3>
            ${participantsHtml}
        </div>

        ${isAuthor && !past ? `
            <div style="margin-top:25px;padding:20px;border:1px solid var(--border);border-radius:10px;">
                <h3 style="margin:0 0 12px;font-size:16px;color:var(--blue-dark);">Пригласить участника</h3>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <input class="form-input" id="invite-email" type="email"
                           placeholder="Email пользователя" style="flex:1;min-width:200px;">
                    <button class="login-button" id="btn-invite" type="button"
                            style="width:auto;padding:12px 18px;">Пригласить</button>
                </div>
                <p id="invite-error" style="color:#ef4444;font-size:13px;margin:8px 0 0;"></p>
            </div>
        ` : ''}

        <div style="margin-top:30px;display:flex;flex-wrap:wrap;gap:10px;">
            ${!isAuthor && myPart && !past ? `
                <button class="login-button" id="btn-accept" style="width:auto;padding:10px 20px;">Принять приглашение</button>
                <button class="delete-event" id="btn-decline">Отклонить</button>
            ` : ''}
            ${isAuthor ? `<button class="delete-event" id="btn-delete">Удалить встречу</button>` : ''}
        </div>
    `;

    bindEvents();
}

function bindEvents() {
    document.getElementById('btn-invite')?.addEventListener('click', inviteUser);

    document.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', () => {
            updateParticipantStatus(Number(sel.dataset.userid), sel.value);
        });
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!confirm('Убрать участника?')) return;
            removeParticipant(Number(btn.dataset.userid));
        });
    });

    document.getElementById('btn-accept')?.addEventListener('click', () => setMyStatus('accepted'));
    document.getElementById('btn-decline')?.addEventListener('click', () => setMyStatus('declined'));

    document.getElementById('btn-delete')?.addEventListener('click', async () => {
        if (!confirm('Удалить встречу?')) return;

        try {
            await deleteMeeting(id);
            location.href = 'index.html';
        } catch (err) {
            alert(err.message);
        }
    });
}

async function inviteUser() {
    const emailInput = document.getElementById('invite-email');
    const errorEl = document.getElementById('invite-error');
    const email = emailInput.value.trim().toLowerCase();

    errorEl.textContent = '';

    if (!email) {
        errorEl.textContent = 'Введите email';
        return;
    }

    const found = allUsers.find(u => u.email.toLowerCase() === email);

    if (!found) {
        errorEl.textContent = 'Пользователь с таким email не найден';
        return;
    }

    const me = getCurrentUser();

    if (found.id === me.id) {
        errorEl.textContent = 'Нельзя пригласить самого себя';
        return;
    }

    const current = currentMeeting.participants || [];

    if (current.some(p => p.userId === found.id)) {
        errorEl.textContent = 'Этот пользователь уже приглашён';
        return;
    }

    const participants = [...current, { userId: found.id, status: 'pending' }];

    try {
        currentMeeting = await updateMeeting(id, { participants });

        await createNotification({
            userId: found.id,
            text: `${me.name} приглашает вас на «${currentMeeting.title}»`,
            meetingId: currentMeeting.id
        });

        emailInput.value = '';
        render();
    } catch (err) {
        errorEl.textContent = err.message || 'Ошибка при приглашении';
    }
}

async function updateParticipantStatus(userId, status) {
    const participants = (currentMeeting.participants || []).map(p =>
        p.userId === userId ? { ...p, status } : p
    );

    try {
        currentMeeting = await updateMeeting(id, { participants });
        render();
    } catch (err) {
        alert(err.message);
    }
}

async function removeParticipant(userId) {
    const participants = (currentMeeting.participants || []).filter(p => p.userId !== userId);

    try {
        currentMeeting = await updateMeeting(id, { participants });
        render();
    } catch (err) {
        alert(err.message);
    }
}

async function setMyStatus(status) {
    const me = getCurrentUser();

    const participants = (currentMeeting.participants || []).map(p =>
        p.userId === me.id ? { ...p, status } : p
    );

    const statusText = status === 'accepted' ? 'принял приглашение' : 'отказался';

    try {
        currentMeeting = await updateMeeting(id, { participants });

        await createNotification({
            userId: currentMeeting.authorId,
            text: `${me.name} ${statusText}: «${currentMeeting.title}»`,
            meetingId: currentMeeting.id
        });

        render();
    } catch (err) {
        alert(err.message);
    }
}