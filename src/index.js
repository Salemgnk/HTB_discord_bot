require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
client.commands = new Collection();

const commandPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
console.log('🔄 Chargement des commandes...');

for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Commande chargée: ${command.data.name}`);
    } else {
        console.log(`❌ Échec du chargement de la commande: ${file}`);
    }
}

client.once('ready', () => {
    console.log(`✅ Connecté 🚀 Epihack Bot est en ligne !'`);
    console.log(`📊 Connecté en tant que ${client.user.tag}`);
    console.log(`🏠 Présent sur ${client.guilds.cache.size} serveur(s)`);
    client.user.setActivity('HackTheBox | !help', { type: 'WATCHING' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('/')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Trouver la commande
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        // Exécuter la commande
        await command.execute(message, args);
        console.log(`📝 Commande exécutée: ${commandName} par ${message.author.tag}`);
    } catch (error) {
        console.error(`❌ Erreur dans la commande ${commandName}:`, error);
        message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande.');
    }
});

client.on('error', error => {
    console.error('❌ Erreur Discord:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Promesse rejetée non gérée:', error);
});

client.login(process.env.DISCORD_TOKEN);
