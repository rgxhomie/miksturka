export default class Appointment {
    #chatId;
    #reminder;
    #usedName;
    #name;
    #dateTime;
    #isCancelled;

    constructor(options) {
        const {
            chatId,
            name,
            dateTime
        } = options;

        this.#chatId = chatId;
        this.#reminder = false;
        this.#name = name;
        this.#dateTime = dateTime;
        this.#isCancelled = false;
    }

    async cancel() {}

    async reminder (option) {}

    async move() {}

    async #saveReminder () {}
}