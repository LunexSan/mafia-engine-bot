import { sign } from 'crypto';
import { prisma } from '../..';
import { Button } from '../../structures/interactions';
import { createSignupPost } from '../commands/signups';
import TestModal from '../modals/example';

export default new Button('signups-leave').onExecute(async (i, cache) => {
	if (!cache) return i.reply({ content: 'This button is invalid', ephemeral: true });
	const signup = await prisma.signup.findUnique({
		where: {
			id: cache,
		},
	});

	if (!signup) return i.reply({ content: 'This signup is no longer active', ephemeral: true });
	if (signup.isLocked) return i.reply({ content: 'This signup is locked.', ephemeral: true });

	const updatedSignup = await prisma.signup.update({
		where: {
			id: signup.id,
		},
		data: {
			players: signup.players.filter((p) => p != i.user.id),
			backups: signup.backups.filter((p) => p != i.user.id),
		},
	});

	const { embed, row } = await createSignupPost(updatedSignup, i.guild);
	await i.message.edit({ embeds: [embed], components: [row] });
	await i.reply({ content: 'Successfully left', ephemeral: true });
});
