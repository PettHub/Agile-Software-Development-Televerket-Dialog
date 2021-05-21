import { DatabaseFunctions } from './DatabaseFunctions';
import Discord from 'discord.js';
import { TextChannel } from 'discord.js';
import { GlobalFunctions } from './GlobalFunctions';

export class setChannel {

    async doIt(message: Discord.Message, newChannel: string, client: Discord.Client): Promise<void> {

        if (newChannel === undefined) {
            message.reply('you need to provide a channel to set as art channel.');
            return;
        }
        newChannel = GlobalFunctions.toId(newChannel);
        if (message.guild.channels.cache.get(newChannel) === undefined) { //if input channel is undefined (e.g. not in guild/incorrect input)
            message.reply('incorrect channel ID (possible causes: channel not on server, or misspelled ID). Please try again.');
            return;
        }
        if (!(client.channels.cache.get(newChannel) instanceof TextChannel)) {
            message.reply('the input channel is not a text channel. Please try again using a text channel ID.');
            return;
        }


        try {
            await (client.channels.cache.get(newChannel) as TextChannel).send('This channel has been set as !art apply receiver channel.');
            DatabaseFunctions.getInstance()
                .prepare(
                    "DELETE FROM Artchannel"
                )
                .run();
            DatabaseFunctions.getInstance().prepare(
                "INSERT INTO ArtChannel VALUES(?);"
            )
                .run(newChannel);
        } catch {
            message.reply("the bot does not have access to that channel.")
        }
    }

    public static getValue(): Promise<string> {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM ArtChannel";
            DatabaseFunctions.getInstance().get(query, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                row ? resolve(row.artchannel) : resolve(undefined);
            });
        });
    }

}
