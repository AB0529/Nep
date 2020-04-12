import Command from '../../Classes/Command';
import Neptune from '../../Classes/Neptune';

import path from 'path';
import {
    Message,
    StreamDispatcher,
    VoiceConnection
} from 'discord.js';
import Util from '../../Classes/Util';
import { Queue } from '../../types';

class VolumeBar {
	public volume: number;
	constructor(volume: number) {
		this.volume = volume || 0;
	}

	format() {
		let string = '';

		for (let i = 0; i < this.volume / 10; i++) string += '⬜';

		if (string.length !== 10) while (string.length !== 10) string += '⬛';

		return string;
	}
}


export default class Cmd extends Command {
    constructor(nep: Neptune) {
        let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

        super(nep, {
            name: path.basename(__filename, '.ts'),
            help: `Changes and shows volume.`,
            long_help: `Changes or shows currently running song's volume.`,
            usage: [`- ${cmd} [1-100]`],
            examples: [`- ${cmd}`, `- ${cmd} 69`],
            category: path.dirname(__filename).split(path.sep).pop(),
            cooldown: 3e3,
            aliases: ['vol'],
            locked: false,
            allow_dm: false
        });
    }

    public async run(msg: Message, args: any[], util: Util, nep: Neptune) {
        
        try {
            var vc: VoiceConnection = msg.guild.members.resolve(nep.user.id).voice.connection;
			var dispatcher: StreamDispatcher = (vc.player as any).dispatcher; // Dispatcher
            var q: Queue = await util.get_queue(msg.guild.id);
		} catch (err) {
			// Make sure something is playing
			return util.embed(`:x: | I'm not **playing anything**, leave me alone!`);
        }
        
        // If args don't exist, show volume of top item
        if (!args[0])
            return util.embed(`🔊 | Current volume: \`${Math.floor(q[0].volume)})/100\`\n[${new VolumeBar(Math.floor(q[0].volume)).format()}]`);
        // Make sure args is a number
        else if (!parseInt(args[0]))
            return util.embed(`:x: | Did you learn your numbers, because \`${util.parse_args(args[0])}\` isn't one of them!`); 
        // Make sure volume doesn't go below 0
        else if (parseInt(args[0]) <= 0) 
            args[0] = 1;
        
        // Change volume
        util.embed(`🎧 | Okay, the volume is now \`${Math.floor(args[0])}\`!\n[${new VolumeBar(Math.floor(args[0])).format()}]`);

        q[0].volume = parseInt(args[0]);
        dispatcher.setVolume(Math.floor(args[0]) / 100);
        
        await util.update_queue(q);

    }

}