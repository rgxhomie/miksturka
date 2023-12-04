import DbControl from './DbControl.js';
import BotControl from './BotControl.js';

const dbController = new DbControl();
const botController = new BotControl(dbController);

botController.init();

// setInterval(async () => {
//     console.log(await dbController.query(`
//         select * from users
//     `));

//     console.log(await dbController.query(`
//         select * from appointments
//     `));
// }, 20000);

// console.log(await dbController.query());