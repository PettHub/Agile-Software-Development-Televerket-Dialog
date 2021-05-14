import Discord from "discord.js";
import { Voter } from "./Voter";
import { DatabaseFunctions } from "./DatabaseFunctions";
import { VoteHandeler } from "./Voter2Hadeler";

export class Voter2 {
    counter: number = 0;
    pagesize: number = 3;
    user: string;
    listener: {
        (message2: Discord.Message): Promise<void>;
        (args_0: Discord.Message): void;
        (...args: any[]): void;
        (...args: any[]): void;
    };
    timeout: NodeJS.Timeout;

    doIt(message: Discord.Message, args: any[], client: Discord.Client): void {
        this.user = message.author.id;
        let query = "SELECT * FROM Nominations WHERE section=?";
        DatabaseFunctions.getInstance().all(
            query,
            args[0],
            async (err, rows) => {
                if (err) {
                    console.log(err);
                    message.channel.send("An error has occoured");
                }
                if (rows.length === 0 || rows === undefined) {
                    message.channel.send(
                        "You can only vote for sections that have nominated members and exists"
                    );
                } else {
                    let votes = await Voter.queryDB(
                        message.author.id,
                        DatabaseFunctions.getInstance(),
                        "SELECT COUNT(voter) as votes FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter"
                    );
                    if (votes[1] === 3) {
                        message.author.send("you are out of votes");
                        return;
                    }
                    let voter = new Discord.MessageEmbed();
                    voter
                        .setTitle(`You have ${3 - votes[1]} vote to spend`)
                        .setDescription(
                            `To vote for an user simply reply with the number listed before their name \n Replying with "cancel" will cancel the vote \n Replying with "next" will show the next page`
                        );
                    message.author.send(voter);
                    this.embedder(rows, message, args[0], votes[1]).then(
                        (embed) => {
                            message.author.send(embed);
                        }
                    );
                    let confirm = false;
                    let vote: number;

                    this.listener = async (message2: Discord.Message) => {
                        if (
                            message2.author == message.author &&
                            message2.guild === null
                        ) {
                            switch (message2.content) {
                                case "next":
                                    this.embedder(
                                        rows,
                                        message,
                                        args[0],
                                        votes[1]
                                    ).then((embed) => {
                                        message.author.send(embed);
                                    });
                                    break;
                                case "prev":
                                    this.counter =
                                        this.counter - 2 * this.pagesize;
                                    this.embedder(
                                        rows,
                                        message,
                                        args[0],
                                        votes[1]
                                    ).then((embed) => {
                                        message.author.send(embed);
                                    });
                                    break;
                                case "cancel":
                                    message.author.send(
                                        "the vote has been cancelled"
                                    );
                                    this.terminate(client);
                                    break;
                                case "yes":
                                    if (confirm) {
                                        Voter.vote(message, [
                                            `${rows[vote].user}`,
                                            `${args[0]}`,
                                        ]);
                                        this.terminate(client);
                                    } else {
                                        message.author.send(
                                            "You need to choose a nomenee before you can confirm"
                                        );
                                    }
                                    break;
                                case "no":
                                    if (confirm) {
                                        message.author.send(
                                            `Yor vote for ${
                                                vote + 1
                                            }: ${await message.guild.members.fetch(
                                                rows[vote].user
                                            )} is cancelled`
                                        );
                                        confirm = false;
                                        vote = NaN;
                                    } else {
                                        message.author.send(
                                            "There is no vote to cancel"
                                        );
                                    }
                                    break;
                                default:
                                    vote = Number(message2.content) - 1;
                                    if (
                                        !rows[vote] ||
                                        vote < 0 ||
                                        vote > rows.length
                                    ) {
                                        message.author.send(
                                            "this is not a valid command"
                                        );
                                    } else {
                                        confirm = true;
                                        message.author.send(
                                            `You are about to vote for ${
                                                vote + 1
                                            }: ${await message.guild.members.fetch(
                                                rows[vote].user
                                            )} \n Type "yes" to confirm or "no" to cancel the vote`
                                        );
                                    }
                                    break;
                            }
                        }
                    };
                    this.timeout = setTimeout(() => {
                        message.author.send("timed out");
                        this.terminate(client);
                    }, 1000 * 60 * 5);
                    client.on("message", this.listener);
                }
            }
        );
    }

    private async embedder(
        rows: any[],
        message: Discord.Message,
        section: string,
        votes: number
    ): Promise<Discord.MessageEmbed> {
        this.counter = this.counter % rows.length;
        let embed = new Discord.MessageEmbed();
        let pages = Math.ceil(rows.length / this.pagesize);
        embed
            .setTitle("Members nominated for: " + section)
            .setDescription(
                `you have ${3 - votes} votes left, page ${
                    pages - (pages - this.counter / this.pagesize) + 1
                } of ${pages}`
            );
        for (const element of rows.slice(this.counter, rows.length)) {
            this.counter++;
            let user = await message.guild.members.fetch(element.user);
            embed.addField(
                `${this.counter} ${user.user.tag}`,
                `nickname: ${user.displayName}`,
                true
            );

            if (this.counter % this.pagesize === 0) break;
        }
        embed.setFooter(
            `avaliable commands: "next", "cancel", any number between: 1 through ${rows.length}`
        );
        return embed;
    }

    terminate(client: Discord.Client) {
        clearTimeout(this.timeout);
        client.removeListener("message", this.listener);
        VoteHandeler.remove(this.user);
    }

    restart(message: Discord.Message, args: any[], client: Discord.Client) {
        clearTimeout(this.timeout);
        client.removeListener("message", this.listener);
        this.counter = 0;
        this.doIt(message, args, client);
    }
}
