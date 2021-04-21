import Discord from 'discord.js';

export class PMHandler {
    constructor(){
        
    }
    doIt(author : Discord.User, client : Discord.Client, guild : Discord.Guild){

        let listener = message => {
            if (author === message.author){
                var Attachment = message.attachments.array();
                Attachment.forEach(function(attachment){
                    messagesRemaining--;
                    images[messagesRemaining] = attachment.url;
                    if (messagesRemaining === 0){
                        clearTimeout(timeout);
                        images.forEach(function(image){
                            repostChannel.send(image + ' user: ' + author.id);
                        })
                        author.send('Your application has been sent, you will get a response within 24 hours.');
                        client.removeListener('message', listener);
                    }
                })
            }
        }

        author.send('Please send 3 images, you have 5 minutes');
        let timeout = setTimeout(function(){author.send('Timed out, please'); client.removeListener('message', listener);}, 1000*60*5);
        let messagesRemaining: number = 3;
        let repostChannel;
        repostChannel = client.channels.cache.get('826895001446645800');
        let images : string[];
        images = [null, null, null];
        client.on('message', listener);

    }
    

}