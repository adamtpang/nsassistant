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
 * Stream a message response from the chatbot
 * @param {string} message - User message
 * @param {string[]} contextTypes - Array of context types to use
 * @param {function} onChunk - Callback function for each chunk of the response
 * @param {function} onDone - Callback function when streaming is complete
 * @param {function} onError - Callback function for errors
 * @returns {function} Function to abort the stream
 */
export function streamMessage(
    message,
    contextTypes = ['wiki', 'calendar', 'discord'],
    onChunk,
    onDone,
    onError
) {
    // Create abort controller to allow canceling the stream
    const controller = new AbortController();
    const { signal } = controller;

    // Start streaming
    fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            contextTypes,
        }),
        signal,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            // Set up event source from response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Function to read stream chunks
            function readStream() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        if (onDone) onDone();
                        return;
                    }

                    try {
                        // Decode and process the chunk
                        const chunk = decoder.decode(value, { stream: true });

                        // Parse SSE format (data: {...})
                        const lines = chunk.split('\n\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);

                                // Check if it's the end marker
                                if (data === '[DONE]') {
                                    if (onDone) onDone();
                                    return;
                                }

                                try {
                                    const parsedData = JSON.parse(data);
                                    if (parsedData.chunk && onChunk) {
                                        onChunk(parsedData.chunk);
                                    } else if (parsedData.error && onError) {
                                        onError(new Error(parsedData.error));
                                    }
                                } catch (error) {
                                    console.error('Error parsing SSE data:', error);
                                }
                            }
                        }

                        // Continue reading the stream
                        readStream();
                    } catch (error) {
                        if (onError) onError(error);
                    }
                }).catch(error => {
                    if (error.name !== 'AbortError' && onError) {
                        onError(error);
                    }
                });
            }

            // Start reading the stream
            readStream();
        })
        .catch(error => {
            if (error.name !== 'AbortError' && onError) {
                onError(error);
            }
        });

    // Return abort function
    return () => controller.abort();
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