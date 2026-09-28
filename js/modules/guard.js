import {isAuthorized} from '../services/auth.js'
import { getCurrentUser } from '../services/auth.js';
import { logout } from '../services/auth.js';
import { isAdmin } from '../services/auth.js';

export function requireAuth() {
    if(!isAuthorized()){
        location.href = 'login.html'
        return;
    }
    const user = getCurrentUser();

    if (user && user.banned) {
        logout();
    }
}
export function requireGuest(){
 if(isAuthorized()){
        location.href = 'index.html'
    }
}
export function requireAdmin(){
 if(!isAuthorized()){
        location.href = 'login.html'
    }
    if(!isAdmin()){
        location.href = "index.html"
    }
}
