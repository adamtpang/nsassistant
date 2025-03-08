import React from 'react';
import './App.css';
import ChatExample from './ChatExample';
import './LandingPage.css'; // We'll use styling from the landing page

function App() {
    return (
        <div className="landing-page">
            {/* Header from landing page design */}
            <header className="landing-header">
                <button className="icon-button">
                    <span className="menu-icon"></span>
                </button>
                <div className="logo-container">
                    <div className="logo-image"></div>
                    <span className="logo-text">Network Assistant</span>
                </div>
                <div className="header-info">
                    <span>Powered by Claude 3.7 Sonnet</span>
                </div>
            </header>

            {/* Main chat content */}
            <main className="chat-main">
                <ChatExample />
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>Network State LLM Assistant with context awareness for wiki, calendar, and Discord data</p>
            </footer>
        </div>
    );
}

export default App;