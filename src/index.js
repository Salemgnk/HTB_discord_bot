// src/index.js - Point d'entrée du bot Epihack

// 1. Importer les dépendances
require('dotenv').config(); // Charge le fichier .env
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 2. Créer le client Discord avec les permissions nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,         // Accès aux serveurs
        GatewayIntentBits.GuildMessages,  // Lire les messages
        GatewayIntentBits.MessageContent  // Contenu des messages
    ]
});

// 3. Collection pour stocker nos commandes
client.commands = new Collection();

// 4. Charger dynamiquement toutes les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('🔄 Chargement des commandes...');
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Vérifier que la commande a un nom et une fonction execute
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Commande chargée: ${command.data.name}`);
    } else {
        console.log(`⚠️  Commande ignorée (${file}): manque 'data' ou 'execute'`);
    }
}

// 5. Événement : Bot connecté
client.once('clientReady', () => {
    console.log('🚀 Epihack Bot est en ligne !');
    console.log(`📊 Connecté en tant que ${client.user.tag}`);
    console.log(`🏠 Présent sur ${client.guilds.cache.size} serveur(s)`);
    
    // Définir le statut du bot
    client.user.setPresence({
        activities: [{ name: 'HackTheBox | !help', type: 3 }], // type: 3 = WATCHING
        status: 'online'
    });
});

// 6. Événement : Nouveau message (pour les commandes préfixées)
client.on('messageCreate', async (message) => {
    // DEBUG: Afficher tous les messages reçus
    console.log(`📨 Message reçu: "${message.content}" de ${message.author.tag}`);
    
    // Ignorer les bots et les messages sans préfixe
    if (message.author.bot) {
        console.log('🤖 Message ignoré: vient d\'un bot');
        return;
    }
    
    if (!message.content.startsWith('!')) {
        console.log('❌ Message ignoré: ne commence pas par !');
        return;
    }

    console.log('✅ Message valide détecté, processing...');

    // Parser la commande et les arguments
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    console.log(`🎯 Commande: "${commandName}", Args: [${args.join(', ')}]`);

    // Trouver la commande
    const command = client.commands.get(commandName);
    if (!command) {
        console.log(`❌ Commande "${commandName}" non trouvée`);
        return;
    }

    console.log(`🚀 Exécution de la commande: ${commandName}`);

    try {
        // Exécuter la commande
        await command.execute(message, args);
        console.log(`📝 Commande exécutée: ${commandName} par ${message.author.tag}`);
    } catch (error) {
        console.error(`❌ Erreur dans la commande ${commandName}:`, error);
        message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande.');
    }
});

// 7. Gestion des erreurs globales
client.on('error', error => {
    console.error('❌ Erreur Discord:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Promesse rejetée non gérée:', error);
});

// 8. Connexion du bot
client.login(process.env.DISCORD_TOKEN);