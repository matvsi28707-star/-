import {isAuthorized, register} from './services/auth.js'
import { clearErrors, showError, patterns} from './utils/validators.js';

if(isAuthorized()){
   location.href = 'index.html'
}

const form = document.querySelector(".auth-form");
const formError = document.querySelector(".form-error");
const btn = document.querySelector(".login-button");

form.addEventListener("submit", (event) => {
    event.preventDefault()
    clearErrors(form);
    formError.textContent = '';

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const replayPassword = form.replayPassword.value;
    console.log(email)

    if(!patterns.name.test(name)){
        showError(form.name, 'Имя может состоять от 2 до 40 букв')
        return;
    }

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

    if(password !== replayPassword){
        showError(form.replayPassword, 'Не совподает')
        console.log(form.replayPassword);
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Входим...';

    register({name, email, password})
    .then(() => {
        location.href = 'index.html'
    })
    .catch((error) => {
        formError.textContent = error.message.includes("Email already exist") ? "Этот email уже зарегистрирован" : "Не удалось войти. Попробуйте позже"
    })
    .finally(() => {
        btn.disabled = false
    })
})