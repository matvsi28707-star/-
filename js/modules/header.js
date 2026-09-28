import { getCurrentUser, logout, isAdmin } from '../services/auth.js';

export function initHeader() {
    const user = getCurrentUser();
    if (!user) return;

    const userName = document.querySelector('.user__name');
    if (userName) userName.textContent = user.name;

    const userAvatar = document.querySelector('.user__avatar');
    if (userAvatar) {
        userAvatar.textContent = (user.name || '?')[0].toUpperCase();
        userAvatar.style.background = user.color || '#0B5FA5';
        userAvatar.style.display = 'flex';
        userAvatar.style.alignItems = 'center';
        userAvatar.style.justifyContent = 'center';
        userAvatar.style.color = '#fff';
        userAvatar.style.fontWeight = '600';
        userAvatar.style.fontSize = '16px';
    }

    // Кнопка «Выйти» (и обычная, и .profile-logout)
    document.querySelectorAll('.logout, .profile-logout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
    const adminLink = document.getElementById("admin_link")
    if(adminLink && isAdmin()){
        adminLink.classList.remove("hidden");
    }
}
