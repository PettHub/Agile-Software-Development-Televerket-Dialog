import { CommandAddSection } from "./CommandAddSection";
import Discord from "discord.js";
import { GlobalFunctions } from "./GlobalFunctions";
export class Nominator {
    static sectionsForUser: Map<string, Set<string>> = new Map();
    static usersForSection: Map<string, Set<string>> = new Map();
    static usersThatHaveNominated: Map<string, number> = new Map();
    //outputChannel: any;
    //client: Discord.Client;
    //timeout: NodeJS.Timeout;
    //constructor(client: Discord.Client) {
    //this.client = client;
    //this.outputChannel = client.channels.cache.get("826895001446645800"); //settings for changings outputchannel should be implemented later along with pms
    // }

    doIt(args: string[], message: Discord.Message): void {
        if (Nominator.usersThatHaveNominated.get(message.author.id))
            if (
                Date.now() -
                Nominator.usersThatHaveNominated.get(message.author.id) <
                1000 * 60 * 60 * 24
            ) {
                console.log("user has already nominated someone");
                return;
            }
        let nominee = args[0];
        let section: string = "";
        for (let i = 1; i < args.length; i++) {
            section = section.concat(args[i] + " ");
        }
        section = section.slice(0, -1);
        if (message.author.id.toString() === nominee) return;
        if (!(args.shift() && args.shift())) {
            message.channel.send("!nominate [member] [section]");
            return;
        }
        if (this.nominate(nominee, section, message)) {
            Nominator.usersThatHaveNominated.set(message.author.id, Date.now());
            message.channel.send(
                "nomination has been registered, type !nominations [section] too see all nominations"
            );
        }
    }

    nominate(user: string, section: string, message: Discord.Message): boolean {
        user = GlobalFunctions.toId(user);
        //console.log(CommandAddSection.sectionList);
        if (!CommandAddSection.sectionList.has(section)) {
            console.log("section does not exist"); //section has not been created or at least does not exist in sectionlist
            return false;
        }
        let guild = message.guild;
        //let guild = this.client.guilds.cache.get("823518625062977626"); //settings guildId
        //console.log(guild);
        if (!guild.members.fetch(user)) {
            console.log("user not in server");
            return false;
        }
        if (!Nominator.sectionsForUser.get(user))
            Nominator.sectionsForUser.set(user, new Set());
        if (!Nominator.usersForSection.get(section))
            Nominator.usersForSection.set(section, new Set());
        if (Nominator.usersForSection.get(section).has(user)) {
            console.log("this person is already nominated");
            return false; //this does not need to be checked in the other map since they both get updated with the same data. Possible bad practice
        }
        Nominator.usersForSection.get(section).add(user);
        Nominator.sectionsForUser.get(user).add(section);
        return true;
    }

    static displayCandidates(
        args: string[],
        message: Discord.Message
    ) {
        let arg = '';
        for (let i = 0; i < args.length; i++) {
            arg = arg.concat(args[i] + " ");
        } //display uses concatination for double word inputs. Still only expects one argument, either user or section
        arg = arg.slice(0, -1);
        //let guild = client.guilds.cache.get("823518625062977626"); //settings guildId
        if (CommandAddSection.sectionList.has(arg))
            this.displayCandidatesForSection(arg, message);
        else if (message.guild.member(arg)) {
            this.displaySectionsForCandidate(arg, message);
        } else
            message.reply(
                "please use correct input values, !nominations [section]/[userId]"
            );
    }

    private static displaySectionsForCandidate(
        arg: string,
        message: Discord.Message
    ): void {
        //let outputChannel: any = client.channels.cache.get(
        //  "826895001446645800"
        //); //settings channelId
        let embed: Discord.MessageEmbed;
        let setString = Nominator.sectionsForUser.get(arg);
        let iterator: Iterator<[string, string], any>;
        if (setString)
            iterator = Nominator.sectionsForUser.get(arg).entries();
        let i = 1;
        let section: string;
        let next: IteratorResult<[string, string], any>;
        embed = new Discord.MessageEmbed();
        if (iterator)
            while (true) {
                if (i++ % 100 == 0) {
                    //in case someone have been nominated for every section
                    embed
                        .setAuthor("sections " + arg + " is nominated for")
                        .setColor("#ff0000");
                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                next = iterator.next();
                if (next.done) break;
                section = next.value[0];
                embed.addField(section, "placeholder", false);
            }
        if (embed.fields.length > 0) {
            //if there are remaining fields in the embed
            embed
                .setAuthor("sections " + arg + " is nominated for")
                .setColor("#ff0000");
            message.channel.send(embed);
        }
    }

    private static displayCandidatesForSection(
        arg: string,
        message: Discord.Message
    ): void {
        // let outputChannel: any = client.channels.cache.get(
        //     "826895001446645800"
        // ); //settings channelId
        //let guild = client.guilds.cache.get("823518625062977626"); //settings guild id
        let embed: Discord.MessageEmbed;
        let setString = Nominator.usersForSection.get(arg);
        let iterator: Iterator<[string, string], any>;
        if (setString)
            iterator = setString.entries();
        let i = 1;
        let user: string;
        let next: IteratorResult<[string, string], any>;
        embed = new Discord.MessageEmbed();
        if (iterator)
            while (true) {
                if (i++ % 100 == 0) {
                    //in case there are more than 100 users for a section
                    embed.setAuthor("nominations for " + arg).setColor("#ff0000");
                    message.channel.send(embed);
                    embed = new Discord.MessageEmbed();
                }
                next = iterator.next();
                if (next.done) break;
                user = next.value[0];
                embed.addField(message.guild.member(user).displayName, user);
            }
        if (embed.fields.length > 0) {
            embed.setAuthor("nominations for " + arg).setColor("#ff0000");
            message.channel.send(embed);
        }
    }
}