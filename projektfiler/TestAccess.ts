import Discord from "discord.js";
import { DatabaseFunctions } from "./DatabaseFunctions";

export class TestAccess {
    constructor(role: string) {
        //DatabaseFunctions.getInstance().addTable('access','AccessLVL TEXT NOT NULL, role TEXT NOT NULL');
        let db = DatabaseFunctions.getInstance().db;
        db.run(
            "CREATE TABLE IF NOT EXISTS access(accessLVL TEXT NOT NULL, role TEXT NOT NULL)"
        );
    }

    public async doIt(
        message: Discord.Message,
        accessLevel: string
    ): Promise<boolean> {
        // let modlist : Set<string>;

        switch (accessLevel) {
            case "mod":
                return (
                    message.author.id === message.member.guild.ownerID ||
                    (await this.isModdb(message)) ||
                    (await this.isOwner(message))
                );
            case "owner":
                return (
                    message.author.id === message.member.guild.ownerID ||
                    (await this.isOwner(message))
                );
            case "gowner":
                return message.author.id === message.member.guild.ownerID;
            case "member":
                return true;
            default:
                return false;
        }
    }

    public async setMod(
        message: Discord.Message,
        command: string
    ): Promise<void> {
        if (!command) {
            message.channel.send("please provide a role");
        } else {
            if (await this.doIt(message, "owner")) {
                let db = DatabaseFunctions.getInstance().db;
                let insert = db.prepare(
                    "INSERT INTO access(accessLVL,role) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM access WHERE accessLVL =? AND role =?);"
                );
                insert.run("mod", command, "mod", command);
                message.channel.send("OK");
            } else {
                message.channel.send("Must be owner");
            }
        }
    }

    public async unMod(
        message: Discord.Message,
        command: string
    ): Promise<void> {
        if (!command) {
            message.channel.send("please provide a role");
        } else {
            if (await this.doIt(message, "owner")) {
                let db = DatabaseFunctions.getInstance().db;
                let insert = db.prepare(
                    "DELETE FROM access WHERE accessLVL =? AND role =?"
                );
                insert.run("mod", command);
                message.channel.send("OK");
            } else {
                message.channel.send("Must be owner");
            }
        }
    }

    public async setOwner(
        message: Discord.Message,
        command: string
    ): Promise<void> {
        if (!command) {
            message.channel.send("please provide a role");
        } else {
            if (await this.doIt(message, "gowner")) {
                let db = DatabaseFunctions.getInstance().db;
                let remove = db.prepare(
                    "DELETE FROM access WHERE accessLVL =?"
                );
                remove.run("owner");
                let insert = db.prepare(
                    "INSERT INTO access(accessLVL,role) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM access WHERE accessLVL =? AND role =?);"
                );
                insert.run("owner", command, "owner", command);
                message.channel.send("OK");
            } else {
                message.channel.send("Must be owner");
            }
        }
    }

    private isModdb(message: Discord.Message): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let querry = "SELECT * FROM access WHERE accessLVL = ?";
            let db = DatabaseFunctions.getInstance().db;
            let value: boolean = false;
            // let i: number = 0;

            db.all(querry, "mod", (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                row?.forEach((element) => {
                    console.log(element.role);
                    if (message.member.roles.cache.has(element.role)) {
                        console.log(element.role);
                        value = true;
                        return;
                    }
                });
                resolve(value);
            });
        });
    }

    private isOwner(message: Discord.Message): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let querry = "SELECT * FROM access WHERE accessLVL = ?";
            let db = DatabaseFunctions.getInstance().db;
            let value: boolean = false;
            // let i: number = 0;

            db.all(querry, "owner", (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                row?.forEach((element) => {
                    console.log(element.role);
                    if (message.member.roles.cache.has(element.role)) {
                        console.log(element.role);
                        value = true;
                        return;
                    }
                });
                resolve(value);
            });
        });
    }
}
