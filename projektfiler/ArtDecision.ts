import Discord from 'discord.js';
import { DatabaseFunctions } from "./DatabaseFunctions";
import { GlobalFunctions } from "./GlobalFunctions";

export class ArtDecision {
    db
    
    constructor(){
        this.db = DatabaseFunctions.getInstance().db;
        DatabaseFunctions.getInstance().db.run(
            "CREATE TABLE IF NOT EXISTS access(accessLVL TEXT NOT NULL, role TEXT NOT NULL)"
        );

    }


    doIt(message: Discord.Message, args, sub): void {
        let tmp = args.shift();
        if (!(sub === 'deny' || sub === 'accept')) { //Checks if the sub command is valid
            message.channel.send('Usage: *!art [accept/deny] [user] [deny reason]*');
            return;
        }
        if (tmp === undefined) { //Checks if a user has been given
            message.channel.send('please provide a user ID');
            return;
        }
        message.guild.members.fetch(GlobalFunctions.toId(tmp)).catch(e => {
            message.channel.send('please provide a valid username'); //Catches errors that discord js may throw so the bot wont die
        }).then((user) =>{
            user 
                ? this.switch(message, args, sub, user) //Runs the switch function if the user is a valid guild member
                : console.log('error, invalid user provided'); //Logs that a discord error has occored
        });
        
    }

    //Determines what sub command has been sent
    private switch(message: Discord.Message, args, sub: string, user){
        switch (sub) {
            case 'accept':
                this.addArtRole(user, message); // gives user artrole
                break;
        case 'deny':
            let reason: string = args[0];
            if (reason === undefined){ //Makes sure there is a reason provided 
                message.channel.send('Please provide a reason');
                return;
            }
            while (args.shift() && args[0]) { //Compiles all remaining args into a string
                reason = reason + ' ' + args[0];
            }
            this.deny(user, reason, message);
            break;
    }
    }

    // sets which role it the artist role
    public setArt(
        message: Discord.Message,
        command: string
    ) {
        if (!command) {
            //Checks if there is a command after the prefix
            message.channel.send("please provide a role");
        } else {
            command = GlobalFunctions.toId(command);
            DatabaseFunctions.getInstance()
            .db.prepare("DELETE FROM access WHERE accessLVL =?")
            .run("art");
                DatabaseFunctions.getInstance() 
                    .db.prepare(
                        "INSERT INTO access(accessLVL, role) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM access WHERE accessLVL =? AND role =?);"
                    )
                    .run("art", command, "art", command); //Adds the owner status for the specified role
                message.channel.send("OK");
            
        }
    }

    //Sends the 'artist' the reason they were rejected and a confirming message so the mods know that the command worked and logs it. 
    private deny(user, reason:string , message: Discord.Message) {
        user.send('Your art application has been rejected for the following reason\n' + reason) 
        message.channel.send('User:' + user + ' has been denied with the reason: ' + reason); 
        
    }

    // adds the art role to the user who has been approved.
    private addArtRole(user, msg:  Discord.Message){
        let querry = 'SELECT * FROM access WHERE accessLVL = ?';
        this.db.get(querry, "art", (err, row) => {
            if (err) { 
                console.log(err);
                return;
            }
            if (row === undefined){
                msg.channel.send('There is no art role set. Use *!setart [role]* to set role');
            }
            if (row) {
                    let role = row.role;
                    user.roles.add(role);
                    user.send('Your art application has been approved');
                    msg.channel.send("user: " + user + " has been approved for art.");
			  
            }
        }) 

    }
        
}

