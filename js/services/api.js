import { storage } from '../utils/storage.js';

const BASE_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
    const token = storage.get('token');

    const response = await fetch(BASE_URL + endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && {Authorization: `Bearer ${token}`}),
            ...options.headers
        }
    });

    if (response.status === 401) {
        storage.remove('token');
        storage.remove('user');

        if (!location.pathname.includes('login')) {
            location.href = 'login.html';
        }

        throw new Error('Требуется вход');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error || `Ошибка ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const api = {
    get:    (endpoint) => request(endpoint),
    post:   (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    patch:  (endpoint, data) => request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};