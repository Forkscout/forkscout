---
name: 📡 New Channel
about: Propose or implement a new communication channel
title: "[Channel] "
labels: channel, enhancement
assignees: ''
---

## Channel Name

e.g., Signal, Bluesky, Mastodon, Zulip

## Platform Details

- **Library/SDK**: (npm package or API to use)
- **Connection type**: Gateway (WebSocket) / Webhook / Polling
- **Auth**: What credentials are needed? (bot token, API key, etc.)
- **Message limit**: Max reply length in characters
- **Media support**: Can it send images, files, voice?

## Required Vault Secrets

List the env vars / vault aliases this channel would need:

```
CHANNEL_BOT_TOKEN
CHANNEL_API_SECRET
```

## Implementation Notes

Any quirks, rate limits, or platform-specific behavior to know about.

## References

- API docs: [link]
- SDK: [npm link]
- Example bot: [link]

## Checklist

- [ ] I've read [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] I'd like to implement this myself
- [ ] I've checked there's no existing issue for this channel
