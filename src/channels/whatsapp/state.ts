// src/channels/whatsapp/state.ts — Exported WhatsApp runtime state for dashboard API
//
// The WhatsApp channel writes to this module; the self-channel HTTP server reads from it.
// This avoids coupling the two channels directly.

export interface WhatsAppState {
    connected: boolean;
    qr: string; // latest QR string from Baileys (empty if connected or not started)
    jid: string; // own JID once connected
}

const state: WhatsAppState = {
    connected: false,
    qr: "",
    jid: "",
};

export function setWhatsAppConnected(jid: string): void {
    state.connected = true;
    state.qr = "";
    state.jid = jid;
}

export function setWhatsAppQR(qr: string): void {
    state.qr = qr;
    state.connected = false;
}

export function setWhatsAppDisconnected(): void {
    state.connected = false;
    state.qr = "";
}

export function getWhatsAppState(): WhatsAppState {
    return { ...state };
}
