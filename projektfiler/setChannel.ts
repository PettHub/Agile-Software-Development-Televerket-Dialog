import { DatabaseFunctions } from './DatabaseFunctions';
import Discord from 'discord.js';
import { TextChannel } from 'discord.js';

export class setChannel {

    doIt(message: Discord.Message, newChannel: string, client: Discord.Client): void {

        if (message.guild.channels.cache.get(newChannel) === undefined) { //if input channel is undefined (e.g. not in guild/incorrect input)
            message.channel.send('Incorrect channel ID (possible causes: channel not on server, or misspelled ID). Please try again.');
            return;
        }

        if (client.channels.cache.get(newChannel).type === 'text') { //checks if the new channel is a textchannel
            let tmp: string;
            setChannel.getValue().then((res) => {
                tmp = res;
            });
            DatabaseFunctions.getInstance()
                .db.prepare(
                    "DELETE FROM Artchannel"
                )
                .run();
            DatabaseFunctions.getInstance()
                .db.prepare(
                    "INSERT INTO ArtChannel VALUES(?);"
                )
                .run(newChannel);

            setChannel.getValue().then((res) => {
                (client.channels.cache.get(res) as TextChannel).send('This channel has been set as !art apply receiver channel.').catch(e => {
                    DatabaseFunctions.getInstance().db.prepare(
                        "INSERT INTO ArtChannel VALUES(?);"
                    )
                        .run(tmp);
                    message.channel.send('Error! Possible cause: bot does not have access to the input channel. Please try again with a new ID or after giving bot access.');
                });
            });

        } else {
            message.channel.send('The input channel is not a text channel. Please try again using a text channel ID.');
        }
    }

    public static getValue(): Promise<string> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM ArtChannel";
            DatabaseFunctions.getInstance().db.get(query, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                row ? resolve(row.artchannel) : resolve(undefined);
            });
        });
    }

} //class end
