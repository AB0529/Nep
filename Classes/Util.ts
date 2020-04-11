import Neptune from './Neptune';
import {
    Message,
    MessageEmbed
} from 'discord.js';

import 'colors'
import db, { IServers } from '../Models/Server_Model';
import { Video } from '../types';

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
            return m.edit({ embed });

        return await this.msg.channel.send({ embed });
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

    // Adds a guild to the database
    public add_server(id: string) {
        let Server = new db.Servers({
            guild_id: id
        });

        Server.save();
    }

    // --------------------------------------------------

    // Returns the queue for the guild
    public async get_queue(id: string): Promise<Array<any>> {
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

    public async update_queue(queue: Array<Video>): Promise<Array<any>> {
        const q = await this.get_queue(this.msg.guild.id);
        
        return new Promise(async (resolve) => {
            // Don't update if the queue is the sames
            if (q == queue) {
                console.log('Same')
                return resolve(queue);
            }
            
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
}