import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getAvailableContexts, checkApiHealth, streamMessage } from './api';
import './ChatExample.css';

// Sample suggestions
const INITIAL_SUGGESTIONS = [
    "Tell me about the Network State concept",
    "What events are happening soon?",
    "Show me recent Discord discussions",
    "How do I join a Network State?",
];

const FOLLOW_UP_SUGGESTIONS = [
    "Tell me more about that",
    "How does this relate to blockchain?",
    "What are some examples?",
    "Who created this concept?"
];

/**
 * Example Chat Component for Network State Assistant
 *
 * This is a simple example of how to integrate with the backend API.
 * Your friend can use this as a reference for their frontend implementation.
 */
function ChatExample() {
    const [message, setMessage] = useState('');
    const [contexts, setContexts] = useState([]);
    const [selectedContexts, setSelectedContexts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiAvailable, setApiAvailable] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [useStreaming, setUseStreaming] = useState(true);
    const abortControllerRef = useRef(null);

    // Chat state
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [currentSuggestions, setCurrentSuggestions] = useState(INITIAL_SUGGESTIONS);

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

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Reset suggestions after receiving a response
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant") {
                setCurrentSuggestions(messages.length > 2 ? FOLLOW_UP_SUGGESTIONS : INITIAL_SUGGESTIONS);
                setShowSuggestions(true);
            }
        }
    }, [messages]);

    // Handle input change
    const handleInputChange = (e) => {
        setMessage(e.target.value);
        if (e.target.value === "") {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setMessage(suggestion);
        setShowSuggestions(false);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim() || isLoading) return;

        // Add user message to chat
        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content: message
        };
        setMessages(prev => [...prev, userMessage]);

        // Clear input and show loading
        setMessage("");
        setIsLoading(true);
        setShowSuggestions(false);

        if (useStreaming) {
            // Use streaming API
            setIsStreaming(true);

            // Create a function to handle each chunk
            const handleChunk = (chunk) => {
                setMessages(prevMessages => {
                    const lastMessage = prevMessages[prevMessages.length - 1];

                    // If there's already an assistant message, append to it
                    if (lastMessage && lastMessage.role === "assistant") {
                        return [
                            ...prevMessages.slice(0, -1),
                            { ...lastMessage, content: lastMessage.content + chunk }
                        ];
                    }
                    // Otherwise create a new message
                    else {
                        return [
                            ...prevMessages,
                            { id: Date.now().toString(), role: "assistant", content: chunk }
                        ];
                    }
                });
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
                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now().toString(),
                            role: "assistant",
                            content: `Error: ${error.message}. Please try again.`
                        }
                    ]);
                    setIsLoading(false);
                    setIsStreaming(false);
                    abortControllerRef.current = null;
                }
            );
        } else {
            // Use regular API
            try {
                const chatResponse = await sendMessage(message, selectedContexts);
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: chatResponse
                    }
                ]);
            } catch (error) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: `Error: ${error.message}. Please try again.`
                    }
                ]);
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
            <div className="chat-container">
                <div className="api-error">
                    <h2>API Not Available</h2>
                    <p>The backend API is not available. Please make sure the server is running.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="welcome-container">
                        <div className="welcome-logo"></div>
                        <h1 className="welcome-title">Network Assistant</h1>
                        <p className="welcome-subtitle">Ask about Network State concepts, events, and discussions</p>

                        <div className="context-selector">
                            {contexts.length > 0 && (
                                <div className="context-options">
                                    {contexts.map(context => (
                                        <label key={context} className="context-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedContexts.includes(context)}
                                                onChange={() => {
                                                    if (selectedContexts.includes(context)) {
                                                        setSelectedContexts(selectedContexts.filter(c => c !== context));
                                                    } else {
                                                        setSelectedContexts([...selectedContexts, context]);
                                                    }
                                                }}
                                            />
                                            {context}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

                {messages.map((message) => (
                    <div key={message.id} className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}>
                        <div className={`message-role ${message.role === "user" ? "user-role" : "assistant-role"}`}>
                            {message.role === "user" ? "You" : "Network"}
                        </div>
                        <div className={`message-content ${message.role === "user" ? "user-content" : "assistant-content"}`}>
                            {message.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message assistant-message">
                        <div className="message-role assistant-role">Network</div>
                        <div className="message-content assistant-content">
                            <span className="loading-dot"></span>
                            <span className="loading-dot"></span>
                            <span className="loading-dot"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                {/* Suggestions Section */}
                {showSuggestions && !isLoading && messages.length > 0 && (
                    <div className="suggestions-container">
                        <div className="suggestions-grid">
                            {currentSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="suggestion-button"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Form */}
                <div className="input-form-container">
                    <form onSubmit={handleSubmit} className="input-form">
                        <input
                            value={message}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            className="input-field"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !message.trim()}
                            className="send-button"
                        >
                            <span className="send-icon"></span>
                            Send
                        </button>
                        {isStreaming && (
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancelStream}
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChatExample;