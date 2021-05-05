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
            return this.me;
        }
    }
}
