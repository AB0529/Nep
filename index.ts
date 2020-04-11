import Neptune from './Classes/Neptune';

const nep = new Neptune({});

// Start bot
nep.start(nep.config.discord.token);