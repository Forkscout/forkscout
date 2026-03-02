// src/channels/discord/index.ts — Discord channel (discord.js + shared adapter)
// Raw JSON of every Discord.Message → agent. Zero message parsing — future-proof.

import type { AppConfig } from "@/config.ts";
import type { Channel } from "@/channels/types.ts";
import { createChannelHandler } from "@/channels/adapter.ts";
import { log } from "@/logs/logger.ts";

const logger = log("discord");

function getRole(userId: string, config: AppConfig): "owner" | "user" | "denied" {
    const dc = (config as any).discord;
    if (!dc) return "denied";
    if (dc.ownerIds?.includes(userId)) return "owner";
    if (dc.allowedUserIds?.length === 0) return "user"; // empty = allow all
    if (dc.allowedUserIds?.includes(userId)) return "user";
    return "denied";
}

export default {
    name: "discord",
    async start(config) {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) { logger.warn("DISCORD_BOT_TOKEN not set — skipping"); return; }

        const { Client, GatewayIntentBits } = await import("discord.js");
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
            ],
        });

        const handler = createChannelHandler({
            channel: "discord",
            historyBudget: (config as any).discord?.historyTokenBudget ?? 12000,
            maxReplyLength: 2000, // Discord limit
            sendReply: async (chatId, text) => {
                const ch = await client.channels.fetch(chatId);
                if (ch?.isTextBased() && "send" in ch) await (ch as any).send(text);
            },
            sendTyping: async (chatId) => {
                const ch = await client.channels.fetch(chatId);
                if (ch?.isTextBased() && "sendTyping" in ch) await (ch as any).sendTyping();
            },
        });

        client.on("messageCreate", (msg) => {
            if (msg.author.bot) return;
            const dc = (config as any).discord;
            const allowed = dc?.allowedChannelIds;
            if (allowed?.length && !allowed.includes(msg.channelId)) return;

            const role = getRole(msg.author.id, config);
            if (role === "denied") return;

            handler.enqueue(
                config, msg.toJSON(), msg.channelId,
                msg.author.id, msg.author.username, role,
                dc?.rateLimitPerMinute ?? 15,
            );
        });

        client.once("ready", () => logger.info(`✓ Discord connected as ${client.user?.tag}`));
        await client.login(token);
        await new Promise(() => { }); // run forever
    },
} satisfies Channel;
