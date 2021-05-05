import sqlite from "sqlite3";
sqlite.verbose();

export class DatabaseFunctions {
    db: sqlite.Database;
    name: string = "database.db";
    private static me: DatabaseFunctions;

    private constructor() {
        new sqlite.Database(
            this.name,
            sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE
        );
        this.db = new sqlite.Database(this.name, sqlite.OPEN_READWRITE);
    }

    public static getInstance(): DatabaseFunctions {
        if (this.me) {
            return this.me;
        } else {
            this.me = new DatabaseFunctions();
            this.me.db.get("PRAGMA foreign_keys = ON");
            this.me.db.on("error", function (error) {
                console.log("Getting an error : ", error);
            });
            return this.me;
        }
    }
}
