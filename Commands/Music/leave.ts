import Command from '../../Classes/Command';
import Neptune from '../../Classes/Neptune';

import path from 'path';
import {
    Message,
    MessageEmbed
} from 'discord.js';
import Util from '../../Classes/Util';

export default class Cmd extends Command {
    constructor(nep: Neptune) {
        let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

        super(nep, {
            name: path.basename(__filename, '.ts'),
            help: `Leaves a voice channel.`,
            long_help: `Leaves the voice channel bot is currently in.`,
            usage: [`- ${cmd}`],
            examples: [`- ${cmd}`],
            category: path.dirname(__filename).split(path.sep).pop(),
            cooldown: 1e3,
            aliases: ['getout', 'fuckoff', 'disconnect', 'goaway', 'cya', 'bye', 'dc'],
            locked: false,
            allow_dm: false
        });
    }

    public async run(msg: Message, args: any[], util: Util, nep: Neptune) {
        let vc = msg.guild.me.voice;

        // Not in voice channel
        if (!vc.connection)
            return util.embed(`:x: | I'm **not in a voice channel**, go away!`);
        // Permissions
        if (!(!msg.member.hasPermission('ADMINISTRATOR') && !util.find_role('NeptuneDJ') && msg.author.id != nep.config.discord.owner_id))
            return util.embed(`:x: | You can only do this if you:\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\``);
        
        // Disconnect
        util.embed(`<a:WhenGifGetsAtYou:527560313655001088> | Left voice channel \`${vc.channel.name}\`, cya! **[${msg.author}]**`);
        vc.channel.leave();
    }

}