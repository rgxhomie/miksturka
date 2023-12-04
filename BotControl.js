import TelegramBot from 'node-telegram-bot-api';

import User from './User.js';

export default class BotControl {
    #token = '6771365160:AAFy4XZstZB9agZVmy7v5imbxmsfoY1-wik';
    #dbController;
    #bot;
    #users = new Map();

    constructor (dbController) {
        this.#bot = new TelegramBot(this.#token, {polling: true});
        this.#dbController = dbController;

        this.#optInHandler = this.#optInHandler.bind(this);
        this.#optOutHandler = this.#optOutHandler.bind(this);
        this.#createApptHandler = this.#createApptHandler.bind(this);
        this.#getApptHandler = this.#getApptHandler.bind(this);
        this.#cancelApptHandler = this.#cancelApptHandler.bind(this);
    }

    init () {
        this.#bot.onText(/\/start/, this.#optInHandler);
        this.#bot.onText(/\/stop/, this.#optOutHandler);

        this.#bot.onText(/Записатись/, this.#createApptHandler);
        this.#bot.onText(/Переглянути запис/, this.#getApptHandler);
        this.#bot.onText(/Скасувати запис/, this.#cancelApptHandler);
    }

    async #storeUser(chatId) {
        let user;

        if (!this.#users.has(chatId)) {
            user = new User(chatId, {db: this.#dbController});
            await user.sync();

            this.#users.set(chatId, user);
        } else {
            user = this.#users.get(chatId);
        }

        return user;
    }

    async #buildKeyboard(chatId) {
        const user = await this.#storeUser(chatId);

        const appointment = user.appointment;

        if (!appointment) return [
            ['Записатись']
        ]

        else return [
            ['Переглянути запис', 'Скасувати запис']
        ]
    }

    /*
        HANDLERS
        \/\/\/\/
    */

    #optInHandler = async (msg) => {
        const chatId = msg.chat.id;

        const user = await this.#storeUser(chatId);

        if (user.state === 'optout') await user.optin();

        const keyboard = await this.#buildKeyboard(chatId);

        await this.#bot.sendMessage(chatId, `Вітаю! Я Мікстурка - твій бот-помічник 🤖\nСьогодні я готовий тобі допомогти у здійсненні доброї справи - стати донором крові для наших Захисників 🩸`);
        await this.#bot.sendMessage(chatId, `Тут ти маєш можливість зареєструватися як донор, переглянути свій запис або скасувати візит.\nЧим я можу тобі допомогти?`, {
            reply_markup: {
                keyboard
            }
        });
    }

    #optOutHandler = async (msg) =>  {
        const chatId = msg.chat.id;

        const user = await this.#storeUser(chatId);

        if (user.state === 'optout') return;

        await user.optout();
            
        await this.#bot.sendMessage(chatId, 'Радий був поспілкуватися!\nЩоб почати нову розмову, скористайся командою \/start');
    }

    #createApptHandler = async (msg) =>  {
        const chatId = msg.chat.id;

        const user = await this.#storeUser(chatId);

        if (user.state === 'optout') return;

        switch (user.state) {
            case 'main-menu':
                await this.#bot.sendMessage(chatId, `Щоб стати донором, тобі лише треба виконати три простих кроки:\n1️⃣ Вказати своє ім'я;\n2️⃣ Обрати зручний для тебе час з запропонованих годин візиту;\n3️⃣ З'явитися у лікарні та вчинити добру справу. Поїхали!`, {
                    reply_markup: {
                        keyboard: [
                            ['В головне меню']
                        ]
                    }
                });
                await this.#bot.sendMessage(chatId, `Будь ласка, введіть Ваше ім'я або псевдоним:`);
                break;
        
            default:
                break;
        }
    }

    #getApptHandler = async (msg) => {
        const chatId = msg.chat.id;

        const user = await this.#storeUser(chatId);

        if (user.state === 'optout') return;

        await this.#bot.sendMessage(chatId, 'get');
    }

    #cancelApptHandler = async (msg) => {
        const chatId = msg.chat.id;

        const user = await this.#storeUser(chatId);

        if (user.state === 'optout') return;

        await this.#bot.sendMessage(chatId, 'cancel');
    }
}