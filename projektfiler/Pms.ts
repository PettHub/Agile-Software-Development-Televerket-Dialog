import Discord from "discord.js";
import { setChannel } from "./setArtChannel";
import { DatabaseFunctions } from "./DatabaseFunctions";

export class PMHandler {
    constructor() { }

    public doIt(
        firstmessage: Discord.Message,
        author: Discord.User,
        client: Discord.Client
    ): void {
        var expression =
            /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        var regex = new RegExp(expression);

        let repostChannel;
        setChannel.getValue().then(async (res) => {
            repostChannel = client.channels.cache.get(res);

            if (repostChannel === undefined) {
                firstmessage.reply(
                    "application not possible. No !art apply receiver channel has been set."
                ); //ev. kan man @:a moderators här
                return;
            }

            let art = await this.getrole();
            if (firstmessage.member.roles.cache.has(art)) {
                //checks if author already is Artist, if so they cannot apply again
                author.send(
                    "you already have the Artist role and can therefore not apply for it."
                );
            } else {
                let listener = (message) => {
                    //saves listener to be able to remove it when it is done
                    if (
                        author === message.author &&
                        message.channel.type === "dm"
                    ) {
                        //checks that author is correct and that the message was sent in DM

                        let messageContent = message.content.split(/\n| /gm); //messageContent is an array of message content separated by spaces or newlines
                        messageContent.forEach(function (content) {
                            if (content.match(regex)) {
                                //checks that content is a link, if so add to images-array
                                numberOfImages--; //if attachment exists, decrament remaining
                                images[numberOfImages] = content; //get the url from the attachments (what an image would be in a message)
                            } else if (message.attachments) {
                                message.attachments.forEach((attachment) => {
                                    numberOfImages--;
                                    let image = attachment.proxyURL;
                                    images[numberOfImages] = image;
                                });
                                // numberOfImages--;
                                // images[numberOfImages] = message.attachments;
                            }
                            if (numberOfImages === 0) {
                                clearTimeout(timeout); //once we have 3, stop the clock
                                let i: number = 0;
                                images.forEach(function (image) {
                                    i++;
                                    let embed = new Discord.MessageEmbed();
                                    embed
                                        .setColor("#F1EDE2")
                                        .setTitle("image" + i)
                                        .setAuthor(author.username)
                                        .setDescription(author.id)
                                        .setThumbnail(author.avatarURL())
                                        .setImage(image)
                                        .setTimestamp()
                                        .setURL(image);

                                    repostChannel.send(embed);
                                    //repostChannel.send(image + ' has been sent by user: ' + author.id); //print the image in the channel along with user id
                                });
                                author.send(
                                    "Your application has been sent, you will get a response within 24 hours."
                                ); //notify applicant that application has been sent
                                client.removeListener("message", listener); //remove the listener from memory
                            }
                        });
                    }
                };
                author.send(
                    "Please send 3 images (as attachements and/or links), you have 15 minutes. Separate links with spaces or newlines. If you send more than three images/links the first three will be registered."
                ); //send initial message asking for images. Could include rules if Matt has some.
                let timeout = setTimeout(function () {
                    author.send("Timed out. Please start a new application if you wish to apply.");
                    client.removeListener("message", listener);
                }, 1000 * 60 * 15); //create a timeout to relieve the bot in case of spam
                let numberOfImages = 3;

                let images: string[];
                images = [null, null, null]; //make an array of size 3
                client.on("message", listener); //add listener
            }
        });
    }

    private getrole(): Promise<string> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM access WHERE accessLVL =?";
            DatabaseFunctions.getInstance().get(query, "art", (err, row) => {
                if (err) {
                    console.log(err);
                    reject(undefined);
                }
                row ? resolve(row.role) : resolve(undefined);
            });
        });
    }
}
