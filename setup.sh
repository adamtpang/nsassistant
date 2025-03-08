#!/bin/bash

# Setup script for Network State Assistant

echo "Setting up Network State Assistant..."
echo "This will install dependencies for both frontend and backend."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install

# Return to root
cd ..

echo "Setup complete! You can now run the project using:"
echo "- 'npm run dev' from the root directory to run both frontend and backend"
echo "- 'cd backend && npm run dev' to run only the backend"
echo "- 'cd frontend && npm run dev' to run only the frontend"
echo ""
echo "Note: Don't forget to add your Replicate API token to backend/.env"