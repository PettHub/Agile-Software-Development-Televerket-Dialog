import Discord from "discord.js";
import { DatabaseFunctions } from "./DatabaseFunctions";
import sqlite from "sqlite3";
sqlite.verbose();

export class sayTest {
    doIt(message: Discord.Message, args: any): void {
        let data = DatabaseFunctions.getInstance();
        if (data) {
            console.log("nice");
        }
        let db = DatabaseFunctions.getInstance().db;
        db.run(
            "CREATE TABLE IF NOT EXISTS data(user INTEGER PRIMARY KEY, said TEXT NOT NULL)"
        );

        let querry = "SELECT * FROM data WHERE user = ?";
        let msg: string;
        db.get(querry, message.author.id, (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row === undefined) {
                let insertdata = db.prepare("INSERT INTO data VALUES (?,?)");
                if ((msg = args.shift())) {
                    insertdata.run(message.author.id, msg);
                } else {
                    insertdata.run(message.author.id, "nothing so far");
                }

                insertdata.finalize();
                console.log("data logged");
                console.log(message.author.id);
                console.log(row);
                return;
            } else {
                if ((msg = args.shift())) {
                    let insertdata = db.prepare("UPDATE data SET said =? WHERE user =?");
                    insertdata.run(msg, message.author.id);
                    insertdata.finalize();
                    //db.close();
                    console.log("data logged");
                    return;
                } else {
                    let said2 = row.said;
                    console.log(said2);
                    message.channel.send(said2);
                }
                // let user2 = row.user;
            }
        });
    }
}
