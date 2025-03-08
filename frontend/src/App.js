import React from 'react';
import './App.css';
import ChatExample from './ChatExample';

function App() {
    return (
        <div className="landing-page">
            {/* Minimal header */}
            <header className="landing-header">
                <div className="logo-container">
                    <div className="logo-image"></div>
                    <span className="logo-text">Network Assistant</span>
                </div>
            </header>

            {/* Main chat content */}
            <main className="chat-main">
                <ChatExample />
            </main>
        </div>
    );
}

export default App;