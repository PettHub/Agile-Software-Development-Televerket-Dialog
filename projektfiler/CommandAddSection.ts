import Discord from 'discord.js';

export class CommandAddSection {
    
    static sections: string[] = [];

    doIt(message : Discord.Message, args){

        //currently accepts several one-word section names (supports adding several sections at once)

        //check message sender role
        if(false) //if not mod (replace false with test access-method later)
        {
            message.channel.send('You are not a moderator!');
            return;
        }
        else //if it is a mod
        {
            //console.log(args);
            for(let a of args){
                if(!(CommandAddSection.sections.indexOf(a) > -1))
                {
                CommandAddSection.sections.push(a);
                message.channel.send(a + ' has been added!');
                }else{
                    message.channel.send('Section ' + a + ' has already been added earlier.');
                }
            }
            
            message.channel.send('The current added sections are: ' + CommandAddSection.sections);
            //^should be formatted to look better


            return;
        }



    }
}