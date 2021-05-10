//import { CommandAddSection } from "./CommandAddSection";
import Discord from "discord.js";
import { GlobalFunctions } from "./GlobalFunctions";
import { DatabaseFunctions } from "./DatabaseFunctions";
export class Nominator {


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
        this.nominate(nominee, section, message).then((res) => {
            if (res) { message.channel.send("nomination has been registered, type !nominations [section] too see all nominations"); }
        });
    }

    private static canNominate(nominator: string): Promise<boolean> { //function name
        let queryNominations = "SELECT COUNT(nominator) as nominator FROM Nominations WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND nominator == ?) GROUP BY nominator"; //querynominations contains the number of nominations made the past 24h
        return new Promise((resolve, reject) => {
            let nominationsByUser = 0;
            DatabaseFunctions.getInstance().get(queryNominations, nominator, (err, row) => {
                if (err) {
                    console.log(err + ' this should not be happening');
                    reject(err);// if we get an unknown error we return this
                }
                if (row) {
                    nominationsByUser = row.nominator;
                    if (nominationsByUser >= 1) {
                        resolve(false);
                    }
                }
                resolve(true);
            });
        });
    }

    private async nominate(user: string, section: string, message: Discord.Message): Promise<boolean> {
        return new Promise(async (resolve) => {
            let returnValue = false;
            let done = false;
            user = GlobalFunctions.toId(user);
            await Nominator.canNominate(message.author.id).then((res) => {
                if (!res) {
                    message.channel.send("You have already nominated once in the last 24 hours: ");
                    resolve(false);
                    done = true;
                }
            });

            DatabaseFunctions.getInstance().prepare("SELECT COUNT(section) as count FROM Sections WHERE (section == ?) GROUP BY SECTION")
                .run(section, (err: any, res: { count: number; }) => {

                    if (done) return;
                    if (err) {
                        resolve(false);
                        done = true;
                        return;
                    }
                    if (res.count == 0) {
                        message.channel.send("section does not exist"); //section has not been created or at least does not exist in sectionlist
                        done = true;
                        resolve(false);
                        return;
                    }
                });

            await message.guild.members.fetch(user).catch(e => {//Catches errors that discord js may throw so the bot wont die
                if (done) return;
                message.channel.send("user not in server");
                resolve(false);
                done = true;
            });

            await Nominator.getIfUserInSection(section, user).then((res) => {
                if (!res && !done) {
                    message.channel.send("This user has already been nominated");
                    return;
                } else if (!done) {
                    returnValue = true;
                    DatabaseFunctions.getInstance().prepare("INSERT INTO Nominations (nominator,user,section) VALUES(?, ?, ?)").run(message.author.id, user, section);
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
        let arg = '';
        for (let i = 0; i < args.length; i++) {
            arg = arg.concat(args[i] + " ");
        }
        arg = arg.slice(0, -1);
        arg = GlobalFunctions.toId(arg);
        DatabaseFunctions.getInstance().prepare('SELECT * FROM Sections WHERE (section == ?)')
            .all(arg, async (err, rows) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (rows) {
                    if (rows[0]) {
                        this.displayCandidatesForSection(arg, message);
                    }
                    else {
                        if (await message.guild.members.fetch(arg)) {
                            this.displaySectionsForCandidate(arg, message);
                        }
                        else {
                            message.reply('please use correct input values, !nominations [section]/[userId]');
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
        DatabaseFunctions.getInstance().all("SELECT section FROM Nominations WHERE user=?", user, async (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row) {
                let embed = new Discord.MessageEmbed();
                await Nominator.forEachRowCandidate(row, message, embed, user);
                await message.guild.members.fetch(user).then((res) => {
                    embed
                        .setAuthor("nominations for " + res.user.username) //searchword bör bli username istället för userid när searchword är användare
                        .setColor("#ff0000");
                });
                message.channel.send(embed);
            } else {
                message.channel.send("This person hasn't been nominated");
                return;
            }
        });
    }

    private static forEachRowCandidate(row: any[], message: Discord.Message, embed: Discord.MessageEmbed, user: string): Promise<void> {
        return new Promise(async resolve => {
            let i = 1;
            row.forEach(async (element) => {
                if (i++ % 100 == 0) {
                    await message.guild.members.fetch(element.user).then((res) => {
                        embed
                            .setAuthor("nominations for " + res.user.username) //searchword bör bli username istället för userid när searchword är användare
                            .setColor("#ff0000");
                    });

                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                embed.addField(element.section, "random", false);

                resolve();
            });

        });
    }

    private static displayCandidatesForSection(
        section: string,
        message: Discord.Message
    ): void {
        DatabaseFunctions.getInstance().all("SELECT user FROM Nominations WHERE section=?", section, async (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row) {

                let embed = new Discord.MessageEmbed();
                await Nominator.forEachRowSection(row, message, embed, section);
                embed
                    .setAuthor("nominations for " + section)
                    .setColor("#ff0000");
                await message.channel.send(embed);
            } else {
                message.channel.send("This person hasn't been nominated");
                return;
            }
        });
    }

    private static forEachRowSection(row: any[], message: Discord.Message, embed: Discord.MessageEmbed, section: string): Promise<void> {
        return new Promise(async resolve => {
            let i = 1;
            row.forEach(async (element) => {
                if (i++ % 100 == 0) {
                    embed
                        .setAuthor("nominations for " + section) //searchword bör bli username istället för userid när searchword är användare
                        .setColor("#ff0000");
                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                await message.guild.members.fetch(element.user).then((res) => {
                    embed.addField(res.user.username, "random", false);
                });
                resolve();
            });

        });
    }

    private static getIfUserInSection(section: string, user: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM Nominations WHERE user=? AND section=?";
            DatabaseFunctions.getInstance().get(query, user, section, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                row ? resolve(false) : resolve(true);
            });
        });
    }


}




