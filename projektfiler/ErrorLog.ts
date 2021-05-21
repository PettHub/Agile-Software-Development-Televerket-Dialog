import Discord from "discord.js";

export class ErrorLog {
    static doIt(message: Discord.Message, error): void {
        message.channel.send("An error has occoured, devs have been contacted");
        message.guild.members.fetch("260115645696442371").then((user) => {
            user.send(
                "an error has occoured, please check the logs:\n" + error
            );
        });
        console.log(error);
    }
}
