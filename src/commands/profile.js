// src/commands/profile.js - Commande pour afficher un profil HTB (version améliorée)

const { EmbedBuilder } = require('discord.js');
const { getHtbUsername } = require('../utils/database');

module.exports = {
    data: {
        name: 'profile',
        description: 'Affiche le profil HackTheBox d\'un utilisateur (le vôtre si aucun nom spécifié)'
    },
    
    async execute(message, args) {
        let targetUsername = null;
        let isOwnProfile = false;
        
        // 1. DÉTERMINER QUEL PROFIL AFFICHER
        if (args[0]) {
            // Un nom a été fourni → afficher ce profil
            targetUsername = args[0];
            isOwnProfile = false;
        } else {
            // Aucun nom → chercher le profil enregistré de l'utilisateur
            targetUsername = await getHtbUsername(message.author.id);
            isOwnProfile = true;
            
            if (!targetUsername) {
                // L'utilisateur n'est pas enregistré
                const registerPromptEmbed = new EmbedBuilder()
                    .setTitle('📝 Enregistrement requis')
                    .setDescription('Vous devez d\'abord associer votre compte Discord à votre profil HackTheBox')
                    .setColor(0xFFAA00)
                    .addFields(
                        { name: '🚀 Pour vous enregistrer', value: '`!register <votre_nom_htb>`' },
                        { name: '💡 Exemple', value: '`!register john_doe`' },
                        { name: '🔍 Ou voir un autre profil', value: '`!profile <nom_utilisateur>`' }
                    )
                    .setFooter({ text: 'Epihack Bot • Une seule fois suffit !' })
                    .setThumbnail(message.author.displayAvatarURL());
                    
                return message.reply({ embeds: [registerPromptEmbed] });
            }
        }
        
        // 2. MESSAGE DE CHARGEMENT
        const loadingMessage = await message.reply(
            isOwnProfile 
                ? '🔍 Chargement de votre profil HTB...' 
                : `🔍 Recherche du profil HTB de **${targetUsername}**...`
        );
        
        try {
            // 3. SIMULER UNE RECHERCHE (on utilisera l'API HTB plus tard)
            // Pour l'instant, on simule avec des données fictives
            const fakeUserData = {
                name: targetUsername,
                points: Math.floor(Math.random() * 10000) + 100, // Points aléatoires
                rank: ['Noob', 'Script Kiddie', 'Hacker', 'Pro Hacker', 'Elite Hacker'][Math.floor(Math.random() * 5)],
                country: 'France',
                university: 'Epitech',
                owns: Math.floor(Math.random() * 100) + 5,
                respects: Math.floor(Math.random() * 500) + 10,
                avatar: 'https://www.hackthebox.com/storage/avatars/default_avatar.png'
            };
            
            // 4. CRÉER L'EMBED PERSONNALISÉ
            const profileEmbed = new EmbedBuilder()
                .setTitle(
                    isOwnProfile 
                        ? `🎯 Votre profil HTB: ${fakeUserData.name}` 
                        : `🎯 Profil HTB: ${fakeUserData.name}`
                )
                .setColor(0x9FEF00) // Vert HTB
                .setThumbnail(fakeUserData.avatar)
                .addFields(
                    { name: '🏆 Points', value: fakeUserData.points.toString(), inline: true },
                    { name: '🎖️ Rang', value: fakeUserData.rank, inline: true },
                    { name: '🌍 Pays', value: fakeUserData.country, inline: true },
                    { name: '🏫 Université', value: fakeUserData.university, inline: true },
                    { name: '👑 Owns', value: fakeUserData.owns.toString(), inline: true },
                    { name: '⭐ Respects', value: fakeUserData.respects.toString(), inline: true }
                )
                .setFooter({ 
                    text: isOwnProfile 
                        ? `Demandé par ${message.author.tag} • Epihack Bot` 
                        : 'Epihack Bot • HackTheBox API',
                    iconURL: isOwnProfile ? message.author.displayAvatarURL() : null
                })
                .setTimestamp();
            
            // 5. MODIFIER LE MESSAGE DE CHARGEMENT
            const successMessage = isOwnProfile 
                ? `✅ Voici votre profil HTB !`
                : `✅ Profil trouvé pour **${targetUsername}** !`;
                
            await loadingMessage.edit({ 
                content: successMessage, 
                embeds: [profileEmbed] 
            });
            
        } catch (error) {
            console.error('Erreur dans profile:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur de récupération')
                .setDescription(`Impossible de récupérer le profil de **${targetUsername}**`)
                .setColor(0xFF0000)
                .addFields(
                    { name: '🔧 Causes possibles', value: '• Nom d\'utilisateur incorrect\n• Profil privé ou inexistant\n• Problème temporaire de l\'API HTB' },
                    { name: '💡 Solutions', value: '• Vérifiez l\'orthographe du nom\n• Réessayez dans quelques minutes' }
                )
                .setFooter({ text: 'Epihack Bot • Erreur technique' });
                
            await loadingMessage.edit({ 
                content: '', 
                embeds: [errorEmbed] 
            });
        }
    }
};