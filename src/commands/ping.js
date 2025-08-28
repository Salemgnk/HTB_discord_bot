// src/commands/ping.js - Commande de test simple

module.exports = {
    data: {
        name: 'ping',
        description: 'Teste si le bot répond'
    },
    
    async execute(message, args) {
        // Mesurer le temps de réponse
        const sent = await message.reply('🏓 Pong!');
        const timeDiff = sent.createdTimestamp - message.createdTimestamp;
        
        // Modifier le message avec la latence
        sent.edit(`🏓 Pong! \`${timeDiff}ms\``);
    }
};