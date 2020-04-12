import Neptune from './Neptune';
import {
    Message,
    MessageEmbed,
    VoiceConnection,
    StreamDispatcher,
    MessageCollector,
} from 'discord.js';
import ytdl from 'ytdl-core';
import he from 'he'
import bent from 'bent'

import 'colors'
import db, { IServers } from '../Models/Server_Model';
import { Queue } from '../types';

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
            return this.embed(`<a:AngryGlitch:665756319172788229> | An error has occured\n\`\`\`css\n${error} (${where})\n\`\`\``);

        console.log(`[${'ERROR'.red}] '${error}' ${where.yellow}`)
    }

    // --------------------------------------------------

    // Generate random color
    public get r_color() {
        return Math.floor(Math.random() * 16777215).toString(16);
    }

    // --------------------------------------------------

    // Easy embed
    public async embed(content: any, m?: Message): Promise<Message> {
        let embed = new MessageEmbed().setDescription(content).setColor(this.r_color);

        // Handle editing
        if (m)
            return m.edit({ embed: embed });

        return await this.msg.channel.send({ embed: embed });
    }

    // --------------------------------------------------

    public check_owner(id: string) {
        return this.nep.config.discord.owner_id == id;
    }

    // --------------------------------------------------
    // Convert MS time into seconds or minutes etc.
    public ms_parser(millisec: number) {
        let seconds = millisec / 1e3;
        let minutes = millisec / (1e3 * 60);
        let hours = millisec / (1e3 * 60 * 60);
        let days = millisec / (1e3 * 60 * 60 * 24);

        if (seconds < 60) {
            return seconds + ' second(s)';
        } else if (minutes < 60) {
            return minutes + ' minute(s)';
        } else if (hours < 24) {
            return hours + ' hour(s)';
        } else {
            return days + ' day(s)';
        }
    }

    // --------------------------------------------------

    // Shortens string to acceptable length
    public parse_args(s: string, max_length: number = 15) {
        return s.length > max_length ? (s = s.substring(0, max_length) + '...') : s;
    }

    // --------------------------------------------------

    // Adds a guild to the database
    public add_server(id: string) {
        let Server = new db.Servers({
            guild_id: id
        });

        Server.save();
    }

    // --------------------------------------------------

    // Returns the queue for the guild
    public async get_queue(id: string): Promise<Queue> {
        return new Promise((resolve) => {
            // Look for guild in db
            this.nep.servers.findOne({ guild_id: id }, (err, res: IServers) => {
                if (err)
                    return this.error(err, 'get_queue()', true);
                
                // If guild does not exist, return empty array
                // Message event will handle adding
                if (!res) 
                    // Return empty queue
                    return resolve([]);

                // Return server queue
                resolve(res.queue);
            });
        });
    }

    // --------------------------------------------------

    public async update_queue(queue: Queue): Promise<Queue> {
        const q = await this.get_queue(this.msg.guild.id);
        
        return new Promise(async (resolve) => {
            // Don't update if the queue is the sames
            if (q == queue) 
                return resolve(queue);
            
            // Update old queue with new one and return it
            this.nep.servers.findOneAndUpdate({ guild_id: this.msg.guild.id }, {$set: {queue: queue}}, (err, resp) => {
                if (err)
                    return this.error(err, 'update_queue()', true);
                
                resp.save();                
            });

            return resolve(await this.get_queue(this.msg.guild.id));

        });

    }

    // --------------------------------------------------

    // Plays the queue
    public play_queue(q: Queue) {
        // Handle queue finish
        if (!q[0])
            return this.msg.channel.send({
                embed: new MessageEmbed()
                    .setDescription(`<:Sharcat:390652483577577483> | Queue has **finished playing**, see ya' later alligator!`)
                    .setColor(this.r_color)
                    })
                    .then(() => {
                        let vc: VoiceConnection = this.msg.guild.voice.connection;

                        // Reset volume
                        q.volume = 100;

                        // Leave VC
                        if (vc != null)
                            this.msg.guild.me.voice.channel.leave();

                    }).catch((err) => this.error(`VC Leave Error:\n${err.stack}`, 'play_queue()'));
        
        // Join VC
        new Promise(async (resolve) => {
            let vc: VoiceConnection = this.msg.guild.me.voice.connection;

            // Attemp to join VC
            if (vc == null) {
                // Join author if they're in channel
                if (this.msg.member.voice.channel)
                    return resolve(await this.msg.member.voice.channel.join());
                return this.embed(`:x: | You're **not in a voice channel**, what do you want me to do?!`);
            }

            resolve(vc);
        }).then((c: any) => {
            // Sound handler
            let video = q[0].video.url;
            let stream = ytdl(video, {filter: 'audioonly'});
            let dispatcher: StreamDispatcher = c.play(stream);

            this.msg.channel.send({
                embed: new MessageEmbed()
                .setDescription(
                    `<a:MikuDance:422159573344845844> | **Now playing** [${he.decode(q[0].video.title)}](${q[0].video.url}) **[<@${q[0].author}>]**`
                )
                .setColor(this.r_color)
                .setThumbnail(q[0].thumbnail.default.url)
            });

            // Set volume
            dispatcher.setVolume(!q.volume ? 1 : Math.floor(q.volume) / 100);

            // Handle sound end
            dispatcher.on('close', () => {
                setTimeout(async () => {
                    q.shift();
                    q = await this.update_queue(q);
                    this.play_queue(q);
                }, 1e3);
            });
            dispatcher.on('finish', () => dispatcher.emit('close'));

            // Handle sound error
            dispatcher.on('error', (err) => this.error(`Dispatcher error:\n${err}`, 'play_queue()', true));

        });

    }

    // --------------------------------------------------

    // Send option for user to pick and return choice
    public async msg_collector(category: string, message: string[], max: number) {
        // Create the collector
        let collector: MessageCollector = this.msg.channel.createMessageCollector((m) => m.author.id == this.msg.author.id, { time: 3e4, dispose: true });
        let m = await this.msg.channel.send('*Loading...*');

        // Send options
        m.edit({
            embed: new MessageEmbed()
                .setDescription(`*Reply your wanted result*\n\n${category}\n${message.join('\n')}\n**c.** Cancel`)
                .setFooter(this.msg.author.tag, this.msg.author.displayAvatarURL())
                .setColor(this.r_color)
        });
        
        return new Promise((resolve, reject) => {
            // Handle collector end
            collector.on('end', () => setTimeout(() => {
                m.delete().catch((err) => reject(err));
                reject();
            }));
            // Logic for parsing results
            collector.on('collect', (msg: Message) => {
                // Cancel
                if (msg.content.toLowerCase() == 'c') {
                    msg.delete().catch((err) => err);
                    collector.stop();
                    reject();
                }
                // Make sure result isn't above or below max value
                if (!parseInt(msg.content) || parseInt(msg.content) <= 0 || parseInt(msg.content) > max)
                    return;

                // Return result
                resolve(parseInt(msg.content));
                msg.delete().catch((err) => err);
                collector.stop();
            });

        });

    }

    // --------------------------------------------------
}