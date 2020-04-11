import {
  Config
} from '../types';
import fs from 'fs';

import config from '../config';
import {
  Client,
  ClientOptions
} from 'discord.js';

import Commands from './Commands';
import Command from './Command';
import Util from './Util';

import 'colors'

export default class Neptune extends Client {
  public config: Config;
  public exit_code: number | null;
  public commands: Commands;
  public util: Util;
  public prefix: string;

  constructor(opts: ClientOptions) {
    // Client config
    super(opts);
    this.config = config;

    // Client variables
    this.commands = new Commands();
    this.prefix = this.config.discord.prefix;
    this.util = new Util(this);
    this.exit_code = null;
  }

  // --------------------------------------------------

  // Start and initalize the bot
  public start(token: string) {
    console.log(this.config.ascii_art);

    // Load all commands
    this.load_commands();
    // Load all events
    this.load_events();

    // Login
    super.login(token);
  }

  // --------------------------------------------------

  // Exit process with exit code provided
  public stop(exit_code: number = config.codes.STOP) {
    this.util.log('Process', `Process terminating with exit code ${`${exit_code}`.yellow}`);

    process.exit(exit_code);
  }

  // --------------------------------------------------

  // Exit process with restart exit code
  public restart() {
    this.util.log('Process', `Process terminating with exit code ${`${this.config.codes.RESTART}`.yellow}`);

    this.stop(this.config.codes.RESTART);
  }

  // --------------------------------------------------

  // Load all commands from command directory
  public load_commands() {
    // Array of categories in commands
    const categories = fs.readdirSync(`${this.config.dir}/Commands`);

    categories.forEach((category) => {
      const files = fs.readdirSync(`${this.config.dir}/Commands/${category}`);

      // Get commands in each category
      files.forEach((cmd) => {
        const command: Command = new (require(`../Commands/${category}/${cmd}`)).default(this);

        // Load the command and aliases
        this.commands.add_cmd(command);
        command.config.aliases.map((alias: string) =>
          this.commands.add_alias(alias, command)
        );
      });
    });

    this.util.log(`Neptune`, `Loaded commands`, this.commands.cmds.size);

  }

  // --------------------------------------------------

  // Load all events from events directory
  public load_events() {
    // Get all events
    const events = fs.readdirSync(`${this.config.dir}/Events`);

    // Run event
    events.forEach((file: any) => {
      const event = require(`../Events/${file}`).default;

      super.on(file.split('.')[0], (...args: any) => event.run(this, ...args));
    });

    this.util.log(`Neptune`, `Loaded events`, events.length);
  }

  // --------------------------------------------------
}