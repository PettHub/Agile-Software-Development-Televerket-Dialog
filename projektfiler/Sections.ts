import { CommandAddSection } from './CommandAddSection';
import { TestAccess } from './TestAccess';
import Discord from 'discord.js';

export class Sections {


    static viewSections(message: Discord.Message): void {
        if (CommandAddSection.sectionList.size == 0) return;
        else {
            let formattedString: string = '';
            for (let s of CommandAddSection.sectionList) {
                formattedString = formattedString.concat(s, ', ');
            }
            formattedString = formattedString.slice(0, -2);
            formattedString = formattedString.concat('.');

            message.channel.send('The current added sections are: ' + formattedString); //Prints the formatted list

        }
    }

    static removesection(args: string[], message: Discord.Message) {

        let tempList: string[] = [];
        let tempString: string = '';
        if (CommandAddSection.sectionList.size == 0) return;

        if (!new TestAccess('').doIt(message, 'member')) //If sender is not a moderator: 
        {
            message.channel.send('You are not a moderator!');
            return;
        }
        else//If sender is a moderator: 
        {
            for (let a of args) { //Restores args to include the spaces between the words
                if (args.indexOf(a) == (args.length - 1)) {
                    tempString = tempString.concat(a);
                } else {
                    tempString = tempString.concat(a, ' ');
                }
            }
            tempList = tempString.split(/, +/); //Splits where there are commas, to distinguish section-names (tempList consists of section names)
            for (let a of tempList) {
                if (!CommandAddSection.sectionList.has(a))
                    message.channel.send('Section ' + a + ' has already been removed.'); //If the section no longer exists, inform user
                else {
                    CommandAddSection.sectionList.delete(a);
                    message.channel.send('Section ' + a + ' has been removed!');
                }
            }
        }
    }
}
