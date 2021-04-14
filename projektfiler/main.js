"use strict";
//import Discord from 'discord.js';
exports.__esModule = true;
var token_1 = require("./token");
//const Token = require('token.js');
var Discord = require('discord.js');
var client = new Discord.Client();
var prefix = '!';
client.once('ready', function () {
    console.log('bot is now online');
});
client.on('message', function (message) {
    if (!message.content.startsWith(prefix) || message.author.bot)
        return;
    var args = message.content.slice(prefix.length).split(/ +/);
    var command = args.shift().toLowerCase();
    if (command === 'ping') {
        message.channel.send('pong!');
    }
    else if (command === 'cool') {
        message.channel.send('me');
    }
});
client.login(token_1.token());
