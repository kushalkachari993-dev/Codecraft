import type { ClerkRuntimeEnvironment } from "../../app/clerk-config";
import type { CodeCraftEnvironment } from "../../server/config";

export type CloudflareAiResponse = string | { response?: string };

export interface CloudflareAiBinding {
  run(model: string, input: {
    messages: Array<{ role: "system" | "user"; content: string }>;
    max_tokens: number;
    temperature: number;
  }): Promise<CloudflareAiResponse>;
}

export interface CloudflareApplicationEnvironment extends ClerkRuntimeEnvironment, CodeCraftEnvironment {
  DB: D1Database;
  AI?: CloudflareAiBinding;
}
