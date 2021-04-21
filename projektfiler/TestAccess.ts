import Discord from 'discord.js';

export class TestAccess {
    

    doIt(message : Discord.Message, args : string){
        let modlist : Array<string>;        
    
       // if (args.){
         //   if (modlist.contains(author)){
           //     return true;
            //}
        //else {
          //  return false;
        //}
        //}

        const command = args.shift().toLowerCase();

        switch (command){
            case 'mod':
                if(modlist.contains());
                break;
            case 'cool':
                message.channel.send('me');
                break;
        }


    }
}