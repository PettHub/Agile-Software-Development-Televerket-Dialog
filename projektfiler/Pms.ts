import Discord from 'discord.js';
import { setChannel } from './setChannel';

export class PMHandler {
    
    
    
    constructor() {
    }

    public doIt(firstmessage: Discord.Message, author: Discord.User, client: Discord.Client): void {
        //let guild = client.guilds.cache.get('823518625062977626'); //idk

        var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        var regex = new RegExp(expression);

        let repostChannel;
        repostChannel = client.channels.cache.get(setChannel.getOutputChannel());
        if(repostChannel === undefined) {
            firstmessage.channel.send('No !art apply receiver channel has been set.') //ev. kan man @:a moderators här
            console.log('repostChannel is undefined');
            return;
        }
        
        if(firstmessage.member.roles.cache.has('836598304140820500') ){ //checks if author already is Artist, if so they cannot apply again
            author.send('You already have the Artist role and can therefore not apply for it.');
        }
        else{
            let listener = message => { //saves listener to be able to remove it when it is done
                if (author === message.author && message.channel.type === 'dm') {   //checks that author is correct and that the message was sent in DM    
                
                let messageContent = message.content.split(/\n| /gm);//messageContent is an array of message content separated by spaces or newlines
                messageContent.forEach(function (content) {
                    if(content.match(regex)){ //checks that content is a link, if so add to images-array
                    numberOfImages--;    //if attachment exists, decrament remaining
                    images[numberOfImages] = content; //get the url from the attachments (what an image would be in a message)
                        if (numberOfImages === 0) {
                            clearTimeout(timeout);  //once we have 3, stop the clock
                            images.forEach(function (image) {
                            repostChannel.send(image + ' has been sent by user: ' + author.id); //print the image in the channel along with user id
                        })
                        author.send('Your application has been sent, you will get a response within 24 hours.'); //notify applicant that application has been sent
                        client.removeListener('message', listener); //remove the listener from memory
                    }
                }
                })
            }
        }             
        author.send('Please send 3 images (as attachements and/or links), you have 5 minutes. Separate links with spaces or newlines. If you send more than three images/links the first three will be registered.'); //send initial message asking for images. Could include rules if Matt has some.
        let timeout = setTimeout(function () { author.send('Timed out, please'); client.removeListener('message', listener); }, 1000 * 60 * 5); //create a timeout to relieve the bot in case of spam
        let numberOfImages = 3;
        
        
        //repostChannel = client.channels.cache.get('826895001446645800'); //this is the channel id of the channel we want the application to be sent to, should be a enviromental variable or a variable that can be changed during runtime
        
        //guild.channels.get('826895001446645800') ???
        
        let images: string[];
        images = [null, null, null]; //make an array of size 3
        client.on('message', listener); //add listener

    }
    }
}