import Discord from "discord.js";
import { GlobalFunctions } from "./GlobalFunctions";
import { DatabaseFunctions } from "./DatabaseFunctions";
export class Nominator {
    static resetNominations(msg: Discord.Message, client) {
        let listener = (message: Discord.Message) => {
            if (
                message.author === msg.author &&
                message.content === "confirm"
            ) {
                clearTimeout(timeout);
                DatabaseFunctions.getInstance()
                    .prepare("DELETE FROM Sections")
                    .run();
                message.channel.send(
                    "all nominations and sections have been reset"
                );
                client.removeListener("message", listener);
            }
        };
        let timeout = setTimeout(function () {
            msg.channel.send("The confirm has timed out");
            client.removeListener("message", listener);
        }, 1000 * 60);
        client.on("message", listener);
        msg.channel.send('Please type "confirm" to reset all sections');
    }

    static removeNomineeFromSection(message: Discord.Message, args: string[]) {
        if (!args[0] || !args[1]) {
            message.channel.send("please provide an user and section");
            return;
        }
        DatabaseFunctions.getInstance()
            .prepare("DELETE FROM Nominations WHERE user = ? AND section = ?")
            .run(GlobalFunctions.toId(args[0]), args[1]);
        message.channel.send(
            "User: " + args[0] + " has been removed from section: " + args[1]
        );
    }

    public static nomUnBan(message: Discord.Message, args: string[]) {
        if (!args[0]) {
            message.channel.send("please provide an user");
            return;
        }
        DatabaseFunctions.getInstance()
            .prepare("DELETE FROM NominatorBanned WHERE banned=?")
            .run(GlobalFunctions.toId(args[0]));
    }

    public static nomBan(message: Discord.Message, args: string[]) {
        if (!args[0]) {
            message.channel.send("please provide an user");
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
                    message.channel.send(
                        "An error occurred, user might already be banned"
                    );
                }
            });
    }

    private isNomBanned(nominee: string) {
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

    public static openNominations(message) {
        DatabaseFunctions.getInstance()
            .prepare("INSERT INTO NominatorOpen (isOpen) VALUES (?)")
            .run(1, (err) => {
                if (err) {
                    console.log(err);
                    message.channel.send(
                        "An error has occoured, nominations might already be open"
                    );
                } else {
                    message.channel.send("Nominations are open");
                }
            });
    }
    public static closeNominations(message) {
        DatabaseFunctions.getInstance()
            .prepare("DELETE FROM NominatorOpen")
            .run();
        message.channel.send("Nominations are Closed");
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
        let nominee = args[0];
        let section: string = "";
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " ");
        }
        section = section.slice(0, -1);
        if (message.author.id.toString() === nominee) {
            message.channel.send("Cannot nominate yourself");
            return;
        }
        if (!(args.shift() && args.shift())) {
            message.channel.send("!nominate [member] [section]");
            return;
        }
        if (await this.isNomBanned(nominee)) {
            message.channel.send("Cannot nominate this user");
            return;
        }
        this.nominate(nominee, section, message).then((res) => {
            if (res) {
                message.channel.send(
                    "nomination has been registered, type !nominations [section] too see all nominations"
                );
            }
        });
    }

    private static canNominate(nominator: string): Promise<boolean> {
        //function name
        let queryNominations =
            "SELECT COUNT(nominator) as nominator FROM Nominations WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND nominator == ?) GROUP BY nominator"; //querynominations contains the number of nominations made the past 24h
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
            user = GlobalFunctions.toId(user);
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
                        message.channel.send("section does not exist"); //section has not been created or at least does not exist in sectionlist
                        resolve(false);
                        done = true;
                        return;
                    }
                    // if (res.count === 0) {
                    //     message.channel.send("section does not exist"); //section has not been created or at least does not exist in sectionlist
                    //     done = true;
                    //     resolve(false);
                    //     return;
                    // }
                });
            await Nominator.canNominate(message.author.id).then((res) => {
                if (!res && false) {
                    //REMOVE FALSE
                    message.channel.send(
                        "You have already nominated once in the last 24 hours: "
                    );
                    resolve(false);
                    done = true;
                }
            });

            await message.guild.members.fetch(user).catch((e) => {
                //Catches errors that discord js may throw so the bot wont die
                if (done) return;
                message.channel.send("user not in server");
                resolve(false);
                done = true;
            });

            await Nominator.getIfUserInSection(section, user).then((res) => {
                if (!res && !done) {
                    message.channel.send(
                        "This user has already been nominated"
                    );
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
        arg = arg.slice(0, -1);
        arg = GlobalFunctions.toId(arg);
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
        console.log(user);
        DatabaseFunctions.getInstance().all(
            "SELECT section FROM Nominations WHERE user=?",
            user,
            async (err, row) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (row) {
                    let embed = new Discord.MessageEmbed();
                    await Nominator.forEachRowCandidate(
                        row,
                        message,
                        embed,
                        user
                    );
                    await message.guild.members.fetch(user).then((res) => {
                        if (res) {
                            embed
                                .setAuthor("nominations for " + res.displayName) //searchword bör bli nickname istället för userid när searchword är användare
                                .setColor("#ff0000");
                            message.channel.send(embed);
                        } else {
                            message.channel.send(
                                "This doesnt seem to be a valid user"
                            );
                        }
                    });
                } else {
                    message.channel.send("This person hasn't been nominated");
                    return;
                }
            }
        );
    }

    private static forEachRowCandidate(
        row: any[],
        message: Discord.Message,
        embed: Discord.MessageEmbed,
        user: string
    ): Promise<void> {
        return new Promise(async (resolve) => {
            let i = 1;
            row.forEach(async (element) => {
                if (i++ % 100 == 0) {
                    await message.guild.members
                        .fetch(element.user)
                        .then((res) => {
                            embed
                                .setAuthor("nominations for " + res.displayName) //searchword bör bli nickname istället för userid när searchword är användare
                                .setColor("#ff0000");
                        });

                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                embed.addField("section", element.section);
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
                if (rows) {
                    let embed = new Discord.MessageEmbed();
                    await Nominator.forEachRowSection(
                        rows,
                        message,
                        embed,
                        section
                    );
                    embed
                        .setAuthor("nominations for " + section)
                        .setColor("#ff0000");
                    await message.channel.send(embed);
                } else {
                    message.channel.send("This section has no nominattions");
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
            message.channel.send("fetching members...");
            for (const element of row) {
                if (i++ % 100 == 0) {
                    embed
                        .setAuthor("nominations for " + section)
                        .setColor("#ff0000");
                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                await message.guild.members.fetch(element.user).then((res) => {
                    embed.addField(res.displayName, res.user.tag, true);
                });
            }
            // row.forEach(async (element) => {
            //     if (i++ % 100 == 0) {
            //         embed
            //             .setAuthor("nominations for " + section)
            //             .setColor("#ff0000");
            //         message.channel.send(embed);
            //         embed = new Discord.MessageEmbed();
            //     }
            //     await message.guild.members.fetch(element.user).then((res) => {
            //         embed.addField(res.displayName, res.user.tag, true);
            //     });
            // });
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
