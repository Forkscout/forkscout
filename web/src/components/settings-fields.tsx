"use client";

import type { ReactNode, ElementType } from "react";

/* ── Section wrapper ──────────────────────────────────────────────── */

export function Section({
    title,
    icon: Icon,
    children,
    actions,
}: {
    title: string;
    icon: ElementType;
    children: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-accent" />
                    <h2 className="text-sm font-semibold">{title}</h2>
                </div>
                {actions}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

/* ── Text / textarea field ────────────────────────────────────────── */

export function Field({
    label,
    value,
    onChange,
    multiline,
    placeholder,
    mono,
    disabled,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
    placeholder?: string;
    mono?: boolean;
    disabled?: boolean;
}) {
    const cls = `w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20 disabled:opacity-50 ${mono ? "font-mono" : ""}`;
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                {label}
            </span>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cls}
                    rows={3}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cls}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            )}
        </label>
    );
}

/* ── Number field ─────────────────────────────────────────────────── */

export function NumberField({
    label,
    value,
    onChange,
    min,
    max,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                {label}
            </span>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
        </label>
    );
}

/* ── Select field ─────────────────────────────────────────────────── */

export function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                {label}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </label>
    );
}

/* ── Boolean toggle ───────────────────────────────────────────────── */

export function BoolField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={value}
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? "bg-accent" : "bg-muted"}`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
                />
            </button>
            <span className="text-sm text-muted-foreground">{label}</span>
        </label>
    );
}

/* ── Chip list (for user IDs / JIDs) ──────────────────────────────── */

export function ChipList({
    items,
    onRemove,
}: {
    items: string[];
    onRemove: (item: string) => void;
}) {
    if (items.length === 0) {
        return (
            <p className="text-xs italic text-muted-foreground">None configured</p>
        );
    }
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-xs"
                >
                    {item}
                    <button
                        type="button"
                        onClick={() => onRemove(item)}
                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${item}`}
                    >
                        ×
                    </button>
                </span>
            ))}
        </div>
    );
}

/* ── Add-item inline form ─────────────────────────────────────────── */

import { useState } from "react";
import { Plus } from "lucide-react";

export function AddItemForm({
    placeholder,
    onAdd,
    transform,
}: {
    placeholder: string;
    onAdd: (value: string) => void;
    transform?: (v: string) => string;
}) {
    const [value, setValue] = useState("");

    const submit = () => {
        const v = (transform ? transform(value) : value).trim();
        if (!v) return;
        onAdd(v);
        setValue("");
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={placeholder}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
            <button
                type="button"
                onClick={submit}
                disabled={!value.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
                <Plus className="h-3.5 w-3.5" /> Add
            </button>
        </div>
    );
}
