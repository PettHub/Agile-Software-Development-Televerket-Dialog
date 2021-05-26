import Discord from "discord.js";
import { TestAccess } from "./TestAccess";

export class HelpCommand {
    static async doItArt(
        message: Discord.Message,
        helptype: string
    ): Promise<void> {
        if (helptype == "artuser") {
            let embed = new Discord.MessageEmbed();
            embed.addField(
                "Available commands in art application:",
                "`!art apply`: Starts application for artist role. ",
                true
            );
            embed.setColor("#6691ba");
            message.channel.send(embed);
        }
        if (helptype == "artmod") {
            let embed = new Discord.MessageEmbed();
            embed.addField(
                "Available commands in art application:",
                "`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. ",
                true
            );
            embed.setColor("#d3a25a");
            message.channel.send(embed);
        }
        if (helptype == "artowner") {
            let embed = new Discord.MessageEmbed();
            embed.addField(
                "Available commands in art application:",
                "`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. \n`!art setchannel [channel]`: Sets a channel as the art channel. \n`!art setrole [role]`: Sets a role as artist.",
                true
            );
            embed.setColor("#e2c696");
            message.channel.send(embed);
        }
    }

    public static async doItVote(
        message: Discord.Message,
        helptype: string
    ): Promise<void> {
        if (helptype == "voteuser") {
            let embed = new Discord.MessageEmbed();
            embed.addField(
                "Available commands in anniversary voting system:",
                "`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [section]`: Starts a voting session in dms. \n`!nominations [section or user]`: Displays users nominated in a section or the sections the user is nominated for. ",
                true
            ); //searchword bör bli nickname istället för userid när searchword är användare
            embed.setColor("#6691ba");
            message.channel.send(embed);
        }
        if (helptype == "votemod") {
            let embed = new Discord.MessageEmbed();
            embed.addField(
                "Available commands in anniversary voting system:",
                "`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [section]`: Starts a voting session in dms. \n`!nominations [section or user]`: Displays users nominated in a section or the sections the user is nominated for. \n`!nominations ban [user]`: bans a user from being nominated. \n`!nominations unban [user]`: unbans a user from being nominated ",
                true
            ); //searchword bör bli nickname istället för userid när searchword är användare
            embed.setColor("#d3a25a");
            message.channel.send(embed);
        }
        if (helptype == "voteowner") {
            let embed = new Discord.MessageEmbed();
            embed.addField(
                "Available commands in anniversary voting system:",
                "`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [section]`: Starts a voting session in dms. \n`!nominations [section or user]`: Displays users nominated in a section or the sections the user is nominated for.\n`!nominations open`: opens sections for nominations and votes. \n`!nominations close`: closes sections for nominations and votes \n`!tallyvotes [?section]`: Returns top 5 polling results within a section. \n`!nominations reset`: resets nominations and votes. \n`!nominations ban [user]`: bans a user from being nominated \n`!nominations unban [user]`: unbans a user from being nominated ",
                true
            ); //searchword bör bli nickname istället för userid när searchword är användare
            embed.setColor("#e2c696");
            message.channel.send(embed);
        }
    }

    public static async doIt(message: Discord.Message): Promise<void> {
        if (await TestAccess.doIt(message, "gowner")) {
            this.messageGowner(message);
            return;
        }

        if (await TestAccess.doIt(message, "owner")) {
            this.messageOwner(message);
            return;
        }

        if (await TestAccess.doIt(message, "mod")) {
            this.messageMod(message);
            return;
        } else {
            this.messageUser(message);
            return;
        }
    }

    private static messageGowner(message: Discord.Message) {
        let embed = new Discord.MessageEmbed();
        embed.addField(
            "Available general commands:",
            "`!ping`: Trigger a pong from bot, to show it is online. \n`!setmod [role]`: Makes a role moderator to the bot. \n`!unmod [role]`: Removes bot mod rights from a role. \n`!setowner [role]`: gives role owner permissions in bot",
            true
        );
        embed.addField(
            "Available commands in anniversary voting system:",
            "`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [section]`: Starts a voting session in dms. \n`!nominations [section  or user]`: Displays users nominated in a section or the sections the user is nominated for.\n`!nominations open`: opens sections for nominations and votes. \n`!nominations close`: closes sections for nominations and votes \n`!tallyvotes [?section]`: Returns top 5 polling results within a section. \n`!nominations reset`: resets nominations and votes.\n`!nominations ban [user]`: bans a user from being nominated. \n`!nominations unban [user]`: unbans a user from being nominated ",
            true
        ); //searchword bör bli nickname istället för userid när searchword är användare
        embed.addField(
            "Available commands in art application:",
            "`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. \n`!art setchannel [channel]`: Sets a channel as the art channel. \n`!art setrole [role]`: Sets a role as artist.",
            true
        );
        embed.setColor("#f1ede2");
        embed.setFooter(
            "Televerket Dialog is brought to you by: \nCrille, Ide, Thing, Mattias, Mona, Paint and Pett"
        );
        message.channel.send(embed);
    }

    private static messageOwner(message: Discord.Message) {
        let embed = new Discord.MessageEmbed();
        embed.addField(
            "Available general commands:",
            "`!ping`: Trigger a pong from bot, to show it is online. \n`!setmod [role]`: Makes a role moderator. \n`!unmod [role]`: Removes mod rights from a role.",
            true
        );
        embed.addField(
            "Available commands in anniversary voting system:",
            "`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [section]`: Starts a voting session in dms. \n`!nominations [section  or user]`: Displays users nominated in a section or the sections the user is nominated for.\n`!nominations open`: opens sections for nominations and votes. \n`!nominations close`: closes sections for nominations and votes \n`!tallyvotes [?section]`: Returns top 5 polling results within a section. \n`!nominations reset`: resets nominations and votes.\n`!nominations ban [user]`: bans a user from being nominated. \n`!nominations unban [user]`: unbans a user from being nominated ",
            true
        ); //searchword bör bli nickname istället för userid när searchword är användare
        embed.addField(
            "Available commands in art application:",
            "`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. \n`!art setchannel [channel]`: Sets a channel as the art channel. \n`!art setrole [role]`: Sets a role as artist.",
            true
        );
        embed.setColor("#e2c696");
        embed.setFooter(
            "Televerket Dialog is brought to you by: \nCrille, Ide, Thing, Mattias, Mona, Paint and Pett"
        );
        message.channel.send(embed);
    }

    private static messageMod(message: Discord.Message) {
        let embed = new Discord.MessageEmbed();
        embed.addField(
            "Available general commands:",
            "`!ping`: Trigger a pong from bot, to show it is online. \n`!setmod [role]`: Makes a role moderator. \n`!unmod [role]`: Removes mod rights from a role.",
            true
        );
        embed.addField(
            "Available commands in anniversary voting system:",
            "`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [section]`: Starts a voting session in dms. \n`!nominations [section or user]`: Displays users nominated in a section or the sections the user is nominated for. \n`!nominations ban [user]`: bans a user from being nominated\n`!nominations unban [user]`: unbans a user from being nominated ",
            true
        ); //searchword bör bli nickname istället för userid när searchword är användare
        embed.addField(
            "Available commands in art application:",
            "`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. ",
            true
        );

        embed.setColor("#d3a25a");
        embed.setFooter(
            "Televerket Dialog is brought to you by: \nCrille, Ide, Thing, Mattias, Mona, Paint and Pett"
        );
        message.channel.send(embed);
    }

    private static messageUser(message: Discord.Message) {
        let embed = new Discord.MessageEmbed();
        embed.addField(
            "Available general commands:",
            "`!ping`: Trigger a pong from bot, to show it is online. ",
            true
        );
        embed.addField(
            "Available commands in aniversity voting system:",
            "`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [section]`: Starts a voting session in dms. \n`!nominations [section or user]`: Displays users nominated in a section or the sections the user is nominated for. ",
            true
        ); //searchword bör bli nickname istället för userid när searchword är användare
        embed.addField(
            "Available commands in art application:",
            "`!art apply`: Starts application for artist role. ",
            true
        );
        embed.setColor("#6691ba");
        embed.setFooter(
            "Televerket Dialog is brought to you by:\nCrille, Ide, Thing, Mattias, Mona, Paint and Pett"
        );
        message.channel.send(embed);
    }
}
