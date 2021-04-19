import Discord from 'discord.js';
//import {token} from './token';
import dotenv from 'dotenv';
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

    if(command === 'ping'){
        message.channel.send('pong!');
    } 
    else if (command === 'cool'){
        message.channel.send('me');
    }
})

client.login(process.env.DISCORD_TOKEN); //true = dev, false = product