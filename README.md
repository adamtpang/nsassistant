# Network State LLM Assistant

A chatbot assistant for the Network State community that provides information from various context sources including wiki content, calendar events, and Discord conversations.

## Features

- Modular backend with swappable LLM models via Replicate
- Claude 3.7 integration with streaming responses
- Context-aware responses using Network State community data
- API endpoints for chat interactions
- Easy to extend with additional context sources

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Replicate API token (get one at https://replicate.com)

### Full Stack Setup (Frontend + Backend)

1. Clone the repository
2. Run the setup script to install all dependencies:
   ```
   ./setup.sh
   ```
   or install manually:
   ```
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Create a `.env` file in the backend directory based on `.env.example` and add your Replicate API token:
   ```
   PORT=3001
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   MODEL_VERSION=anthropic/claude-3.7-sonnet
   ```
4. Start both frontend and backend:
   ```
   npm run dev
   ```

The backend will be running at http://localhost:3001 and the frontend at http://localhost:3000

### Backend-Only Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your Replicate API token
4. Start the server:
   ```
   npm run dev
   ```

### Frontend-Only Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the React development server:
   ```
   npm run dev
   ```

## API Endpoints

- `POST /api/chat` - Send a message to the chatbot
  - Request body: `{ "message": "Your question here", "contextTypes": ["wiki", "calendar", "discord"] }`
  - Response: `{ "response": "Assistant's response" }`

- `POST /api/chat/stream` - Stream a message response from the chatbot (Server-Sent Events)
  - Request body: `{ "message": "Your question here", "contextTypes": ["wiki", "calendar", "discord"] }`
  - Response: Stream of SSE events: `data: {"chunk": "text chunk"}`

- `GET /api/chat/contexts` - Get available context types
  - Response: `{ "contexts": ["wiki", "calendar", "discord"] }`

- `GET /api/health` - Health check endpoint
  - Response: `{ "status": "ok", "message": "Server is running" }`

## Testing

- Test API endpoints:
  ```
  cd backend && npm run test:api
  ```

- Test Claude 3.7 integration:
  ```
  cd backend && npm run test:claude
  ```

## Customizing the LLM Model

You can easily swap out the LLM model by changing the `MODEL_VERSION` in your `.env` file. Some options include:

- Claude 3.7 Sonnet: `anthropic/claude-3.7-sonnet`
- Claude 3.5 Sonnet: `anthropic/claude-3.5-sonnet`
- Llama 2 70B: `meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3`

## Adding New Context Sources

To add a new context source:

1. Create a new text file in the `backend/context` directory (e.g., `blog.txt`)
2. Add your content to the file
3. Restart the server
4. The new context will automatically be available via the API

## License

MIT