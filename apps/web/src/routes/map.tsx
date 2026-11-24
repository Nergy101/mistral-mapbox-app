import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { areaById } from "../map/areas";
import { ChatPanel } from "../map/chat-panel";
import { MapView } from "../map/map-view";

/**
 * The map page: Mapbox on the left, chat on the right. It claims the landing page, so `/`
 * redirects here.
 */
const MapPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = areaById(selectedId);

  return (
    <main className="flex h-dvh w-full overflow-hidden">
      <div className="relative flex-1">
        <MapView selectedId={selectedId} onSelect={setSelectedId} />
        {selected && (
          <div className="absolute left-4 top-4 max-w-xs rounded-lg bg-white/95 p-4 shadow">
            <h2 className="text-base font-semibold">{selected.name}</h2>
            <p className="mt-1 text-sm text-gray-700">{selected.description}</p>
            <ul className="mt-2 list-disc pl-4 text-xs text-gray-500">
              {selected.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <aside className="w-96 shrink-0">
        <ChatPanel
          selectedArea={selected}
          onClearSelection={() => setSelectedId(null)}
        />
      </aside>
    </main>
  );
};

export const Route = createFileRoute("/map")({
  // i18n-exempt: a route claim, not prose
  staticData: { landing: 1 },
  component: MapPage,
});
