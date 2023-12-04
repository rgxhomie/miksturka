import Appointment from './Appointment.js';

export default class User {
    #chatId;
    #db;

    state = 'main-menu';
    appointment = null;
    name = null;

    constructor(chatId, options) {
        this.#chatId = `${chatId}`;
        this.#db = options.db;
    }

    async sync() {
        await this.#syncUser(this.#chatId);
    }

    async optin() {
        this.state = 'main-menu';
        
        await this.#saveUser();
    }

    async optout() {
        this.state = 'optout';

        await this.#saveUser();
    }

    async setState (newState) {
        this.state = newState;

        await this.#saveUser();
    }

    async #syncUser() {
        const user = await this.#db.query(`
            SELECT *
            FROM users
            WHERE chat_id = '${this.#chatId}';
        `);

        if (user.isError) return;

        if (user.rowCount === 0) return await this.#createUser();

        const userData = user.rows[0];
        this.state = userData.state;

        await this.#getAppointment();
    }

    async #getAppointment() {
        const appointment = await this.#db.query(`
            SELECT *
            FROM appointments
            WHERE chat_id = '${this.#chatId}';
        `);

        if (appointment.isError) return;
        if (appointment.rowCount === 0) return;

        const appointmentData = appointment.rows[0];

        this.appointment = new Appointment(appointmentData);
    }

    async #createUser () {
        const createdAt = Date.now();

        const res = await this.#db.query(`
            INSERT INTO users (created_at, state, chat_id)
            VALUES ('${new Date(createdAt).toISOString()}', '${this.state}', '${this.#chatId}');
        `);
    }

    async #saveUser () {
        await this.#db.query(`
            UPDATE users
            SET state = '${this.state}'
            WHERE chat_id = '${this.#chatId}'
        `);
    }
}