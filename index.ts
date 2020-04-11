import Neptune from './Classes/Neptune';

const nep = new Neptune({});

// Handle clean exit
process.on('SIGINT', () => {
    nep.stop();
});

// Start bot
nep.start(nep.config.discord.token);