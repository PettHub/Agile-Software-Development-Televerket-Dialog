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
        this.createTables();
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

    private createTables() {
        this.db.run(
            "CREATE TABLE IF NOT EXISTS Access(accessLVL TEXT NOT NULL, role TEXT NOT NULL)"
        ); //Creates a table for TestAccess

        this.db.run(
            "CREATE TABLE IF NOT EXISTS ArtChannel(artchannel CHAR(18) PRIMARY KEY)"
        ); //Creates a table for artchannel

        this.db.run(
            "CREATE TABLE IF NOT EXISTS Sections(section TEXT PRIMARY KEY)"
        ); //Creates a table for Sections 

        this.db.run(
            "CREATE TABLE IF NOT EXISTS Users(user CHAR(20) PRIMARY KEY)"
        ); //Creates a table for Users

        this.db.run(
            "CREATE TABLE IF NOT EXISTS Nominations(user CHAR(20) NOT NULL, section TEXT NOT NULL, FOREIGN KEY(user) REFERENCES Users(user) ON DELETE CASCADE, FOREIGN KEY(section) REFERENCES Sections(section) ON DELETE CASCADE,PRIMARY KEY(user, section))"
        ); //Creates a table for Nominations

        this.db.run(
            "CREATE TABLE IF NOT EXISTS Votes(id INTEGER, stamp TIMESTAMP NOT NULL, voter CHAR(20) NOT NULL, votee CHAR(20) NOT NULL, section TEXT NOT NULL, FOREIGN KEY (votee, section) REFERENCES Nominations(user, section) ON DELETE CASCADE, FOREIGN KEY(voter) REFERENCES Users(user) ON DELETE CASCADE,PRIMARY KEY(id AUTOINCREMENT))"
        ); //Creates a table for Votes
    }
}


