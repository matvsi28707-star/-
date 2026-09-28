import { getMyMeetings } from '../services/meetingService.js';
import { getCurrentUser } from '../services/auth.js';
import { isPast, toDate } from '../utils/dates.js';
import MeetingCard from './meetingCard.js';

const list = document.querySelector('.meetings__list');
const nextBox = document.querySelector('.next-meeting_body');
const searchInput = document.querySelector('.search');
const filterButtons = document.querySelectorAll('.filters__btn');
const createBtn = document.querySelector('.meeting__btn');

let meetings = [];
let currentFilter = '';
let searchQuery = '';

export function initMeetings() {
    list.innerHTML = `<p>Загружаем встречи...</p>`;

    if (createBtn) {
        createBtn.addEventListener('click', () => {
            location.href = 'calendar.html';
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('filters__btn_active'));
            btn.classList.add('filters__btn_active');
            currentFilter = btn.dataset.filter || '';
            renderList();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value.trim().toLowerCase();
            renderList();
        });
    }

    return getMyMeetings()
        .then(data => {
            meetings = data.sort((a, b) => toDate(a) - toDate(b));
            renderNext();
            renderList();
        })
        .catch(error => {
            list.textContent = 'Не удалось загрузить встречи';
            console.error(error);
        });
}

function getFilteredMeetings() {
    const userId = getCurrentUser().id;

    return meetings.filter(meeting => {
        const card = new MeetingCard(meeting, userId);
        const title = (meeting.title || '').toLowerCase();

        if (searchQuery && !title.includes(searchQuery)) return false;

        switch (currentFilter) {
            case 'organizer': return card.isAuthor;
            case 'waiting':   return !card.isAuthor && card.myStatus === 'pending';
            case 'accepted':  return !card.isAuthor && card.myStatus === 'accepted';
            case 'past':      return card.isPast;
            default:          return true;
        }
    });
}

function renderList() {
    const userId = getCurrentUser().id;
    const filtered = getFilteredMeetings();

    if (filtered.length === 0) {
        list.innerHTML = '<p style="color: var(--text-light); text-align: center;">Встреч не найдено</p>';
        return;
    }

    list.innerHTML = filtered
        .map(m => new MeetingCard(m, userId).render())
        .join('');
}

function renderNext() {
    const next = meetings.find(m => !isPast(m));
    const userId = getCurrentUser().id;

    if (!next) {
        nextBox.textContent = 'Предстоящих встреч нет';
        return;
    }
    nextBox.innerHTML = new MeetingCard(next, userId).render();
}