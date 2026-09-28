import { getMyMeetings } from '../services/meetingService.js';
import { createNotification } from '../services/notifyService.js';
import { getCurrentUser } from '../services/auth.js';
import { toDate } from '../utils/dates.js';
import { storage } from '../utils/storage.js';

const CHECK_EVERY = 60000;
const SHOW_KEY = 'reminders';

export function initReminders() {
    askPermission();

    check();
    setInterval(check, CHECK_EVERY);
}

function askPermission() {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

async function check() {
    try {
        const meetings = await getMyMeetings();
        const shown = storage.get(SHOW_KEY, []);

        for (const meeting of meetings) {
            if (shown.includes(meeting.id)) continue;

            const minutesLeft = (toDate(meeting) - Date.now()) / 60000;
            const remindBefore = meeting.remindBefore || 15;

            if (minutesLeft > 0 && minutesLeft <= remindBefore) {
                await fire(meeting);

                shown.push(meeting.id);
                storage.set(SHOW_KEY, shown);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function fire(meeting) {
    const me = getCurrentUser();
    const text = `Встреча "${meeting.title}" начнётся в ${meeting.time}`;

    await createNotification({ userId: me.id, text, meetingId: meeting.id });

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Скоро встреча', {
            body: text,
            tag: `meeting-${meeting.id}`
        });
    }
}