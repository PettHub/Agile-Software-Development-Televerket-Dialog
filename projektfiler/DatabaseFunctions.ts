import sqlite from 'sqlite3';
sqlite.verbose();

export class DatabaseFunctions {
    db: sqlite.Database;
    private static me: DatabaseFunctions;

    private constructor() {
        this.db = new sqlite.Database('database.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
    }

    public static getInstance(): DatabaseFunctions {
        if (!this.me) this.me = new DatabaseFunctions();
        return this.me;
    }
}