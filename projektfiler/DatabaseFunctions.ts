import Discord from 'discord.js';
import sqlite from 'sqlite3';
sqlite.verbose();

export class DatabaseFunctions {
    db;
    name : string = 'database.db';
    private static me : DatabaseFunctions;

    private constructor() {
    new sqlite.Database(this.name, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
    this.db = new sqlite.Database(this.name, sqlite.OPEN_READWRITE);
    }

    public static getInstance(): DatabaseFunctions{
        if (this.me){
            return this.me;
        } else {
            this.me = new DatabaseFunctions();
            return this.me;
        }
    }

    get(): any{
        
    }

    set(table : string, key : any, args : string[]): boolean{
        
        return false;
    }

    addTable(table : string, args : string): void{
        let db = new sqlite.Database(this.name, sqlite.OPEN_READWRITE);
        db.run(`CREATE TABLE IF NOT EXISTS ${table}(${args})`);
        console.log('hi');
    }
    
    doIt(message: Discord.Message): void {
        message.channel.send('pong!');
    }
}