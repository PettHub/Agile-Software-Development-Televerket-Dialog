import Discord from 'discord.js';
import { TestAccess } from 'TestAccess';

export class CommandAddSection {

    static sectionList: string[] = []; //Contains only section names (e.g. = [Best Gamer,Funniest Person])

    public doIt(message: Discord.Message, args: string[], accesscontrol: TestAccess): void {

        //
        let tempList: string[] = [];
        let tempString: string = '';
        let formattedString: string = '';

        //Check message sender role
        if (accesscontrol.doIt(message, 'mod')) //If sender is not a moderator: 
        {
            message.channel.send('You are not a moderator!');
            return;
        }
        else //If sender is a moderator: 
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
                if (!(CommandAddSection.sectionList.indexOf(a) > -1)) //If the section has NOT already been added, add section name to sectionList
                {
                    CommandAddSection.sectionList.push(a);
                    message.channel.send('Section ' + a + ' has been added!');
                } else {
                    message.channel.send('Section ' + a + ' has already been added earlier.'); //If the section has been added, inform user
                }
            }

            //Creates a formatted string from the sectionList, to make printing look good 
            //Should probably be refactored into a common nominations-class, to make it accessible for !removesections and possibly !viewsections
            for (let s of CommandAddSection.sectionList) {
                if (CommandAddSection.sectionList.indexOf(s) == (CommandAddSection.sectionList.length - 1)) {
                    formattedString = formattedString.concat(s, '.')
                } else
                    formattedString = formattedString.concat(s, ', ');
            }

            message.channel.send('The current added sections are: ' + formattedString); //Prints the formatted list

            return;
        }
    }
}