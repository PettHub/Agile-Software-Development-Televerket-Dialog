import Discord from 'discord.js';

export class TestAccess {
    mod : string;
    modset = new Set();

    constructor(role : string){
        this.modset.add(role);
    }

    doIt(message : Discord.Message, accessLevel : string){
       // let modlist : Array<string>;        
    this.isMod(message);
       switch (accessLevel){
        case 'mod':
            if (message.author.id === message.member.guild.ownerID || this.isMod(message)){
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
        if (this.doIt(message, 'owner')){
            this.modset.add(command);
            message.channel.send('OK');
        }
        else{
            message.channel.send('Must be owner');
        }
    }

    isMod(message : Discord.Message){
        let value : boolean = false;
        this.modset.forEach(function(role : any){
            if(message.member.roles.cache.has(role)){
                value = true;
            };
            
            });
            return value;
    }
}

