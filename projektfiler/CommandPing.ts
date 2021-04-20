import Discord from 'discord.js';

export class CommandPing {
    doIt(message : Discord.Message, args){
        message.channel.send('pong!');
    }
}