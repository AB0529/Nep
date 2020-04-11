export interface Config {
    dir: string,
    discord: {
        prefix: string,
        token: string,
        owner_id: string | Array<string>
    },
    mongo: {
        user: string,
        password: string,
        db: string,
        ip: string
    },
    codes: {
        STOP: number,
        ERROR: number,
        RESTART: number
    },
    api: {
        key: string,
        url: string
    },
    ascii_art: string
}

export interface Video {
    status: number;
    state:  string;
    result: Result[];
}

export interface Result {
    video:     VideoClass;
    channel:   Channel;
    thumbnail: Thumbnail;
}

export interface Channel {
    name: string;
    id:   string;
    url:  string;
}

export interface Thumbnail {
    default: Default;
    medium:  Default;
    high:    Default;
}

export interface Default {
    url:    string;
    width:  number;
    height: number;
}

export interface VideoClass {
    id:          string;
    url:         string;
    title:       string;
    description: string;
    publishedAt: Date;
}


export interface CommandInfo {
    name: string | undefined,
    help: Array<string> | string,
    long_help: Array<string> | string,
    usage: Array<string> | Array<null> | string,
    examples: Array<string> | Array<null> | string,
    category: Array<string> | string
}

export interface CommandConfig {
    cooldown: number,
    aliases: Array<string>,
    allow_dm: boolean,
    locked: boolean
}