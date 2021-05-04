import Discord from 'discord.js';
import { DatabaseFunctions } from "./DatabaseFunctions";
import { GlobalFunctions } from "./GlobalFunctions";

export class ArtDecision {
    db
    
    constructor(){
        this.db = DatabaseFunctions.getInstance().db;
        DatabaseFunctions.getInstance().db.run(
            "CREATE TABLE IF NOT EXISTS artrole(accessLVL TEXT NOT NULL, role TEXT NOT NULL)"
        );

    }


    doIt(message: Discord.Message, args, sub): void {
        message.guild.members.fetch(GlobalFunctions.toId(args.shift())).catch(e => {
            message.channel.send('please provide a valid username');
        }).then((user) =>{
            user 
                ? this.switch(message, args, sub, user)
                : console.log('error');
        });
        
    }

    private switch(message, args, sub, user){
        switch (sub) {
            case 'accept':
                this.addArtRole(user, message);
                break;
        case 'deny':
            let reason: string = args[0];
            while (args.shift() && args[0]) {
                reason = reason + ' ' + args[0];
            }
            
            message.channel.send(user + ' ' + reason);
            this.deny(user, reason, message);
            break;
    }
    }

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
                    .db.prepare(
                        "INSERT INTO artrole(accessLVL, role) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM artrole WHERE accessLVL =? AND role =?);"
                    )
                    .run("art", command, "art", command); //Adds the owner status for the specified role
                message.channel.send("OK");
            
        }
    }

    private deny(user, reason:string , message: Discord.Message) {
        user.send('Your art application has been rejected for the following reason\n' + reason)
        message.channel.send('User:' + user + ' has been denied by:' + message.author.username + ' with the reason: ' + reason);
        
    }

    private addArtRole(user, msg:  Discord.Message){
        console.log('a');
        let querry = 'SELECT * FROM artrole WHERE accessLVL = ?';
        this.db.get(querry, "art", (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!(row === undefined)) {
                    let role = row.role;
                    user.roles.add(role);
                    msg.channel.send("user: " + user + " has been approved for art.")
			  //do stuff
            }
        }) 

    }
        
    }

