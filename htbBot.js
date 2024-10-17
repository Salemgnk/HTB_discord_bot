const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Créer une instance de client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Charger les IDs HTB des utilisateurs
let userHTBIds = {};
try {
    if (fs.existsSync('userHTBIds.json')) {
        const data = fs.readFileSync('userHTBIds.json', 'utf-8');
        userHTBIds = JSON.parse(data);
    }
} catch (error) {
    console.error('Erreur lors de la lecture du fichier userHTBIds.json:', error);
    userHTBIds = {};
}

// Fonction pour récupérer la progression de l'utilisateur (profil général)
async function getUserProgress(htbId) {
    try {
        const response = await axios.get(`https://www.hackthebox.com/api/v4/profile/${htbId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de la progression HTB:', error.response ? error.response.data : error.message);
        throw new Error('Impossible de récupérer les données de progression.');
    }
}

// Fonction pour récupérer les challenges résolus de l'utilisateur
async function getUserChallenges(htbId) {
    try {
        const response = await axios.get(`https://www.hackthebox.com/api/v4/profile/progress/challenges/${htbId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            }
        });
        return response.data.profile.challenge_owns;
    } catch (error) {
        console.error('Erreur lors de la récupération des challenges HTB:', error.response ? error.response.data : error.message);
        throw new Error('Impossible de récupérer les données de challenges.');
    }
}

// Fonction pour attribuer des points en fonction du rang
function getPointsFromRank(rank) {
    const pointsMap = {
        'Noob': 10,
        'Script Kiddie': 20,
        'Hacker': 30,
        'Pro Hacker': 40,
        'Elite Hacker': 50,
        'Guru': 60,
        'Omniscient': 70
    };
    return pointsMap[rank] || 0; // 0 si le rang n'est pas reconnu
}

// Commandes du bot
const commands = {
    linkhtb: async (message, args) => {
        if (args.length < 2) {
            return message.author.send('Veuillez fournir votre ID HTB après la commande, par exemple : `!linkhtb votre_id_htb`.'); // Envoyer le message en DM
        }

        const htbId = args[1];
        userHTBIds[message.author.id] = htbId; // Lier l'ID HTB à l'utilisateur Discord

        // Sauvegarder les IDs HTB dans le fichier JSON
        fs.writeFile('userHTBIds.json', JSON.stringify(userHTBIds, null, 2), (err) => {
            if (err) {
                console.error('Erreur lors de la sauvegarde des IDs HTB:', err);
                return message.author.send('Erreur lors de la liaison de votre compte HTB. Veuillez réessayer.'); // Envoyer le message en DM
            }

            // Message DM au lanceur
            message.author.send(`Votre compte HTB a été lié avec succès !`); // Envoyer le message en DM
            
            // Message public pour informer que l'utilisateur a lié son compte (sans ID)
            message.channel.send(`${message.author.username} a lié son compte HTB avec succès !`);
        });
    },
    progresshtb: async (message) => {
        const htbId = userHTBIds[message.author.id];
        if (!htbId) {
            return message.reply('Vous devez d\'abord lier votre compte HTB avec !linkhtb.');
        }

        try {
            // Récupérer la progression générale
            const profileResponse = await getUserProgress(htbId);
            const profile = profileResponse.profile; // Accéder au profil

            // Récupérer la progression des challenges
            const challenges = await getUserChallenges(htbId);

            // Créer un embed avec des champs variables
            const embed = new EmbedBuilder()
                .setColor('#9FEF00') // Couleur verte HTB
                .setTitle(profile.name || 'Utilisateur inconnu') // Nom HTB
                .setDescription(`:trophy: **Rang :** ${profile.rank || 'N/A'}\n:flag_${(profile.country_code || '').toLowerCase()}: **Classement pays :** ${profile.country_name || 'N/A'}\n:world_map: **Classement global :** #${profile.ranking || 'N/A'}`)
                .addFields(
                    { name: ':desktop: Machines', value: `${profile.user_owns || 0}\n${profile.system_owns || 0} : system_own`, inline: true },
                    { name: ':dart: Challenges', value: `${challenges.solved || 0} / ${challenges.total || 0}`, inline: true },
                    { name: ':smiley: XP to level up', value: `${profile.current_rank_progress || 'N/A'}` },
                    { name: 'Free Content Pwned', value: `${profile.rank_ownership} %`, inline: false }
                )
                .setFooter({ text: 'HackTheBox Progress' }) // Footer avec informations supplémentaires
                .setTimestamp(); // Ajouter l'heure actuelle

            await message.channel.send({ embeds: [embed] }); // Envoyer l'embed dans le canal
        } catch (error) {
            console.error('Erreur lors de la récupération de la progression HTB:', error);
            message.reply('Erreur lors de la récupération de votre progression HTB. Veuillez réessayer plus tard.');
        }
    },
    leaderboard: async (message) => {
        // Créer un classement interne basé uniquement sur les utilisateurs du serveur
        const leaderboard = [];
        const members = await message.guild.members.fetch(); // Récupérer tous les membres du serveur

        for (const member of members.values()) {
            if (userHTBIds[member.id]) { // Vérifier si l'utilisateur a lié son compte HTB
                const htbId = userHTBIds[member.id];
                try {
                    const profileResponse = await getUserProgress(htbId);
                    const profile = profileResponse.profile;
                    const rank = profile.rank;
                    const points = getPointsFromRank(rank); // Obtenir les points en fonction du rang
                    leaderboard.push({ userId: member.id, name: member.user.username, points });
                } catch (error) {
                    console.error('Erreur lors de la récupération de la progression HTB pour le leaderboard:', error);
                }
            }
        }

        // Trier le classement par points
        const sortedLeaderboard = leaderboard.sort((a, b) => b.points - a.points); // Du plus haut au plus bas

        // Créer un embed pour le classement
        const embed = new EmbedBuilder()
            .setColor('#FFAA00')
            .setTitle('Classement interne HackTheBox')
            .setDescription('Voici le classement des utilisateurs ayant lié leur compte HTB :')
            .addFields(
                sortedLeaderboard.length > 0 // Vérifier s'il y a des utilisateurs liés
                    ? sortedLeaderboard.map((user, index) => ({
                        name: `${index + 1}. ${user.name}`,
                        value: `Points: ${user.points}`,
                        inline: false
                    }))
                    : [{ name: 'Aucun utilisateur lié', value: 'Il n\'y a pas d\'utilisateurs ayant lié leur compte HTB.' }]
            )
            .setFooter({ text: 'Classement basé sur les points HTB' });

        await message.channel.send({ embeds: [embed] }); // Envoyer le classement dans le canal
    }
};

// Événement lorsqu'un message est reçu
client.on('messageCreate', async (message) => {
    console.log(`Message reçu : ${message.content} de ${message.author.tag}`); // Log du message reçu

    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args[0].substring(1); // Enlève le préfixe
    if (commands[command]) {
        await commands[command](message, args);
    }
});

// Se connecter à Discord
client.login(process.env.DISCORD_TOKEN);
client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
});
