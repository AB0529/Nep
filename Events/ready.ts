import Neptune from '../Classes/Neptune';

const run = (nep: Neptune) => {
    nep.util.log(`Neptune`, `Logged in as ${nep.user.tag.magenta}`);

    // Set status
    nep.user.setActivity('Big Block Cock', { type: 'WATCHING' });
}

export default { run };