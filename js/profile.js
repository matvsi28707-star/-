import { initHeader } from './modules/header.js';
import { requireAuth } from './modules/guard.js';
import { getCurrentUser } from './services/auth.js';

requireAuth();
initHeader();

const user = getCurrentUser();

document.getElementById('profile-name').textContent = user.name || '—';
document.getElementById('info-name').textContent = user.name || '—';
document.getElementById('info-email').textContent = user.email || '—';
document.getElementById('info-id').textContent = user.id ?? '—';

const avatar = document.getElementById('profile-avatar');
avatar.textContent = (user.name || '?')[0].toUpperCase();
avatar.style.background = user.color || '#0B5FA5';