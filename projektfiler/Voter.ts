import { DatabaseFunctions } from "./DatabaseFunctions";
import Discord from "discord.js";
import { Database } from "sqlite3";

export class Voter {
    static timedOutUsers: Map<string, number> = new Map(); //this is a cache of users that are timed out in order to ease the load for hte database

    static async vote(message: Discord.Message, args: string[]): Promise<void> {
        let voter = message.author;
        let votee = args[0];
        let section: string = "";
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " "); //turns section into a string
        }
        section = section.slice(0, -1);
        message.delete(); //removes the message before the queries in order to delete it as fast as possible
        if (votee == voter.id) {
            voter.send("you can't vote for yourself");
            return;
        }
        let db = DatabaseFunctions.getInstance().db;
        let queryVotes = "SELECT COUNT(voter) as votes FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter";
        let insertVote = "INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, ?, ?, ?);";
        let timeout = Voter.timedOutUsers.get(voter.id);
        if (timeout)    //if user is timed out in the cache
            if (timeout > Date.now()) {
                voter.send('you are out of votes, please try again ' + new Date(timeout).toString());
                return;
            }
        let value = await Voter.queryDB(voter.id, db, queryVotes)
        switch (value) {
            case result.passed:
                let insert = db.prepare(insertVote); //prepare the vote
                let insertResult = insert.run(voter.id, votee, section); //insert it
                insertResult.finalize((err) => { voter.send('vote did actually not go through, check arguments') });
                voter.send('vote for ' + votee + ' went through.');
                break;
            case result.outOfVotes:
                let timeout = Voter.timedOutUsers.get(voter.id)
                if (timeout)
                    voter.send('you are out of votes, please try again ' + new Date(timeout).toString());
                else
                    voter.send('you are out of votes'); //should only run once per instance and user
                break;
        }
    }

    private static queryDB(voter: string, db: Database, queryVotes: string): Promise<result> {
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
                        resolve(result.outOfVotes);
                    }
                }
                resolve(result.passed);
            });
        });
    }
}

enum result {
    passed = 1,
    outOfVotes = 2
}