// src/agent/system-prompts/build-project-context.ts — Gather live project context for the dynamic system prompt.
// Injected into dynamicPrompt (NOT baseIdentity) so Anthropic cache_control on the stable block is never broken.
// Only injected when the user message is project-related — general queries (news, math, chat) skip it entirely.
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { AppConfig } from "@/config.ts";

// Keywords that strongly indicate a project/code/dev task.
const PROJECT_KEYWORDS = [
    "fix", "bug", "error", "code", "file", "folder", "src", "build", "deploy",
    "git", "commit", "branch", "push", "pull", "merge", "pr", "diff",
    "tool", "agent", "config", "setting", "install", "run", "start", "restart",
    "channel", "telegram", "discord", "slack", "whatsapp",
    "skill", "provider", "model", "token", "api", "endpoint",
    "create", "add", "update", "delete", "refactor", "implement",
    "test", "lint", "tsc", "type", "import", "export", "module",
    "memory", "recall", "store", "forkscout",
];

/**
 * Returns true if the user message looks like a coding/project task.
 * General queries (news, math, weather, jokes, chat) return false → skip context injection.
 */
export function isProjectRelated(message: string): boolean {
    const lower = message.toLowerCase();
    return PROJECT_KEYWORDS.some((kw) => lower.includes(kw));
}

function runGit(args: string): string {
    try {
        return execSync(`git ${args}`, {
            cwd: process.cwd(),
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
            timeout: 3000,
        }).trim();
    } catch {
        return "";
    }
}

// Cache per-session so git commands run once per session, not once per step.
const _cache = new Map<string, string>();

export function buildProjectContext(config: AppConfig, sessionKey?: string): string {
    const cacheKey = sessionKey ?? "__default__";
    if (_cache.has(cacheKey)) return _cache.get(cacheKey)!;

    const lines: string[] = [];

    // — Git state —
    const branch = runGit("branch --show-current");
    const lastCommits = runGit("log --oneline -3");
    const dirtyFiles = runGit("status --short");

    if (branch) lines.push(`Git branch: \`${branch}\``);
    if (lastCommits) {
        const formatted = lastCommits.split("\n").map((l) => `  ${l}`).join("\n");
        lines.push(`Recent commits:\n${formatted}`);
    }
    if (dirtyFiles) {
        const formatted = dirtyFiles.split("\n").map((l) => `  ${l}`).join("\n");
        lines.push(`Uncommitted changes:\n${formatted}`);
    } else if (branch) {
        lines.push("Working tree: clean");
    }

    // — Package version —
    const pkgPath = join(process.cwd(), "package.json");
    if (existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
            if (pkg.version) lines.push(`Package version: ${pkg.version}`);
        } catch { /* ignore */ }
    }

    // — Active channels —
    const channels = config.channels
        ? Object.entries(config.channels as unknown as Record<string, { enabled?: boolean }>)
            .filter(([, v]) => v?.enabled)
            .map(([k]) => k)
        : [];
    if (channels.length) lines.push(`Active channels: ${channels.join(", ")}`);

    // — Agent description —
    if (config.agent.description) lines.push(`Agent description: ${config.agent.description}`);

    const result = lines.length
        ? `## Live project context\n\n${lines.join("\n")}`
        : "";

    _cache.set(cacheKey, result);
    return result;
}
