import {isAuthorized, login} from './services/auth.js'
import { clearErrors, showError, patterns} from './utils/validators.js';
import {requireGuest} from "./modules/guard.js"

requireGuest();

const form = document.querySelector(".auth-form");
const formError = document.querySelector(".form-error");
const btn = document.querySelector(".login-button");

form.addEventListener("submit", (event) => {
    event.preventDefault()
    clearErrors(form);
    formError.textContent = '';

    const email = form.email.value;
    const password = form.password.value;
    console.log(email)

    if(!patterns.email.test(email)){
        showError(form.email, 'Введите корректный email');
        console.log(form.email);
        return;
    }
    
    if(password.length < 6){
        showError(form.password, 'Пароль должен содержать минимум 6 символов');
        console.log(form.password);
        return;
    }
    btn.disabled = true;
    btn.textContent = 'Входим...';

    login({email, password})
    .then(() => {
        location.href = 'index.html'
    })
    .catch((error) => {
        formError.textContent = translateError(error.message)
    })
    .finally(() => {
        btn.disabled = false
    })
})

function translateError ( message ) {
    const dictionary = {
        'Incorrect password': "Неверный пароль",
        "Cannot find user": "Пользователь с таким email не найден"
}
return dictionary[message] || "Не удалось войти. Попробуйте позже"
}