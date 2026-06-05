# DevEco Session Viewer

A plugin for [deveco](https://github.com/sst/opencode) that provides a local web UI to browse and viewing historical conversation sessions.

## Features

- **Session List View** - Browse all conversation sessions with search functionality
- **Session Detail View** - View complete conversation history with markdown rendering
- **Real-time Updates** - Automatic refresh via Server-Sent Events (SSE) when sessions or messages change
- **Clean Mode** - Hide intermediate agent steps, show only user inputs and final assistant responses
- **Sticky Header** - Session title and navigation controls stay visible while scrolling
- **Tool Call Display** - View tool invocations and their outputs
- **Reasoning Display** - View agent thinking process (collapsible in Clean Mode)

## Installation

### 1. Clone the repository

```bash
git clone https://gitcode.com/user/liujianghang/deveco-session-viewer.git
cd deveco-session-viewer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure in your deveco project

Add the plugin to your `deveco.jsonc` (or `opencode.jsonc`):

```jsonc
{
  "plugin": [
    ["./path/to/deveco-session-viewer", { "port": 9876 }]
  ]
}
```

**Options:**
- `port` (optional): HTTP server port, defaults to `9876`

### 4. Start deveco

```bash
bun dev
```

### 5. Open the web UI

Visit `http://localhost:9876` in your browser.

## Requirements

- **deveco**: >= 1.15.0 (or any compatible fork)
- **Node.js**: >= 18

## Usage

### Session List

- Browse all sessions sorted by most recent
- Use the search box to filter sessions by keyword
- Click any session card to view details

### Session Detail

- **Back** button (top right) - Return to session list
- **Clean Mode** toggle (top right) - Hide intermediate agent steps, show only:
  - All user inputs
  - Final assistant response for each turn
- Session title and metadata (creation time, model, token usage, cost) are displayed at the top

### Real-time Updates

The web UI automatically updates when:
- New sessions are created
- Session titles change
- New messages are added to the currently viewed session

Updates are delivered via Server-Sent Events (SSE) with automatic reconnection on disconnect.

## Architecture

This plugin is **zero-dependency** at runtime:

- Uses Node.js built-in `node:http` module
- Embeds the complete web UI as a string (no static files)
- Communicates with deveco via in-process client (no network overhead)
- Type definitions are inlined (no external `@opencode-ai/plugin` dependency)

The plugin starts an HTTP server that:
1. Serves the embedded web UI at `/`
2. Provides REST API endpoints for session data
3. Streams real-time events via SSE at `/api/events`

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | Web UI |
| `GET /api/info` | Project info (directory, projectId) |
| `GET /api/sessions?search=...` | List sessions with optional search |
| `GET /api/sessions/:id` | Get session details |
| `GET /api/sessions/:id/messages?limit=200` | Get session messages |
| `GET /api/events` | SSE stream for real-time updates |

## License

MIT License - see [LICENSE](./LICENSE)

Based on [opencode](https://github.com/sst/opencode) by SST.
