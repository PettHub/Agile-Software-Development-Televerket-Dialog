import Discord from "discord.js";

export class GlobalFunctions {

    public static toId(command: string): string {
        if (command.indexOf("@") == 1) {
            command = command.substring(3, command.length - 1);
        } else if (command.indexOf("#") == 1) {
            command = command.substring(2, command.length - 1);
        }
        return command;
    }

    public static async idToUsername(message: Discord.Message, id: string): Promise<Discord.User> {
        return (await message.guild.members.fetch(id)).user;
    }
}