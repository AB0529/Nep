import Command from './Command';

export default class Commands {
    public commands: Map<string | undefined, Command>;

    constructor() {
        this.commands = new Map();
    }

    // ---------------------------------------------------------------------------

    // Adds a command to the map
    public add_cmd(cmd: Command) {
        this.commands.set(cmd.info.name, cmd);
    }

    // ---------------------------------------------------------------------------

    // Adds a command with a different name to act as an alias
    public add_alias(name: string, cmd: Command) {
        this.commands.set(name, cmd);
    }

    // ---------------------------------------------------------------------------

    // Returns commands object from map
    public get_cmd(name: string) {
        return this.commands.get(name);
    }

    // ---------------------------------------------------------------------------

    public get cmds() {
        return this.commands;
    }

    // ---------------------------------------------------------------------------
}