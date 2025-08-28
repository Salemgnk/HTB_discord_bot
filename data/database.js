// src/utils/database.js - Gestion simple de la base de données utilisateurs

const fs = require('fs').promises;
const path = require('path');

// 📁 Chemin vers le fichier de base de données
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.json');

/**
 * 🏗️ Initialiser la base de données si elle n'existe pas
 */
async function initDatabase() {
    try {
        // Créer le dossier data s'il n'existe pas
        const dataDir = path.dirname(DB_PATH);
        await fs.mkdir(dataDir, { recursive: true });
        
        // Vérifier si le fichier existe
        try {
            await fs.access(DB_PATH);
        } catch (error) {
            // Fichier n'existe pas, le créer
            const initialData = {
                users: {},
                lastUpdated: new Date().toISOString()
            };
            await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
            console.log('📊 Base de données initialisée');
        }
    } catch (error) {
        console.error('❌ Erreur initialisation DB:', error);
    }
}

/**
 * 📖 Lire la base de données
 * @returns {Promise<Object>} Données de la base
 */
async function readDatabase() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Erreur lecture DB:', error);
        // Retourner structure vide en cas d'erreur
        return { users: {}, lastUpdated: new Date().toISOString() };
    }
}

/**
 * 💾 Écrire dans la base de données  
 * @param {Object} data - Données à sauvegarder
 */
async function writeDatabase(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Erreur écriture DB:', error);
        throw error;
    }
}

/**
 * 👤 Enregistrer un utilisateur Discord avec son nom HTB
 * @param {string} discordId - ID Discord de l'utilisateur
 * @param {string} discordTag - Tag Discord (nom#0000)
 * @param {string} htbUsername - Nom d'utilisateur HTB
 */
async function registerUser(discordId, discordTag, htbUsername) {
    try {
        const db = await readDatabase();
        
        db.users[discordId] = {
            discordTag: discordTag,
            htbUsername: htbUsername,
            registeredAt: new Date().toISOString()
        };
        
        await writeDatabase(db);
        console.log(`✅ Utilisateur enregistré: ${discordTag} → ${htbUsername}`);
        return true;
    } catch (error) {
        console.error('❌ Erreur enregistrement utilisateur:', error);
        return false;
    }
}

/**
 * 🔍 Récupérer le nom HTB d'un utilisateur Discord
 * @param {string} discordId - ID Discord
 * @returns {Promise<string|null>} Nom HTB ou null si non trouvé
 */
async function getHtbUsername(discordId) {
    try {
        const db = await readDatabase();
        const user = db.users[discordId];
        return user ? user.htbUsername : null;
    } catch (error) {
        console.error('❌ Erreur récupération utilisateur:', error);
        return null;
    }
}

/**
 * 📊 Récupérer tous les utilisateurs enregistrés
 * @returns {Promise<Object>} Liste des utilisateurs
 */
async function getAllUsers() {
    try {
        const db = await readDatabase();
        return db.users;
    } catch (error) {
        console.error('❌ Erreur récupération tous utilisateurs:', error);
        return {};
    }
}

/**
 * 🗑️ Supprimer un utilisateur
 * @param {string} discordId - ID Discord à supprimer
 * @returns {Promise<boolean>} Succès ou échec
 */
async function unregisterUser(discordId) {
    try {
        const db = await readDatabase();
        
        if (db.users[discordId]) {
            delete db.users[discordId];
            await writeDatabase(db);
            console.log(`🗑️ Utilisateur supprimé: ${discordId}`);
            return true;
        }
        
        return false; // Utilisateur n'existait pas
    } catch (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        return false;
    }
}

// Initialiser la DB au démarrage
initDatabase();

module.exports = {
    registerUser,
    getHtbUsername,
    getAllUsers,
    unregisterUser,
    initDatabase
};