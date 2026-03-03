// src/providers/openai_provider.ts — Native OpenAI provider via @ai-sdk/openai.
// Uses the official OpenAI endpoint (https://api.openai.com/v1).
//
// IMPORTANT: AI SDK v6 defaults to the Responses API for openai(modelId).
// We use provider.chat(modelId) to force the Chat Completions API,
// ensuring consistent behavior with all other providers.
//
// Env: OPENAI_API_KEY

import {
    createOpenAICompatibleProvider,
    type OpenAICompatibleProvider,
} from "@/providers/open_ai_compatible_provider.ts";

/**
 * Creates the official OpenAI provider.
 *
 * Uses the same OpenAI-compatible factory with the standard OpenAI endpoint.
 * .chat() is used instead of the Responses API for consistency.
 */
export function createOpenAIProvider(): OpenAICompatibleProvider {
    return createOpenAICompatibleProvider({
        name: "openai",
        baseURL: "https://api.openai.com/v1",
        apiKey: process.env.OPENAI_API_KEY ?? "",
    });
}
