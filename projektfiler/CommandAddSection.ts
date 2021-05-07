/*
import Discord from 'discord.js';
import { TestAccess } from 'TestAccess';

export class CommandAddSection {

    static sectionList: Set<string> = new Set(); //Contains only section names (e.g. = [Best Gamer,Funniest Person])

    public doIt(message: Discord.Message, args: string[], accesscontrol: TestAccess): void {

        let tempList: string[] = [];
        let tempString: string = '';
        let formattedString: string = '';

        //Check message sender role
        if (args[0]){
            for(let a of args){ //Restores input args to include the spaces between the words
                if(args.indexOf(a) == (args.length - 1)){
                    tempString = tempString.concat(a);
                } else {
                        tempString = tempString.concat(a, ' ');
                }
        }


            tempList = tempString.split(/, +|,+/); //Splits where there are commas, to distinguish section-names (tempList consists of section names)

            for (let a of tempList) {
                if (a === ''){
                    message.channel.send(a + ' isnt a valid name')
                } else if (CommandAddSection.sectionList.has(a))
                    message.channel.send('Section ' + a + ' has already been added earlier.'); //If the section has been added, inform user
                else {
                    CommandAddSection.sectionList.add(a)
                    message.channel.send('Section ' + a + ' has been added!');
                }
            }

            //Creates a formatted string from the sectionList, to make printing look good
            //Should probably be refactored into a common nominations-class, to make it accessible for !removesections and possibly !viewsections
            for (let s of CommandAddSection.sectionList) {
                formattedString = formattedString.concat(s, ', ');
            }
            formattedString = formattedString.slice(0, -2);
            formattedString = formattedString.concat('.');

            message.channel.send('The current added sections are: ' + formattedString); //Prints the formatted list

            return;
        }else {
            message.channel.send("Usage: *!addsection [section name]*, you can provide several sections as a comma separated list");

        }

    }
}
*/