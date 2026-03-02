// src/channels/discord/README.md — Discord channel contract
//
// ## Purpose
// Discord bot channel — listens to messages via Discord gateway, sends raw JSON to agent.
//
// ## Files
// - `index.ts` — Channel entry point. Uses discord.js Client + shared adapter.
//
// ## Setup
// 1. Create a Discord bot at https://discord.com/developers/applications
// 2. Enable MESSAGE CONTENT intent in Bot settings
// 3. Add bot to server with messages.read + messages.send permissions
// 4. Set env: DISCORD_BOT_TOKEN, config: discord.ownerIds + discord.allowedChannelIds
//
// ## Rules
// - Raw JSON of the Discord Message object is sent to agent (future-proof)
// - Role resolved from discord.ownerIds config
// - Max 200 lines per file
