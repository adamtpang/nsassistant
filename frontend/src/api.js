/**
 * Network State Assistant API Client
 *
 * This file provides functions to interact with the backend API.
 */

const API_URL = 'http://localhost:3001/api';

/**
 * Get available context types
 * @returns {Promise<string[]>} Array of available context types
 */
export async function getAvailableContexts() {
    try {
        const response = await fetch(`${API_URL}/chat/contexts`);
        const data = await response.json();
        return data.contexts || [];
    } catch (error) {
        console.error('Error fetching contexts:', error);
        return [];
    }
}

/**
 * Send a message to the chatbot
 * @param {string} message - User message
 * @param {string[]} contextTypes - Array of context types to use
 * @returns {Promise<string>} Chatbot response
 */
export async function sendMessage(message, contextTypes = ['wiki', 'calendar', 'discord']) {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                contextTypes,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return data.response;
        } else {
            throw new Error(data.error || 'Failed to get response');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

/**
 * Check if the API is available
 * @returns {Promise<boolean>} True if API is available
 */
export async function checkApiHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}