import Discord from "discord.js";
import { SetChannel } from "./SetArtChannel";
import { TestAccess } from "./TestAccess";
import { ApplyHandeler } from "./ApplyHandeler";
import { ArtDecision } from "./ArtDecision";
import { RemoveArtist } from "./RemoveArtist";
import { HelpCommand} from "./HelpCommand";

export class Art {
    static applyHandler = new ApplyHandeler();

    static doIt(
        message: Discord.Message,
        args: any[],
        client: Discord.Client
    ): void {
        let command: string;
        if (args.shift()){
        command = args.shift().toLowerCase();
    }

        switch (command) {
            case "apply": //art
                this.applyHandler.doIt(message, client);
                break;

            case "setchannel": //art
                new SetChannel().doIt(message, args[0], client);
                TestAccess.doIt(message, "owner").then((res) => {
                    res
                        ? new SetChannel().doIt(message, args[0], client)
                        : message.channel.send("Access level owner needed");
                });
                break;

            case "deny": //art
                new ArtDecision().doIt(message, args, "deny");
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? new ArtDecision().doIt(message, args, "deny")
                        : message.channel.send("Access level mod needed");
                });
                break;

            case "accept": //art
                new ArtDecision().doIt(message, args, "accept");
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? new ArtDecision().doIt(message, args, "accept")
                        : message.channel.send("Access level mod needed");
                });
                break;

            case "remove": //art
                TestAccess.doIt(message, "mod").then((res) => {
                    res
                        ? new RemoveArtist().doIt(message, args)
                        : message.channel.send("Access level mod needed");
                });
                break;

            case "setartist": //art
                new ArtDecision().setArt(message, args.shift());
                TestAccess.doIt(message, "owner").then((res) => {
                    res
                        ? new ArtDecision().setArt(message, args.shift())
                        : message.channel.send("Access level mod needed");
                });
                break;

            default:
                if (!command){
                TestAccess.doIt(message, "owner").then((res) => {
                    res
                        ? HelpCommand.doItArt(message, "artowner")
                        : TestAccess.doIt(message, "mod").then((res) => {
                              res
                                  ? HelpCommand.doItArt(message, "artmod")
                                  : HelpCommand.doItArt(message, "artuser");
                          });
                });
                break;
            }
        }
    }
}
