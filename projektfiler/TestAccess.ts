import Discord from "discord.js";
import { GlobalFunctions } from "./GlobalFunctions";
import { DatabaseFunctions } from "./DatabaseFunctions";

export class TestAccess {
    public static async doIt(
        message: Discord.Message,
        accessLevel: string
    ): Promise<boolean> {
        if (GlobalFunctions.messageIsDirectMessage(message)) return false; //since the bot will crash if message.guild === null, and guild does not exist in dm
        switch (accessLevel) {
            case "mod": //Checks if the member has a mod role
                return (
                    message.author.id === message.member.guild.ownerID ||
                    (await this.hasAccessLevel(message, "mod")) ||
                    (await this.hasAccessLevel(message, "owner"))
                );
            case "owner": //Checks if the member has a owner role
                return (
                    message.author.id === message.member.guild.ownerID ||
                    (await this.hasAccessLevel(message, "owner"))
                );
            case "gowner": //Checks if the member is guild(server) owner
                return message.author.id === message.member.guild.ownerID;
            default:
                return false;
        }
    }

    public static async setMod(
        message: Discord.Message,
        command: string
    ): Promise<void> {
        if (!command) {
            //Checks if there is a command after the prefix
            message.reply("please provide a role.");
        } else {
            command = GlobalFunctions.toId(command);
            if (
                (await this.doIt(message, "owner")) &&
                this.isguild(message, command)
            ) {
                //Make sure only people with owner role can access
                DatabaseFunctions.getInstance()
                    .prepare(
                        "INSERT INTO Access(accessLVL,role) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM Access WHERE accessLVL =? AND role =?);"
                    )
                    .run("mod", command, "mod", command); //Sets mod status fom the specified role
                message.reply('OK!');
            } else {
                message.reply("failed. Either the input role is incorrect or you are not the server owner.");
            }
        }
    }

    public static async setOwner(
        message: Discord.Message,
        command: string
    ): Promise<void> {
        if (!command) {
            //Checks if there is a command after the prefix
            message.reply("please provide a role.");
            return;
        } else {
            command = GlobalFunctions.toId(command);
            if (
                (await this.doIt(message, "gowner")) &&
                this.isguild(message, command)
            ) {
                //Make sure only guild owner can access
                DatabaseFunctions.getInstance()
                    .prepare("DELETE FROM Access WHERE accessLVL =?")
                    .run("owner"); //Deletes the old owner role
                DatabaseFunctions.getInstance()
                    .prepare(
                        "INSERT INTO Access(accessLVL, role) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM Access WHERE accessLVL =? AND role =?);"
                    )
                    .run("owner", command, "owner", command); //Adds the owner status for the specified role
                message.reply('OK!');
            } else {
                message.reply("failed. Either the input role is incorrect or you are not the server owner.");
            }
        }
    }

    public static async unMod(
        message: Discord.Message,
        command: string
    ): Promise<void> {

        if (!command) {
            //Checks if there is a command after the prefix
            message.reply("please provide a role.");
        } else {
            command = GlobalFunctions.toId(command);
            if (
                (await this.doIt(message, "owner")) &&
                this.isguild(message, command)
            ) {
                //Make sure only people with owner role can access
                DatabaseFunctions.getInstance()
                    .prepare(
                        "DELETE FROM Access WHERE accessLVL =? AND role =?"
                    )
                    .run("mod", command); //Deletes the mod status from the specified role
                message.reply('OK!');
            } else {
                message.reply("you must be server owner.");
            }
        }
    }

    private static hasAccessLevel(
        message: Discord.Message,
        accessLevel: string
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM Access WHERE accessLVL = ?"; //Query to check the access level
            let value: boolean = false;
            DatabaseFunctions.getInstance().all(
                query,
                accessLevel,
                (err, row) => {
                    //Returns all rows from the query
                    if (err) {
                        //If there is an error with the query
                        console.log(err);
                        reject(err);
                    }
                    row?.forEach((element) => {
                        //loops throw all roles that meet the criteria
                        if (message.member.roles.cache.has(element.role)) {
                            //Checks if the member has the requested role
                            value = true;
                            return;
                        }
                    });
                    resolve(value); //true if member has specified role, otherwise false
                }
            );
        });
    }

    private static isguild(message: Discord.Message, command: string): boolean {
        if (
            message.guild.roles.cache.find((role) => role.name == command) ||
            message.guild.roles.cache.has(command)
        )
            return true;
        return false;
    }
}
