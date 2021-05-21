import Discord from "discord.js";
import { Voter2 } from "./Voter2";

export class VoteHandeler {
    private users: Map<String, { date: Date; vote: Voter2 }>;
    private static votehandler: VoteHandeler;

    private constructor() {
        this.users = new Map();
    }

    public static getinstance() {
        if (!this.votehandler) {
            this.votehandler = new VoteHandeler();
        }
        return this.votehandler;
    }

    public doIt(message: Discord.Message, args: any[], client: Discord.Client): void {
        if (!args[0]) {
            message.channel.send("Usage !vote [section]"); //if vote is called without section
            return;
        }
        if (this.users.get(message.author.id)) {
            if (
                Date.now() - this.users.get(message.author.id).date.getTime() > //if you haven't called this in the last 30 seconds
                1000 * 30
            ) {
                this.users
                    .get(message.author.id)
                    .vote.restart(message, args, client);
                this.users.get(message.author.id).date = new Date(Date.now()); //restart and update timestamp
            } else {
                message.channel.send(
                    `you need to wait ${30 -
                    (Date.now() -
                        this.users.get(message.author.id).date.getTime()) /
                    1000
                    } seconds to use this command again`
                ); //wait remaining seconds of the 30 you have on you to vote
            }
        } else {
            this.users.set(message.author.id, {
                date: new Date(Date.now()),
                vote: new Voter2(),
            });
            this.users.get(message.author.id).vote.doIt(message, args, client);
        }
    }

    static remove(id: string) {
        this.votehandler.users.delete(id);
    }
}
