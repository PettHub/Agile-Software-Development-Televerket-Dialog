import Discord from 'discord.js';
import { PMHandler } from './Pms';

export class ApplyHandeler {
    users : Map<String, Date>;
     
    constructor(){
        this.users = new Map<String, Date>();
    }

    doIt(message: Discord.Message, client){
        if (this.users.get(message.author.id)){
            if ((Date.now() - this.users.get(message.author.id).getTime()) > 1000*60*15){
                this.users.set(message.author.id, new Date(Date.now()));
                new PMHandler().doIt(message, message.author, client);
            } else {
                message.channel.send('You need to wait 15 mins before you may apply again');
            }
        } else {
            this.users.set(message.author.id, new Date(Date.now()));
            new PMHandler().doIt(message, message.author, client);
        }
    }
}