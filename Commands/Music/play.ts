import Command from '../../Classes/Command';
import Neptune from '../../Classes/Neptune';

import path from 'path';
import {
    Message,
    MessageEmbed
} from 'discord.js';
import Util from '../../Classes/Util';
import bent from 'bent';
import he from 'he';

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

        // If no args are provided
        if (!args[0]) {
            // Play queue if it has items
            if (queue.length == 0)
                return util.embed(`:x: | The **queue is empty** as your friends list!`);
            
            return util.play_queue(queue);
        }

        // Get video and push to queue
        let res: any = await bent('json')(`${nep.config.api.url}/yt_search?key=${nep.config.api.key}&maxResults=1&search=${args.join('+')}`);
        
        if (res.state == 'fail')
            return util.error(`Search Error:\n${res.result}`, 'play.ts')

        let v = res.result[0];

        v.author = msg.author.id;
        
        // Push first result only
        queue.push(v);
        util.update_queue(queue);

        msg.channel.send({
            embed: new MessageEmbed()
            .setDescription(
                `<:Selfie:390652489919365131> | Enqueued [${he.decode(v.video.title)}](${v.video.url}) **[${msg.author}]** Use \`${nep.prefix}${this.info.name}\` to play!`
            )
            .setThumbnail(v.thumbnail.medium.url)
            .setColor(util.r_color)
        });

    }

}