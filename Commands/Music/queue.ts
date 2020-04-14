import Command from '../../Classes/Command';
import Neptune from '../../Classes/Neptune';

import path from 'path';
import {
    Message,
    MessageEmbed,
	StreamDispatcher
} from 'discord.js';
import Util from '../../Classes/Util';
import he from 'he'

const mf = (arg: string, flag: string) => {
    // Matches flag or -flag
    let reg = new RegExp(`(^${flag}$)|(^-${flag}$)`, 'gim');
	
    return reg.test(arg);
};

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
		let vc = msg.guild.me.voice.connection;

		// Send help
		if (!args[0])
			return;

        // Setup flags
        let flag = args[0];
        args = args.slice(1);

        // Handle different flags
        switch(true) {

			// ---------------------------------------------------------------------------

            // Shows the queue
            case mf(flag, 'sq'):
            case mf(flag, 'show'):
            case mf(flag, 'list'):
			case mf(flag, 'ls'):
			case mf(flag, 'li'):
                // Handle empty queue
                if (q.length <= 0)
                    return util.embed(`<a:WhereTf:539164678480199720> *You can't list something if there's nothing to list!*`);
                
                let formated_quque = q.map((i, index) => `${index + 1}) [${he.decode(i.video.title)}](${i.video.url}) **[<@${i.author}>]**`);

                util.embed(`<:Fish:390652481404796928> | Current Queue\n${formated_quque.join('\n')}`);
			break;
			
			// ---------------------------------------------------------------------------

			// Clears the queue
			case mf(flag, 'cq'):
			case mf(flag, 'clear'):
			case mf(flag, 'wipe'):
			case mf(flag, 'purge'):
			case mf(flag, 'qc'):
				// Handle permissions
				if (msg.author.id != q[0].author && !msg.member.hasPermission('ADMINISTRATOR') && !util.find_role('NeptuneDJ') && msg.author.id != nep.config.discord.owner_id)
					return util.embed(`:x: | You can only do this if you:\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\``);
				// Check if queue has items
				else if (!q)
					return util.embed(`:x: | There's **nothing to remove**, add something with \`${nep.prefix}play\`!`);
				// If playing, clear everything but first item
				else if (vc) {
					// Clear the queue except first item
					util.update_queue([q.shift()]);

					util.embed(`⛔ | Queue has been **cleared** by **[${msg.author}]**!`);
				}
				// If not playing, remove everything
				else {
					util.update_queue([]);
					util.embed(`⛔ | Queue has been **cleared** by **[${msg.author}]**!`);
				}
			break;

			// ---------------------------------------------------------------------------

			// Removes an item from the queue
			case mf(flag, 'rm'):
			case mf(flag, 'remove'):
			case mf(flag, 'delete'):
			case mf(flag, 'del'):
				let rm = args[0];

				// Make sure queue exists
				if (!q)
					return util.embed(`:x: | There's **nothing to remove**, add something with \`${nep.prefix}play\`!`);
				// Make sure argument is provided
				else if (!rm)
					return util.embed(`:x: | What do you **want to remove**? To see, do \`${nep.prefix}queue show\`!`);	
				// Validate argument
				else if (!parseInt(rm))
					return util.embed(`:x: | Something's telling me that \`${util.parse_args(rm)}\` is not a **valid number**!`);
				// Make sure item exists
				else if (!q[parseInt(rm) - 1])
					return util.embed(`:x: | \`${util.parse_args(rm)}\` **doesn't exist** in the queue! To see, do \`${nep.prefix}queue show\`!`); 
				// Permissions
				else if (msg.author.id != q[parseInt(rm) - 1].author && !msg.member.hasPermission('ADMINISTRATOR') && !util.find_role('NeptuneDJ') && msg.author.id != nep.config.discord.owner_id)
					return util.embed(`:x: | You can only remove if you:\n- \`Queued the item\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\``);
				// Handle removing playing item
				else if (vc && parseInt(rm) - 1 == 0) {
					util.embed(`❎ | [${he.decode(q[parseInt(rm) - 1].video.title)}](${q[parseInt(rm) - 1].video.url}) has been removed by **[${msg.author}]**! 1`);

					let dispatcher: StreamDispatcher = (vc.player as any).dispatcher;
					
					if (dispatcher.paused) dispatcher.resume();
					if (!dispatcher) return;

					return dispatcher.end();
				} else {
					util.embed(`❎ | [${he.decode(q[parseInt(rm) - 1].video.title)}](${q[parseInt(rm) - 1].video.url}) has been removed by **[${msg.author}]**! 2`);

					// Remove item
					q.splice(parseInt(rm) - 1, 1);
					util.update_queue(q);
				}
			break;
        }

    }

}