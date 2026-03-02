"use client";

import {
    Section,
    Field,
    NumberField,
    BoolField,
} from "@web/components/settings-fields";
import { Bot, Globe, Monitor } from "lucide-react";

type Config = Record<string, any>;

interface Props {
    config: Config;
    updateField: (path: string[], value: unknown) => void;
    get: (path: string[]) => unknown;
}

export default function GeneralSettings({ config, updateField, get }: Props) {
    return (
        <div className="space-y-6">
            {/* Agent Identity */}
            <Section title="Agent Identity" icon={Bot}>
                <div className="grid gap-4">
                    <Field
                        label="Name"
                        value={(get(["agent", "name"]) as string) ?? ""}
                        onChange={(v) => updateField(["agent", "name"], v)}
                    />
                    <Field
                        label="Description"
                        value={(get(["agent", "description"]) as string) ?? ""}
                        onChange={(v) => updateField(["agent", "description"], v)}
                        multiline
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="GitHub URL"
                            value={(get(["agent", "github"]) as string) ?? ""}
                            onChange={(v) => updateField(["agent", "github"], v)}
                        />
                        <Field
                            label="Gender"
                            value={(get(["agent", "gender"]) as string) ?? ""}
                            onChange={(v) => updateField(["agent", "gender"], v)}
                        />
                    </div>
                    <Field
                        label="Extra System Prompt"
                        value={(get(["agent", "systemPromptExtra"]) as string) ?? ""}
                        onChange={(v) => updateField(["agent", "systemPromptExtra"], v)}
                        multiline
                        placeholder="Optional instructions appended to the identity prompt"
                    />
                </div>
            </Section>

            {/* Browser */}
            <Section title="Browser" icon={Globe}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <BoolField
                        label="Headless Mode"
                        value={(get(["browser", "headless"]) as boolean) ?? false}
                        onChange={(v) => updateField(["browser", "headless"], v)}
                    />
                    <NumberField
                        label="Screenshot Quality (1-100)"
                        value={(get(["browser", "screenshotQuality"]) as number) ?? 50}
                        onChange={(v) => updateField(["browser", "screenshotQuality"], v)}
                        min={1}
                        max={100}
                    />
                    <Field
                        label="Chrome Path"
                        value={(get(["browser", "chromePath"]) as string) ?? ""}
                        onChange={(v) => updateField(["browser", "chromePath"], v)}
                        placeholder="Auto-detect if empty"
                        mono
                    />
                    <Field
                        label="Profile Directory"
                        value={(get(["browser", "profileDir"]) as string) ?? ""}
                        onChange={(v) => updateField(["browser", "profileDir"], v)}
                        mono
                    />
                </div>
            </Section>

            {/* Self Channel */}
            <Section title="Self Channel (HTTP)" icon={Monitor}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField
                        label="HTTP Port"
                        value={(get(["self", "httpPort"]) as number) ?? 3200}
                        onChange={(v) => updateField(["self", "httpPort"], v)}
                    />
                    <NumberField
                        label="History Token Budget"
                        value={(get(["self", "historyTokenBudget"]) as number) ?? 12000}
                        onChange={(v) => updateField(["self", "historyTokenBudget"], v)}
                    />
                </div>
            </Section>
        </div>
    );
}
