import Neptune from '../Classes/Neptune';
import Command from '../Classes/Command';
import {
	Message, MessageEmbed
} from 'discord.js';
import Util from '../Classes/Util';

const run = async (nep: Neptune, msg: Message) => {
	// Ignore bot
	if (msg.author.bot)
		return;

	// Multiple prefixes
	[nep.config.discord.prefix, `<@${nep.user.id}> `, `<@!${nep.user.id}> `].forEach(
		(p) => (msg.content.startsWith(p) ? (nep.prefix = p) : nep.prefix)
	);

	// Make sure msg starts with prefix
	if (!msg.content.toLowerCase().startsWith(nep.prefix))
		return;

	// Message attributes
	let args = msg.content.slice(nep.prefix.length).trim().split(/ +/g);
	let cmd = args.shift();
	let command: Command | any = nep.commands.get_cmd((cmd as string));
	let is_owner = nep.util.check_owner(msg.author.id);

	// Make sure command exists
	if (!command)
		return;
	// Handle cooldown
	else if (command.cooldown.has(msg.author.id)) return;
	// Ignore cooldown for owner
	else if (!is_owner)
		return msg.channel.send({
			embed: new MessageEmbed()
				.setDescription(
					`⏲ | *Please wait* \`${nep.util.ms_parser(
						command.config.cooldown
					)}\` *until using this command again!*`
				)
				.setColor(nep.util.r_color)
				.setFooter(msg.author.tag, msg.author.displayAvatarURL())
		}).then(() => command.sentCooldownMessage.add(msg.author.id));

	// Handle commands
	try {
		// Reset cooldown
		if (command.config.cooldown > 0) command.start_cooldown(msg.author.id);
		// Make sure commands can be used in DMs
		if (!command.config.allow_dm && !msg.guild)
			return nep.util.embed(`:x: | **${command}** cannot be used in a DM!`);
		// Handle owner lock
		if (command.info.category == 'Owner' && !is_owner)
			return nep.util.embed(`<:NepShock:475055910830735372> | You're **not my master**, go away! Shoo, shoo!`);
		// Check lock
		if (command.config.locked && !is_owner)
			return nep.util.embed(`🔒 | \`${command.info.name}\` has been **locked to the public**! Try again later!`);
		else
			// Run command
			command.run(msg, args, new Util(nep, msg), nep);
	} catch (err) {
		nep.util.error(`Command Error`, err);
	}

}

export default {
	run
};