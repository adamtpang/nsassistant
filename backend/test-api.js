const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3001}`;

// Test health endpoint
async function testHealth() {
    try {
        console.log('Testing health endpoint...');
        const response = await axios.get(`${API_URL}/api/health`);
        console.log('Health check response:', response.data);
        return true;
    } catch (error) {
        console.error('Health check failed:', error.message);
        return false;
    }
}

// Test contexts endpoint
async function testContexts() {
    try {
        console.log('\nTesting contexts endpoint...');
        const response = await axios.get(`${API_URL}/api/chat/contexts`);
        console.log('Available contexts:', response.data.contexts);
        return response.data.contexts;
    } catch (error) {
        console.error('Contexts check failed:', error.message);
        return [];
    }
}

// Test chat endpoint
async function testChat(message = 'What is a Network State?', contexts = ['wiki']) {
    try {
        console.log(`\nTesting chat endpoint with message: "${message}"...`);
        console.log(`Using contexts: ${contexts.join(', ')}`);

        const response = await axios.post(`${API_URL}/api/chat`, {
            message,
            contextTypes: contexts
        });

        console.log('\nChat response:');
        console.log(response.data.response);
        return true;
    } catch (error) {
        console.error('Chat request failed:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('=== TESTING API ===');

    // Test health endpoint
    const healthOk = await testHealth();
    if (!healthOk) {
        console.error('Health check failed. Make sure the server is running.');
        return;
    }

    // Test contexts endpoint
    const contexts = await testContexts();
    if (contexts.length === 0) {
        console.warn('No contexts available. Check your context files.');
    }

    // Test chat endpoint
    if (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_API_TOKEN !== 'your_replicate_api_token_here') {
        await testChat('Tell me about the Network State concept', contexts);
    } else {
        console.warn('\nSkipping chat test because REPLICATE_API_TOKEN is not configured.');
        console.warn('Set your Replicate API token in the .env file to test the chat endpoint.');
    }

    console.log('\n=== TESTS COMPLETED ===');
}

// Run the tests
runTests();