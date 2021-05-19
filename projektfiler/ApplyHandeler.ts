import Discord from 'discord.js';
import { PMHandler } from './Pms';

export class ApplyHandeler {
    users: Map<String, Date>;

    constructor() {
        this.users = new Map<String, Date>();
    }

    doIt(message: Discord.Message, client: Discord.Client) {
        if (this.users.get(message.author.id)) {
            if ((Date.now() - this.users.get(message.author.id).getTime()) > 1000 * 60 * 15) {
                this.users.set(message.author.id, new Date(Date.now()));
                message.reply("Check dm for further instructions");
                new PMHandler().doIt(message, message.author, client);
            } else {
                message.reply('You need to wait 15 mins before you may apply again');
            }
        } else {
            this.users.set(message.author.id, new Date(Date.now()));
            message.reply("Check dm for further instructions");
            new PMHandler().doIt(message, message.author, client);
        }
    }
}