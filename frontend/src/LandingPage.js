import React, { useState, useRef, useEffect } from 'react';
import './LandingPage.css';

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

function LandingPage({ onStartChat }) {
    const [messages, setMessages] = useState([
        { id: "1", role: "assistant", content: "Hello! I'm your Network State Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [currentSuggestions, setCurrentSuggestions] = useState(INITIAL_SUGGESTIONS);
    const messagesEndRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        setShowSuggestions(false);
    };

    // Reset suggestions when a new message is sent
    useEffect(() => {
        if (messages.length > 0) {
            if (messages[messages.length - 1].role === "assistant") {
                setCurrentSuggestions(messages.length > 2 ? FOLLOW_UP_SUGGESTIONS : INITIAL_SUGGESTIONS);
                setShowSuggestions(true);
            }
        }
    }, [messages]);

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (e.target.value === "") {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        // Add user message
        const userMessage = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);

        // Clear input and show loading
        setInput("");
        setIsLoading(true);
        setShowSuggestions(false);

        // Simulate assistant response (in a real app, this would call your API)
        setTimeout(() => {
            const responseMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "This is a simulated response. To see actual responses from Claude 3.7, click the 'Start Chatting' button to use the real assistant!"
            };
            setMessages(prev => [...prev, responseMessage]);
            setIsLoading(false);
        }, 1500);
    };

    if (!mounted) return null;

    return (
        <div className="landing-page">
            {/* Header */}
            <header className="landing-header">
                <button className="icon-button">
                    <span className="menu-icon"></span>
                </button>
                <div className="logo-container">
                    <div className="logo-image"></div>
                    <span className="logo-text">Network Assistant</span>
                </div>
                <button className="login-button" onClick={onStartChat}>
                    START CHATTING
                    <span className="login-icon"></span>
                </button>
            </header>

            {/* Chat Messages */}
            <div className="chat-container">
                <div className="messages-container">
                    {messages.length <= 1 ? (
                        <div className="welcome-container">
                            <div className="welcome-logo"></div>
                            <h1 className="welcome-title">Network Assistant</h1>
                            <p className="welcome-subtitle">A Conversational Experience</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}>
                                <div className={`message-role ${message.role === "user" ? "user-role" : "assistant-role"}`}>
                                    {message.role === "user" ? "You" : "Network"}
                                </div>
                                <div className={`message-content ${message.role === "user" ? "user-content" : "assistant-content"}`}>
                                    {message.content}
                                </div>
                            </div>
                        ))
                    )}

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
            </div>

            {/* Input Area with Suggestions */}
            <div className="input-area">
                {/* Suggestions Section */}
                {showSuggestions && !isLoading && (
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
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            className="input-field"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="send-button"
                        >
                            <span className="send-icon"></span>
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;