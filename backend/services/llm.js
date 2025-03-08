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

        // Get model version from environment or use default
        const modelVersion = process.env.MODEL_VERSION ||
            'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3';

        // Create system prompt with context
        const systemPrompt = `You are a helpful assistant for the Network State community.
You have access to the following context information to help answer questions:
${context}

Please use this context to provide accurate and helpful responses. If you don't know the answer or if it's not in the context, please say so rather than making up information.`;

        // Create the prompt for the model
        const prompt = `<s>[INST] <<SYS>>
${systemPrompt}
<</SYS>>

${message} [/INST]`;

        console.log('Sending request to Replicate...');

        // Call Replicate API
        const output = await replicate.run(
            modelVersion,
            {
                input: {
                    prompt: prompt,
                    max_new_tokens: 1000,
                    temperature: 0.7,
                    top_p: 0.9,
                    top_k: 50,
                },
            }
        );

        // Join the output array into a single string
        const response = output.join('');

        console.log('Received response from Replicate');
        return response;
    } catch (error) {
        console.error('Error calling LLM:', error);
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
                getResponse: getModelResponse
            };
        // Add more providers here as needed
        default:
            return {
                getResponse: getModelResponse
            };
    }
}

module.exports = {
    getModelResponse,
    createModelAdapter
};