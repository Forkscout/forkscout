// src/channels/email/index.ts — Email channel (IMAP poll + SMTP reply + shared adapter)
// Raw JSON of parsed email → agent. Replies via SMTP.

import type { AppConfig } from "@/config.ts";
import type { Channel } from "@/channels/types.ts";
import { createChannelHandler } from "@/channels/adapter.ts";
import { log } from "@/logs/logger.ts";

const logger = log("email");

function getRole(from: string, config: AppConfig): "owner" | "user" | "denied" {
    const em = (config as any).email;
    if (!em) return "denied";
    const addr = from.toLowerCase();
    if (em.ownerEmails?.some((e: string) => addr.includes(e.toLowerCase()))) return "owner";
    if (em.allowedEmails?.length === 0) return "user";
    if (em.allowedEmails?.some((e: string) => addr.includes(e.toLowerCase()))) return "user";
    return "denied";
}

export default {
    name: "email",
    async start(config) {
        const host = process.env.EMAIL_IMAP_HOST;
        const user = process.env.EMAIL_IMAP_USER;
        const pass = process.env.EMAIL_IMAP_PASS;
        if (!host || !user || !pass) { logger.warn("EMAIL_IMAP_* env vars not set — skipping"); return; }

        const { ImapFlow } = await import("imapflow");
        const nodemailer = await import("nodemailer");

        const smtpTransport = nodemailer.createTransport({
            host: process.env.EMAIL_SMTP_HOST ?? host,
            port: Number(process.env.EMAIL_SMTP_PORT ?? 587),
            secure: process.env.EMAIL_SMTP_SECURE === "true",
            auth: { user: process.env.EMAIL_SMTP_USER ?? user, pass: process.env.EMAIL_SMTP_PASS ?? pass },
        });

        const handler = createChannelHandler({
            channel: "email",
            historyBudget: (config as any).email?.historyTokenBudget ?? 12000,
            maxReplyLength: 100000,
            sendReply: async (chatId, text) => {
                await smtpTransport.sendMail({
                    from: user,
                    to: chatId, // chatId = sender's email
                    subject: "Re: ForkScout",
                    text,
                });
            },
        });

        const pollInterval = (config as any).email?.pollIntervalMs ?? 30000;

        const poll = async () => {
            const client = new ImapFlow({ host, port: Number(process.env.EMAIL_IMAP_PORT ?? 993), secure: true, auth: { user, pass }, logger: false as any });
            try {
                await client.connect();
                const lock = await client.getMailboxLock("INBOX");
                try {
                    for await (const msg of client.fetch({ seen: false }, { envelope: true, source: true })) {
                        const from = msg.envelope?.from?.[0]?.address ?? "";
                        const role = getRole(from, config);
                        if (role === "denied") continue;

                        const raw = {
                            messageId: msg.envelope?.messageId,
                            from, subject: msg.envelope?.subject,
                            date: msg.envelope?.date,
                            body: msg.source?.toString("utf-8")?.slice(0, 5000) ?? "",
                        };

                        handler.enqueue(config, raw, from, from, from, role);
                        await client.messageFlagsAdd(msg.seq, ["\\Seen"], { uid: false });
                    }
                } finally { lock.release(); }
                await client.logout();
            } catch (err: any) { logger.error(`IMAP error: ${err.message}`); }
        };

        logger.info("✓ Email channel started (polling IMAP)");
        while (true) { await poll(); await new Promise(r => setTimeout(r, pollInterval)); }
    },
} satisfies Channel;
