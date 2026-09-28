export const patterns = {
    name: /^[а-яёА-Яa-zA-Z\s-]{2,40}$/,
    email: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
}

export function showError(input, message){
    input.nextElementSibling.textContent = message;
}
export function clearErrors(form) {
    form
    .querySelectorAll(".errormes")
    .forEach(span => span.textContent = '')
}