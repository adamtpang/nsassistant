import React, { useState } from 'react';
import './App.css';
import ChatExample from './ChatExample';
import LandingPage from './LandingPage';

function App() {
    const [showChat, setShowChat] = useState(false);

    return (
        <div className="App">
            {showChat ? (
                <>
                    <header className="App-header">
                        <h1>Network State Assistant</h1>
                        <p>Context-aware AI assistant for the Network State community</p>
                    </header>
                    <main>
                        <ChatExample />
                    </main>
                    <footer>
                        <p>Powered by Claude 3.7 Sonnet via Replicate</p>
                        <button
                            className="back-button"
                            onClick={() => setShowChat(false)}
                        >
                            Back to Landing Page
                        </button>
                    </footer>
                </>
            ) : (
                <LandingPage onStartChat={() => setShowChat(true)} />
            )}
        </div>
    );
}

export default App;