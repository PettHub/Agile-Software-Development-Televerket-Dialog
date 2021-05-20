import Discord from 'discord.js';
import { TestAccess } from "./TestAccess";

export class HelpCommand {
    static async doItArt(message: Discord.Message, helptype: string): Promise<void> {
        if(helptype == "artuser"){
            let embed = new Discord.MessageEmbed();
            embed.addField('Available commands in art application:', '`!art apply`: Starts application for artist role. ', true);
            embed.setColor("#00ff00")    
        message.channel.send(embed);

        }
        if(helptype == "artmod"){
            let embed = new Discord.MessageEmbed;
            embed.addField('Available commands in art application:', '`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. ', true);
            message.channel.send(embed)

        }
        if(helptype == "artowner"){
            let embed = new Discord.MessageEmbed();
            embed.addField('Available commands in art application:', '`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. \n`!art setchannel [channel]`: Sets a channel as the art channel. \n`!art setrole [role]`: Sets a role as artist.', true);
            embed.setColor("#00ff00")    
            message.channel.send(embed);

        }
        
    }

    static async doItVote(message: Discord.Message, helptype: string): Promise<void> {
        if(helptype == "voteuser"){
            let embed = new Discord.MessageEmbed();
            embed.addField('Available commands in aniversity voting system:', '`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [user] [section]`: Votes for a user already nominated in a section. \n`!nominations [section]`: Displays users nominated in a section. ',true); //searchword bör bli nickname istället för userid när searchword är användare
            embed.setColor("#00ff00")    
        message.channel.send(embed);

        }
        if(helptype == "votemod"){
            let embed = new Discord.MessageEmbed;
            embed.addField('Available commands in anniversary voting system:', '`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [user] [section]`: Votes for a user already nominated in a section. \n`!nominations [section]`: Displays users nominated in a section. \n`!nominations ban`: bans a user from being nominated \n`!nominations ban`: bans a user from being nominated. \n`!nominations unban`: unbans a user from being nominated ',true); //searchword bör bli nickname istället för userid när searchword är användare
            message.channel.send(embed)

        }
        if(helptype == "voteowner"){
            let embed = new Discord.MessageEmbed();
            embed.addField('Available commands in anniversary voting system:', '`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [user] [section]`: Votes for a user already nominated in a section. \n`!nominations [section]`: Displays users nominated in a section.\n`!nominate open`: opens sections for nominations and votes. \n`!nominate close`: closes sections for nominations and votes \n`!tallyvotes [?section]`: Returns top 5 polling results within a section. \n`!nominate reset`: resets nominations and votes. \n`!nominations ban`: bans a user from being nominated \n`!nominations ban`: bans a user from being nominated. \n`!nominations unban`: unbans a user from being nominated ',true); //searchword bör bli nickname istället för userid när searchword är användare
            embed.setColor("#00ff00")    
            message.channel.send(embed);

        }
        
    }
        
        static async doIt(message: Discord.Message): Promise<void> {

        if(await TestAccess.doIt(message, "gowner")){
            this.messageGowner(message);
            return;
        }

        if(await TestAccess.doIt(message, "owner")){
            this.messageOwner(message);
            return;
        }

        if(await TestAccess.doIt(message, "mod")){
            this.messageMod(message);
            return;
        }

        else{
            this.messageUser(message);
            return;
        }
    }

    private static messageGowner(message){
        
        let embed = new Discord.MessageEmbed();
        embed.addField('Available general commands:', '`!ping`: Trigger a pong from bot, to show it is online. \n`!setmod [role]`: Makes a role moderator to the bot. \n`!unmod [role]`: Removes bot mod rights from a role. \n`!setowner [role]`: gives role owner permissions in bot', true);
        embed.addField('Available commands in anniversary voting system:', '`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [user] [section]`: Votes for a user already nominated in a section. \n`!nominations [section]`: Displays users nominated in a section.\n`!nominate open`: opens sections for nominations and votes. \n`!nominate close`: closes sections for nominations and votes \n`!tallyvotes [?section]`: Returns top 5 polling results within a section. \n`!nominate reset`: resets nominations and votes. \n`!nominations ban`: bans a user from being nominated \n`!nominations ban`: bans a user from being nominated. \n`!nominations unban`: unbans a user from being nominated ',true); //searchword bör bli nickname istället för userid när searchword är användare
        embed.addField('Available commands in art application:', '`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. \n`!art setchannel [channel]`: Sets a channel as the art channel. \n`!art setrole [role]`: Sets a role as artist.', true);
        embed.setColor("#00ff00")    
        message.channel.send(embed);
    }

    private static messageOwner(message){
        let embed = new Discord.MessageEmbed();
        embed.addField('Available general commands:', '`!ping`: Trigger a pong from bot, to show it is online. \n`!setmod [role]`: Makes a role moderator. \n`!unmod [role]`: Removes mod rights from a role.', true);
        embed.addField('Available commands in anniversary voting system:', '`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [user] [section]`: Votes for a user already nominated in a section. \n`!nominations [section]`: Displays users nominated in a section.\n`!nominate open`: opens sections for nominations and votes. \n`!nominate close`: closes sections for nominations and votes \n`!tallyvotes [?section]`: Returns top 5 polling results within a section. \n`!nominate reset`: resets nominations and votes. \n`!nominations ban`: bans a user from being nominated \n`!nominations ban`: bans a user from being nominated. \n`!nominations unban`: unbans a user from being nominated ',true); //searchword bör bli nickname istället för userid när searchword är användare
        embed.addField('Available commands in art application:', '`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. \n`!art setchannel [channel]`: Sets a channel as the art channel. \n`!art setrole [role]`: Sets a role as artist.', true);
        embed.setColor("#ff0000");
    message.channel.send(embed);
    }

    // Base commands
    // ping - alla
    // setmod [role] - owner
    // unmod [role] - owner
    // setowner [role] - guild owner
    
    // Art commands
    // art...
    //   apply - alla
    //   accept [user] - mod
    //   deny [user] [reason] - mod
    //   remove [user] [reason] - mod
    //   setchannel [channel] - owner
    //   setrole [role] - owner
    
    // Vote commands
    // vote [section] - alla
    // nominate [user] [section] - alla
    // sections - alla
    // viewvotes [user] - mod
    // tallyvotes [?section] - mod
    // nom/nominate...
    //   [user] [section] - alla
    //   remove [user] [section] - mod
    //   ban [user] - mod
    //   unban [user] - mod
    //   open - owner
    //   close - owner
    //   reset - owner
    // section
    //   add [section],[section2]... - mod
    //   remove [section] - mod

    private static messageMod(message){
        let embed = new Discord.MessageEmbed();
        embed.addField('Available general commands:', '`!ping`: Trigger a pong from bot, to show it is online. \n`!setmod [role]`: Makes a role moderator. \n`!unmod [role]`: Removes mod rights from a role.', true);
        embed.addField('Available commands in anniversary voting system:', '`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [user] [section]`: Votes for a user already nominated in a section. \n`!nominations [section]`: Displays users nominated in a section. \n`!nominations ban`: bans a user from being nominated \n`!nominations ban`: bans a user from being nominated. \n`!nominations unban`: unbans a user from being nominated ',true); //searchword bör bli nickname istället för userid när searchword är användare
        embed.addField('Available commands in art application:', '`!art apply`: Starts application for artist role. \n`!art accept [user]`: Grants an applicant the `Artist` role and triggers DM to inform the user of accepted application. \n`!art deny [user] [reason]`: Denies the artist role application. Reason needed and triggers DM to user to inform that the application has been denied. \n`!art remove [user] [reason]`: Removes artist role for a user. Reason required, which will be sent to user via DM. ', true);

        embed.setColor("#09cdda");
    message.channel.send(embed);
    }

    private static messageUser(message){
        let embed = new Discord.MessageEmbed;
        embed.addField('Available general commands:', '`!ping`: Trigger a pong from bot, to show it is online. ', true);
        embed.addField('Available commands in aniversity voting system:', '`!nominate [user] [section]`: Nominates a user in a section. \n`!vote [user] [section]`: Votes for a user already nominated in a section. \n`!nominations [section]`: Displays users nominated in a section. ',true); //searchword bör bli nickname istället för userid när searchword är användare
        embed.addField('Available commands in art application:', '`!art apply`: Starts application for artist role. ', true);
        embed.setColor("#ffff00");
        message.channel.send(embed)
    }
}