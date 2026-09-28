import {getCurrentUser} from './auth.js'
import {api} from './api.js'

export function getMyMeetings() {
    const me = getCurrentUser();

    return api.get("/meetings").then(meetings => {
        return meetings.filter(meeting =>
            me.id === meeting.authorId ||
            meeting.participants.some(people => people.userId === me.id)
        );
    });
}

// получение по id
export function getMeeting(id){
    return api.get(`/meetings/${id}`)
}

// Создание встречи (post)
export function createMeeting(data) {
    return api.post("/meetings", data)
}

// обновление встречи (patch)
export function updateMeeting(id, data) {
    return api.patch(`/meetings/${id}`, data)
}

// удаление встречи (delete)
export function deleteMeeting(id) {
    return api.delete(`/meetings/${id}`)
}

