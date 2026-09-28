import { api } from "./api.js";
import { getCurrentUser } from "./auth.js";

// Получить всех пользователей (для приглашений)
export function getUsers() {
    return api.get('/users');
}

export function getOtherUsers(){
    const me = getCurrentUser();

    return getUsers().then(users => users.filter( u => u.id !== me.id))
}

export function banUser(id){
    return api.patch(`/users/${id}`, {banned: true})
}
export function unbanUser(id){
    return api.patch(`/users/${id}`, {banned: false})
}