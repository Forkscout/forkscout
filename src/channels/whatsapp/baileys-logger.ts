// src/channels/whatsapp/baileys-logger.ts — Silent pino-compatible logger for Baileys
//
// Baileys expects an ILogger with pino-style methods. We suppress all output
// since Baileys is extremely verbose. Our own logger handles user-facing logs.

import type { ILogger } from "@whiskeysockets/baileys/lib/Utils/logger.js";

const noop = () => { };

/** Create a silent ILogger that satisfies Baileys' requirements. */
export function makeSilentLogger(): ILogger {
    const logger: ILogger = {
        level: "silent",
        child: () => logger,
        trace: noop,
        debug: noop,
        info: noop,
        warn: noop,
        error: noop,
    };
    return logger;
}
