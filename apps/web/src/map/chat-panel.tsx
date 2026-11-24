import { useState } from "react";

import { chat } from "../server/chat";
import type { Area } from "./areas";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  selectedArea: Area | undefined;
  onClearSelection: () => void;
}

/**
 * The chat sidebar. Questions go to the server function, which calls Mistral with the map areas
 * and the selected area as context; the API key never leaves the server.
 */
export const ChatPanel = ({ selectedArea, onClearSelection }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  const send = async () => {
    const question = input.trim();
    if (!question || pending) {
      return;
    }

    setInput("");
    setPending(true);
    const history = messages;
    setMessages([...history, { role: "user", content: question }]);

    try {
      const result = await chat({
        data: {
          question,
          selectedAreaId: selectedArea?.id ?? null,
          history,
        },
      });
      setMessages([
        ...history,
        { role: "user", content: question },
        { role: "assistant", content: result.answer },
      ]);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "The chat request failed.";
      setMessages([
        ...history,
        { role: "user", content: question },
        { role: "assistant", content: `Sorry, something went wrong: ${detail}` },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-lg font-semibold">Map assistant</h1>
        <p className="mt-1 text-xs text-gray-500">
          Ask about the selected area or any area on the map.
        </p>
        {selectedArea ? (
          <div className="mt-2 flex items-center justify-between rounded bg-orange-50 px-2 py-1 text-xs text-orange-900">
            <span>
              Selected: <strong>{selectedArea.name}</strong>
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="ml-2 underline"
            >
              clear
            </button>
          </div>
        ) : (
          <p className="mt-2 rounded bg-gray-50 px-2 py-1 text-xs text-gray-500">
            No area selected — click one on the map.
          </p>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">
            Try “What is the history of the selected area?” or “Which area is best for cafés?”
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? "ml-8 rounded-lg bg-orange-600 px-3 py-2 text-sm text-white"
                : "mr-8 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-900"
            }
          >
            {message.content}
          </div>
        ))}
        {pending && <p className="text-sm text-gray-400">Thinking…</p>}
      </div>

      <form
        className="flex gap-2 border-t border-gray-200 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about the map…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || input.trim() === ""}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};
