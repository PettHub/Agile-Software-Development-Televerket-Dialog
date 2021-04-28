import { CommandAddSection } from './CommandAddSection';
import Discord from 'discord.js';
export class Nominator {
    static sectionsForUser: Map<string, Set<string>> = new Map();
    static usersForSection: Map<string, Set<string>> = new Map();
    static usersThatHaveNominated: Map<string, number> = new Map();
    outputChannel: any;
    client: Discord.Client;
    timeout: NodeJS.Timeout;
    constructor(client: Discord.Client) {
        this.client = client;
        this.outputChannel = client.channels.cache.get('826895001446645800'); //settings for changings outputchannel should be implemented later along with pms
    }

    doIt(args: string[], message: Discord.Message): void {
        if (Nominator.usersThatHaveNominated.get(message.author.id))
            if (Date.now() - Nominator.usersThatHaveNominated.get(message.author.id) < 1000 * 60 * 60 * 24) {
                console.log('user has already nominated someone');
                return;
            }
        let nominee = args[0];
        let section = args[1];
        if (message.author.id.toString() === nominee) return;
        if (!(args.shift() && args.shift())) {
            message.channel.send('!nominate [member] [section]');
            return;
        }
        if (this.nominate(nominee, section)) {
            Nominator.usersThatHaveNominated.set(message.author.id, Date.now());
            message.channel.send('nomination has been registered, type !nominations [section] too see all nominations');
        }
    }

    nominate(user: string, section: string): boolean {
        if (!CommandAddSection.sectionList.has(section)) {
            console.log('section does not exist'); //section has not been created or at least does not exist in sectionlist
            return false;
        }
        let guild = this.client.guilds.cache.get('823518625062977626');
        if (!guild.member(user)) {
            console.log('user not in server');
            return false;
        }
        if (!Nominator.sectionsForUser.get(user))
            Nominator.sectionsForUser.set(user, new Set());
        if (!Nominator.usersForSection.get(section))
            Nominator.usersForSection.set(section, new Set());
        if (Nominator.usersForSection.get(section).has(user)) {
            console.log('this person is already nominated');
            return false; //this does not need to be checked in the other map since they both get updated with the same data. Possible bad practice
        }
        Nominator.usersForSection.get(section).add(user);
        Nominator.sectionsForUser.get(user).add(section);
        return true;
    }

}