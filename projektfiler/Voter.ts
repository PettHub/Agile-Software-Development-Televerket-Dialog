import { DatabaseFunctions } from "./DatabaseFunctions";
import { GlobalFunctions } from "./GlobalFunctions";
import Discord from "discord.js";
import { Database } from "sqlite3";

export class Voter {
    public static showVotes(message: Discord.Message, args: any[]) {
        if (!args[0]) {
            message.channel.send(
                "please use correct input values, !viewVotes [userId]"
            );
            return;
        }
        let votee = GlobalFunctions.toId(args[0]);
        let query =
            "SELECT section, COUNT(votee) as votes FROM Votes WHERE votee = ? GROUP BY section";
        DatabaseFunctions.getInstance().all(query, votee, async (err, row) => {
            if (err) {
                console.log(err);
                message.channel.send("An error has occured");
                return;
            }
            if (!(row === undefined)) {
                let embed = new Discord.MessageEmbed();
                embed
                    .setAuthor(
                        "votes for " +
                        (await (
                            await message.guild.members.fetch(votee)
                        ).nickname)
                    )
                    .setColor("#ff0000");
                row?.forEach((element) => {
                    embed.addField(element.section, element.votes, false);
                });
                message.channel.send(embed);
            }
        });
    }

    static timedOutUsers: Map<string, number> = new Map(); //this is a cache of users that are timed out in order to ease the load for the database

    static async vote(
        message: Discord.Message,
        args: string[],
        dm?: boolean
    ): Promise<void> {
        if (!args[0]) {
            message.channel.send(
                "please use correct input values, !vote [userId] [section]"
            );
            return;
        }
        let voter = message.author;
        let votee = GlobalFunctions.toId(args[0]);
        let section: string = "";
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " "); //turns section into a string
        }
        section = section.slice(0, -1);
        if (!dm) message.delete(); //removes the message before the queries in order to delete it as fast as possible
        if (votee == voter.id) {
            voter.send("You can't vote for yourself");
            return;
        }
        let db = DatabaseFunctions.getInstance();
        let queryVotes =
            "SELECT COUNT(voter) as votes FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter"; //amount of votes from a person the last 24 hours
        let insertVote =
            "INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, ?, ?, ?);";
        let timeout = Voter.timedOutUsers.get(voter.id);
        if (timeout)
            if (timeout > Date.now()) {
                //if user is timed out in the cache
                voter.send(
                    "You are out of votes, please try again " +
                    new Date(timeout).toString()
                ); //does not work correctly if you manually delete votes from the database since it still remembers the old timestamp, should not be a problem in production.
                return;
            } else {
                Voter.timedOutUsers.delete(voter.id); //clean up the ram by removing unnessescary entries in the map
            }
        let value = await Voter.queryDB(voter.id, db, queryVotes); // get number of votes the last 24 hours
        switch (value[0]) {
            case result.passed:
                db.prepare(insertVote).run(
                    voter.id,
                    votee,
                    section,
                    (err: any, res: any) => {
                        if (err) {
                            voter.send(
                                "Vote did not get through, please try again and check your arguments :)"
                            );
                        } else
                            voter.send(
                                "Vote went through. You have " +
                                (2 - value[1]) +
                                " votes remaining"
                            );
                    }
                ); //insert it
                break;
            case result.outOfVotes:
                let timeout = Voter.timedOutUsers.get(voter.id);
                if (timeout)
                    voter.send(
                        "You are out of votes, please try again " +
                        new Date(timeout).toString()
                    );
                else voter.send("You are out of votes"); //should only run once per instance and user due to async problems since timeout is added in a async function
                break;
        }
    }

    public static queryDB(
        voter: string,
        db: Database,
        queryVotes: string
    ): Promise<[result: number, votes: number]> {
        return new Promise((resolve, reject) => {
            let votesByVoter = 0;
            db.get(queryVotes, voter, (err, row) => {
                if (err) {
                    console.log(err + " this should not be happening");
                    reject(err); // if we get an unknown error we return this
                }
                if (row) {
                    votesByVoter = row.votes;
                    //console.log(votesByVoter);
                    if (votesByVoter >= 3) {
                        //if user has voted more than 3 times the last 24 hours
                        let queryAllVotes =
                            "SELECT strftime('%s',MIN(stamp)) as earliest FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter;";
                        db.get(queryAllVotes, voter, (err, row) => {
                            if (err) {
                                console.log(
                                    err + " this is a simulation, wake up"
                                );
                            }
                            if (row) {
                                //sql dates and javascript dates might not match up, please be aware
                                let nextElligableVote =
                                    Date.now() +
                                    1000 *
                                    (24 * 60 * 60 -
                                        (Date.now() / 1000 - row.earliest)); //calculates the time the next elligable vote is to take place
                                Voter.timedOutUsers.set(
                                    voter,
                                    nextElligableVote
                                ); //caches that the user is timed out in order to save the db some load
                            }
                        });
                        resolve([result.outOfVotes, votesByVoter]); //out of votes
                    }
                }
                resolve([result.passed, votesByVoter]); //passed
            });
        });
    }

    public static async tallyVotes(
        client: Discord.Client,
        message: Discord.Message,
        args?: string[]
    ): Promise<void> {
        return new Promise((resolve) => {
            if (GlobalFunctions.messageIsDirectMessage(message)) {
                message.author.send(
                    "this command can not be sent through direct messages. Please type in a channel"
                );
                resolve();
                return;
            }
            let query: string;
            let section: string = "";
            for (let i = 0; i < args.length; i++) {
                section = section.concat(args[i] + " "); //turns section into a string
            }
            section = section.slice(0, -1);
            if (section.length == 0)
                query =
                    "SELECT section, votee, COUNT(votee) as votes FROM Votes GROUP BY section, votee;";
            else
                query =
                    "SELECT section, votee, COUNT(votee) as votes FROM Votes WHERE section = ? GROUP BY section, votee;";
            let db = DatabaseFunctions.getInstance();
            let runnable = db.prepare(query);
            let handler = async (err, res) => {
                if (err) console.log(err);
                if (!res) return;
                this.sortQuery(res).then((result) => { //after the query is sorted for each section
                    let iterator = result.entries();
                    let next = iterator.next();
                    while (!next.done) {
                        this.addSectionToEmbed(client, next.value, message); //create new embed for each section
                        next = iterator.next();
                    }
                });
            };
            if (section.length > 0) runnable.all(section, handler);  //if section is specified in the command
            else runnable.all(handler); //for all sections
            resolve();
        });
    }

    // private static async delay(ms: number) {
    //     return new Promise((resolve) => setTimeout(resolve, ms));
    // }

    private static async addSectionToEmbed(
        client: Discord.Client,
        value: [
            section: string,
            rows: { section: string; votee: string; votes: number }[]
        ], //this is the format from the query
        message: Discord.Message
    ): Promise<void> {
        return new Promise((resolve) => {
            let embed = new Discord.MessageEmbed()
                .setTitle(value[0])
                .setColor("#00EF00"); //Created an embed with the title of the section as well as the color green
            this.addAllSubToEmbed(client, value[1], embed).then(() => {
                // this.delay(2000).then(() => {
                message.channel.send(embed);
                // });
            }); //delay amount is dependant on hardware and has to be hardcoded
            resolve(); //since the amount of nominees per section is maxed out at 5 we have an upper bound for time at least
        });
    }

    private static async addAllSubToEmbed(
        client: Discord.Client,
        rows: { section: string; votee: string; votes: number }[],
        embed: Discord.MessageEmbed
    ): Promise<void> {
        return new Promise(async (resolve) => {
            for (const row of rows) {
                await GlobalFunctions.idToUsernameClient(
                    client,
                    row.votee
                ).then((user) => {
                    //get username from id
                    embed.addField(user.username, "Votes: " + row.votes, true); //add name and votes in row
                });
            }
            resolve();
        });
    }

    private static async sortQuery(
        queryResult: { section: string; votee: string; votes: number }[]
    ): Promise<
        Map<string, { section: string; votee: string; votes: number }[]>
    > {
        return new Promise((resolve, reject) => {
            let sections: Map<
                string,
                { section: string; votee: string; votes: number }[]
            >;
            sections = new Map();
            queryResult.forEach((row) => {
                if (!sections.has(row.section))
                    //if row is of new section
                    sections.set(row.section, []); //create new
                sections.get(row.section).push(row); //add row to set of other rows where section is the same
            });
            let iterator = sections.keys(); //with sorted map of arrays of rows
            let key = iterator.next();
            while (!key.done) {
                sections.set(
                    key.value,
                    this.sectionSort(sections.get(key.value))
                ); //use section sort to trim it down to the highest 5 voted in each section
                key = iterator.next();
            }
            resolve(sections); //return a Map of every section linked to the top 5 votee for each section
        });
    }

    private static sectionSort(
        section: { section: string; votee: string; votes: number }[]
    ): { section: string; votee: string; votes: number }[] {
        // take arry of rows sort by votes and give five highest
        section.sort((a, b) => (a[2] > b[2] ? -1 : 1));
        let result = section.slice(0, 5);
        return result;
    }
}

enum result {
    passed = 1,
    outOfVotes = 2,
}
