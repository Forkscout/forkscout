// src/channels/slack/README.md — Slack channel contract
//
// ## Purpose
// Slack bot channel — receives events via Slack Events API (Socket Mode), sends raw JSON to agent.
//
// ## Files
// - `index.ts` — Channel entry point. Uses @slack/bolt + shared adapter.
//
// ## Setup
// 1. Create a Slack app at https://api.slack.com/apps
// 2. Enable Socket Mode, subscribe to message.channels + message.im events
// 3. Set env: SLACK_BOT_TOKEN, SLACK_APP_TOKEN
// 4. Config: slack.ownerIds + slack.allowedChannelIds
//
// ## Rules
// - Raw JSON of the Slack event object is sent to agent (future-proof)
// - Role resolved from slack.ownerIds config
// - Max 200 lines per file
