import Command from '../../Classes/Command';
import Neptune from '../../Classes/Neptune';

import path from 'path';
import {
    Message,
    MessageEmbed
} from 'discord.js';
import Util from '../../Classes/Util';
import he from 'he'

export default class Cmd extends Command {
    constructor(nep: Neptune) {
        let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

        super(nep, {
            name: path.basename(__filename, '.ts'),
            help: `Shows and maniuplates the queue.`,
            long_help: `Allows for varies actions on the queue`,
            usage: [`- ${cmd} TOOD: Add usage`],
            examples: [`- ${cmd} TOOD: Add usage`],
            category: path.dirname(__filename).split(path.sep).pop(),
            cooldown: 1e3,
            aliases: ['q'],
            locked: false,
            allow_dm: false
        });
    }

    public async run(msg: Message, args: any[], util: Util, nep: Neptune) {
        let q = await util.get_queue(msg.guild.id);

        // Setup flags
        let flag = args[0];
        args = args.slice(flag.length);

        // Handle different flags
        switch(flag) {
            // Shows the queue
            case 'sq':
            case 'show':
            case 'list':
            case '-sq':
            case '-show':
            case '-list':
            case '-lq':
            case 'ls':
            case '-ls':
            case 'lq':
                // Handle empty queue
                if (q.length <= 0)
                    return util.embed(`<a:WhereTf:539164678480199720> *You can't list something if there's nothing to list!*`);
                
                let formated_quque = q.map((i, index) => `${index + 1}) [${he.decode(i.video.title)}](${i.video.url}) **[<@${i.author}>]**`);

                util.embed(`<:Fish:390652481404796928> | Current Queue\n${formated_quque.join('\n')}`);
            
            break;

            default:
                msg.channel.send('Flags available:\n- ls \n\nTODO: Better help')
            break;
        }

    }

}