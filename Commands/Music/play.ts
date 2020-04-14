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
            usage: [`- ${cmd} [-d] [Search/Link]`],
            examples: [`- ${cmd}`, `- ${cmd} fallen kingdom\nShows 5 resulsts`, `- ${cmd} -d fallen kingdom\nGets only first result`, `-${cmd} https://www.youtube.com/watch?v=dQw4w9WgXcQ`],
            category: path.dirname(__filename).split(path.sep).pop(),
            cooldown: 1e3,
            aliases: ['p'],
            locked: false,
            allow_dm: false
        });
    }

    public async run(msg: Message, args: any[], util: Util, nep: Neptune) {
        let q = await util.get_queue(msg.guild.id);
        let flag_reg = /(^-d)|( -d)/i;
        let yt_reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm
        let clean_args = args[0] ? args.join(' ').replace(flag_reg, '').trim() : '';

        // ------------------------------------------
        // Plays a url
        const play_url = async (url: string) => {
            // Delete author message
            msg.delete().catch((err) => err);

            let res: any = await bent('json')(`${nep.config.api.url}/yt_search?key=${nep.config.api.key}&maxResults=1&search=${args.join('+')}`);
            
            // Check for failure
            if (res.state == 'fail')
                return util.error(`Search error:\n${res.result}`, 'play_url() - play.ts');
            
            // Get result
            let v = res.result[0];
            // Push to queue
            v.author = msg.author.id;
            v.volume = 100;

            q.push(v);
            await util.update_queue(q);

            msg.channel.send({
                embed: new MessageEmbed()
                .setDescription(
                    `<:Selfie:390652489919365131> | Enqueued [${he.decode(v.video.title)}](${v.video.url}) **[${msg.author}]** Use \`${nep.prefix}${this.info.name}\` to play!`
                )
                .setThumbnail(v.thumbnail.medium.url)
                .setColor(util.r_color)
            });
        };
        // ------------------------------------------
        // Sends multiple and plays choice
		const get_choice = async (query: string, amount: number = 5) => {
            // Searches for n videos and gets choice
            let res: any = await bent('json')(`${nep.config.api.url}/yt_search?key=${nep.config.api.key}&maxResults=${amount}&search=${he.encode(args.join(' '))}`);

            // Handle fail
            if (res.state == 'fail')
                return util.error(`Search Error:\n${res.result}`, 'ge_choice() - play.ts');
            
            // Format videos as message to send
            let fmsg = res.result.map((v, i) => `${i + 1}) [${he.decode(v.video.title)}](${v.video.url}) **[${v.channel.name}]**`);
            // Start collector and get choice
            util.msg_collector(`Results for: \`${util.parse_args(args.join(' '))}\``, fmsg, res.result.length)
                .then((choice: any) => {
                    // Handle invalid choice
                    if (choice == -1)
                        return;
                    // Get the video
                    let v = res.resulst[choice - 1];
                    
                    // Push video to queue
                    v.author = msg.author.id;
                    v.volume = 100;

                    q.push(v);
                    util.update_queue(q);

                            
                    msg.channel.send({
                        embed: new MessageEmbed()
                        .setDescription(
                            `<:Selfie:390652489919365131> | Enqueued [${he.decode(v.video.title)}](${v.video.url}) **[${msg.author}]** Use \`${nep.prefix}${this.info.name}\` to play!`
                        )
                        .setThumbnail(v.thumbnail.medium.url)
                        .setColor(util.r_color)
                    });

                }).catch((err) => err);
		};
		// ------------------------------------------
		// Plays first resulst
		const play_first = async (query: string) => {
            // Search for only 1 video and queues it
            let res: any = await bent('json')(`${nep.config.api.url}/yt_search?key=${nep.config.api.key}&maxResults=1&search=${he.encode(clean_args)}`);

            // Handle fail
            if (res.state == 'fail')
                return util.error(`Search Error:\n${res.result}`, 'play_first() - play.ts');

            // Get video
            let v = res.result[0];

            // Push video to queue
            v.author = msg.author.id;
            v.volume = 100;

            q.push(v);
            util.update_queue(q);

            msg.channel.send({
                embed: new MessageEmbed()
                .setDescription(
                    `<:Selfie:390652489919365131> | Enqueued [${he.decode(v.video.title)}](${v.video.url}) **[${msg.author}]** Use \`${nep.prefix}${this.info.name}\` to play!`
                )
                .setThumbnail(v.thumbnail.medium.url)
                .setColor(util.r_color)
            });
		};
		// ------------------------------------------
		
        // TODO: Clean up to switch
        // No args are provided and queue is empty
        if (!args[0] && !q)
            return util.embed(`:x: | The **queue is empty** as your friends list!`);
        // No args and queue is not empty
        else if (!args[0] && q)
            // Play the queue
            return util.play_queue(q);
        // URL is provided, play that immidetly
        else if (yt_reg.test(clean_args))
            return await play_url(clean_args);
        // Only flag is provided
        else if (args.join(' ').toLowerCase() == '-d')
            return util.embed(`:x: | You need **something to search**, try a **link** or **term**!`);
        // No flag is provided, send multiple search
        else if (!flag_reg.test(args.join(' ')))
            return await get_choice(args.join(' '));
        // Flag is present, play first
        else if (flag_reg.test(args.join(' ')))
            return await play_first(clean_args);         
    }

}