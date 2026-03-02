// src/channels/whatsapp/state.ts — Exported WhatsApp runtime state for dashboard API
//
// The WhatsApp channel writes to this module; the self-channel HTTP server reads from it.
// This avoids coupling the two channels directly.
// Also exposes the live socket + recent message cache for tools (e.g. media download).

import QRCode from "qrcode";
import type { makeWASocket } from "@whiskeysockets/baileys";

type Sock = ReturnType<typeof makeWASocket>;

export interface WhatsAppState {
    connected: boolean;
    started: boolean; // true once the channel has been launched (even if not yet connected)
    qr: string; // data:image/png;base64,... QR image (empty if connected or not started)
    jid: string; // own JID once connected
}

const state: WhatsAppState = {
    connected: false,
    started: false,
    qr: "",
    jid: "",
};

// ── Live socket reference (for tools like media download) ────────────────────
let activeSock: Sock | null = null;
export function setActiveSock(sock: Sock): void { activeSock = sock; }
export function getActiveSock(): Sock | null { return activeSock; }

// ── Recent message cache — keyed by msg id, expires after 1h ─────────────────
// Tools call getRecentMessage(id) to get the raw WAMessage for downloadMediaMessage.
const MESSAGE_TTL = 60 * 60 * 1000; // 1 hour
const recentMessages = new Map<string, { msg: any; ts: number }>();

export function cacheMessage(msgId: string, msg: any): void {
    recentMessages.set(msgId, { msg, ts: Date.now() });
    // Lazy cleanup: evict expired entries when cache grows
    if (recentMessages.size > 500) {
        const now = Date.now();
        for (const [k, v] of recentMessages) {
            if (now - v.ts > MESSAGE_TTL) recentMessages.delete(k);
        }
    }
}

export function getRecentMessage(msgId: string): any | null {
    const entry = recentMessages.get(msgId);
    if (!entry) return null;
    if (Date.now() - entry.ts > MESSAGE_TTL) { recentMessages.delete(msgId); return null; }
    return entry.msg;
}

export function setWhatsAppStarted(): void {
    state.started = true;
}

export function setWhatsAppConnected(jid: string): void {
    state.connected = true;
    state.started = true;
    state.qr = "";
    state.jid = jid;
}

export async function setWhatsAppQR(rawQr: string): Promise<void> {
    try {
        // Convert raw Baileys QR string → data:image/png;base64,...
        state.qr = await QRCode.toDataURL(rawQr, { width: 512, margin: 2 });
    } catch {
        state.qr = rawQr; // fallback to raw string
    }
    state.connected = false;
}

export function setWhatsAppDisconnected(): void {
    state.connected = false;
    state.qr = "";
}

/** Full reset — pairing failed or session deleted. User can click Connect again. */
export function resetWhatsAppState(): void {
    state.connected = false;
    state.started = false;
    state.qr = "";
    state.jid = "";
}

export function getWhatsAppState(): WhatsAppState {
    return { ...state };
}
