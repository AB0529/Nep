import Command from '../../Classes/Command';
import Neptune from '../../Classes/Neptune';

import path from 'path';
import {
    Message,
    RichEmbed
} from 'discord.js';
import Util from '../../Classes/Util';

export default class Cmd extends Command {
    constructor(nep: Neptune) {
        let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

        super(nep, {
            name: path.basename(__filename, '.ts'),
            help: `Usual 'ping' command.`,
            long_help: `Returns the round trip ping and API latency`,
            usage: [`- ${cmd}`],
            examples: [`- ${cmd}`],
            category: path.dirname(__filename).split(path.sep).pop(),
            cooldown: 1e3,
            aliases: ['pong'],
            locked: false,
            allow_dm: true
        });
    }

    public async run(msg: Message, args: any[], util: Util, nep: Neptune) {
        // Send message to edit
        let m = await util.embed('*Pinging...*');

        // Edit with new message
        m.edit({
            embed: new RichEmbed()
                .addField(
                    `:ping_pong: Ping my Pong`,
                    `⏱ | **Message Delay:** \`${Math.round(
                        m.createdTimestamp - msg.createdTimestamp
                    )}ms\`\n 📡 | **Neptune:**  \`${Math.round(nep.ping)}ms\``
                )
                .setColor(util.r_color)
        });

    }

}