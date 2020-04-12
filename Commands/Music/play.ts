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
import { Queue } from '../../types';

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
        let flag_reg = /(^-d)|( -d)/i;
        let nflag_reg = /^((?!( -d)|^(-d)).)*$/;

        // If no args are provided
        if (!args[0] && !queue)
            return util.embed(`:x: | The **queue is empty** as your friends list!`);
        // No args but 
        else if (!args[0])
            return util.play_queue(queue);
        // If flag exists, but nothing else
        else if (args.join(' ').toLowerCase() == '-d')
            return util.embed(`:x: | You need **something to search**, try a **link** or **title**!`);
        // If no flag, send mutliple search
        else if (!flag_reg.test(args.join(' ')) && nflag_reg.test(args.join(' ').replace(flag_reg, '')) && args.join(' ').toLowerCase() !== '-d') {
            // Search for 5 videos
            let res: any = await bent('json')(`${nep.config.api.url}/yt_search?key=${nep.config.api.key}&maxResults=5&search=${args.join('+')}`);

            // Handle fail
            if (res.state == 'fail')
                return util.error(`Search Error:\n${res.result}`, 'play.ts');
            
            // Format the msg to send
            let formated_msg = res.result.map((v: any, i: number) => `${i + 1}) [${he.decode(v.video.title)}](${v.video.url}) **[${v.channel.name}]**`);
            // Send message collector and queue picked video
            util.msg_collector(`**Results for** \`${args.join(' ')}\`:`, formated_msg, res.length).then((choice: any) => {
                msg.channel.send(choice);

                if (choice == -1)
                    return;
    
                // Get video
                let v = res.result[choice - 1];
    
                v.author = msg.author.id;
                v.volume = 100;
                
                // Push result to queue
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
            }).catch((err) => err);
        }
        // If flag is present, queue and play first result
        else if (flag_reg.test(args.join(' ')) && nflag_reg.test(args.join(' ').replace(flag_reg, ''))) {
            let res: any = await bent('json')(`${nep.config.api.url}/yt_search?key=${nep.config.api.key}&maxResults=1&search=${args.join('+').replace(flag_reg, '')}`);
            
            // Handle fail
            if (res.state == 'fail')
                return util.error(`Search Error:\n${res.result}`, 'play.ts');

            // Get first video
            let v = res.result[0];
    
            v.author = msg.author.id;
            v.volume = 100;
            
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

}