import Discord from 'discord.js';

export class CommandPing {
    doIt(message: Discord.Message): void {
        message.channel.send('pong!');
    }
}