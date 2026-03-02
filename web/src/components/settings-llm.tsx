"use client";

import {
    Section,
    Field,
    NumberField,
    SelectField,
} from "@web/components/settings-fields";
import { Cpu, Layers } from "lucide-react";

type Config = Record<string, any>;

interface Props {
    config: Config;
    updateField: (path: string[], value: unknown) => void;
    get: (path: string[]) => unknown;
}

export default function LLMSettings({ config, updateField, get }: Props) {
    const providers = (get(["llm", "providers"]) as Record<string, any>) ?? {};
    const activeProvider = (get(["llm", "provider"]) as string) ?? "openrouter";
    const activeTiers = providers[activeProvider] as Record<string, string> | undefined;

    return (
        <div className="space-y-6">
            {/* Core LLM config */}
            <Section title="Model Selection" icon={Cpu}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                        label="Provider"
                        value={activeProvider}
                        options={Object.keys(providers)}
                        onChange={(v) => updateField(["llm", "provider"], v)}
                    />
                    <SelectField
                        label="Tier"
                        value={(get(["llm", "tier"]) as string) ?? "balanced"}
                        options={["fast", "balanced", "powerful"]}
                        onChange={(v) => updateField(["llm", "tier"], v)}
                    />
                    <NumberField
                        label="Max Tokens"
                        value={(get(["llm", "maxTokens"]) as number) ?? 2000}
                        onChange={(v) => updateField(["llm", "maxTokens"], v)}
                    />
                    <NumberField
                        label="Max Steps"
                        value={(get(["llm", "maxSteps"]) as number) ?? 100}
                        onChange={(v) => updateField(["llm", "maxSteps"], v)}
                    />
                    <Field
                        label="Reasoning Tag"
                        value={(get(["llm", "reasoningTag"]) as string) ?? ""}
                        onChange={(v) => updateField(["llm", "reasoningTag"], v)}
                        placeholder="think"
                    />
                    <NumberField
                        label="Summarize Max Tokens"
                        value={(get(["llm", "llmSummarizeMaxTokens"]) as number) ?? 1200}
                        onChange={(v) => updateField(["llm", "llmSummarizeMaxTokens"], v)}
                    />
                    <NumberField
                        label="Auto-Compress > Words"
                        value={(get(["llm", "toolResultAutoCompressWords"]) as number) ?? 400}
                        onChange={(v) => updateField(["llm", "toolResultAutoCompressWords"], v)}
                    />
                </div>
            </Section>

            {/* Active provider model IDs */}
            {activeTiers && (
                <Section title={`Model IDs — ${activeProvider}`} icon={Layers}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {Object.entries(activeTiers).map(([tier, model]) => (
                            <Field
                                key={tier}
                                label={tier}
                                value={(model as string) ?? ""}
                                onChange={(v) =>
                                    updateField(["llm", "providers", activeProvider, tier], v)
                                }
                                mono
                                placeholder={`Model ID for ${tier}`}
                            />
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}
