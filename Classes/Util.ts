import Neptune from './Neptune';
import { Message } from 'discord.js';

import 'colors'
import { RichEmbed } from 'discord.js';

export default class Util {
    public nep: Neptune;
    public msg: Message;

    constructor(nep: Neptune, msg?: Message | any) {
        this.nep = nep;
        this.msg = msg || undefined;
    }

    // --------------------------------------------------

    // Pretty log
    public log(title: any, content: any, extra: any = '') {
        console.log(`[${title.blue}] ${content} (${extra.toString().green})`);
    };

    // --------------------------------------------------

    // Error handling
    public error(error: any, where?: string, log: boolean = false) {
        if (!log && this.msg)
            return

        console.log(`[${'ERROR'.red}]`)
    }

    // --------------------------------------------------

    // Generate random color
    public get r_color() {
        return Math.floor(Math.random() * 16777215).toString(16);
    }

    // --------------------------------------------------

    // Easy embed
    public async embed(content: any, m?: Message): Promise<Message> {
        let embed = new RichEmbed().setDescription(content).setColor(this.r_color);

        // Handle editing
        if (m)
            return m.edit({
                embed: embed
            });

        return await this.msg.channel.send({ embed: embed });
    }

    // --------------------------------------------------
}