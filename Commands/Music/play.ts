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
            help: `Play the queue or song.`,
            long_help: `Plays the current queue or plays a link or search term.`,
            usage: [`- ${cmd} [Search/Link]`],
            examples: [`- ${cmd}`, `- ${cmd} fallen kingdom`, `-${cmd} https://www.youtube.com/watch?v=dQw4w9WgXcQ`],
            category: path.dirname(__filename).split(path.sep).pop(),
            cooldown: 1e3,
            aliases: ['p'],
            locked: false,
            allow_dm: false
        });
    }

    public async run(msg: Message, args: any[], util: Util, nep: Neptune) {
        let queue = await util.get_queue(msg.guild.id);

        msg.channel.send(`Queue: ${queue}`);
    }

}