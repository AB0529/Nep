import mongoose, { Schema, Document } from 'mongoose';
import config from '../config'

export interface IServers extends Document {
    guild_id: string;
    prefix: string;
    queue: Array<any>;
    roles: Array<any>;
    ignore: Array<any>;
}

// Server
const servers_schema = new Schema({
    guild_id: {
        type: String,
        unique: true
    },
    prefix: {
        type: String,
        default: config.discord.prefix
    },
    queue: {
        type: Array,
        default: []
    },
    roles: {
        type: Array,
        default: []
    },
    ignore: {
        type: Array,
        default: []
    }
});
const Servers = mongoose.model<IServers>('Servers', servers_schema);

export default { servers_schema, Servers }; 