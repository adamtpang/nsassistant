const Replicate = require('replicate');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Get response from LLM model via Replicate
 * @param {string} message - User message
 * @param {string} context - Context information
 * @returns {Promise<string>} - LLM response
 */
async function getModelResponse(message, context) {
    try {
        // Check if API token is configured
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('REPLICATE_API_TOKEN is not configured');
        }

        // Get model version from environment or use default (Claude 3.7 Sonnet)
        const modelVersion = process.env.MODEL_VERSION || 'anthropic/claude-3.7-sonnet';

        // Create system prompt with context
        const systemPrompt = `You are a helpful assistant for the Network State community.
You have access to the following context information to help answer questions:
${context}

Please use this context to provide accurate and helpful responses. If you don't know the answer or if it's not in the context, please say so rather than making up information.`;

        console.log('Sending request to Replicate...');

        // Format input for Claude 3.7
        const input = {
            prompt: `${systemPrompt}\n\nHuman: ${message}\n\nAssistant:`,
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9
        };

        // Call Replicate API
        const output = await replicate.run(modelVersion, { input });

        // Join the output if it's an array (needed for backwards compatibility)
        const response = Array.isArray(output) ? output.join('') : output;

        console.log('Received response from Replicate');
        return response;
    } catch (error) {
        console.error('Error calling LLM:', error);
        throw error;
    }
}

/**
 * Get streaming response from LLM model via Replicate
 * @param {string} message - User message
 * @param {string} context - Context information
 * @param {function} onChunk - Callback function for each chunk of the streamed response
 * @returns {Promise<void>}
 */
async function getStreamingModelResponse(message, context, onChunk) {
    try {
        // Check if API token is configured
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('REPLICATE_API_TOKEN is not configured');
        }

        // Get model version from environment or use default (Claude 3.7 Sonnet)
        const modelVersion = process.env.MODEL_VERSION || 'anthropic/claude-3.7-sonnet';

        // Create system prompt with context
        const systemPrompt = `You are a helpful assistant for the Network State community.
You have access to the following context information to help answer questions:
${context}

Please use this context to provide accurate and helpful responses. If you don't know the answer or if it's not in the context, please say so rather than making up information.`;

        console.log('Starting streaming request to Replicate...');

        // Format input for Claude 3.7
        const input = {
            prompt: `${systemPrompt}\n\nHuman: ${message}\n\nAssistant:`,
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9
        };

        // Stream from Replicate API
        for await (const event of replicate.stream(modelVersion, { input })) {
            // Call the callback function for each chunk
            if (onChunk && typeof onChunk === 'function') {
                onChunk(event);
            }
        }

        console.log('Completed streaming response from Replicate');
    } catch (error) {
        console.error('Error streaming from LLM:', error);
        throw error;
    }
}

/**
 * Factory function to create a model adapter
 * This allows for easy swapping of different LLM providers
 * @param {string} provider - The LLM provider to use
 * @returns {Object} - The model adapter
 */
function createModelAdapter(provider = 'replicate') {
    switch (provider.toLowerCase()) {
        case 'replicate':
            return {
                getResponse: getModelResponse,
                getStreamingResponse: getStreamingModelResponse
            };
        // Add more providers here as needed
        default:
            return {
                getResponse: getModelResponse,
                getStreamingResponse: getStreamingModelResponse
            };
    }
}

module.exports = {
    getModelResponse,
    getStreamingModelResponse,
    createModelAdapter
};