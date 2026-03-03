import type { Metadata } from "next";
import { Exo_2, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.forkscout.com";
const siteName = "ForkScout";
const siteDescription =
  "Self-hosted autonomous AI agent with real tools, persistent memory, multi-channel presence, and the ability to modify and restart itself.";

export const metadata: Metadata = {
  title: {
    default: `${siteName} — Autonomous AI Agent`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: `${siteName} — Autonomous AI Agent`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Autonomous AI Agent`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  keywords: [
    "AI agent", "autonomous agent", "self-hosted AI", "ForkScout",
    "MCP", "LLM agent", "open source AI", "multi-channel AI",
    "persistent memory AI", "tool-using AI agent",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${exo2.variable} ${geistMono.variable} overflow-x-hidden font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <JsonLd />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
