import React from 'react';
import './App.css';
import ChatExample from './ChatExample';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Network State Assistant</h1>
                <p>Context-aware AI assistant for the Network State community</p>
            </header>
            <main>
                <ChatExample />
            </main>
            <footer>
                <p>Powered by Claude 3.7 Sonnet via Replicate</p>
            </footer>
        </div>
    );
}

export default App;