import { getCurrentUser } from "./auth.js"
import { api } from "./api.js";

export function getMyNotifications() {
    const me = getCurrentUser();

    return api.get(`/notifications?userId=${me.id}`).then(list => list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
}

export function createNotification({ userId, text, meetingId }) {
    return api.post("/notifications", {
        userId,
        text,
        meetingId,
        read: false,
        createdAt: new Date().toISOString()
    })
}

export function notifyMany(userIds, text, meetingId) {
    return Promise.all(
        userIds.map(userId => createNotification({ userId, text, meetingId }))
    )
}
export function markAsRead(id) {
    return api.patch(`/notifications/${id}`, {
        read: true
    })
}

export function markAllAsRead(list) {
    const unread = list.filter(r => r.read === false)
 return Promise.all(
       unread.map(item => markAsRead(item.id))
    )
}