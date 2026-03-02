// src/channels/slack/index.ts — Slack channel (@slack/bolt Socket Mode + shared adapter)
// Raw JSON of every Slack event → agent. Zero message parsing — future-proof.

import type { AppConfig } from "@/config.ts";
import type { Channel } from "@/channels/types.ts";
import { createChannelHandler } from "@/channels/adapter.ts";
import { log } from "@/logs/logger.ts";

const logger = log("slack");

function getRole(userId: string, config: AppConfig): "owner" | "user" | "denied" {
    const sl = (config as any).slack;
    if (!sl) return "denied";
    if (sl.ownerIds?.includes(userId)) return "owner";
    if (sl.allowedUserIds?.length === 0) return "user";
    if (sl.allowedUserIds?.includes(userId)) return "user";
    return "denied";
}

export default {
    name: "slack",
    async start(config) {
        const botToken = process.env.SLACK_BOT_TOKEN;
        const appToken = process.env.SLACK_APP_TOKEN;
        if (!botToken || !appToken) { logger.warn("SLACK_BOT_TOKEN or SLACK_APP_TOKEN not set — skipping"); return; }

        const { App } = await import("@slack/bolt");
        const app = new App({ token: botToken, appToken, socketMode: true });

        const handler = createChannelHandler({
            channel: "slack",
            historyBudget: (config as any).slack?.historyTokenBudget ?? 12000,
            maxReplyLength: 40000, // Slack limit
            sendReply: async (chatId, text) => {
                await app.client.chat.postMessage({ channel: chatId, text });
            },
        });

        app.message(async ({ message, say }) => {
            const msg = message as any;
            if (msg.subtype || msg.bot_id) return;
            const sl = (config as any).slack;
            const allowed = sl?.allowedChannelIds;
            if (allowed?.length && !allowed.includes(msg.channel)) return;

            const role = getRole(msg.user, config);
            if (role === "denied") return;

            handler.enqueue(
                config, msg, msg.channel,
                msg.user, msg.user, role,
                sl?.rateLimitPerMinute ?? 15,
            );
        });

        await app.start();
        logger.info("✓ Slack connected (Socket Mode)");
        await new Promise(() => { }); // run forever
    },
} satisfies Channel;
