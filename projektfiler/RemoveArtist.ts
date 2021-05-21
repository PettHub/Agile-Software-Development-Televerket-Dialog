import Discord from 'discord.js';
import { DatabaseFunctions } from "./DatabaseFunctions";
import { GlobalFunctions } from "./GlobalFunctions";


//Removes the artist role from a user
export class RemoveArtist {

    private static nick: string;

    constructor() {

    }

    public doIt(message: Discord.Message, args: any[]): void {
        if (args[0]) { //Checks if a user has been given
            message.reply('please provide a user ID');
            return;
        }
        let tmp = args.shift();

        console.log(GlobalFunctions.toId(tmp))
        message.guild.members.fetch(GlobalFunctions.toId(tmp)).catch(e => {
            message.reply('An error has occured'); //Catches errors that discord js may throw so the bot wont die
        }).then((user) => {
            user
                ? this.userRemoval(message, args, user) //Runs the switch function if the user is a valid guild member
                : console.log('error, invalid user provided'); //Logs that a discord error has occored
        });

    }

    //Determines what sub command has been sent
    private userRemoval(message: Discord.Message, args: any[], user: Discord.GuildMember): void {

        if (!args[0]) { //Makes sure there is a reason provided 
            message.reply('Please provide a reason');
            return;
        }
        let removeReason: string = args[0];
        while (args.shift() && args[0]) { //Compiles all remaining args into a string; the reason gets put into a single string
            removeReason = removeReason + ' ' + args[0];
        }
        let querry = 'SELECT * FROM Access WHERE accessLVL = ?';

        message.guild.members.fetch(user).then((res) => {
            RemoveArtist.nick = res.user.username;
        });

        DatabaseFunctions.getInstance().get(querry, "art", (err, row) => { //Query the database to get the artist role ID (to ensure we remove the correct role)
            if (err) {
                console.log(err);
                return;
            }

            if (row) {
                let role = row.role;

                if (!user.roles.cache.has(role)) {
                    message.reply('User does not have the artist role');
                    return;
                } else
                    user.roles.remove(role);//Removes role from user                 
                message.reply("User: " + RemoveArtist.nick + " is not an artist anymore."); //user is userID, which should be presented as username instead

                //Sends the artist the reason they were rejected. Sent in PM. Also sends confirmation in the channel 
                user.send('The Artist role has been removed from you for the following reason:\n' + removeReason)
                message.reply('User: ' + RemoveArtist.nick + '\'s artist role has been removed with the reason: ' + removeReason);
                //}


            }
        })


    }
}







