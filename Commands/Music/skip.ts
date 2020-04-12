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
            help: `Skips song.`,
            long_help: `Skips currently playing song.`,
            usage: [`- ${cmd}`],
            examples: [`- ${cmd}`],
            category: path.dirname(__filename).split(path.sep).pop(),
            cooldown: 3e3,
            aliases: [],
            locked: false,
            allow_dm: false
        });
    }

    public async run(msg: Message, args: any[], util: Util, nep: Neptune) {
        let q = await util.get_queue(msg.guild.id);
        let vc = msg.guild.me.voice.connection;

        // Handle empty queue
        if (q.length <= 0)
            return util.embed(`:x: | The **queue is empty**, add something with \`${nep.prefix}play Song\`.`);
        // Handle no VC
        else if (!vc)
            return util.embed(`:x: | I'm not **palying anything** go away!`);
        
        // Skip first item
        return util.embed(`⏩ | \`${he.decode(q[0].video.title)}\` has been skipped by **[${msg.author}]**!`).then(async () => {
            // Update queue
            q.shift();
			q = await util.update_queue(q);
            
			let dispatcher = (vc.player as any).dispatcher;

			if (!dispatcher) return;
			else if (dispatcher.paused) dispatcher.resume();

            return dispatcher.end();
		});

    }

}