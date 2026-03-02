"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@web/components/navbar";
import { useAuth } from "@web/lib/auth-context";
import {
    getConfig as fetchConfig,
    saveConfig,
    listSecrets,
    storeSecret,
    removeSecret,
} from "@web/lib/api";
import GeneralSettings from "@web/components/settings-general";
import LLMSettings from "@web/components/settings-llm";
import TelegramSettings from "@web/components/settings-telegram";
import WhatsAppSettings from "@web/components/settings-whatsapp";
import {
    Save,
    RefreshCw,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    Code2,
    Settings2,
    Cpu,
    Send,
    MessageCircle,
    Sliders,
} from "lucide-react";

const TABS = [
    { id: "general", label: "General", icon: Settings2 },
    { id: "llm", label: "LLM", icon: Cpu },
    { id: "telegram", label: "Telegram", icon: Send },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { id: "json", label: "JSON", icon: Code2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
    const { token, isAuthenticated } = useAuth();
    const [config, setConfig] = useState<Record<string, any> | null>(null);
    const [jsonText, setJsonText] = useState("");
    const [tab, setTab] = useState<TabId>("general");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dirty, setDirty] = useState(false);
    const [secrets, setSecrets] = useState<string[]>([]);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [data, sec] = await Promise.all([fetchConfig(token), listSecrets(token)]);
            setConfig(data);
            setJsonText(JSON.stringify(data, null, 4));
            setSecrets(sec);
            setDirty(false);
            setStatus(null);
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        if (!status) return;
        const t = setTimeout(() => setStatus(null), 4000);
        return () => clearTimeout(t);
    }, [status]);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const toSave = tab === "json" ? JSON.parse(jsonText) : config;
            await saveConfig(token, toSave);
            setConfig(toSave);
            setJsonText(JSON.stringify(toSave, null, 4));
            setDirty(false);
            setStatus({ type: "success", msg: "Config saved — hot-reload applied." });
        } catch (err: any) {
            setStatus({ type: "error", msg: err.message });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (path: string[], value: unknown) => {
        if (!config) return;
        const next = structuredClone(config);
        let obj: any = next;
        for (let i = 0; i < path.length - 1; i++) {
            if (!(path[i] in obj)) obj[path[i]] = {};
            obj = obj[path[i]];
        }
        obj[path[path.length - 1]] = value;
        setConfig(next);
        setJsonText(JSON.stringify(next, null, 4));
        setDirty(true);
    };

    const get = (path: string[]): unknown => {
        if (!config) return undefined;
        let obj: any = config;
        for (const key of path) {
            if (obj == null || typeof obj !== "object") return undefined;
            obj = obj[key];
        }
        return obj;
    };

    const handleStoreSecret = async (alias: string, value: string) => {
        if (!token) return;
        await storeSecret(token, alias, value);
        setSecrets((prev) => [...new Set([...prev, alias])]);
        setStatus({ type: "success", msg: `Secret "${alias}" stored.` });
    };

    const handleRemoveSecret = async (alias: string) => {
        if (!token) return;
        await removeSecret(token, alias);
        setSecrets((prev) => prev.filter((a) => a !== alias));
        setStatus({ type: "success", msg: `Secret "${alias}" deleted.` });
    };

    if (!isAuthenticated) {
        return (
            <>
                <Navbar />
                <div className="flex h-screen items-center justify-center pt-16">
                    <div className="text-center">
                        <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-destructive/50" />
                        <h2 className="mb-2 text-xl font-semibold">Unauthorized</h2>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Open the authenticated URL to access settings.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-16">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
                            <p className="text-sm text-muted-foreground">
                                Edit agent configuration — changes are hot-reloaded.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={load} disabled={loading} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs hover:bg-muted disabled:opacity-50">
                                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Reload
                            </button>
                            <button onClick={handleSave} disabled={saving || !dirty} className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50">
                                <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    {status && (
                        <div className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${status.type === "success" ? "border-accent/30 bg-accent/5 text-accent" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>
                            {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            {status.msg}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    if (id === "json" && config) setJsonText(JSON.stringify(config, null, 4));
                                    setTab(id);
                                }}
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-colors ${tab === id ? "bg-card text-accent shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Icon className="h-3.5 w-3.5" /> {label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {loading && !config ? (
                        <div className="flex items-center justify-center py-20 text-muted-foreground">
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Loading…
                        </div>
                    ) : config ? (
                        <>
                            {tab === "general" && <GeneralSettings config={config} updateField={updateField} get={get} />}
                            {tab === "llm" && <LLMSettings config={config} updateField={updateField} get={get} />}
                            {tab === "telegram" && <TelegramSettings config={config} updateField={updateField} get={get} secrets={secrets} onStoreSecret={handleStoreSecret} onRemoveSecret={handleRemoveSecret} />}
                            {tab === "whatsapp" && <WhatsAppSettings config={config} updateField={updateField} get={get} />}
                            {tab === "json" && (
                                <div className="rounded-xl border border-border bg-card">
                                    <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                                        <Code2 className="h-4 w-4 text-accent" />
                                        <span className="text-sm font-semibold">forkscout.config.json</span>
                                    </div>
                                    <textarea
                                        value={jsonText}
                                        onChange={(e) => { setJsonText(e.target.value); setDirty(true); try { setConfig(JSON.parse(e.target.value)); } catch { } }}
                                        className="w-full bg-transparent p-5 font-mono text-sm leading-relaxed text-foreground outline-none"
                                        rows={30}
                                        spellCheck={false}
                                    />
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </main>
        </>
    );
}
