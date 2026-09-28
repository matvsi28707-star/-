import {formatWhen, isPast} from '../utils/dates.js'

const status = {
    author: 'Вы организатор',
    accepted: 'Иду',
    declined: 'Не смогу',
    pending: 'Не ответили'
}

export default class MeetingCard{
    #meeting;
    #userId;
    constructor(meeting, userId) {
        this.#meeting = meeting;
        this.#userId = userId;
    }
    get id() {
        return this.#meeting.id
    }
    get isAuthor() {
        return this.#userId === this.#meeting.authorId
    }
    get isParticipants() {
        return this.#meeting.participants.find(p => p.userId === this.#userId)
    }

    get myStatus() {
        if(this.isAuthor){
            return 'author';
        }
        return this.isParticipants?.status ?? "pending"
    }
    get isPast(){
        return isPast(this.#meeting)
    }

    get acceptedCount() {
        return this.#meeting.participants.filter(p => p.status === "accepted").length;
    }

    render() {
    const m = this.#meeting;

        return `
        <div class="card">
        <div class="card__top">
            <h3 class="card__title">${m.title}</h3>
            <span class="card__status">
            ${status[this.myStatus]}
            </span>
        </div>
        <p class="card__when">${formatWhen(m)}</p>
        <p class="card__place">${m.place}</p>
        <div class="card__bottom">
            <span class="card__people">
                Придут: ${this.acceptedCount} из ${m.participants.length}
            </span>
            <a class="card__link" href="meeting.html?id=${m.id}">👀Подробнее👀</a>
        </div>
        </div>
        `;
    }
}


// meeting = {
//     title: '123',
//     place: "zoom",
//     "participants": [
//         { "userId": 2, "status": "accepted" },
//         { "userId": 3, "status": "pending" },
//         { "userId": 4, "status": "declined" },
//     ]
// }
