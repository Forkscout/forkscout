// src/channels/whatsapp/compile-message.ts — Compiles raw Baileys message → ModelMessage (user role).
// Passes the full raw JSON so the agent sees every field Baileys provides —
// sender, timestamps, message type, media captions, reactions, etc.
// Zero maintenance — any new Baileys message types are automatically included.

import type { ModelMessage } from "ai";

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Compile a raw Baileys WAMessage into an AI SDK v6 `ModelMessage` (role: "user").
 * Sends the full raw JSON from Baileys — agent decides what matters.
 */
export function compileWhatsAppMessage(rawMsg: unknown): ModelMessage {
    return { role: "user", content: JSON.stringify(rawMsg) };
}
