// scripts/migrate-env-to-vault.ts — One-shot: .env secrets → vault + config vault section.
import { createHash, createCipheriv, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const ENV_FILE = resolve(ROOT, ".env");
const VAULT_FILE = resolve(ROOT, ".agents", "vault.enc.json");
const CONFIG_FILE = resolve(ROOT, "src", "forkscout.config.json");

// ── Read .env ────────────────────────────────────────────────────────────────
const envVars = new Map<string, string>();
for (const line of readFileSync(ENV_FILE, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
    envVars.set(t.slice(0, eq).trim(), val);
}

const VAULT_KEY = envVars.get("VAULT_KEY");
if (!VAULT_KEY) { console.error("No VAULT_KEY in .env"); process.exit(1); }

// ── Crypto helpers ───────────────────────────────────────────────────────────
const key = createHash("sha256").update(VAULT_KEY).digest();

interface EncEntry { iv: string; tag: string; data: string }

function encrypt(plaintext: string): EncEntry {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const data = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { iv: iv.toString("hex"), tag: tag.toString("hex"), data: data.toString("hex") };
}

// ── Load vault ───────────────────────────────────────────────────────────────
let vault: Record<string, EncEntry> = {};
if (existsSync(VAULT_FILE)) {
    try { vault = JSON.parse(readFileSync(VAULT_FILE, "utf-8")); } catch { /* empty */ }
}

// ── Secret detection ─────────────────────────────────────────────────────────
const SEC = /KEY|TOKEN|SECRET|PASSWORD|SID|AUTH|DATABASE_URL|BOT_ID|LOGIN_USERNAME/i;
const EXTRA = new Set(["TWILIO_PHONE_NUMBER"]);
const isSecret = (n: string) => n !== "VAULT_KEY" && (SEC.test(n) || EXTRA.has(n));

// ── Migrate ──────────────────────────────────────────────────────────────────
console.log("\n  Migrating .env secrets → vault...\n");
const toRemove: string[] = [];
let migrated = 0;

for (const [k, v] of envVars) {
    if (!isSecret(k) || !v) continue;
    if (!vault[k]) { vault[k] = encrypt(v); console.log(`  ✓ ${k} → vault`); migrated++; }
    else console.log(`  ⊘ ${k} — already in vault`);
    toRemove.push(k);
}

// Save vault
const vaultDir = dirname(VAULT_FILE);
if (!existsSync(vaultDir)) mkdirSync(vaultDir, { recursive: true });
writeFileSync(VAULT_FILE, JSON.stringify(vault, null, 2), "utf-8");

// Clean .env
const cleanLines = [
    "# ForkScout environment — ONLY vault key lives here",
    "# All secrets are in .agents/vault.enc.json (encrypted)",
    "# Do NOT put API keys here — use 'bun run setup' instead",
    "",
];
for (const [k, v] of envVars) { if (!toRemove.includes(k)) cleanLines.push(`${k}=${v}`); }
cleanLines.push("");
writeFileSync(ENV_FILE, cleanLines.join("\n"), "utf-8");
console.log(`\n  ✓ .env cleaned (${toRemove.length} secret(s) removed, ${migrated} migrated)`);

// ── Build vault section for config ───────────────────────────────────────────
const aliases = Object.keys(vault);
const config = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
const provider = config.llm?.provider ?? "openrouter";

const PROV_KEYS: Record<string, string> = {
    openrouter: "OPENROUTER_API_KEY", openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY", google: "GOOGLE_GENERATIVE_AI_API_KEY",
    xai: "XAI_API_KEY", deepseek: "DEEPSEEK_API_KEY",
    perplexity: "PERPLEXITY_API_KEY", groq: "GROQ_API_KEY",
    mistral: "MISTRAL_API_KEY", together: "TOGETHER_API_KEY",
    fireworks: "FIREWORKS_API_KEY", deepinfra: "DEEPINFRA_API_KEY",
    cerebras: "CEREBRAS_API_KEY", cohere: "COHERE_API_KEY",
    vercel: "VERCEL_API_KEY", replicate: "REPLICATE_API_TOKEN",
    huggingface: "HUGGINGFACE_API_KEY", baseten: "BASETEN_API_KEY",
    aigateway: "AI_GATEWAY_API_KEY",
};

const vaultSection: Record<string, unknown> = {};
const provKey = PROV_KEYS[provider];
if (provKey && aliases.includes(provKey)) vaultSection.llmApiKey = provKey;

// Channels
const CH: Record<string, string[]> = {
    telegram: ["TELEGRAM_BOT_TOKEN"], discord: ["DISCORD_BOT_TOKEN"],
    slack: ["SLACK_BOT_TOKEN", "SLACK_APP_TOKEN"],
    messenger: ["MESSENGER_PAGE_ACCESS_TOKEN", "MESSENGER_VERIFY_TOKEN"],
    instagram: ["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_VERIFY_TOKEN"],
    twitter: ["TWITTER_BEARER_TOKEN", "TWITTER_API_KEY", "TWITTER_API_SECRET"],
    reddit: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD"],
    sms: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
    voice: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
    email: ["EMAIL_IMAP_HOST", "EMAIL_IMAP_USER", "EMAIL_IMAP_PASS"],
    matrix: ["MATRIX_HOMESERVER_URL", "MATRIX_ACCESS_TOKEN"],
    youtube: ["YOUTUBE_API_KEY", "YOUTUBE_LIVE_CHAT_ID"],
    line: ["LINE_CHANNEL_ACCESS_TOKEN", "LINE_CHANNEL_SECRET"],
    viber: ["VIBER_AUTH_TOKEN", "VIBER_WEBHOOK_URL"],
    teams: ["TEAMS_APP_ID", "TEAMS_APP_PASSWORD"],
    google_chat: ["GOOGLE_CHAT_SERVICE_ACCOUNT"],
};
const channels: Record<string, string | string[]> = {};
for (const [ch, keys] of Object.entries(CH)) {
    const found = keys.filter(k => aliases.includes(k));
    const extraId = ch.toUpperCase() + "_OWNER_IDS";
    if (aliases.includes(extraId)) found.push(extraId);
    if (found.length === 1) channels[ch] = found[0];
    else if (found.length > 1) channels[ch] = found;
}
if (Object.keys(channels).length > 0) vaultSection.channels = channels;

// Speech
if (aliases.includes("ELEVENLABS_API_KEY")) vaultSection.speech = { tts: "ELEVENLABS_API_KEY", stt: "ELEVENLABS_API_KEY" };

// Image / Video
for (const a of ["OPENAI_API_KEY", "REPLICATE_API_TOKEN", "BFL_API_KEY"]) {
    if (aliases.includes(a)) { vaultSection.imageGeneration = a; break; }
}
for (const a of ["REPLICATE_API_TOKEN", "MINIMAX_API_KEY", "RUNWAY_API_KEY"]) {
    if (aliases.includes(a)) { vaultSection.videoGeneration = a; break; }
}

// Services
const SVC: Record<string, string> = {
    N8N_API_KEY: "n8n", MOLTBOOK_BOT_ID_FORKSCOUT: "moltbook",
    DATABASE_URL: "database", X_LOGIN_USERNAME: "x_login", TWILIO_PHONE_NUMBER: "twilio_phone",
};
const services: Record<string, string> = {};
for (const [alias, svc] of Object.entries(SVC)) {
    if (aliases.includes(alias)) services[svc] = alias;
}
if (Object.keys(services).length > 0) vaultSection.services = services;

config.vault = vaultSection;
writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4) + "\n", "utf-8");

console.log(`  ✓ vault section added to forkscout.config.json`);
console.log(`  Vault aliases: ${aliases.join(", ")}\n`);
