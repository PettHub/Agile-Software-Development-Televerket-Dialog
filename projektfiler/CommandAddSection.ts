import Discord from 'discord.js';

export class CommandAddSection {
    doIt(message : Discord.Message, args){

        //check message sender role
        if(false) //if not mod (replace false with test access-method later)
        {
            message.channel.send('You are not a moderator');
            return;
        }
        else //if it is a mod
        {
            console.log(args);
        }



        //message.channel.send();
    }
}