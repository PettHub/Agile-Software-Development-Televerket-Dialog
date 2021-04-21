import Discord from 'discord.js';

export class TestAccess {
    mod : string;

    constructor(role : string){
        this.mod = role;
    }

    doIt(message : Discord.Message, accessLevel : string){
       // let modlist : Array<string>;        
    
       switch (accessLevel){
        case 'mod':
            if (message.author.id === message.member.guild.ownerID || message.author.id === this.mod){
                return true;
            }
            else{
                return false;
            }
            break;
        case 'owner':
            if (message.author.id === message.member.guild.ownerID){
                return true;
            }
            else{
                return false;
            }
            break;
        case 'member':
            return true;
            break;
       
        }
        return false;
    }

    setMod(message : Discord.Message, command){
        console.log(command);
        if (this.doIt(message, 'owner')){
            this.mod = command;
            message.channel.send('OK');
        }
        else{
            message.channel.send('Must be owner');
        }
    }
}