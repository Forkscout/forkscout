// src/channels/matrix/README.md — Matrix channel contract
//
// ## Purpose
// Matrix bot channel — connects to a Matrix homeserver, listens for room messages.
//
// ## Files
// - `index.ts` — Channel entry point. Uses matrix-bot-sdk + shared adapter.
//
// ## Setup
// 1. Create a Matrix account for the bot
// 2. Set env: MATRIX_HOMESERVER_URL, MATRIX_ACCESS_TOKEN
// 3. Config: matrix.ownerIds, matrix.allowedRoomIds
//
// ## Rules
// - Raw JSON of the Matrix event object is sent to agent (future-proof)
// - Role resolved from matrix.ownerIds config
// - Max 200 lines per file
