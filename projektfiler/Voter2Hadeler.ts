import Discord from "discord.js";
import { Voter2 } from "./Voter2";

export class VoteHandeler {
    users: Map<String, { date: Date; vote: Voter2 }>;
    static votehandler;

    private constructor() {
        this.users = new Map();
    }

    static getinstance() {
        if (!this.votehandler) {
            this.votehandler = new VoteHandeler();
        }
        return this.votehandler;
    }

    public doIt(message: Discord.Message, args, client): void {
        if (!args[0]) {
            message.channel.send("Usage !vote [section]");
            return;
        }
        if (this.users.get(message.author.id)) {
            if (
                Date.now() - this.users.get(message.author.id).date.getTime() >
                1000 * 30
            ) {
                this.users
                    .get(message.author.id)
                    .vote.restart(message, args, client);
                this.users.get(message.author.id).date = new Date(Date.now());
            } else {
                message.channel.send(
                    `you need to wait ${
                        30 -
                        (Date.now() -
                            this.users.get(message.author.id).date.getTime()) /
                            1000
                    } secounds to use this command again`
                );
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
