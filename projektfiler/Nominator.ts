import { CommandAddSection } from './CommandAddSection';
import Discord from 'discord.js';
export class Nominator {
    sectionsForUser: Map<string, Set<string>>;
    usersForSection: Map<string, Set<string>>;
    usersThatHaveNominated: Set<Discord.User>;
    client: Discord.Client;

    constructor(client: Discord.Client) {
        this.sectionsForUser = new Map();
        this.usersForSection = new Map();
        this.usersThatHaveNominated = new Set();
        this.client = client;
        this.startTimer();
    }

    private startTimer(): void { }

    doIt(args: string[], message: Discord.Message): void {
        if (this.usersThatHaveNominated.has(message.author)) return;
        let nominee = args[0];
        let section = args[1];
        if (!(args.shift() && args.shift())) {
            message.channel.send('!nominate [member] [section]');
            return;
        }
        if (message.author.id.toString() === nominee) return;
        if (this.nominate(nominee, section)) {
            this.usersThatHaveNominated.add(message.author);
            message.channel.send('nomination has been registered, type !nominations [section]');
        }
    }

    nominate(user: string, section: string): boolean {
        if (!CommandAddSection.sectionList.has(section))
            return false;
        if (!this.client.users.cache.has(user))
            return false;
        if (!this.sectionsForUser.get(user))
            this.sectionsForUser.set(user, new Set());
        if (!this.usersForSection.get(section))
            this.usersForSection.set(section, new Set());
        if (this.usersForSection.get(section).has(user))
            return false; //this does not need to be checked in the other map since they both get updated with the same data. Possible bad practice
        this.usersForSection.get(section).add(user);
        this.sectionsForUser.get(user).add(section);
        return true;
    }
}