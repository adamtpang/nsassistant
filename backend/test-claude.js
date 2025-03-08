const dotenv = require('dotenv');
const Replicate = require('replicate');

// Load environment variables
dotenv.config();

// Initialize Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Test regular (non-streaming) response
async function testRegular() {
    try {
        console.log('Testing regular Claude 3.7 response...');

        const input = {
            prompt: "Give me a concise explanation of what a Network State is.",
            max_tokens: 500,
            temperature: 0.7
        };

        console.log('Sending request to Claude 3.7...');

        const output = await replicate.run(
            "anthropic/claude-3.7-sonnet",
            { input }
        );

        console.log('\nClaude 3.7 Response:');
        console.log(output);

        return true;
    } catch (error) {
        console.error('Error with Claude 3.7:', error);
        return false;
    }
}

// Test streaming response
async function testStreaming() {
    try {
        console.log('\n\nTesting streaming Claude 3.7 response...');

        const input = {
            prompt: "Write a short poem about a Network State.",
            max_tokens: 500,
            temperature: 0.7
        };

        console.log('Starting stream from Claude 3.7...\n');

        // Start streaming
        let fullResponse = '';
        for await (const event of replicate.stream("anthropic/claude-3.7-sonnet", { input })) {
            process.stdout.write(event);
            fullResponse += event;
        }

        console.log('\n\nStreaming completed.');
        return true;
    } catch (error) {
        console.error('Error streaming from Claude 3.7:', error);
        return false;
    }
}

// Run tests
async function runTests() {
    // Check API token
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === 'your_replicate_api_token_here') {
        console.error('ERROR: REPLICATE_API_TOKEN is not configured in .env file');
        console.error('Please sign up at https://replicate.com to get an API token');
        console.error('Then, update the REPLICATE_API_TOKEN value in your .env file');
        return;
    }

    console.log('=== TESTING CLAUDE 3.7 VIA REPLICATE ===\n');

    // Run tests
    await testRegular();
    await testStreaming();

    console.log('\n=== TESTS COMPLETED ===');
}

// Run the tests
runTests();