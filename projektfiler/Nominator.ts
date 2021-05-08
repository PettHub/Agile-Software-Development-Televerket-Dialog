//import { CommandAddSection } from "./CommandAddSection";
import Discord from "discord.js";
import { GlobalFunctions } from "./GlobalFunctions";
import { DatabaseFunctions } from "./DatabaseFunctions";
export class Nominator {
    //private static timedOutUsers: Map<string, number> = new Map(); //this is a cache of users that are timed out in order to ease the load for hte database

    public async doIt(args: string[], message: Discord.Message): Promise<void> {
        //let nominator = message.author;
        //let nominatorTimeoutEnds = Nominator.timedOutUsers.get(nominator.id);

        /*if (nominatorTimeoutEnds) {
            if (nominatorTimeoutEnds > Date.now()) { //if nominator in map  and if date and time now has not passed the next time they are allowed to vote 
                nominator.send("You have already nominated someone within 24h. Please try again at: " + new Date(nominatorTimeoutEnds).toString());
                return;
            }
        }*/
        //let value = await Nominator.getTimeout(nominator.id);

        /*switch (value) {
            case true: //todo: acutlaly call for nominatorthingys
                let insert = db.prepare(insertVote); //prepare the vote
                 let insertResult = insert.run(voter.id, votee, section); //insert it
                 insertResult.finalize(() => { voter.send('vote did actually not go through, check arguments') });
                 nominatorId.send('vote for ' + votee + ' went through.');
                break;
            case false:
                let nominatorTimeoutEnds = Nominator.timedOutUsers.get(nominator.id);
                if (nominatorTimeoutEnds)
                    nominator.send("You have already nominated someone within 24h. Please try again at: " + new Date(nominatorTimeoutEnds).toString());
                break;
        }*/

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
                    if (nominationsByUser >= 1) { //if user has nominated 1 time the last 24 hours
                        /*let queryAllNominations = "SELECT strftime('%s',MIN(stamp)) as earliest FROM Nominations WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY user;";
                        DatabaseFunctions.getInstance().db.get(queryAllNominations, nominator, (err, row) => {
                            if (err) { console.log(err + ' this is a simulation, wake up'); }
                            if (row) {//sql dates and javascript dates might not match up, please be aware
                                let nextElligableNomination = Date.now() + 1000 * (24 * 60 * 60 - (Date.now() / 1000 - row.earliest)); //calculates the time the next elligable vote is to take place
                                Nominator.timedOutUsers.set(nominator, nextElligableNomination); //caches that the user is timed out in order to save the db some load
                            }
                        });*/
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
            let runnable = DatabaseFunctions.getInstance().prepare("SELECT COUNT(section) as count FROM Sections WHERE (section == ?) GROUP BY SECTION");
            await runnable.run(section, (err, res) => {
                if (err) {
                    resolve(false);
                    return;
                }
                if (res.count == 0) {
                    message.channel.send("section does not exist"); //section has not been created or at least does not exist in sectionlist
                    resolve(false);
                    return;
                }
            })
            /*
            if (!CommandAddSection.sectionList.has(section) && !done) {
                message.channel.send("section does not exist"); //section has not been created or at least does not exist in sectionlist
                resolve(false);
                return;
            }
            */

            await message.guild.members.fetch(user).catch(e => {//Catches errors that discord js may throw so the bot wont die
                if (done) return;
                message.channel.send("user not in server");
                resolve(false);
                done = true;
            });

            await Nominator.getIfUserInSection(section, user).then((res) => {
                //console.log("inner function before: " + returnValue);
                if (!res && !done) {
                    message.channel.send("This user has already been nominated");
                    return;
                } else if (!done) {
                    returnValue = true;
                    //console.log("inner function after: " + returnValue);
                    DatabaseFunctions.getInstance().prepare("INSERT INTO Nominations (nominator,user,section) VALUES(?, ?, ?)").run(message.author.id, user, section);
                    return;
                }
            });
            //console.log("outer function: " + returnValue);
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
        let runnable = await DatabaseFunctions.getInstance().prepare('SELECT * FROM Sections WHERE (section == ?)');
        runnable.all(arg, (err, rows) => {
            if (err) {
                console.log('crashes first run');
                console.log(err);
                return;
            }
            if (rows)
                if (rows[0])
                    this.displayCandidatesForSection(arg, message);
                else {
                    if (message.guild.member(arg)) {
                        this.displaySectionsForCandidate(arg, message);
                    }
                    else {
                        message.reply('please use correct input values, !nominations [section]/[userId]');
                    }
                }
        });
    }

    private static displaySectionsForCandidate(
        user: string,
        message: Discord.Message
    ): void {
        console.log(user);
        Nominator.displayCandidatesBySearchword(user, message, "SELECT section FROM Nominations WHERE user=?");
    }

    private static displayCandidatesForSection(
        user: string,
        message: Discord.Message
    ): void {
        Nominator.displayCandidatesBySearchword(user, message, "SELECT user FROM Nominations WHERE section=?");
    }

    private static displayCandidatesBySearchword(searchWord: string,
        message: Discord.Message, query: string): void {
        DatabaseFunctions.getInstance().all(query, searchWord, async (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row) {

                let embed = new Discord.MessageEmbed();
                await Nominator.forEachRow(row, message, embed, searchWord);
                embed
                    .setAuthor(searchWord + " nominations")
                    .setColor("#ff0000");
                await message.channel.send(embed);
            } else {
                message.channel.send("This person hasnt been nominated");
                return;
            }
        }
        );
    }

    private static forEachRow(row: any[], message: Discord.Message, embed: Discord.MessageEmbed, searchWord: string): Promise<void> {
        return new Promise(async resolve => {

            let i = 1;
            row.forEach(async (element) => {
                if (i++ % 100 == 0) {
                    embed
                        .setAuthor(searchWord + " nominations:") //searchword bör bli username istället för userid när searchword är användare
                        .setColor("#ff0000");
                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                //console.log(element.user);
                if (element.user) {
                    await message.guild.members.fetch(element.user).then((res) => {
                        embed.addField(res.user.username, res.id, false);
                    });
                } else {
                    embed.addField(element.section, "random", false);
                }

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


