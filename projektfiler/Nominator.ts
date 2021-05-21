import Discord from "discord.js";
import { GlobalFunctions } from "./GlobalFunctions";
import { DatabaseFunctions } from "./DatabaseFunctions";
import { HelpCommand} from "./HelpCommand";
import { TestAccess } from "./TestAccess";
export class Nominator {
    static resetNominations(
        msg: Discord.Message,
        client: Discord.Client
    ): void {
        let listener = (message: Discord.Message) => {
            if (
                message.author === msg.author &&
                message.content.toLowerCase() === "confirm"
            ) {
                //if the correct user types confirm
                clearTimeout(timeout);
                DatabaseFunctions.getInstance()
                    .prepare("DELETE FROM Sections")
                    .run(); //delete all sections, should drop every other table since they rely on it
                message.channel.send(
                    "All nominations and sections have been reset."
                );
                client.removeListener("message", listener);
            }
        };
        let timeout = setTimeout(function () {
            msg.reply("the confirmation await has timed out.");
            client.removeListener("message", listener);
        }, 1000 * 60); //lets the user have 60 seconds to confirm
        client.on("message", listener);
        msg.reply('please type "confirm" to reset all sections.');
    }

    static removeNomineeFromSection(
        message: Discord.Message,
        args: string[]
    ): void {
        if (!args[0] || !args[1]) {
            message.reply("please provide a user and a section.");
            return;
        } //if either user or section is missing send error and return
        let section: string = "";
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " "); //turns section into a string
        }
        section = section.slice(0, -1);
        DatabaseFunctions.getInstance()
            .prepare("DELETE FROM Nominations WHERE user = ? AND section = ?")
            .run(GlobalFunctions.toId(args[0]), section);
        message.reply(args[0] + " has been removed from section: " + section);
    }

    public static nomUnBan(message: Discord.Message, args: string[]): void {
        if (!args[0]) {
            message.reply("please provide an user");
            return;
        }
        DatabaseFunctions.getInstance()
            .prepare("DELETE FROM NominatorBanned WHERE banned=?")
            .run(GlobalFunctions.toId(args[0]), (err) => {
                if (err) {
                } else {
                    message.reply("The user has been unbanned");
                }
            });
    }

    public static nomBan(message: Discord.Message, args: string[]): void {
        if (!args[0]) {
            message.reply("please provide a user.");
            return;
        }
        DatabaseFunctions.getInstance()
            .prepare("DELETE FROM Nominations WHERE user = ?")
            .run(GlobalFunctions.toId(args[0]));
        DatabaseFunctions.getInstance()
            .prepare("INSERT INTO NominatorBanned (banned) VALUES (?)")
            .run(GlobalFunctions.toId(args[0]), (err) => {
                if (err) {
                    console.log(err);
                    message.reply(
                        "an error occurred, user might already be banned."
                    );
                } else {
                    message.reply("The user has been banned");
                }
            }); //remove from nominations and add to banned nominators
    }

    private isNomBanned(nominee: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM NominatorBanned WHERE banned = ?";
            DatabaseFunctions.getInstance().get(query, nominee, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                row ? resolve(true) : resolve(false);
            });
        });
    }

    public static openNominations(message: Discord.Message): void {
        DatabaseFunctions.getInstance()
            .prepare("INSERT INTO NominatorOpen (isOpen) VALUES (?)")
            .run(1, (err) => {
                if (err) {
                    console.log(err);
                    message.reply(
                        "an error has occurred, nominations might already be open."
                    );
                } else {
                    message.reply("Nominations are open!");
                }
            });
    }
    public static closeNominations(message: Discord.Message): void {
        DatabaseFunctions.getInstance()
            .prepare("DELETE FROM NominatorOpen")
            .run();
        message.reply("Nominations are closed.");
    }

    public static isOpen(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM NominatorOpen";
            DatabaseFunctions.getInstance().get(query, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                row ? resolve(true) : resolve(false);
            });
        });
    }

    public async doIt(args: string[], message: Discord.Message): Promise<void> {
        let section: string = "";
        if (!args[0]) {
            if(await TestAccess.doIt(message, "owner")){
                HelpCommand.doItVote(message, "voteowner");
                return;
            }
            if(await TestAccess.doIt(message, "mod")){
                HelpCommand.doItVote(message, "votemod");
                return;
            }
            else{
                HelpCommand.doItVote(message, "voteuser");
            }
            return;
        }
        console.log(args[0]);
        let nominee = args[0];
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " "); //array of strings to string
        }
        section = section.slice(0, -1);
        if (!(args.shift() && args.shift())) {
            message.reply(
                "please use correct input values, !nominations [section]/[userId]"
            );
            return;
        }
        nominee = GlobalFunctions.toId(nominee);
        if (message.author.id.toString() === nominee) {
            message.reply("can not nominate yourself.");
            return;
        }
        if (await this.isNomBanned(nominee)) {
            message.reply("can not nominate this user.");
            return;
        }
        this.nominate(nominee, section, message).then((res) => {
            if (res) {
                message.reply(
                    "nomination has been registered, type !nominations [section] too see all nominations."
                );
            }
        });
    }

    private static canNominate(message: Discord.Message): Promise<boolean> {
        let nominator = message.author.id;
        let queryNominations =
            "SELECT COUNT(nominator) as nominator, (strftime('%s',min(stamp))) as stamp FROM Nominations WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND nominator == ?) GROUP BY nominator"; //querynominations contains the number of nominations made the past 24h
        return new Promise((resolve, reject) => {
            let nominationsByUser = 0;
            DatabaseFunctions.getInstance().get(
                queryNominations,
                nominator,
                (err, row) => {
                    if (err) {
                        console.log(err + " this should not be happening");
                        reject(err); // if we get an unknown error we return this
                    }
                    if (row) {
                        nominationsByUser = row.nominator;
                        if (nominationsByUser >= 1) {
                            //if user has nominated in the last 24 hours
                            message.reply(
                                `you have already nominated once in the past 24 hours, you can nominate again: ${new Date(
                                    Date.now() +
                                        1000 *
                                            (24 * 60 * 60 -
                                                (Date.now() / 1000 - row.stamp))
                                ).toString()}`
                            );
                            resolve(false);
                        }
                    }
                    resolve(true);
                }
            );
        });
    }

    private async nominate(
        user: string,
        section: string,
        message: Discord.Message
    ): Promise<boolean> {
        return new Promise(async (resolve) => {
            let returnValue = false;
            let done = false;
            DatabaseFunctions.getInstance()
                .prepare("SELECT * FROM Sections WHERE section = ?")
                .get(section, (err: any, res) => {
                    if (done) return;
                    if (err) {
                        resolve(false);
                        done = true;
                        return;
                    }
                    if (res === undefined) {
                        resolve(false);
                        done = true;
                        return;
                    }
                });
            await Nominator.canNominate(message).then((res) => {
                if (!res && false) {
                    resolve(false);
                    done = true;
                }
            });

            await message.guild.members.fetch(user).catch((e) => {
                //Catches errors that discord js may throw so the bot wont die
                if (done) return;
                message.reply(
                    "user is not in server. Please try again with a correct name or ID."
                );
                resolve(false);
                done = true;
            });

            await Nominator.getIfUserInSection(section, user).then((res) => {
                if (!res && !done) {
                    message.reply("this user has already been nominated");
                    return;
                } else if (!done) {
                    returnValue = true;
                    DatabaseFunctions.getInstance()
                        .prepare(
                            "INSERT INTO Nominations (nominator,user,section) VALUES(?, ?, ?)"
                        )
                        .run(message.author.id, user, section);
                    return;
                }
            });
            resolve(returnValue);
        });
    }

    public static async displayCandidates(
        args: string[],
        message: Discord.Message
    ) {
        let arg = "";
        if (!args[0]) {
            message.reply(
                "please use correct input values, !nominations [section]/[userId]"
            );
            return;
        }
        for (let i = 0; i < args.length; i++) {
            arg = arg.concat(args[i] + " ");
        }
        arg = arg.slice(0, -1); //arg will now be a full section
        arg = GlobalFunctions.toId(arg); //turn it to id
        DatabaseFunctions.getInstance()
            .prepare("SELECT * FROM Sections WHERE section = ?")
            .all(arg, async (err, rows) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (rows) {
                    if (rows[0]) {
                        this.displayCandidatesForSection(arg, message);
                    } else {
                        if (
                            await message.guild.members
                                .fetch(arg)
                                .catch((e) => console.log(e))
                        ) {
                            this.displaySectionsForCandidate(arg, message);
                        } else {
                            message.reply(
                                "please use correct input values, !nominations [section]/[userId]"
                            );
                        }
                    }
                }
            });
    }

    private static displaySectionsForCandidate(
        user: string,
        message: Discord.Message
    ): void {
        DatabaseFunctions.getInstance().all(
            "SELECT section FROM Nominations WHERE user=?",
            user,
            async (err, rows) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (rows[0]) {
                    let embed = new Discord.MessageEmbed();
                    await Nominator.forEachRowCandidate(rows, message, embed);

                    await message.guild.members.fetch(user).then((res) => {
                        if (res) {
                            embed
                                .setTitle(
                                    res.displayName + " has been nominated for:"
                                )
                                .setColor("#E2C696");
                            message.channel.send(embed); //send embed after all sections are added
                        } else {
                            message.reply(
                                "this doesn't seem to be a valid user. Please try again."
                            );
                        }
                    });
                } else {
                    message.reply(
                        "this user hasn't been nominated for any section."
                    );
                    return;
                }
            }
        );
    }

    private static forEachRowCandidate(
        row: any[],
        message: Discord.Message,
        embed: Discord.MessageEmbed
    ): Promise<void> {
        return new Promise(async (resolve) => {
            let i = 1;
            row.forEach(async (element) => {
                if (i++ % 100 == 0) {
                    await message.guild.members
                        .fetch(element.user)
                        .then((res) => {
                            embed
                                .setTitle(
                                    res.displayName + " has been nominated for:"
                                )
                                .setColor("#E2C696");
                        });

                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                embed.addField(element.section, "-");
                resolve();
            });
        });
    }

    private static displayCandidatesForSection(
        section: string,
        message: Discord.Message
    ): void {
        DatabaseFunctions.getInstance().all(
            "SELECT user FROM Nominations WHERE section=?",
            section,
            async (err, rows) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (rows[0]) {
                    let embed = new Discord.MessageEmbed();
                    await Nominator.forEachRowSection(
                        rows,
                        message,
                        embed,
                        section
                    );
                    embed
                        .setTitle("Users nominated for " + section + ":")
                        .setColor("#E2C696");
                    await message.channel.send(embed);
                } else {
                    message.reply("this section has no nominations.");
                    return;
                }
            }
        );
    }

    private static forEachRowSection(
        row: any[],
        message: Discord.Message,
        embed: Discord.MessageEmbed,
        section: string
    ): Promise<void> {
        return new Promise(async (resolve) => {
            let i = 1;
            message.channel.send("Fetching info, please wait...");
            for (const element of row) {
                if (i++ % 100 == 0) {
                    embed
                        .setTitle("Users nominated for " + section + ":")
                        .setColor("#E2C696");
                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                await message.guild.members.fetch(element.user).then((res) => {
                    embed.addField(res.displayName, res.user.tag, true);
                });
            }
            resolve();
        });
    }

    private static getIfUserInSection(
        section: string,
        user: string
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM Nominations WHERE user=? AND section=?";
            DatabaseFunctions.getInstance().get(
                query,
                user,
                section,
                (err: any, row: any) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }

                    row ? resolve(false) : resolve(true);
                }
            );
        });
    }
}
