import Discord from 'discord.js';

export class PMHandler {
    constructor(){
        
    }
    doIt(author : Discord.User, client : Discord.Client){

        let listener = message => { //saves listener to be able to remove it when it is done
            if (author === message.author){
                var Attachment = message.attachments.array(); //turns the attachments from the message into an array
                Attachment.forEach(function(attachment){
                    messagesRemaining--;    //if attachment exists, decrament remaining
                    images[messagesRemaining] = attachment.url; //get the url from the attachments (what an image would be in a message)
                    if (messagesRemaining === 0){
                        clearTimeout(timeout);  //once we have 3, stop the clock
                        images.forEach(function(image){
                            repostChannel.send(image + ' user: ' + author.id); //print the image in the channel along with user id
                        })
                        author.send('Your application has been sent, you will get a response within 24 hours.'); //notify applicant that application has been sent
                        client.removeListener('message', listener); //remove the listener from memory
                    }
                })
            }
        }

        author.send('Please send 3 images, you have 5 minutes'); //send initial message asking for images
        let timeout = setTimeout(function(){author.send('Timed out, please'); client.removeListener('message', listener);}, 1000*60*5); //create a timeout to relieve the bot in case of spam
        let messagesRemaining: number = 3;  //amount of images we want
        let repostChannel;
        repostChannel = client.channels.cache.get('826895001446645800'); //this is the channel id of the channel we want the application to be sent to, should be a enviromental variable or a variable that can be changed during runtime
        let images : string[];
        images = [null, null, null]; //make an array of size 3
        client.on('message', listener); //add listener

    }
    

}