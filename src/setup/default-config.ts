// src/setup/default-config.ts — Default config template generated during setup.

import { listAliases } from "@/secrets/vault.ts";
import { buildProviderTiers } from "@/setup/provider-tiers.ts";
import { PROVIDERS } from "@/setup/shared.ts";
import { CHANNELS } from "@/setup/channel-info.ts";
import type { VaultConfig } from "@/config-types.ts";

/** Build the vault section by scanning existing vault aliases and categorizing them. */
export function buildVaultSection(providerName: string): VaultConfig {
    const aliases = new Set(listAliases());
    const vault: VaultConfig = {};

    // LLM provider key
    const provider = PROVIDERS.find(p => p.name === providerName);
    if (provider?.envVar && aliases.has(provider.envVar)) {
        vault.llmApiKey = provider.envVar;
    }

    // Channel secrets
    const channels: Record<string, string | string[]> = {};
    for (const ch of CHANNELS) {
        if (ch.builtIn || ch.requiredSecrets.length === 0) continue;
        const found = ch.requiredSecrets.filter(s => aliases.has(s));
        // Also check for extra secrets like TELEGRAM_OWNER_IDS
        const extras = [`${ch.name.toUpperCase()}_OWNER_IDS`];
        for (const e of extras) { if (aliases.has(e)) found.push(e); }
        if (found.length === 1) channels[ch.name] = found[0];
        else if (found.length > 1) channels[ch.name] = found;
    }
    if (Object.keys(channels).length > 0) vault.channels = channels;

    // Speech
    const speechAliases = ["ELEVENLABS_API_KEY", "OPENAI_API_KEY"];
    for (const a of speechAliases) {
        if (aliases.has(a)) {
            vault.speech = { tts: a, stt: a };
            break;
        }
    }

    // Image generation
    const imageAliases = ["OPENAI_API_KEY", "REPLICATE_API_TOKEN", "BFL_API_KEY"];
    for (const a of imageAliases) {
        if (aliases.has(a)) { vault.imageGeneration = a; break; }
    }

    // Video generation
    const videoAliases = ["REPLICATE_API_TOKEN", "MINIMAX_API_KEY", "RUNWAY_API_KEY"];
    for (const a of videoAliases) {
        if (aliases.has(a)) { vault.videoGeneration = a; break; }
    }

    // Named services
    const serviceMap: Record<string, string> = {
        N8N_API_KEY: "n8n",
        MOLTBOOK_BOT_ID_FORKSCOUT: "moltbook",
        DATABASE_URL: "database",
        X_LOGIN_USERNAME: "x_login",
        TWILIO_PHONE_NUMBER: "twilio_phone",
    };
    const services: Record<string, string> = {};
    for (const [alias, svcName] of Object.entries(serviceMap)) {
        if (aliases.has(alias)) services[svcName] = alias;
    }
    if (Object.keys(services).length > 0) vault.services = services;

    return vault;
}

export function buildDefaultConfig(opts: {
    provider: string;
    tier: string;
    agentName: string;
}): any {
    return {
        channels: {
            defaults: {
                historyTokenBudget: 12000,
                rateLimitPerMinute: 20,
                maxInputLength: 3000,
            },
            telegram: {
                pollingTimeout: 30,
                historyTokenBudget: 12000,
                allowedUserIds: [],
                rateLimitPerMinute: 20,
                maxInputLength: 2000,
                maxToolResultTokens: 3000,
                maxSentencesPerToolResult: 20,
            },
            terminal: { historyTokenBudget: 16000 },
            self: { historyTokenBudget: 12000, httpPort: 3200 },
        },
        agent: {
            name: opts.agentName,
            description: "An autonomous agent that can use tools and access the web to answer questions and perform tasks.",
            github: "https://github.com/Forkscout/forkscout",
            ownerOnlyTools: ["run_shell_commands", "write_file", "git_operations", "validate_and_restart", "secret_vault"],
        },
        browser: {
            headless: false,
            profileDir: ".agents/browser-profile",
            screenshotQuality: 50,
            chromePath: "",
        },
        browserAgent: { maxSteps: 25, maxTokens: 4096 },
        llm: {
            provider: opts.provider,
            tier: opts.tier,
            maxTokens: 2000,
            maxSteps: 100,
            reasoningTag: "think",
            llmSummarizeMaxTokens: 1200,
            toolResultAutoCompressWords: 400,
            providers: buildProviderTiers(),
        },
        skills: { dirs: [".agents/skills", "src/skills/built-in"] },
        n8n: { baseUrl: "http://localhost:5678" },
        vault: buildVaultSection(opts.provider),
    };
}

