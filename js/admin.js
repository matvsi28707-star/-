import { requireAdmin } from './modules/guard.js';
import { initHeader } from './modules/header.js';
import { initNotifications } from './modules/notifications.js';
import { getUsers, banUser, unbanUser } from './services/usersService.js';
import { getCurrentUser } from './services/auth.js';
import { esc } from './utils/esc.js';

requireAdmin();
initHeader('admin');
initNotifications();

const list = document.getElementById('admin-list');
const count = document.getElementById('admin-count');

let users = [];

list.addEventListener('click', async(e) => {
    const btn = e.target.closest("button[data-id]");
    if(!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
const text = action === 'ban' ? 'Заблокировать пользователя?' : 'Разблокировать пользователя?';
    if(!confirm(text)) return;

    try{
        if (action === "ban"){
            await banUser(id);
        } else{
            await unbanUser(id);
        }

        await load();
    } catch (err) {
        alert(err.message);
    }
})

load();

async function load(){
    try{
        users = await getUsers();
        render();
    } catch (err) {
        list.innerHTML = "Не удалось загрузить"
    }
}

function render () {
    const me = getCurrentUser();
    count.textContent = `Всего зарегестрировано ${users.length}`;

    list.innerHTML = users.map(user => {
        const isMe = user.id === me.id;
        const isAdminUser = user.role === "admin";

        return `
        <div>
        <div class="event-info">
                    <h3>
                        ${esc(user.name)}
                        ${isAdminUser ? '<span class="admin-tag">админ</span>' : ''}
                        ${user.banned ? '<span class="ban-tag">заблокирован</span>' : ''}
                    </h3>
                    <p>${esc(user.email)}</p>
                    <p>ID: ${user.id}</p>
                </div>
                <div class="event-actions">
                    ${isMe || isAdminUser ? '' : user.banned
                        ? `<button class="delete-event" data-id="${user.id}" data-action="unban">Разблокировать</button>`
                        : `<button class="delete-event" data-id="${user.id}" data-action="ban">Заблокировать</button>`
                    }
                </div>
        </div>
        `
    }).join('');
}
