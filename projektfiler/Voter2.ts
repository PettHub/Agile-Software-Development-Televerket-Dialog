import Discord from "discord.js";
import { Voter } from "./Voter";
import { DatabaseFunctions } from "./DatabaseFunctions";
import { VoteHandeler } from "./Voter2Hadeler";

export class Voter2 {
    counter: number = 0;
    pagesize: number = 21;
    user: string;
    listener: {
        (message2: Discord.Message): Promise<void>;
        (args_0: Discord.Message): void;
        (...args: any[]): void;
        (...args: any[]): void;
    };
    timeout: NodeJS.Timeout;

    doIt(
        message: Discord.Message,
        args: any[],
        client: Discord.Client,
        restart?: boolean
    ): void {
        this.user = message.author.id; //saves who started this session
        let query = "SELECT * FROM Nominations WHERE section=?";
        DatabaseFunctions.getInstance().all(
            query,
            args[0],
            async (err, rows) => {
                if (err) {
                    //catches any errors the database might throw
                    console.log(err);
                    message.reply("An error has occoured");
                    this.terminate();
                }
                if (rows.length === 0 || rows === undefined) {
                    //check if there are any nomenees for the section
                    message.reply(
                        "You can only vote for sections that have nominated members and exists"
                    );
                    this.terminate();
                } else if (rows.length === 1) {
                    //checks so that there are at least 2 nomenees
                    message.reply(
                        "There must at least be at least 2 nomenees for the section to vote"
                    );
                    this.terminate();
                } else {
                    let votes = await Voter.queryDB(
                        //gets how many votes the user have left to spend
                        message.author.id,
                        DatabaseFunctions.getInstance(),
                        "SELECT COUNT(voter) as votes FROM Votes WHERE (strftime('%s','now')-strftime('%s',stamp) < 60*60*24 AND voter == ?) GROUP BY voter"
                    );
                    if (!restart)
                        message.reply(
                            //checks if the session was restarted and tells the user to check their dms to start a new session
                            "Please check your dms to start voting!"
                        );
                    if (votes[1] === 3) {
                        //checks if the user is out of votes
                        message.author
                            .send(
                                `you are out of votes ${
                                    Voter.timedOutUsers.get(message.author.id)
                                        ? "you can vote again in " +
                                          new Date(
                                              Voter.timedOutUsers.get(
                                                  message.author.id
                                              )
                                          ).toString()
                                        : ""
                                }`
                            ) //tells the user that they are out of votes and when they can vote again
                            .catch((e) => {
                                //catches any errors that the bot can throw in case it has been blocked by the user
                                message.reply(
                                    "Looks like I am unable to dm you"
                                );
                            });
                        this.terminate(); //terminates the session if the user was out of votes
                        return;
                    }
                    let voter = new Discord.MessageEmbed();
                    voter
                        .setTitle(`You have ${3 - votes[1]} vote to spend`)
                        .setColor("#6691BA")
                        .setDescription(
                            `To vote for an user simply reply with the number listed before their name`
                        )
                        .addField(
                            "next",
                            "reply with next to see the next page"
                        )
                        .addField(
                            "cancel",
                            "reply with cancel to cancel the voting session"
                        ); //prepairs an embed
                    let blocked: boolean = false;
                    await message.author
                        .send("Fetching information... please wait")
                        .catch((e) => {
                            message.reply(
                                //catches an error if the bot is blocked
                                "Looks like I am unable to dm you"
                            );
                            blocked = true;
                        });
                    await this.embedder(rows, message, args[0], votes[1]).then(
                        //creates an embed listing all the nomenees
                        async (embed) => {
                            message.author.send(voter);
                            //if the bot is blocked, stop
                            message.author.send(embed);
                        }
                    );
                    if (blocked) {
                        this.terminate(); //terminate the session since the bot is blocked
                        return;
                    }
                    let confirm = false;
                    let vote: number = undefined;
                    let id: string = undefined;

                    this.listener = async (message2: Discord.Message) => {
                        //new listener that will listen for commands during the voting session
                        if (
                            message2.author == message.author &&
                            message2.guild === null //makes sure that the bot is talking to the session host and in dms
                        ) {
                            switch (message2.content.toLowerCase()) {
                                case "next": //displayes the next page for the voter
                                    this.embedder(
                                        rows,
                                        message,
                                        args[0],
                                        votes[1]
                                    ).then((embed) => {
                                        message.author.send(embed);
                                    });
                                    break;
                                // case "prev": //unimplemented
                                //     this.counter =
                                //         this.counter - 2 * this.pagesize;
                                //     this.embedder(
                                //         rows,
                                //         message,
                                //         args[0],
                                //         votes[1]
                                //     ).then((embed) => {
                                //         message.author.send(embed);
                                //     });
                                //     break;
                                case "cancel": //cancels the voting session if
                                    message.author.send(
                                        "the vote has been cancelled"
                                    );
                                    this.terminate(client); //terminates the session since it was cencelled
                                    break;
                                case "yes": //confirms that the voter wants to vote for the user
                                    if (confirm) {
                                        //makes sure the voter is allowed to confirm yet
                                        await Voter.vote(
                                            message,
                                            [
                                                `${
                                                    vote !== undefined
                                                        ? rows[vote].user
                                                        : id
                                                }`,
                                                `${args[0]}`,
                                            ],
                                            true
                                        ); //sends the vote to the voting system that then registers the vote
                                        this.restart(
                                            message,
                                            args,
                                            client,
                                            true
                                        ); //restarts the session so the voter can vote again
                                    } else {
                                        message.author.send(
                                            "You need to choose a nominee before you can confirm"
                                        ); //tells the voter that they need to choose someone to vote for
                                    }
                                    break;
                                case "no":
                                    if (confirm) {
                                        //if the voter is about to vote this will cancel the vote
                                        message.author.send(
                                            `Yor vote for ${
                                                vote + 1
                                            }: ${await message.guild.members
                                                .fetch(rows[vote].user)
                                                .catch((e) => {
                                                    console.log(e);
                                                    return rows[vote].user;
                                                })} is cancelled`
                                        );
                                        confirm = false;
                                        vote = undefined;
                                        id = undefined;
                                    } else {
                                        message.author.send(
                                            "There is no vote to cancel"
                                        ); //tells the user that they cant cancel a vote right now
                                    }
                                    break;
                                default:
                                    if (
                                        rows.find(
                                            (element) =>
                                                element.user ===
                                                message2.content
                                        ) // checks if the command is an user id
                                    ) {
                                        confirm = true;
                                        message.author.send(
                                            `You are about to vote for ${await message.guild.members
                                                .fetch(message2.content)
                                                .catch((e) => {
                                                    console.log(e);
                                                    return rows[vote].user;
                                                })} \nType "yes" to confirm or "no" to cancel the vote`
                                        ); //tells the voter who they are about to vvote for and how to confirm the vote
                                        id = message2.content;
                                        break;
                                    }
                                    if (!confirm) {
                                        vote = Number(message2.content) - 1;
                                    }
                                    if (!rows[vote]) {
                                        //checks so the command is valid
                                        message2.author.send(
                                            "this is not a valid command"
                                        );
                                    } else {
                                        confirm = true; //makes it possible to respond yes
                                        message.author.send(
                                            `You are about to vote for ${
                                                vote + 1
                                            }: ${await message.guild.members
                                                .fetch(rows[vote].user)
                                                .catch((e) => {
                                                    console.log(e);
                                                    return rows[vote].user;
                                                })} \nType "yes" to confirm or "no" to cancel the vote`
                                        ); //tells the voter who they are about to vote for and how to confirm the vote
                                    }
                                    break;
                            }
                        }
                    };
                    this.timeout = setTimeout(() => {
                        //sets a timeout for the listener
                        message.author.send("timed out");
                        this.terminate(client);
                    }, 1000 * 60 * 5);
                    client.on("message", this.listener); //starts the listener
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
        //prepairs an embed with some nomenees listed
        this.counter = this.counter % rows.length; //makes sure the counter doesnt get higher than the lenght
        let embed = new Discord.MessageEmbed();
        let pages = Math.ceil(rows.length / this.pagesize); //calculates wich page is being showed
        embed
            .setTitle("Members nominated for: " + section)
            .setDescription(
                `you have ${3 - votes} votes left, page ${
                    pages - (pages - this.counter / this.pagesize) + 1
                } of ${pages}`
            )
            .setColor("#6691BA");
        loop: for (const element of rows.slice(this.counter, rows.length)) {
            //goes through a "pagesize" abouts of nomenees
            this.counter++;
            let user = await message.guild.members
                .fetch(element.user)
                .catch((e) => {
                    console.log(e);
                });
            embed.addField(
                `${this.counter} ${
                    user ? user.user.tag : "user not in server"
                }`,
                `nickname: ${user ? user.displayName : "not in server"}`,
                true
            );

            if (this.counter % this.pagesize === 0) break; //breaks the loop if the pagesize has been met
        }
        embed.setFooter(
            `avaliable commands: "next", "cancel", any number between: 1 through ${rows.length}`
        ); //tells the user which commands they can use
        return embed;
    }

    terminate(client?: Discord.Client) {
        //terminates the session so its cleared from the RAM
        if (client) {
            clearTimeout(this.timeout);
            client.removeListener("message", this.listener);
        }
        VoteHandeler.remove(this.user);
    }

    restart(
        message: Discord.Message,
        args: any[],
        client: Discord.Client,
        restart?: boolean
    ) {
        //restarts the session and clears the old one form the RAM
        clearTimeout(this.timeout);
        client.removeListener("message", this.listener);
        this.counter = 0;
        this.doIt(message, args, client, restart);
    }
}
