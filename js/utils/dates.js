export function toDate(meeting) {
    return new Date(`${meeting.date}T${meeting.time}`)
}

export function isPast(meeting) {
    return new Date() > toDate(meeting)
}

export function formatWhen(meeting){
    const now = new Date();
    const date = toDate(meeting);

    const time = date.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});

    if(isSameDay(now, date)){
        return `Сегодня в ${time}`
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1)
    
    if(isSameDay(tomorrow, date)){
        return `Завтра в ${time}`
    }

    const day = date.toLocaleDateString("ru-RU", { day: "numeric", month: 'long' });
    return `${day} в ${time}`;
}

export function formatTimeLeft(meeting){
    const milliseconds = toDate(meeting) - new Date();
    
    if (milliseconds <= 0){
        return "уже началась";
    }

    const MS_IN_MINUTE = 60 * 1000;
    const MS_IN_HOUR   = 60 * MS_IN_MINUTE;
    const MS_IN_DAY    = 24 * MS_IN_HOUR;

    const days = Math.floor(milliseconds / MS_IN_DAY);
    const hors = Math.floor((milliseconds % MS_IN_DAY) / MS_IN_HOUR);
    const minutes = Math.floor((milliseconds % MS_IN_HOUR) / MS_IN_MINUTE);

    if(days > 0){
        return `через ${days} дн ${hors} ч`;
    }

    if(hors > 0){
        return `через ${hors} ч ${minutes} мин`;
    }

    return `через ${minutes} мин`;
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}