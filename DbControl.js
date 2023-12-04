import pkg from "pg";
const { Pool } = pkg;

export default class DbControl {
    #client

    constructor() {
        this.#client = new Pool({
            connectionString: 'postgres://appointments_kje8_user:GjG0FJDTMlouHT4AzAEGEGwrBYV2wYz7@dpg-clmqpfj8772c73e0064g-a.frankfurt-postgres.render.com/appointments_kje8',
            ssl: {
                rejectUnauthorized: false
            }
        });

        this.#connect();
    }

    #connect() {
        this.#client.connect();
    }

    #end() {
        this.#client.end();
    }

    async query(str) {
        try {
            const resp = await this.#client.query(str);
            return {
                isError: false,
                rows: resp.rows,
                rowCount: resp.rowCount
            }
        } catch (error) {
            console.log({error, str});
            return {
                isError: true,
                error,
                rows: [],
                rowCount: 0
            }
        }
    }
}