import { CommandPing } from "./CommandPing";
import { PMHandler } from "./Pms";
import { CommandAddSection } from "./CommandAddSection";
import { TestAccess } from "./TestAccess";
import { sayTest } from "./sayTest";
import { Nominator } from "./Nominator";
import { Sections } from "./Sections";
import { Voter } from "./Voter";
import Discord from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { setChannel } from './setChannel';
import { ArtDecision} from './ArtDecision';
import { DatabaseFunctions } from "./DatabaseFunctions";

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

client.on("message", (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case "ping":
            new CommandPing().doIt(message);
            break;
        case "cool":
            message.channel.send("me");
            break;
        case 'apply':
            new PMHandler().doIt(message, message.author, client);
            break;
        case 'setchannel':
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? new setChannel().doIt(message, args[0], client)
                    : message.channel.send("Access level mod needed");
            });

            break;
        case "addsection":
            accesscontrol.doIt(message, "mod").then((res) => { 
                res
                    ? new CommandAddSection().doIt(message, args, accesscontrol)
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
        case "say":
            new sayTest().doIt(message, args);
            break;
        case "nominate":
            new Nominator().doIt(args, message);
            break;
        case "nominations":
            Nominator.displayCandidates(args, message);
            break;
        case "sections":
            Sections.viewSections(message);
            break;
        case "removesection":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ? Sections.removesection(args, message)
                    : message.channel.send("Access level mod needed");
            });
            break;
        case "art":
            let sub: string = args.shift();
            if(sub === 'accept' || sub === 'deny' || 0 === 0){
                accesscontrol.doIt(message, "mod").then((res) => {
                    res
                        ? new ArtDecision().doIt(message, args, sub)
                        : message.channel.send("Access level mod needed");
                });
            }
            break;
        case "setart":
            accesscontrol.doIt(message, "mod").then((res) => {
                res
                    ?  new ArtDecision().setArt(message, args.shift())
                    : message.channel.send("Access level mod needed");
            });
           
            break;
        case "vote":
            Voter.vote(message, args);
            break;
    }
});

client.login(process.env.DISCORD_TOKEN); //true = dev, false = product
