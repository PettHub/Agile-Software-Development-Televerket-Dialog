import Discord from 'discord.js';
import { TestAccess } from 'TestAccess';
//import { TextChannel } from 'discord.js';

export class setChannel {
    
    static outputChannel: string = '826895001446645800';

    doIt(message: Discord.Message, newChannel: string, accesscontrol: TestAccess, client:Discord.Client): void{

        if(message.guild.channels.cache.get(newChannel) === undefined){ //if input channel is undefined (not in guild/incorrect input)
            message.channel.send('Incorrect channel ID (possible causes: channel not on server, or misspelled ID). Please try again.');
            return;
        }
        //console.log(message.guild.channels.cache.get(newChannel).permissionsFor(client.user));
        //channels.cache.get(newChannel).me.hasPermission("MUTE_MEMBERS");
        
        //vi vill kolla om boten har tillgång till kanalen som skickas in för att undvika error i bakgrunden och missförstånd
        //kolla på att catcha exceptionet missing access
        

        /* Works to check permissions (probably)
        const botPermissionsFor = message.guild.channels.cache.get(newChannel).permissionsFor(client.user);
        const tmpArray = botPermissionsFor.toArray();
        console.log(tmpArray.includes("SEND_MESSAGES"));*/

       /* if(client.channels.cache.get(newChannel).isText){
        
            setChannel.outputChannel = newChannel;
        //client.channels.cache.get(setChannel.outputChannel).send('Channel has been set as !art apply receiver channel.');
        //client.channels.get(setChannel.outputChannel as TextChannel).send('Channel has been set as !art apply receiver channel.');
        //if(client.channels.cache.get(setChannel.outputChannel).type === ChannelType.text){
            (client.channels.cache.get(setChannel.outputChannel) as TextChannel).send('bla');
         }*/
    }
}