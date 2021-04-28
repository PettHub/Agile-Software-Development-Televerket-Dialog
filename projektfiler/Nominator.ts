import { CommandAddSection } from './CommandAddSection';
import Discord from 'discord.js';
export class Nominator {
    sectionsForUser: Map<string, Set<string>>;
    usersForSection: Map<string, Set<string>>;
    usersThatHaveNominated: Set<Discord.User>;
    outputChannel: any;
    client: Discord.Client;
    timeout: NodeJS.Timeout;
    constructor(client: Discord.Client) {
        this.sectionsForUser = new Map();
        this.usersForSection = new Map();
        this.usersThatHaveNominated = new Set();
        this.client = client;
        this.outputChannel = client.channels.cache.get('826895001446645800'); //settings for changings outputchannel should be implemented later along with pms
        this.startTimer();
    }

    private startTimer(): void {
        let outputChannel = this.outputChannel;
        let usersThatHaveNominated = this.usersThatHaveNominated;                                                           //  ms     s    m    h
        this.timeout = setTimeout(function () { outputChannel.send('nominations have closed'); usersThatHaveNominated.clear(); }, 1000 * 60 * 60 * 24); //this should reset the set of users that have voted 24 hours after the first one voted
    }

    doIt(args: string[], message: Discord.Message): void {
        if (this.usersThatHaveNominated.size == 0) this.startTimer();
        if (this.usersThatHaveNominated.has(message.author)) return;
        let nominee = args[0];
        let section = args[1];
        if (message.author.id.toString() === nominee) return;
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
        if (!CommandAddSection.sectionList.has(section)) {
            console.log('section does not exist'); //section has not been created or at least does not exist in sectionlist
            return false;
        }
        /* //this does not return the expected set, it is therefore not used. Please be aware
        if (!this.client.users.cache.has(user)) {
            console.log('user not in server');
            return false;
        }*/
        if (!this.sectionsForUser.get(user))
            this.sectionsForUser.set(user, new Set());
        if (!this.usersForSection.get(section))
            this.usersForSection.set(section, new Set());
        if (this.usersForSection.get(section).has(user)) {
            console.log('this person is already nominated'); //user already voted in the latest 24 hour cycle
            return false; //this does not need to be checked in the other map since they both get updated with the same data. Possible bad practice
        }
        this.usersForSection.get(section).add(user);
        this.sectionsForUser.get(user).add(section);
        return true;
    }

    getUsersForSection(): Map<string, Set<string>> {
        return this.usersForSection;
    }

    getSectionsForUser(): Map<string, Set<string>> {
        return this.sectionsForUser;
    }
}