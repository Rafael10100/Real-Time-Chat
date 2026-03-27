# Real-Time Chat Application

## Overview
A real-time chat application with a Node.js/Socket.IO backend and a React frontend. Users can join a chat room with a username, send and receive messages in real-time, see who is online, and view typing indicators.

## Architecture

- **Backend**: `chat-backend/` — Node.js + Express v5 + Socket.IO v4, serves on port 5000
- **Frontend**: `chat-frotend/` — React 19, built as a static bundle and served by the backend

The backend serves the compiled React build as static files. Socket.IO connects via the same origin, so no CORS or cross-origin issues.

## Running the App

The workflow command is:
```
cd chat-backend && node server.js
```

The frontend must be built before starting the server:
```
cd chat-frotend && npm run build
```

## Key Design Decisions

- The frontend connects to Socket.IO using `window.location.origin` (relative), so it works in any environment without hardcoding a URL.
- The backend uses Express v5, which requires `/{*splat}` syntax for wildcard catch-all routes (not `*`).
- The server listens on `0.0.0.0:5000` to be accessible via Replit's proxy.
- `"type": "module"` is set in the backend package.json to support ES module syntax.

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `user_join` | Client → Server | User joins with username |
| `send_message` | Client → Server | Send a chat message |
| `typing` | Client → Server | User is typing |
| `stop_typing` | Client → Server | User stopped typing |
| `receive_message` | Server → Client | Broadcast a message |
| `users_update` | Server → Client | Updated list of online users |
| `user_typing` | Server → Client | Notify others someone is typing |
| `user_stop_typing` | Server → Client | Notify others someone stopped typing |
