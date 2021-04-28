import { CommandAddSection } from './CommandAddSection';
import Discord from 'discord.js';

export class Sections{
    
    public static doIt(message: Discord.Message): void {
                this.viewSections(message);
                  
        }    
    
    
    

    static viewSections (message : Discord.Message): void {
        if (CommandAddSection.sectionList.size == 0) return;
        else{
            let formattedString: string = ''; 
            for (let s of CommandAddSection.sectionList) {
                formattedString  = formattedString.concat(s, ', ');
            }
            formattedString = formattedString.slice(0, -2);
            formattedString = formattedString.concat('.');

            message.channel.send('The current added sections are: ' + formattedString); //Prints the formatted list

        } 
    }
}