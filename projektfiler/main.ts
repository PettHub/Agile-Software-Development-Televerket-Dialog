import { CommandPing } from "./CommandPing";
import { TestAccess } from "./TestAccess";
import Discord from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { DatabaseFunctions } from "./DatabaseFunctions";
import { art } from "./artModule";
import { voteModule } from "./voteModue";

if (process.env.NODE_ENV) {
    dotenv.config({
        path: path.join(__dirname, `.env.${process.env.NODE_ENV}`),
    }); //sets up the enviromend varibles
} else {
    dotenv.config({ path: path.join(__dirname, `.env`) });
}
const client = new Discord.Client();
DatabaseFunctions.getInstance(); // sets up the database if needed
let prefix = process.env.DISCORD_PREFIX; //sets the prefix

client.once("ready", () => {
    console.log("bot is now online"); //informs the console that the bot is up and running
});

client.on("message", (message) => {
    if (
        !message.content.startsWith(prefix) ||
        message.author.bot ||
        message.guild === null
    )
        return;

    const args = message.content.slice(prefix.length).split(/ +/); //splits the command into args that are easier to manage
    const command = args.shift().toLowerCase();

    switch (command) {
        case "ping":
            new CommandPing().doIt(message);
            break;

        case "cool":
            message.channel.send("me");
            break;

        case "art":
            art.doIt(message, args, client); //Manages all the art sub commands
            break;

        case "vote":
        case "nominations":
        case "nominte":
        case "nom":
        case "section":
        case "sections":
        case "viewvotes":
        case "tallyvotes":
            voteModule.doIt(command, message, args, client); //Manages all the voting commands
            break;

        case "hasaccess": //acc
            TestAccess.doIt(message, "mod").then((res) => {
                message.channel.send(
                    res ? "You have Access" : "You dont have Access"
                );
            });
            break;
        case "setmod": //acc
            TestAccess.setMod(message, args.shift());
            break;
        case "unmod": //acc
            TestAccess.unMod(message, args.shift());
            break;
        case "setowner": //acc
            TestAccess.setOwner(message, args.shift());
            break;

        // case 'help':
        //     TestAccess.doIt(message, "owner").then((res) => {
        //         res
        //             ? message.channel.send("TODO all art commands")
        //             : TestAccess.doIt(message, "mod").then((res) => {
        //                   res
        //                       ? message.channel.send("TODO mod commands")
        //                       : message.channel.send("Usage !art apply");
        //               });
        //     });
        //     break;
    }
});

client.login(process.env.DISCORD_TOKEN); //starts the bot
