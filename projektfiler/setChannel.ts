import Discord from 'discord.js';
import { TestAccess } from 'TestAccess';
import { TextChannel } from 'discord.js';

export class setChannel {
    
    private static outputChannel: string;

    constructor(){
    }

    doIt(message: Discord.Message, newChannel: string, accesscontrol: TestAccess, client:Discord.Client): void{
        //fråga gruppen om denna: får error när botten inte har tillgång till den nya kanalen. Är detta att catcha erroret? https://stackoverflow.com/questions/65557039/discord-js-client-onerror-not-being-called
        process.on('unhandledRejection', error => {
            console.log('Test error:', error);
            message.channel.send('Error! Possible cause: setting a channel which the bot does not have access to. Please try again.');
        });

        if(setChannel.outputChannel === newChannel)
        {
            message.channel.send('The input channel ID is already set as the !art apply receiver channel.');
            return;
        }

        if(message.guild.channels.cache.get(newChannel) === undefined){ //if input channel is undefined (e.g. not in guild/incorrect input)
            message.channel.send('Incorrect channel ID (possible causes: channel not on server, or misspelled ID). Please try again.');
            return;
        }
            
        if(client.channels.cache.get(newChannel).type === 'text'){ //sets outputChannel to the newChannel, if the newChannel is textchannel
            setChannel.outputChannel = newChannel;
            console.log('Output channel set! ' + setChannel.outputChannel);
            (client.channels.cache.get(setChannel.outputChannel) as TextChannel).send('This channel has been set as !art apply receiver channel.');
        }else{
            message.channel.send('The input channel is not a text channel. Please try again using a text channel ID.');
        }
    }

    public static getOutputChannel(): string{
        console.log(this.outputChannel);
        if (this.getOutputChannel){
            return (this as any).outputChannel;
        }
        else{
            return null;
        }
    }
}