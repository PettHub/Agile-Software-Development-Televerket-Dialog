import { DatabaseFunctions } from "./DatabaseFunctions";
import Discord from "discord.js";

export class Sections {
    public static viewSections(message: Discord.Message): void {
        let db = DatabaseFunctions.getInstance();
        let query = "SELECT * FROM Sections";
        db.all(query, (err, rows) => {
            if (err) {
                console.log(err)
                return;
            };
            if (rows[0]) {
                let message2 = new Discord.MessageEmbed();
                message2.setTitle("Current Sections").setColor("#D3A25A");
                rows.forEach((row) => {
                    message2.addField(row.section, "_", false);
                });
                message.reply(message2);
            } else {
                message.reply(
                    "there are currently no sections, please wait for the mods to add sections."
                );
            }
        });
    }

    public static addsection(message: Discord.Message, args: string[]): void {
        let db = DatabaseFunctions.getInstance();
        let argument = "INSERT INTO Sections (section) VALUES (?)";
        let tmpString = "";
        if (!args[0]) {
            message.reply('please provide a section to add.')
            return;
        }
        for (let a of args) {
            //Restores input args to include the spaces between the words
            if (args.indexOf(a) == args.length - 1) {
                tmpString = tmpString.concat(a);
            } else {
                tmpString = tmpString.concat(a, " ");
            }
        }


        //Splits where there are commas, to distinguish section-names (consists of section names)
        //runs seperate inserts for each section as argument
        tmpString.split(/, +|,+/).forEach((section) => {
            let prepared = db.prepare(argument);
            prepared.run(section, (err: any, res: any) => {
                if (err) {
                    console.log(err);
                    message.reply(
                        'Section: "' + section + '" already exists'
                    );
                } else {
                    message.reply(
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

        if (args[0] && args[0] != "") {
            for (let a of args) {
                //Restores input args to include the spaces between the words
                if (args.indexOf(a) == args.length - 1) {
                    tmpString = tmpString.concat(a);
                } else {
                    tmpString = tmpString.concat(a, " ");
                }
            }
        } else {
            message.reply("please try again with correct formatting !removesection [section]");
            return;
        }

        //Splits where there are commas, to distinguish section-names (consists of section names)
        //runs seperate inserts for each section as argument
        tmpString.split(/, +|,+/).forEach((section) => {
            let statement = db.prepare(argument);
            statement.run(section, (err: any, res: any) => {
                if (err) {
                    console.log(err);
                    message.reply(
                        'section: "' + section + '" already removed.'
                    );
                } else {
                    message.reply(
                        'section: "' + section + '" has been removed.'
                    );
                }
            });
        });
    }
}
