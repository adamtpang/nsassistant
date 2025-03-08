const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Chat API: http://localhost:${PORT}/api/chat`);
});

// Load context files on startup
const loadContextFiles = async () => {
    try {
        console.log('Loading context files...');
        const contextDir = path.join(__dirname, 'context');

        // Check if context directory exists
        if (!fs.existsSync(contextDir)) {
            console.warn('Context directory not found. Creating...');
            fs.mkdirSync(contextDir, { recursive: true });
        }

        // List all context files
        const files = fs.readdirSync(contextDir);
        console.log(`Found ${files.length} context files: ${files.join(', ')}`);
    } catch (error) {
        console.error('Error loading context files:', error);
    }
};

// Call the function to load context files
loadContextFiles();