import { CommandPing } from "./CommandPing";
//import { CommandAddSection } from "./CommandAddSection";
import { TestAccess } from "./TestAccess";
import { Nominator } from "./Nominator";
import { Sections } from "./Sections";
import { Voter } from "./Voter";
import Discord from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { setChannel } from "./setArtChannel";
import { ArtDecision } from "./ArtDecision";
import { DatabaseFunctions } from "./DatabaseFunctions";
import { ApplyHandeler } from "./ApplyHandeler";
import { RemoveArtist } from "./RemoveArtist";
import { VoteHandeler } from "./Voter2Hadeler";

if (process.env.NODE_ENV) {
    dotenv.config({
        path: path.join(__dirname, `.env.${process.env.NODE_ENV}`),
    });
} else {
    dotenv.config({ path: path.join(__dirname, `.env`) });
}
const client = new Discord.Client();
DatabaseFunctions.getInstance();
let prefix = process.env.DISCORD_PREFIX;

client.once("ready", () => {
    console.log("bot is now online");
});
let accesscontrol = new TestAccess();
let applyHandeler = new ApplyHandeler();

client.on("message", (message) => {
    if (
        !message.content.startsWith(prefix) ||
        message.author.bot ||
        message.guild === null
    )
        return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case "ping":
            new CommandPing().doIt(message);
            break;
        case "cool":
            message.channel.send("me");
            break;
        case "apply":
            applyHandeler.doIt(message, client);
            break;
        case "artchannel":
            accesscontrol.doIt(message, "owner").then((res) => {
                res
                    ? new setChannel().doIt(message, args[0], client)
                    : message.channel.send("Access level owner needed");
            });
            break;
        case "addsection":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? Sections.addsection(message, args)
                    : message.channel.send("Access level mod needed");
            });

            break;
        case "hasaccess":
            accesscontrol.doIt(message, "mod").then((res) => {
                message.channel.send(
                    res ? "You have Access" : "You dont have Access"
                );
            });
            break;
        case "setmod":
            accesscontrol.setMod(message, args.shift());
            break;
        case "unmod":
            accesscontrol.unMod(message, args.shift());
            break;
        case "setowner":
            accesscontrol.setOwner(message, args.shift());
            break;
        case "nominate":
            Nominator.isOpen().then((res) => {
                res
                    ? new Nominator().doIt(args, message)
                    : message.channel.send("Nominations are currently closed");
            });
            break;
        case "nominations":
            Nominator.isOpen().then((res) => {
                res
                    ? Nominator.displayCandidates(args, message)
                    : message.channel.send("Nominations are currently closed");
            });

            break;
        case "opennominations":
            accesscontrol.doIt(message, "owner").then((res) => {
                res
                    ? Nominator.openNominations(message)
                    : message.channel.send("Access level owner needed");
            });
            break;
        case "closenominations":
            accesscontrol.doIt(message, "owner").then((res) => {
                res
                    ? Nominator.closeNominations(message)
                    : message.channel.send("Access level owner needed");
            });

            break;
        case "sections":
            Sections.viewSections(message);
            break;
        case "removesection":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? Sections.removeSection(message, args)
                    : message.channel.send("Access level mod needed");
            });
            break;
        case "art":
            let sub: string = args.shift();
            if (sub === "accept" || sub === "deny" || 0 === 0) {
                accesscontrol.doIt(message, "mod").then((res) => {
                    res
                        ? new ArtDecision().doIt(message, args, sub)
                        : message.channel.send("Access level mod needed");
                });
            }
            break;
        case "artremove":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? new RemoveArtist().doIt(message, args)
                    : message.channel.send("Access level mod needed");
            });
            break;
        case "setart":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? new ArtDecision().setArt(message, args.shift())
                    : message.channel.send("Access level mod needed");
            });

            break;
        case "vote":
            Nominator.isOpen().then((res) => {
                res
                    ? Voter.vote(message, args)
                    : message.channel.send("votes are currently closed");
            });
            break;
        case "nomban":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? Nominator.nomBan(message, args)
                    : message.channel.send("Access level mod needed");
            });
            break;
        case "nomunban":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? Nominator.nomUnBan(message, args)
                    : message.channel.send("Access level mod needed");
            });
            break;
        case "removenominee": //user, section
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? Nominator.removeNomineeFromSection(message, args)
                    : message.channel.send("Access level mod needed");
            });
            break;
        case "resetnominations":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? Nominator.resetNominations(message, client)
                    : message.channel.send("Access level mod needed");
            });
            break;
        case "viewvotes": //user
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? Voter.showVotes(message, args)
                    : message.channel.send("Access level mod needed");
            });
            break;
        case "newvote":
            VoteHandeler.getinstance().doIt(message, args, client);
            break;
    }
});

client.login(process.env.DISCORD_TOKEN); //true = dev, false = product
