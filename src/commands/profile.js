const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: {
        name: 'profile',
        description: "Display HackTheBox profile information"    
    },

    async execute(message, args) {
        if (!args[0])
            return message.reply("**Usage:** !profile <username>\n");

        const username = args[0];

        const loadingMessage = await message.reply('🔍 Looking for HTB profile...');

        try {
            const fakeUserData = {
                name: username,
                points: 1337,
                rank: 'Hacker',
                country: 'France',
                university: 'Epitech',
                owns: 42,
                respects: 256,
                avatar: 'https://www.hackthebox.com/storage/avatars/default_avatar.png'
            };

            const profileEmbed = new EmbedBuilder()
            .setTitle(`${fakeUserData.name}'s HackTheBox Profile`)
            .setColor(0x9FEF00)
            .setThumbnail(fakeUserData.avatar)
            .addFields(
                { name: '🏆 Points', value: fakeUserData.points.toString(), inline: true },
                { name: '🎖️ Rank', value: fakeUserData.rank, inline: true },
                { name: '🌍 Country', value: fakeUserData.country, inline: true },
                { name: '👑 Owns', value: fakeUserData.owns.toString(), inline: true },
                { name: '⭐ Respects', value: fakeUserData.respects.toString(), inline: true }
            )
            .setFooter({ text: "Epihack Bot + HackTheBox API" })
            .setTimestamp();

            await loadingMessage.edit({
                content: `✅ Profile found for ${username}!`,
                embeds: [profileEmbed]
            })

        } catch (error) {
            console.error('Error fetching HTB profile:', error);
            await loadingMessage.edit(`❌ Error fetching profile for ${username}. Please try again later.`);
        }
    }

}