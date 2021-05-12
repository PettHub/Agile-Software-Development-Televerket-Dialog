import { DatabaseFunctions } from "./DatabaseFunctions";
import { GlobalFunctions } from "./GlobalFunctions";
import Discord from "discord.js";
import { Database } from "sqlite3";



export class Voter {
    static timedOutUsers: Map<string, number> = new Map(); //this is a cache of users that are timed out in order to ease the load for the database
    static usernameIndex: Map<string, string> = new Map();

    static async vote(message: Discord.Message, args: string[]): Promise<void> {
        let voter = message.author;
        let votee = GlobalFunctions.toId(args[0]);
        let section: string = "";
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " "); //turns section into a string
        }
        section = section.slice(0, -1);
        message.delete(); //removes the message before the queries in order to delete it as fast as possible
        if (votee == voter.id) {
            voter.send("You can't vote for yourself");
            return;
        }
        let db = DatabaseFunctions.getInstance();
        let queryVotes = "SELECT COUNT(voter) as votes FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter"; //amount of votes from a person the last 24 hours
        let insertVote = "INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, ?, ?, ?);";
        let timeout = Voter.timedOutUsers.get(voter.id);
        if (timeout)    //if user is timed out in the cache
            if (timeout > Date.now()) {
                voter.send('You are out of votes, please try again ' + new Date(timeout).toString()); //does not work correctly if you manually delete votes from the database since it still remembers the old timestamp, should not be a problem in production.
                return;
            }
            else {
                Voter.timedOutUsers.delete(voter.id); //clean up the ram
            }
        let value = await Voter.queryDB(voter.id, db, queryVotes);
        switch (value[0]) {
            case result.passed:
                db.prepare(insertVote).run(voter.id, votee, section, (err: any, res: any) => {
                    if (err) {
                        voter.send('Vote did not get through, please try again and check your arguments :)');
                    }
                    else
                        voter.send('Vote went through. You have ' + (2 - value[1]) + ' votes remaining');
                }); //insert it
                break;
            case result.outOfVotes:
                let timeout = Voter.timedOutUsers.get(voter.id);
                if (timeout)
                    voter.send('You are out of votes, please try again ' + new Date(timeout).toString());
                else
                    voter.send('You are out of votes'); //should only run once per instance and user
                break;
        }
    }

    private static queryDB(voter: string, db: Database, queryVotes: string): Promise<[result: number, votes: number]> {
        return new Promise((resolve, reject) => {
            let votesByVoter = 0;
            db.get(queryVotes, voter, (err, row) => {
                if (err) {
                    console.log(err + ' this should not be happening');
                    reject(err);// if we get an unknown error we return this
                }
                if (row) {
                    votesByVoter = row.votes;
                    console.log(votesByVoter);
                    if (votesByVoter >= 3) { //if user has voted more than 3 times the last 24 hours
                        let queryAllVotes = "SELECT strftime('%s',MIN(stamp)) as earliest FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter;";
                        db.get(queryAllVotes, voter, (err, row) => {
                            if (err) { console.log(err + ' this is a simulation, wake up'); }
                            if (row) {//sql dates and javascript dates might not match up, please be aware
                                let nextElligableVote = Date.now() + 1000 * (24 * 60 * 60 - (Date.now() / 1000 - row.earliest)); //calculates the time the next elligable vote is to take place
                                Voter.timedOutUsers.set(voter, nextElligableVote); //caches that the user is timed out in order to save the db some load
                            }
                        });
                        resolve([result.outOfVotes, votesByVoter]);//out of votes
                    }
                }
                resolve([result.passed, votesByVoter]);//passed
            });
        });
    }

    public static async tallyVotes(message: Discord.Message, args?: string[]): Promise<void> {

        let query: string;
        let section: string = "";
        for (let i = 0; i < args.length; i++) {
            section = section.concat(args[i] + " "); //turns section into a string
        }
        section = section.slice(0, -1);
        console.log(section.length + " " + section);
        if (section.length == 0)
            query = "SELECT section, votee, COUNT(votee) as votes FROM Votes GROUP BY section, votee;";
        else
            query = "SELECT section, votee, COUNT(votee) as votes FROM Votes WHERE section = ? GROUP BY section, votee;";
        let db = DatabaseFunctions.getInstance();
        let embed = new Discord.MessageEmbed();
        let runnable = db.prepare(query);
        let handler = async (err, res) => {
            if (err)
                console.log(err);
            if (!res) return;
            let result = await this.sortQuery(res);
            let iterator = result.entries();
            let next = iterator.next();
            while (!next.done) {
                let section = next.value[0];
                let values = next.value[1];
                embed.addField(section, values.length + " nominees", false);
                /*
                await values.forEach(row => {
                    GlobalFunctions.idToUsername(message, row.votee).then(user => {
                        embed.addField(row.section, "Username: " + user.username + " Votes: " + row.votes, true);
                    });
                });
                */
                values.forEach(row => {
                    embed.addField(row.section, "Used ID: " + row.votee + " Votes: " + row.votes, true);
                });
                next = iterator.next();
            }
            message.author.send(embed);
            /*
            result.forEach(next => {
                //embed.addField(next[0].section, next.length + " nominees", false);
                console.log(next.length);
                next.forEach(row => {
                    GlobalFunctions.idToUsername(message, row.votee).then(user => {
                        embed.addField(row.section, "Username: " + user.username + " Votes: " + row.votes, true);
                    });
                });
            });*/
            message.author.send(embed);
        };
        if (section.length > 0)
            runnable.all(section, handler);
        else
            runnable.all(handler);
    }

    private static async sortQuery(queryResult: { section: string, votee: string, votes: number }[]): Promise<Map<string, { section: string, votee: string, votes: number }[]>> {
        return new Promise((resolve, reject) => {
            let sections: Map<string, { section: string, votee: string, votes: number }[]>;
            sections = new Map();
            queryResult.forEach(row => {
                if (!sections.has(row.section)) //if row is of new section
                    sections.set(row.section, []); //create new
                sections.get(row.section).push(row); //add row to set of other rows where section is the same
            });
            let iterator = sections.keys(); //with sorted map of arrays of rows
            let key = iterator.next();
            while (!key.done) {
                sections.set(key.value, this.sectionSort(sections.get(key.value))); //use section sort to trim it down to the highest 5 voted in each section
                key = iterator.next();
            }
            resolve(sections); //return a Map of every section linked to the top 5 votee for each section
        });
    }

    private static sectionSort(section: { section: string, votee: string, votes: number }[]): { section: string, votee: string, votes: number }[] {// take arry of rows sort by votes and give five highest 
        section.sort((a, b) => a[2] > b[2] ? -1 : 1);
        let result = section.slice(0, 5);
        return result;
    }

}

enum result {
    passed = 1,
    outOfVotes = 2
}