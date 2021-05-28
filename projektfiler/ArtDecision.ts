import Discord from "discord.js";
import { ErrorLog } from "./ErrorLog";
import { DatabaseFunctions } from "./DatabaseFunctions";
import { GlobalFunctions } from "./GlobalFunctions";

export class ArtDecision {
    constructor() {}

    doIt(message: Discord.Message, args: any[], sub: string): void {
        let tmp = args.shift();
        if (!(sub === "deny" || sub === "accept")) {
            //Checks if the sub command is valid
            message.channel.send(
                "Usage: *!art [accept/deny] [user] [deny reason]*"
            );
            return;
        }
        if (tmp === undefined) {
            //Checks if a user has been given
            message.reply(
                "you must provide a username/ID. Please try again with !art deny [user] [reason]"
            );
            return;
        }
        message.guild.members
            .fetch(GlobalFunctions.toId(tmp))
            .catch((e) => {
                message.reply(
                    "invalid username/ID. Please try again with !art deny [user] [reason]."
                ); //Catches errors that discord js may throw so the bot wont die
            })
            .then((user) => {
                user
                    ? this.switch(message, args, sub, user) //Runs the switch function if the user is a valid guild member
                    : console.log("error, invalid user provided."); //Logs that a discord error has occored
            });
    }

    //Determines what sub command has been sent
    private switch(
        message: Discord.Message,
        args: any[],
        sub: string,
        user: Discord.GuildMember
    ) {
        switch (sub) {
            case "accept":
                this.addArtRole(user, message); // gives user artrole
                break;
            case "deny":
                let reason: string = args[0];
                if (reason === undefined) {
                    //Makes sure there is a reason provided
                    message.reply(
                        "you must provide a reason. Please try again with !art deny [user] [reason]"
                    );
                    return;
                }
                while (args.shift() && args[0]) {
                    //Compiles all remaining args into a string
                    reason = reason + " " + args[0];
                }
                this.deny(user, reason, message);
                break;
        }
    }

    // sets which role it the artist role
    public setArt(message: Discord.Message, command: string) {
        if (!command) {
            //Checks if there is a command after the prefix
            message.channel.send("please provide a role");
        } else {
            command = GlobalFunctions.toId(command);
            DatabaseFunctions.getInstance()
                .prepare("DELETE FROM Access WHERE accessLVL =?")
                .run("art");
            DatabaseFunctions.getInstance()
                .prepare(
                    "INSERT INTO Access(accessLVL, role) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM Access WHERE accessLVL =? AND role =?);"
                )
                .run("art", command, "art", command); //Adds the owner status for the specified role
            message.channel.send("OK");
        }
    }

    //Sends the 'artist' the reason they were rejected and a confirming message so the mods know that the command worked and logs it.
    private deny(
        user: Discord.GuildMember,
        reason: string,
        message: Discord.Message
    ) {
        user.send(
            "Your art application has been rejected for the following reason:\n" +
                reason
        ).catch((e) => {
            message.channel.send(
                "Looks like I am unable to dm this member! They are not aware of the reason!"
            );
            console.log(e);
        });
        message.channel.send(
            "User: " + user + " has been denied with the reason: " + reason
        );
    }

    // adds the art role to the user who has been approved.
    private addArtRole(user: Discord.GuildMember, msg: Discord.Message) {
        let querry = "SELECT * FROM Access WHERE accessLVL = ?";
        DatabaseFunctions.getInstance().get(querry, "art", (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row === undefined) {
                msg.channel.send(
                    "There is no art role set. Use *!setart [role]* to set role"
                );
            }
            if (row) {
                let role = row.role;
                user.roles.add(role).catch((error) => {
                    ErrorLog.doIt(msg, error);
                });
                user.send(
                    "Your art application has been approved and you have been granted the Artist role."
                ).catch((e) => {
                    msg.channel.send(
                        "Looks like I am unable to dm this member! Please tell them the good news for me!"
                    );
                });
                msg.channel.send(
                    "User: " +
                        user.user.tag +
                        " has been approved and given the Artist role."
                );
            }
        });
    }
}
