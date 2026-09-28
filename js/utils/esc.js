export function esc(str) {
    if (str == null) return '';
    
    const d = document.createElement('div');
    d.textContent = String(str);

    return d.innerHTML;
}