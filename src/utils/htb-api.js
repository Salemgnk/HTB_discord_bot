const axios = require('axios');

const HTB_BASE_URL = 'https://www.hackthebox.com/api/v4';
const HTB_API_TOKEN = process.env.HTB_API_TOKEN;

const htbApi = axios.create({
    baseURL: HTB_BASE_URL,
    timeout: 10000,
    headers: {
        'Authorization': `Bearer ${HTB_API_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "EpihackBot/1.0"
    }
});

/**
 * 🔍 Search user by name
 * @param {string} username - HTB username
 * @returns {Promise<Object>} User data or null
 */
async function searchUser(username) {
    try {
        console.log(`🔍 Searching HTB: ${username}`);

        // User search endpoint
        const response = await htbApi.get(`/search/users/${encodeURIComponent(username)}`);
        
        if (response.data && response.data.length > 0) {
            // Prendre le premier résultat (match exact de préférence)
            const user = response.data.find(u => u.name.toLowerCase() === username.toLowerCase()) || response.data[0];

            console.log(`✅ User found: ${user.name} (ID: ${user.id})`);
            return user;
        } else {
            console.log(`❌ No user found for: ${username}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Error searching user:', error.response?.status, error.response?.statusText);

        if (error.response?.status === 401) {
            throw new Error('Invalid or expired HTB token');
        } else if (error.response?.status === 404) {
            return null; // User not found
        } else {
            throw new Error('HTB API error');
        }
    }
}

/**
 * 👤 Get full user profile
 * @param {number} userId - HTB user ID
 * @returns {Promise<Object>} Full profile
 */
async function getUserProfile(userId) {
    try {
        console.log(`📊 Getting HTB profile: ID ${userId}`);

        const response = await htbApi.get(`/user/profile/${userId}`);
        
        if (response.data && response.data.info) {
            console.log(`✅ Profile retrieved: ${response.data.info.name}`);
            return response.data;
        } else {
            throw new Error('Invalid profile data');
        }
    } catch (error) {
        console.error('❌ Error getting profile:', error.response?.status);

        if (error.response?.status === 401) {
            throw new Error('Invalid HTB token');
        } else if (error.response?.status === 404) {
            throw new Error('Profile not found');
        } else {
            throw new Error('HTB API error');
        }
    }
}

/**
 * 🎯 Get full profile by username (combined function)
 * @param {string} username - Username
 * @returns {Promise<Object>} Full profile or null
 */
async function getFullProfile(username) {
    try {
        // 1. Search for user
        const user = await searchUser(username);
        if (!user) return null;

        // 2. Get full profile
        const profile = await getUserProfile(user.id);

        // 3. Combine data
        return {
            basic: user,
            full: profile
        };
    } catch (error) {
        console.error(`❌ Error getting full profile for ${username}:`, error.message);
        throw error;
    }
}

/**
 * 🏥 Test HTB API connection
 * @returns {Promise<boolean>} True if API is working
 */
async function testConnection() {
    try {
        // Simple test with an endpoint that doesn't require parameters
        const response = await htbApi.get('/user/htb/profile');
        return response.status === 200;
    } catch (error) {
        console.error('❌ Error testing HTB connection:', error.response?.status);
        return false;
    }
}

module.exports = {
    searchUser,
    getUserProfile, 
    getFullProfile,
    testConnection
};