import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getAvailableContexts, checkApiHealth, streamMessage } from './api';
import './ChatExample.css';

/**
 * Example Chat Component for Network State Assistant
 *
 * This is a simple example of how to integrate with the backend API.
 * Your friend can use this as a reference for their frontend implementation.
 */
function ChatExample() {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [contexts, setContexts] = useState([]);
    const [selectedContexts, setSelectedContexts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiAvailable, setApiAvailable] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [useStreaming, setUseStreaming] = useState(true);
    const abortControllerRef = useRef(null);

    // Check API health and load available contexts on component mount
    useEffect(() => {
        async function initialize() {
            // Check if API is available
            const isAvailable = await checkApiHealth();
            setApiAvailable(isAvailable);

            if (isAvailable) {
                // Load available contexts
                const availableContexts = await getAvailableContexts();
                setContexts(availableContexts);
                setSelectedContexts(availableContexts); // Select all by default
            }
        }

        initialize();
    }, []);

    // Cleanup streaming on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current();
            }
        };
    }, []);

    // Handle context selection
    const handleContextToggle = (context) => {
        if (selectedContexts.includes(context)) {
            setSelectedContexts(selectedContexts.filter(c => c !== context));
        } else {
            setSelectedContexts([...selectedContexts, context]);
        }
    };

    // Handle streaming toggle
    const handleStreamingToggle = () => {
        setUseStreaming(!useStreaming);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        setResponse('');

        if (useStreaming) {
            // Use streaming API
            setIsStreaming(true);

            // Create a function to handle each chunk
            const handleChunk = (chunk) => {
                setResponse(prevResponse => prevResponse + chunk);
            };

            // Start streaming
            abortControllerRef.current = streamMessage(
                message,
                selectedContexts,
                handleChunk,
                () => {
                    // On complete
                    setIsLoading(false);
                    setIsStreaming(false);
                    abortControllerRef.current = null;
                },
                (error) => {
                    // On error
                    setResponse(`Error: ${error.message}`);
                    setIsLoading(false);
                    setIsStreaming(false);
                    abortControllerRef.current = null;
                }
            );
        } else {
            // Use regular API
            try {
                const chatResponse = await sendMessage(message, selectedContexts);
                setResponse(chatResponse);
            } catch (error) {
                setResponse(`Error: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Handle canceling a streaming request
    const handleCancelStream = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current();
            abortControllerRef.current = null;
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    if (!apiAvailable) {
        return (
            <div className="chat-container error">
                <h2>API Not Available</h2>
                <p>The backend API is not available. Please make sure the server is running at http://localhost:3001</p>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <h2>Network State Assistant</h2>

            <div className="context-selector">
                <h3>Select Context Sources:</h3>
                <div className="context-options">
                    {contexts.map(context => (
                        <label key={context}>
                            <input
                                type="checkbox"
                                checked={selectedContexts.includes(context)}
                                onChange={() => handleContextToggle(context)}
                            />
                            {context}
                        </label>
                    ))}
                </div>
            </div>

            <div className="streaming-toggle">
                <label>
                    <input
                        type="checkbox"
                        checked={useStreaming}
                        onChange={handleStreamingToggle}
                    />
                    Use streaming (Claude 3.7 real-time response)
                </label>
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask something about Network State..."
                    rows={4}
                    disabled={isLoading}
                />
                <div className="button-container">
                    <button type="submit" disabled={isLoading || !message.trim()}>
                        {isLoading ? 'Thinking...' : 'Send'}
                    </button>
                    {isStreaming && (
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={handleCancelStream}
                        >
                            Cancel Stream
                        </button>
                    )}
                </div>
            </form>

            {isLoading && !isStreaming && <div className="loading">Getting response...</div>}
            {isStreaming && <div className="streaming">Streaming response...</div>}

            {response && (
                <div className="response">
                    <h3>Response:</h3>
                    <div className="response-content">{response}</div>
                </div>
            )}
        </div>
    );
}

export default ChatExample;