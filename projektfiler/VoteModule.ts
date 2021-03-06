import Discord from "discord.js";
import { VoteHandeler } from "./Voter2Hadeler";
import { Nominator } from "./Nominator";
import { TestAccess } from "./TestAccess";
import { Voter } from "./Voter";
import { Sections } from "./Sections";
import { HelpCommand } from "./HelpCommand";

export class VoteModule {
    static doIt(
        command: string,
        message: Discord.Message,
        args: string[],
        client: Discord.Client
    ) {
        switch (command) {
            case "vote":
                    Voter.isOpen().then((res) => {
                        res
                            ? VoteHandeler.getinstance().doIt(message, args, client)
                            : message.channel.send("votes are currently closed");
                    });
                break;

            case "nominate":
                Nominator.isOpen().then((res) => {
                    res
                        ? new Nominator().doIt(args, message)
                        : message.channel.send(
                            "Nominations are currently closed"
                        );
                });
                break;
            case "nominations":
            case "nom":
                this.nominations(message, args, client);
                break;
            case "section":
                this.section(message, args);
                break;
            case "sections": //vote
                Sections.viewSections(message);
                break;
            case "viewvotes": //user votes
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? Voter.showVotes(message, args)
                        : message.channel.send("Access level mod needed");
                });
                break;
            case "tallyvotes":
                TestAccess.doIt(message, "mod").then(async (res) => {
                    res
                        ? await Voter.tallyVotes(client, message, args)
                        : message.channel.send("Access level mod needed");
                });
                break;
            case "votes":
                console.log(args[0]);
            if (args[0] === "open"){
                TestAccess.doIt(message, "owner").then(async (res) => {
                    res
                        ? Voter.openVotes(message)
                        : message.channel.send("Access level owner needed");
                });
            } else if (args[0] === "close"){
                TestAccess.doIt(message, "owner").then(async (res) => {
                    res
                        ? Voter.closeVotes(message)
                        : message.channel.send("Access level owner needed");
                });
            }
                break;

            default:
                break;
        }
    }

    private static async nominations(
        message: Discord.Message,
        args: string[],
        client: Discord.Client
    ) {
        if (!args[0]) {
            if (await TestAccess.doIt(message, "owner")) {
                HelpCommand.doItVote(message, "voteowner");
                return;
            }
            if (await TestAccess.doIt(message, "mod")) {
                HelpCommand.doItVote(message, "votemod");
                return;
            }
            else {
                HelpCommand.doItVote(message, "voteuser");
            }
            return;
        }
        const command = args[0].toLowerCase();
        switch (command) {
            case "open": //vote
                TestAccess.doIt(message, "owner").then((res) => {
                    res
                        ? Nominator.openNominations(message)
                        : message.channel.send("Access level owner needed");
                });
                break;
            case "close": //vote
                TestAccess.doIt(message, "owner").then((res) => {
                    res
                        ? Nominator.closeNominations(message)
                        : message.channel.send("Access level owner needed");
                });
                break;
            case "ban": //vote
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? Nominator.nomBan(message, args.slice(1))
                        : message.channel.send("Access level mod needed");
                });
                break;
            case "unban": //vote
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? Nominator.nomUnBan(message, args.slice(1))
                        : message.channel.send("Access level mod needed");
                });
                break;
            case "remove": //user, section vote
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? Nominator.removeNomineeFromSection(
                            message,
                            args.slice(1)
                        )
                        : message.channel.send("Access level mod needed");
                });
                break;
            case "reset": //vote
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? Nominator.resetNominations(message, client)
                        : message.channel.send("Access level mod needed");
                });
                break;

            default:
                //vote
                Nominator.isOpen().then((res) => {
                    res
                        ? Nominator.displayCandidates(args, message)
                        : message.channel.send(
                            "Nominations are currently closed"
                        );
                });

                break;
        }
    }

    private static section(message: Discord.Message, args: string[]) {
        const command = args.shift().toLowerCase();
        switch (command) {
            case "add": //vote
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? Sections.addsection(message, args)
                        : message.channel.send("Access level mod needed");
                });
                break;
            case "remove": //vote
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? Sections.removeSection(message, args)
                        : message.channel.send("Access level mod needed");
                });
                break;
        }
    }
}
