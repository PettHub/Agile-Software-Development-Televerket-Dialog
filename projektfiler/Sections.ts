import { DatabaseFunctions } from "./DatabaseFunctions";
import Discord from "discord.js";

export class Sections {
    public static viewSections(message: Discord.Message): void {
        let db = DatabaseFunctions.getInstance();
        let query = "SELECT * FROM Sections";
        db.all(query, (err, rows) => { //get all sections
            if (err) console.log(err);
            if (rows) {
                let message2 = new Discord.MessageEmbed();
                message2.setTitle("Current Sections");
                rows.forEach((row) => {
                    message2.addField(row.section, "_", false); //"_" is needed due to discord api trash
                });
                message.channel.send(message2);
            } else {
                message.channel.send(
                    "There are currently no sections, use !addsection [section name]*, you can provide several sections as a comma separated list"
                );
            }
        });
    }

    public static addsection(message: Discord.Message, args: string[]): void {
        let db = DatabaseFunctions.getInstance();
        let argument = "INSERT INTO Sections (section) VALUES (?)";
        let tmpString = "";

        if (args[0]) {
            for (let a of args) {
                //Restores input args to include the spaces between the words
                if (args.indexOf(a) == args.length - 1) {
                    tmpString = tmpString.concat(a);
                } else {
                    tmpString = tmpString.concat(a, " ");
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
                    message.channel.send(
                        'Section: "' + section + '" already exists'
                    );
                } else {
                    message.channel.send(
                        'Section: "' + section + '" has been added'
                    );
                }
            });
        });
    }

    public static removeSection(
        message: Discord.Message,
        args: string[]
    ): void {
        let db = DatabaseFunctions.getInstance();
        let argument = "DELETE FROM Sections WHERE section == ?;";
        let tmpString = "";

        if (args[0]) {
            for (let a of args) {
                //Restores input args to include the spaces between the words
                if (args.indexOf(a) == args.length - 1) {
                    tmpString = tmpString.concat(a);
                } else {
                    tmpString = tmpString.concat(a, " ");
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
                    message.channel.send(
                        'Section: "' + section + '" already removed'
                    );
                } else {
                    message.channel.send(
                        'Section: "' + section + '" has been removed'
                    );
                }
            });
        });
    }
}
