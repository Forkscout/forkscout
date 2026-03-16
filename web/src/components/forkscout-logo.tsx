"use client";

import Image from "next/image";

export function ForkScoutLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
    return (
        <Image
            src="/forkscout-logo.png"
            alt="ForkScout"
            width={size}
            height={size}
            className={`rounded-full ${className}`}
            priority
        />
    );
}
