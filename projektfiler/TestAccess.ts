import Discord from 'discord.js';
import { DatabaseFunctions } from './DatabaseFunctions';

export class TestAccess {
    modset = new Set();

    constructor(role: string) {
        this.modset.add(role);
        DatabaseFunctions.getInstance().addTable('access','AccessLVL TEXT NOT NULL, role TEXT NOT NULL');
    }

    public doIt(message: Discord.Message, accessLevel: string): boolean {
        // let modlist : Set<string>;
        this.isMod(message);
        switch (accessLevel) {
            case 'mod':
                return (message.author.id === message.member.guild.ownerID || this.isMod(message));
                break;
            case 'owner':
                return (message.author.id === message.member.guild.ownerID);
                break;
            case 'member':
                return true;
                break;
            default:
                return false;
                break;
        }
    }

    public setMod(message: Discord.Message, command: string): void {
        if (!command) {
            message.channel.send('please provide a role');
        } else {
            if (this.doIt(message, 'owner')) {
                this.modset.add(command);
                message.channel.send('OK');
            } else {
                message.channel.send('Must be owner');
            }
        }
    }

    public unMod(message: Discord.Message, command: string): void {
        if (!command) {
            message.channel.send('please provide a role');
        } else {
            if (this.doIt(message, 'owner')) {
                this.modset.delete(command);
                message.channel.send('OK');
            } else {
                message.channel.send('Must be owner');
            }
        }
    }

    private isMod(message: Discord.Message): boolean {
        let value: boolean = false;
        this.modset.forEach(function (role: any) {
            if (message.member.roles.cache.has(role)) {
                value = true;
                return;
            };

        });
        return value;
    }
}

