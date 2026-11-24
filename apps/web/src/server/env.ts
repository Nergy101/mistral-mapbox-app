/**
 * Server-only settings. Nothing in this module may be imported by client code: the values it reads
 * (MISTRAL_API_KEY) must never reach the browser bundle.
 */

import { readFileSync } from "node:fs";

/**
 * The Mistral API key, from the server environment. In production the variable is set directly; in
 * dev (`bun run dev` inside apps/web) the workspace-root `.env` is not loaded into `process.env`,
 * so fall back to reading it from there. The root `.env` is gitignored.
 */
export const getMistralApiKey = (): string | undefined => {
  const fromEnv = process.env.MISTRAL_API_KEY?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  try {
    // apps/web/src/server/env.ts -> workspace root .env
    const rootEnvUrl = new URL("../../../../.env", import.meta.url);
    const text = readFileSync(rootEnvUrl, "utf8");
    for (const line of text.split("\n")) {
      const match = /^MISTRAL_API_KEY=(.*)$/u.exec(line.trim());
      const value = match?.[1]?.trim();
      if (value) {
        return value;
      }
    }
  } catch {
    // Not running from the source tree (built output): rely on process.env only.
  }

  return undefined;
};
