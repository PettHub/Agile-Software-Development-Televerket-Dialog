import Discord from 'discord.js';
import { DatabaseFunctions } from "./DatabaseFunctions";
import { GlobalFunctions } from "./GlobalFunctions";


//Removes the artist role from a user
export class RemoveArtist {

    static nick: string;

    constructor() {

    }

    doIt(message: Discord.Message, args: any[]): void {
        let tmp = args.shift();
        if (tmp === undefined) { //Checks if a user has been given
            message.channel.send('please provide a user ID');
            return;
        }
        message.guild.members.fetch(GlobalFunctions.toId(tmp)).catch(e => {
            message.channel.send('please provide a valid username'); //Catches errors that discord js may throw so the bot wont die
        }).then((user) => {
            user
                ? this.userRemoval(message, args, user) //Runs the switch function if the user is a valid guild member
                : console.log('error, invalid user provided'); //Logs that a discord error has occored
        });

    }

    //Determines what sub command has been sent
    private userRemoval(message: Discord.Message, args: any[], user: Discord.GuildMember) : void{
        console.log('Inne i userRemoval!');        
        
        let removeReason: string = args[0];
        if (removeReason === undefined) { //Makes sure there is a reason provided 
            message.channel.send('Please provide a reason');
            return;
            }
        while (args.shift() && args[0]) { //Compiles all remaining args into a string; the reason gets put into a single string
            removeReason = removeReason + ' ' + args[0];
            }
        let querry = 'SELECT * FROM Access WHERE accessLVL = ?';

        console.log(RemoveArtist.nick);
            message.guild.members.fetch(user).then((res) => {
                RemoveArtist.nick = res.user.username;
                console.log(RemoveArtist.nick + 'i fetch');
            });
                
        DatabaseFunctions.getInstance().get(querry, "art", (err, row) => { //Query the database to get the artist role ID (to ensure we remove the correct role)
            if (err) {
                console.log(err);
                return;
            }
            
            if (row) {
                let role = row.role;
                console.log('Artist role in database: ' + role);
                
                if(!user.roles.cache.has(role)){
                    message.channel.send('User does not have the artist role');
                    return;
                }else
                user.roles.remove(role);//Removes role from user                 
                console.log(RemoveArtist.nick);
                message.channel.send("User: " + RemoveArtist.nick + " is not an artist anymore."); //user is userID, which should be presented as username instead
        
                //Sends the artist the reason they were rejected. Sent in PM. Also sends confirmation in the channel 
                user.send('The Artist role has been removed from you for the following reason:\n' + removeReason)
                message.channel.send('User: ' + RemoveArtist.nick + '\'s artist role has been removed with the reason: ' + removeReason);
                //}

                
            }
        })
                
                
    }
}







