/**
 * The chat endpoint. `createServerFn` runs the handler only on the server; the browser calls it as
 * an RPC and never sees this module's imports. The Mistral SDK is imported dynamically inside the
 * handler so it cannot end up in the client bundle, and the API key is read server-side only.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { AREAS, areaById } from "../map/areas";
import { getMistralApiKey } from "./env";
import { buildSystemPrompt } from "./prompt";

const MODEL = "mistral-small-latest";

const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const inputSchema = z.object({
  question: z.string().min(1).max(2000),
  /** The area currently selected on the map, if any. */
  selectedAreaId: z.string().nullable(),
  /** Prior turns of this conversation, oldest first. */
  history: z.array(historyMessageSchema).max(20),
});

export const chat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = getMistralApiKey();
    if (!apiKey) {
      throw new Error(
        "MISTRAL_API_KEY is not set on the server. Add it to the workspace-root .env."
      );
    }

    const selected = areaById(data.selectedAreaId);
    const systemPrompt = buildSystemPrompt(AREAS, selected);

    const { Mistral } = await import("@mistralai/mistralai");
    const client = new Mistral({ apiKey });

    const response = await client.chat.complete({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...data.history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: "user", content: data.question },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const answer =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .map((chunk) => ("text" in chunk ? chunk.text : ""))
              .join("")
          : "";

    if (!answer) {
      throw new Error("The model returned an empty answer.");
    }

    return { answer };
  });
