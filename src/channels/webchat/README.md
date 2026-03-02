// src/channels/webchat/README.md — Web Chat channel contract
//
// ## Purpose
// WebSocket-based chat — connects to the existing self-channel HTTP server (port 3200).
// Zero external deps — uses Bun's native WebSocket.
//
// ## Files
// - `index.ts` — Channel entry point. Upgrades HTTP to WS on /ws path.
//
// ## Setup
// No setup needed — runs on the existing self-channel HTTP server.
// Frontend connects to ws://localhost:3200/ws
// Authentication via first message: { type: "auth", token: "..." }
//
// ## Rules
// - Raw JSON of the WebSocket message is sent to agent
// - Max 200 lines per file
