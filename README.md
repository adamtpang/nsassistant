# Network State LLM Assistant

A chatbot assistant for the Network State community that provides information from various context sources including wiki content, calendar events, and Discord conversations.

## Features

- Modular backend with swappable LLM models via Replicate
- Context-aware responses using Network State community data
- API endpoints for chat interactions
- Easy to extend with additional context sources

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Replicate API token (get one at https://replicate.com)

### Backend Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example` and add your Replicate API token:
   ```
   PORT=3001
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   MODEL_VERSION=meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3
   ```
5. Start the server:
   ```
   npm start
   ```

The server will be running at http://localhost:3001

### API Endpoints

- `POST /api/chat` - Send a message to the chatbot
  - Request body: `{ "message": "Your question here", "contextTypes": ["wiki", "calendar", "discord"] }`
  - Response: `{ "response": "Assistant's response" }`

- `GET /api/chat/contexts` - Get available context types
  - Response: `{ "contexts": ["wiki", "calendar", "discord"] }`

- `GET /api/health` - Health check endpoint
  - Response: `{ "status": "ok", "message": "Server is running" }`

## Customizing the LLM Model

You can easily swap out the LLM model by changing the `MODEL_VERSION` in your `.env` file. Some options include:

- Llama 2 70B: `meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3`
- Llama 2 13B: `a16z-infra/llama-2-13b-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52`
- Mistral 7B: `mistralai/mistral-7b-instruct-v0.1:83b6a56e7c828e667f21fd596c338fd4f0039b46bcfa18d973e8e70e455fda70`

## Adding New Context Sources

To add a new context source:

1. Create a new text file in the `backend/context` directory (e.g., `blog.txt`)
2. Add your content to the file
3. Restart the server
4. The new context will automatically be available via the API

## License

MIT