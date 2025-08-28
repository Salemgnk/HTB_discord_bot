// src/commands/register.js - S'enregistrer avec son nom HTB

const { EmbedBuilder } = require('discord.js');
const { registerUser } = require('../utils/database');

module.exports = {
    data: {
        name: 'register',
        description: 'Associer votre compte Discord avec votre nom d\'utilisateur HackTheBox'
    },
    
    async execute(message, args) {
        // 1. VÉRIFICATIONS
        if (!args[0]) {
            const usageEmbed = new EmbedBuilder()
                .setTitle('📝 Comment s\'enregistrer')
                .setDescription('Associez votre compte Discord avec votre profil HackTheBox')
                .setColor(0x9FEF00)
                .addFields(
                    { name: '📋 Usage', value: '`!register <votre_nom_htb>`' },
                    { name: '💡 Exemple', value: '`!register john_doe`' },
                    { name: '⚠️ Important', value: 'Utilisez exactement votre nom HTB (sensible à la casse)' }
                )
                .setFooter({ text: 'Epihack Bot • Une fois enregistré, utilisez !profile sans argument' });
                
            return message.reply({ embeds: [usageEmbed] });
        }
        
        const htbUsername = args.join(' ').trim(); // Supporter les noms avec espaces
        const discordUser = message.author;
        
        // 2. MESSAGE DE TRAITEMENT
        const processingMessage = await message.reply('⏳ Enregistrement en cours...');
        
        try {
            // 3. ENREGISTRER DANS LA DATABASE
            const success = await registerUser(
                discordUser.id, 
                discordUser.tag, 
                htbUsername
            );
            
            if (success) {
                // 4. CONFIRMATION DE SUCCÈS
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Enregistrement réussi !')
                    .setDescription(`Votre compte Discord est maintenant associé à **${htbUsername}** sur HackTheBox`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '👤 Discord', value: discordUser.tag, inline: true },
                        { name: '🎯 HackTheBox', value: htbUsername, inline: true },
                        { name: '🚀 Prochaine étape', value: 'Tapez `!profile` pour voir votre profil HTB !' }
                    )
                    .setThumbnail(discordUser.displayAvatarURL())
                    .setFooter({ text: 'Epihack Bot • Pour changer, utilisez !register à nouveau' })
                    .setTimestamp();
                
                await processingMessage.edit({ 
                    content: '', 
                    embeds: [successEmbed] 
                });
                
            } else {
                throw new Error('Erreur lors de l\'enregistrement');
            }
            
        } catch (error) {
            console.error('❌ Erreur register:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur d\'enregistrement')
                .setDescription('Impossible de vous enregistrer pour le moment')
                .setColor(0xFF0000)
                .addFields(
                    { name: '🔧 Solutions possibles', value: '• Réessayez dans quelques secondes\n• Vérifiez l\'orthographe de votre nom HTB\n• Contactez un administrateur si le problème persiste' }
                )
                .setFooter({ text: 'Epihack Bot • Erreur technique' });
                
            await processingMessage.edit({ 
                content: '', 
                embeds: [errorEmbed] 
            });
        }
    }
};