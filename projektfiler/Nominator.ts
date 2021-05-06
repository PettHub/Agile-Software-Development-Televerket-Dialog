import { CommandAddSection } from "./CommandAddSection";
import Discord from "discord.js";
import { GlobalFunctions } from "./GlobalFunctions";
import { DatabaseFunctions } from "./DatabaseFunctions";
export class Nominator {
    private static timedOutUsers: Map<string, number> = new Map(); //this is a cache of users that are timed out in order to ease the load for hte database

    public async doIt(args: string[], message: Discord.Message): Promise<void> {
        let nominator = message.author;
        let nominatorTimeoutEnds = Nominator.timedOutUsers.get(nominator.id);

        if (nominatorTimeoutEnds) //sus, inga måsvingar?
            if (nominatorTimeoutEnds < Date.now()) { //if nominator in map  and if date and time now has not passed the next time they are allowed to vote 
                nominator.send("You have already nominated someone within 24h. Please try again at :" + new Date(nominatorTimeoutEnds).toString());
                return;
            }

        let value = await Nominator.getTimeout(nominator.id);
        switch (value) {
            case true: //todo: acutlaly call for nominatorthingys
                /*let insert = db.prepare(insertVote); //prepare the vote
                 let insertResult = insert.run(voter.id, votee, section); //insert it
                 insertResult.finalize(() => { voter.send('vote did actually not go through, check arguments') });
                 nominatorId.send('vote for ' + votee + ' went through.');*/
                break;
            case false:
                let timeout = Nominator.timedOutUsers.get(nominator.id)
                if (timeout)
                    nominator.send("You have already nominated someone within 24h. Please try again at :" + new Date(nominatorTimeoutEnds).toString());
                else
                    nominator.send('you are out of votes'); //should only run once per instance and user
                break;
        }

        let nominee = args[0];
        let section: string = "";
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " ");
        }
        section = section.slice(0, -1);
        if (message.author.id.toString() === nominee) return;
        if (!(args.shift() && args.shift())) {
            message.channel.send("!nominate [member] [section]");
            return;
        }
        if (this.nominate(nominee, section, message)) {
            DatabaseFunctions.getInstance().db.prepare(
                "INSERT INTO Nominations VALUES(?,?);"
            ).run(message.author.id, section);
            message.channel.send(
                "nomination has been registered, type !nominations [section] too see all nominations"
            );
        }
    }

    private static getTimeout(nominator: string): Promise<boolean> {
        let queryNominations = "SELECT COUNT(user) as users FROM Nominations WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND user == ?) GROUP BY user";
        return new Promise((resolve, reject) => {
            let nominationsByUser = 0;
            DatabaseFunctions.getInstance().db.get(queryNominations, nominator, (err, row) => {
                if (err) {
                    console.log(err + ' this should not be happening');
                    reject(err);// if we get an unknown error we return this
                }
                if (row) {
                    nominationsByUser = row.user;
                    console.log(nominationsByUser);
                    if (nominationsByUser >= 1) { //if user has nominated 1 time the last 24 hours
                        let queryAllNominations = "SELECT strftime('%s',MIN(stamp)) as earliest FROM Nominations WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY user;";
                        DatabaseFunctions.getInstance().db.get(queryAllNominations, nominator, (err, row) => {
                            if (err) { console.log(err + ' this is a simulation, wake up'); }
                            if (row) {//sql dates and javascript dates might not match up, please be aware
                                let nextElligableNomination = Date.now() + 1000 * (24 * 60 * 60 - (Date.now() / 1000 - row.earliest)); //calculates the time the next elligable vote is to take place
                                Nominator.timedOutUsers.set(nominator, nextElligableNomination); //caches that the user is timed out in order to save the db some load
                            }
                        });
                        resolve(false);
                    }
                }
                resolve(true);
            });
        });
    }

    nominate(user: string, section: string, message: Discord.Message): boolean {
        let returnValue = false;
        user = GlobalFunctions.toId(user);
        if (!CommandAddSection.sectionList.has(section)) {
            console.log("section does not exist"); //section has not been created or at least does not exist in sectionlist
            return false;
        }
        if (!message.guild.members.fetch(user)) {
            console.log("user not in server");
            return false;
        }
        Nominator.getIfUserInSection(section, user).then((res) => {
            if (!res) {
                return;
            } else {
                returnValue = true;
                DatabaseFunctions.getInstance().db.prepare("INSERT INTO Nominations (user,section) VALUES(?, ?)").run(user, section);
                return;
            }
        });
        return returnValue;
    }

    static displayCandidates(
        args: string[],
        message: Discord.Message
    ) {
        let arg = '';
        for (let i = 0; i < args.length; i++) {
            arg = arg.concat(args[i] + " ");
        } //display uses concatination for double word inputs. Still only expects one argument, either user or section
        arg = arg.slice(0, -1);
        //let guild = client.guilds.cache.get("823518625062977626"); //settings guildId
        if (CommandAddSection.sectionList.has(arg))
            this.displayCandidatesForSection(arg, message);
        else if (message.guild.member(arg)) {
            this.displaySectionsForCandidate(arg, message);
        } else
            message.reply(
                "please use correct input values, !nominations [section]/[userId]"
            );
    }

    private static displaySectionsForCandidate(
        user: string,
        message: Discord.Message
    ): void {
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
        let embed: Discord.MessageEmbed;
        let i = 1;
        embed = new Discord.MessageEmbed();
        DatabaseFunctions.getInstance().db.all(query, searchWord, (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row)
                row.forEach((element) => {
                    if (i++ % 100 == 0) {
                        embed
                            .setAuthor("sections " + searchWord + " is nominated for")
                            .setColor("#ff0000");
                        message.channel.send(embed);
                        embed = new Discord.MessageEmbed();
                    }
                    embed.addField(element, "placeholder", false);
                });
            embed
                .setAuthor("sections " + searchWord + " is nominated for")
                .setColor("#ff0000");
            message.channel.send(embed);
        }
        );
    }

    static getIfUserInSection(section: string, user: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM Nominations WHERE user=? AND section=?";
            DatabaseFunctions.getInstance().db.get(query, user, section, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                row ? resolve(false) : resolve(true);
            });
        });
    }
}


