"use client";

import { useState } from "react";
import {
    Section,
    Field,
    NumberField,
    ChipList,
    AddItemForm,
} from "@web/components/settings-fields";
import { Eye, EyeOff, Send, Trash2, Users, Shield, Bot } from "lucide-react";

type Config = Record<string, any>;

interface Props {
    config: Config;
    updateField: (path: string[], value: unknown) => void;
    get: (path: string[]) => unknown;
    secrets: string[];
    onStoreSecret: (alias: string, value: string) => Promise<void>;
    onRemoveSecret: (alias: string) => Promise<void>;
}

const TOKEN_SECRET = "TELEGRAM_BOT_TOKEN";
const OWNER_IDS_SECRET = "TELEGRAM_OWNER_IDS";

export default function TelegramSettings({
    config,
    updateField,
    get,
    secrets,
    onStoreSecret,
    onRemoveSecret,
}: Props) {
    const [newToken, setNewToken] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [saving, setSaving] = useState(false);

    const hasToken = secrets.includes(TOKEN_SECRET);
    const hasOwnerIdsSecret = secrets.includes(OWNER_IDS_SECRET);

    const ownerIds: number[] = (get(["telegram", "ownerUserIds"]) as number[]) ?? [];
    const allowedIds: number[] = (get(["telegram", "allowedUserIds"]) as number[]) ?? [];

    const handleSaveToken = async () => {
        if (!newToken.trim()) return;
        setSaving(true);
        try {
            await onStoreSecret(TOKEN_SECRET, newToken.trim());
            setNewToken("");
            setShowToken(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteToken = async () => {
        setSaving(true);
        try {
            await onRemoveSecret(TOKEN_SECRET);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Bot Token */}
            <Section title="Bot Token" icon={Bot}>
                {hasToken ? (
                    <div className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 p-4">
                        <div>
                            <p className="text-sm font-medium">Bot token configured</p>
                            <p className="text-xs text-muted-foreground">
                                Stored encrypted in vault as <code className="rounded bg-muted px-1 py-0.5">{TOKEN_SECRET}</code>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowToken(!showToken)}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                            >
                                Change
                            </button>
                            <button
                                onClick={handleDeleteToken}
                                disabled={saving}
                                className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                            >
                                <Trash2 className="inline h-3 w-3 mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                ) : null}
                {(!hasToken || showToken) && (
                    <div className={hasToken ? "mt-4" : ""}>
                        <label className="block">
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                {hasToken ? "New Bot Token" : "Bot Token"}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type={showToken ? "text" : "password"}
                                        value={newToken}
                                        onChange={(e) => setNewToken(e.target.value)}
                                        placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 font-mono text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(!showToken)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleSaveToken}
                                    disabled={saving || !newToken.trim()}
                                    className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    {saving ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </label>
                    </div>
                )}
            </Section>

            {/* Owner IDs */}
            <Section title="Owners (Admin Access)" icon={Shield}>
                <p className="mb-3 text-xs text-muted-foreground">
                    Owners have full access including restricted tools. Stored encrypted in vault.
                    {hasOwnerIdsSecret && (
                        <span className="ml-1 text-accent">Vault: {OWNER_IDS_SECRET}</span>
                    )}
                </p>
                <div className="mb-3">
                    <ChipList
                        items={ownerIds.map(String)}
                        onRemove={(id) =>
                            updateField(
                                ["telegram", "ownerUserIds"],
                                ownerIds.filter((i) => String(i) !== id)
                            )
                        }
                    />
                </div>
                <AddItemForm
                    placeholder="Telegram user ID (numeric)"
                    onAdd={(v) => {
                        const num = Number(v);
                        if (!isNaN(num) && !ownerIds.includes(num)) {
                            updateField(["telegram", "ownerUserIds"], [...ownerIds, num]);
                        }
                    }}
                    transform={(v) => v.replace(/\D/g, "")}
                />
            </Section>

            {/* Allowed Users */}
            <Section title="Allowed Users" icon={Users}>
                <p className="mb-3 text-xs text-muted-foreground">
                    Users who can chat with the bot but cannot use owner-only tools. Empty = everyone allowed.
                </p>
                <div className="mb-3">
                    <ChipList
                        items={allowedIds.map(String)}
                        onRemove={(id) =>
                            updateField(
                                ["telegram", "allowedUserIds"],
                                allowedIds.filter((i) => String(i) !== id)
                            )
                        }
                    />
                </div>
                <AddItemForm
                    placeholder="Telegram user ID (numeric)"
                    onAdd={(v) => {
                        const num = Number(v);
                        if (!isNaN(num) && !allowedIds.includes(num)) {
                            updateField(["telegram", "allowedUserIds"], [...allowedIds, num]);
                        }
                    }}
                    transform={(v) => v.replace(/\D/g, "")}
                />
            </Section>

            {/* Channel Config */}
            <Section title="Channel Configuration" icon={Send}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField
                        label="Polling Timeout (s)"
                        value={(get(["telegram", "pollingTimeout"]) as number) ?? 30}
                        onChange={(v) => updateField(["telegram", "pollingTimeout"], v)}
                    />
                    <NumberField
                        label="History Token Budget"
                        value={(get(["telegram", "historyTokenBudget"]) as number) ?? 12000}
                        onChange={(v) => updateField(["telegram", "historyTokenBudget"], v)}
                    />
                    <NumberField
                        label="Rate Limit / Min"
                        value={(get(["telegram", "rateLimitPerMinute"]) as number) ?? 20}
                        onChange={(v) => updateField(["telegram", "rateLimitPerMinute"], v)}
                    />
                    <NumberField
                        label="Max Input Length"
                        value={(get(["telegram", "maxInputLength"]) as number) ?? 2000}
                        onChange={(v) => updateField(["telegram", "maxInputLength"], v)}
                    />
                    <NumberField
                        label="Max Tool Result Tokens"
                        value={(get(["telegram", "maxToolResultTokens"]) as number) ?? 3000}
                        onChange={(v) => updateField(["telegram", "maxToolResultTokens"], v)}
                    />
                    <NumberField
                        label="Max Sentences / Tool Result"
                        value={(get(["telegram", "maxSentencesPerToolResult"]) as number) ?? 20}
                        onChange={(v) => updateField(["telegram", "maxSentencesPerToolResult"], v)}
                    />
                </div>
            </Section>
        </div>
    );
}
