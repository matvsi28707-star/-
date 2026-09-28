import { initHeader } from './modules/header.js';
import { requireAuth } from './modules/guard.js';
import { initMeetings } from './modules/meetingsList.js';
import { initNotifications } from './modules/notifications.js';
import { initReminders } from './modules/reminders.js';

requireAuth();
initHeader('index');
initMeetings();
initNotifications();
initReminders();