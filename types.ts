export interface Config {
    dir: string,
    discord: {
        prefix: string,
        token: string,
        owner_id: string | Array<string>
    },
    codes: {
        STOP: number,
        ERROR: number,
        RESTART: number
    },
    ascii_art: string
}

export interface CommandInfo {
    name: string | undefined,
    help: Array<string> | string,
    longHelp: Array<string> | string,
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