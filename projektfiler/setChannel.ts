import Discord from 'discord.js';
import { TestAccess } from 'TestAccess';
import { TextChannel } from 'discord.js';

export class setChannel {
    
    private static outputChannel: string;

    constructor(){
    }

    doIt(message: Discord.Message, newChannel: string, accesscontrol: TestAccess, client:Discord.Client): void{
        //TODO: Check if sender is moderator
            
            if(setChannel.outputChannel === newChannel) //if new channel is same as old channel
            {
                message.channel.send('The input channel ID is already set as the !art apply receiver channel.');
                return;
            }

            if(message.guild.channels.cache.get(newChannel) === undefined){ //if input channel is undefined (e.g. not in guild/incorrect input)
                message.channel.send('Incorrect channel ID (possible causes: channel not on server, or misspelled ID). Please try again.');
                return;
            }

            if(client.channels.cache.get(newChannel).type === 'text'){ //checks if the new channel is a textchannel
                
                let tmp = setChannel.outputChannel;             //sets output channel to the new one, if there's an error in sending to the channel, inform mods.
                setChannel.outputChannel = newChannel;
                (client.channels.cache.get(setChannel.outputChannel) as TextChannel).send('This channel has been set as !art apply receiver channel.').catch(e => {
                    setChannel.outputChannel = tmp;
                    message.channel.send('Error! Possible cause: bot does not have access to the input channel. Please try again with a new ID or after giving bot access.');
                });

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

} //class end