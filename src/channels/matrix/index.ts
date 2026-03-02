// src/channels/matrix/index.ts — Matrix channel (matrix-bot-sdk + shared adapter)
// Raw JSON of every Matrix event → agent. Zero message parsing — future-proof.

import type { AppConfig } from "@/config.ts";
import type { Channel } from "@/channels/types.ts";
import { createChannelHandler } from "@/channels/adapter.ts";
import { log } from "@/logs/logger.ts";

const logger = log("matrix");

function getRole(userId: string, config: AppConfig): "owner" | "user" | "denied" {
    const mx = (config as any).matrix;
    if (!mx) return "denied";
    if (mx.ownerIds?.includes(userId)) return "owner";
    if (mx.allowedUserIds?.length === 0) return "user";
    if (mx.allowedUserIds?.includes(userId)) return "user";
    return "denied";
}

export default {
    name: "matrix",
    async start(config) {
        const homeserver = process.env.MATRIX_HOMESERVER_URL;
        const token = process.env.MATRIX_ACCESS_TOKEN;
        if (!homeserver || !token) { logger.warn("MATRIX_HOMESERVER_URL or MATRIX_ACCESS_TOKEN not set — skipping"); return; }

        const { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin } = await import("matrix-bot-sdk");
        const storage = new SimpleFsStorageProvider(".agents/matrix-storage.json");
        const client = new MatrixClient(homeserver, token, storage);
        AutojoinRoomsMixin.setupOnClient(client);

        const handler = createChannelHandler({
            channel: "matrix",
            historyBudget: (config as any).matrix?.historyTokenBudget ?? 12000,
            maxReplyLength: 40000,
            sendReply: async (roomId, text) => {
                await client.sendText(roomId, text);
            },
        });

        const mx = (config as any).matrix;
        const botUserId = await client.getUserId();

        client.on("room.message", (roomId: string, event: any) => {
            if (!event?.content?.body) return;
            if (event.sender === botUserId) return;

            const allowed = mx?.allowedRoomIds;
            if (allowed?.length && !allowed.includes(roomId)) return;

            const role = getRole(event.sender, config);
            if (role === "denied") return;

            handler.enqueue(
                config, event, roomId,
                event.sender, event.sender, role,
                mx?.rateLimitPerMinute ?? 15,
            );
        });

        await client.start();
        logger.info(`✓ Matrix connected as ${botUserId}`);
        await new Promise(() => { }); // run forever
    },
} satisfies Channel;
