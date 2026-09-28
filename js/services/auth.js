import {api} from './api.js'
import {storage} from '../utils/storage.js'

const COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#f87171']

export function register({name, email, password}) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return api.post('/register', {name, email, password, color, role: "user", banned: false})
    .then(data => {
        saveSession(data)
        return data.user;
    })
}

export function login({email, password}){
    return api.post('/login', {email, password})
        .then(data => {
            if (data.user.banned){
                console.log("Ваш аккаунт заблокирован")
            }
        saveSession(data)
        return data.user;
        })
}

export function logout(){
    storage.remove('token');
    storage.remove('user')
    location.href = 'login.html'
}

export function getCurrentUser(){
    return storage.get('user')
}
export function isAuthorized(){ 
    return Boolean(storage.get('token')); // true / false.   //. "gmkdgfmwemf250u4295"
}
export function isAdmin(){
    const user = getCurrentUser();
    return user ? user.role === "admin" : false;
}
function saveSession(data) {
    storage.set('token', data.accessToken);
    storage.set('user', data.user)
}