import Neptune from './Classes/Neptune';

const nep = new Neptune({ disableEveryone: true });

// Start bot
nep.start(nep.config.discord.token);