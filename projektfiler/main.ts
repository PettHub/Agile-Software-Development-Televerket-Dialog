import { CommandPing } from './CommandPing';
import { PMHandler } from './Pms';
import { CommandAddSection } from './CommandAddSection';
import { TestAccess } from './TestAccess';
import Discord from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config({ path: path.join(__dirname, `.env.${process.env.NODE_ENV}`) });

const client = new Discord.Client();

let prefix = process.env.DISCORD_PREFIX;

client.once('ready', () => {
    console.log('bot is now online');
});
let accesscontrol = new TestAccess('');

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'ping':
            new CommandPing().doIt(message);
            break;
        case 'cool':
            message.channel.send('me');
            break;
        case 'dm':
            new PMHandler().doIt(message.author, client);
            break;
        case 'addsection':
            new CommandAddSection().doIt(message, args, accesscontrol);
            break;
        case 'hasaccess':
            if (accesscontrol.doIt(message, 'mod')) {
                message.channel.send('You have access');
            }
            else {
                message.channel.send('You do not have access');
            }
            break;
        case 'setmod':
            accesscontrol.setMod(message, args.shift());
            break;
    }
});

client.login(process.env.DISCORD_TOKEN); //true = dev, false = product