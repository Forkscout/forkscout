// src/channels/webchat/index.ts — WebSocket chat channel (zero deps — Bun native WS)
// Raw JSON of every WS message → agent. Frontend connects to ws://host:3200/ws

import type { AppConfig } from "@/config.ts";
import type { Channel } from "@/channels/types.ts";
import { createChannelHandler } from "@/channels/adapter.ts";
import { log } from "@/logs/logger.ts";

const logger = log("webchat");

// ── Active WebSocket connections ─────────────────────────────────────────────
const clients = new Map<string, { ws: any; role: "owner" | "user" }>();
let nextId = 1;

function getRole(token: string, config: AppConfig): "owner" | "user" | "denied" {
    const wc = (config as any).webchat;
    if (!wc) return "user"; // no config = dev mode, allow all
    if (wc.ownerToken && token === wc.ownerToken) return "owner";
    if (wc.allowPublic) return "user";
    return "denied";
}

/** Start the WebSocket upgrade handler. Call from self-channel HTTP server. */
export function handleWebSocketUpgrade(req: Request, server: any, config: AppConfig): Response | undefined {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== "/ws") return undefined;
    const upgraded = server.upgrade(req, { data: { config, id: String(nextId++) } });
    return upgraded ? undefined : new Response("WebSocket upgrade failed", { status: 500 });
}

/** Create handler + wire WebSocket events. Called from self-channel. */
export function setupWebChat(config: AppConfig) {
    const handler = createChannelHandler({
        channel: "webchat",
        historyBudget: (config as any).webchat?.historyTokenBudget ?? 12000,
        maxReplyLength: 100000, // no real limit for WS
        sendReply: async (chatId, text) => {
            const c = clients.get(chatId);
            if (c) c.ws.send(JSON.stringify({ type: "message", text }));
        },
    });

    return {
        open(ws: any) {
            const id = ws.data?.id ?? String(nextId++);
            clients.set(id, { ws, role: "user" });
            logger.info(`WS client connected: ${id}`);
            ws.send(JSON.stringify({ type: "connected", id }));
        },
        message(ws: any, raw: string) {
            const id = ws.data?.id;
            if (!id) return;
            try {
                const msg = JSON.parse(raw);
                // Auth message: { type: "auth", token: "..." }
                if (msg.type === "auth") {
                    const role = getRole(msg.token ?? "", config);
                    if (role === "denied") { ws.send(JSON.stringify({ type: "error", error: "denied" })); ws.close(); return; }
                    clients.set(id, { ws, role });
                    ws.send(JSON.stringify({ type: "authenticated", role }));
                    return;
                }
                const client = clients.get(id);
                const role = client?.role ?? "user";
                handler.enqueue(config, msg, id, id, `webchat-${id}`, role);
            } catch { ws.send(JSON.stringify({ type: "error", error: "invalid JSON" })); }
        },
        close(ws: any) {
            const id = ws.data?.id;
            if (id) { clients.delete(id); logger.info(`WS client disconnected: ${id}`); }
        },
    };
}

export default {
    name: "webchat",
    async start(config) {
        logger.info("WebChat runs via self-channel HTTP server on /ws — no standalone start needed");
    },
} satisfies Channel;
