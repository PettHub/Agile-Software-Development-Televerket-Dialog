import Discord from 'discord.js';
import {token} from './token';

const client = new Discord.Client();

let prefix = '!';

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
        message.channel.send('me')
    }
})

client.login(token(true)); //true = dev, false = product