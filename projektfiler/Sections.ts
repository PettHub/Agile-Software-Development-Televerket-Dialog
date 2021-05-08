import { DatabaseFunctions } from "./DatabaseFunctions";
import Discord from 'discord.js';

export class Sections {
    static viewSections(message: Discord.Message): void {
        let db = DatabaseFunctions.getInstance();
        let author = message.author;
        let query = "SELECT * FROM Sections";
        db.all(query, (err, rows) => {
            if (err) console.log(err);
            if (rows) {
                let message = new Discord.MessageEmbed();
                message.setTitle('Current Sections');
                rows.forEach(row => {
                    message.addField(row.section, '_', true);
                })
                author.send(message);
            }
            else {
                author.send('There are currently no sections, use !addsection [section name]*, you can provide several sections as a comma separated list')
            }
        })
    }

    static addsection(message: Discord.Message, args: string[]): void {
        let db = DatabaseFunctions.getInstance();
        let argument = 'INSERT INTO Sections (section) VALUES (?)';
        let tmpString = "";

        if (args[0]) {
            for (let a of args) { //Restores input args to include the spaces between the words
                if (args.indexOf(a) == (args.length - 1)) {
                    tmpString = tmpString.concat(a);
                } else {
                    tmpString = tmpString.concat(a, ' ');
                }
            }
        }

        //Splits where there are commas, to distinguish section-names (consists of section names)
        //runs seperate inserts for each section as argument
        tmpString.split(/, +|,+/).forEach((section) => {
            let prepared = db.prepare(argument);
            prepared.run(section, (err, res) => {
                if (err) {
                    console.log(err);
                    message.author.send('Section: "' + section + '" already exists');
                }
                else {
                    message.author.send('Section: "' + section + '" has been added');
                }
            });
        });
    }


    static removeSection(message: Discord.Message, args: string[]): void {
        let db = DatabaseFunctions.getInstance();
        let argument = "DELETE FROM Sections WHERE section == ?;";
        let tmpString = "";

        if (args[0]) {
            for (let a of args) { //Restores input args to include the spaces between the words
                if (args.indexOf(a) == (args.length - 1)) {
                    tmpString = tmpString.concat(a);
                } else {
                    tmpString = tmpString.concat(a, ' ');
                }
            }
        }

        //Splits where there are commas, to distinguish section-names (consists of section names)
        //runs seperate inserts for each section as argument
        tmpString.split(/, +|,+/).forEach((section) => {
            let statement = db.prepare(argument);
            statement.run(section, (err, res) => {
                if (err) {
                    console.log(err);
                    message.author.send('Section: "' + section + '" already removed');
                }
                else {
                    message.author.send('Section: "' + section + '" has been removed');
                }
            });
        });
    }
}
