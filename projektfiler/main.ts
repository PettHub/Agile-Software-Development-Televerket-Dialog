import {CommandPing} from 'CommandPing';
import {CommandAddSection} from 'CommandAddSection';
import Discord from 'discord.js';
import dotenv from 'dotenv/types';
import path from 'path';


dotenv.config({path : path.join(__dirname,`.env.${process.env.NODE_ENV}`)});

const client = new Discord.Client();

let prefix = process.env.DISCORD_PREFIX;

client.once('ready', () => {
    console.log('bot is now online');
});

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command){
        case 'ping':
            new CommandPing().doIt(message, args);
            break;
        case 'cool':
            message.channel.send('me');
            break;
        case 'addsection':
        new CommandAddSection().doIt(message, args);
    }
});




client.login(process.env.DISCORD_TOKEN); //true = dev, false = product