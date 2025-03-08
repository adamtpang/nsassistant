const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const { getModelResponse } = require('../services/llm');

// Load context data
const loadContextData = () => {
    const contextDir = path.join(__dirname, '..', 'context');
    const contextData = {};

    try {
        const files = fs.readdirSync(contextDir);

        files.forEach(file => {
            const filePath = path.join(contextDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const contextName = path.basename(file, path.extname(file));
            contextData[contextName] = content;
        });

        return contextData;
    } catch (error) {
        console.error('Error loading context data:', error);
        return {};
    }
};

// Context data
const contextData = loadContextData();

// POST /api/chat - Process a chat message
router.post('/', async (req, res) => {
    try {
        const { message, contextTypes = ['wiki', 'calendar', 'discord'] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Build context string based on requested context types
        let contextString = '';
        contextTypes.forEach(type => {
            if (contextData[type]) {
                contextString += `\n\n--- ${type.toUpperCase()} CONTEXT ---\n${contextData[type]}`;
            }
        });

        // Get response from LLM
        const response = await getModelResponse(message, contextString);

        return res.json({ response });
    } catch (error) {
        console.error('Error processing chat:', error);
        return res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// GET /api/chat/contexts - Get available context types
router.get('/contexts', (req, res) => {
    const availableContexts = Object.keys(contextData);
    res.json({ contexts: availableContexts });
});

module.exports = router;