import { DatabaseFunctions } from "./DatabaseFunctions";
import Discord from "discord.js";

export class Voter {
    static timedOutUsers: Map<string, number> = new Map(); //this is a cache of users that are timed out in order to ease the load for hte database

    static vote(message: Discord.Message, args: string[]): void {
        let voter = message.author;
        let votee = args[0];
        let section: string = "";
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " "); //turns section into a string
        }
        section = section.slice(0, -1);
        message.delete(); //removes the message before the queries in order to delete it as fast as possible
        switch (Voter.privateVote(voter.id, votee, section)) {
            case result.passed: voter.send('vote for ' + votee + ' went through.'); break;
            case result.outOfVotes:
                let timeout = Voter.timedOutUsers.get(voter.id)
                if (timeout)
                    voter.send('you are out of votes, please try again ' + new Date(timeout).toString());
                else
                    voter.send('you are out of votes'); //should only run once per instance and user
                break;
            case result.notNominated: voter.send(votee + ' is not nominated for ' + section); break;
            case result.sectionDoesNotExist: voter.send('invalid section, please try again'); break;
            case result.userDoesNotExist: voter.send(votee + ' does not exist in this server'); break;
            case result.unknown: voter.send('unknown error while processing vote, vote has not been counted'); break;
        }

    }
    private static privateVote(voter: string, votee: string, section: string): result {
        let timeout = Voter.timedOutUsers.get(voter);
        if (timeout)    //if user is timed out in the cache
            if (timeout > Date.now())
                return result.outOfVotes;
        let db = DatabaseFunctions.getInstance().db;
        let queryVotes = "SELECT COUNT(votes) FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter";
        let querySection = "SELECT * FROM Section WHERE section = ?";
        let queryUser = "SELECT * FROM Users WHERE user = ?";
        let queryNomination = "Select * FROM Nominations WHERE user = ? AND section = ?";
        let insertVote = "INSERT INTO Votes(stamp, voter, votee, section) VALUES (CURRENT_TIMESTAMP, [DATANAME:1], [DATANAME:2], [DATANAME:3]);";
        let votesByVoter: number;
        db.get(querySection, section, (err, row) => {
            if (!row) return result.sectionDoesNotExist;
        });
        db.get(queryUser, votee, (err, row) => {
            if (!row) return result.userDoesNotExist;
        });
        db.get(queryNomination, votee, section, (err, row) => {
            if (!row) return result.notNominated;
        });
        db.get(queryVotes, voter, (err, row) => {
            if (err) {
                console.log(err);
                return result.unknown;// if we get an unknown error we return this
            }
            if (row) {
                votesByVoter = row.votes;
                if (votesByVoter >= 3) { //if user has voted more than 3 times the last 24 hours
                    let queryAllVotes = "SELECT strftime('%s',MIN(stamp)) as earliest FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter;";
                    db.get(queryAllVotes, voter, (err, row) => {
                        if (err) { console.log(err); }
                        if (row) {//sql dates and javascript dates might not match up, please be aware
                            let nextElligableVote = Date.now() + 1000 * (24 * 60 * 60 - (Date.now() / 1000 - row.earliest)); //calculates the time the next elligable vote is to take place
                            Voter.timedOutUsers.set(voter, nextElligableVote); //caches that the user is timed out in order to save the db some load
                        }
                    });
                    return result.outOfVotes;
                }
            }
        });
        let insert = db.prepare(insertVote); //prepare the vote
        insert.run(voter, votee, section); //insert it
        //if this can return an error we would want to handle it. But we don't know how yet
        return result.passed; //return that everything worked
    }
}

enum result {
    passed = 1,
    outOfVotes = 2,
    notNominated = 3,
    sectionDoesNotExist = 4,
    userDoesNotExist = 5,
    unknown = 6
}