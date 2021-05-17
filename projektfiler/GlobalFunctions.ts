import Discord from "discord.js";

export class GlobalFunctions {
    public static toId(command: string): string {
        if (command.indexOf("!") === 2 && command.indexOf("@") === 1) {
            command = command.substring(3, command.length - 1);
        } else if (command.indexOf("@") === 1) {
            command = command.substring(2, command.length - 1);
        } else if (command.indexOf("#") == 1) {
            command = command.substring(2, command.length - 1);
        }
        return command;
    }

    public static async idToUsername(
        message: Discord.Message,
        id: string
    ): Promise<Discord.User> {
        return (await message.guild.members.fetch(id)).user;
    }

    public static async idToUsernameClient(
        client: Discord.Client,
        id: string
    ): Promise<Discord.User> {
        return client.users.fetch(id);
    }

    public static messageIsDirectMessage(message: Discord.Message): boolean {
        return message.guild === null;
    }
}
