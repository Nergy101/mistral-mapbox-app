import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { AREAS, MAP_CENTER, MAP_ZOOM, areasGeoJson } from "./areas";

interface MapViewProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * The Mapbox map. Each area is a clickable polygon; clicking one selects it (highlighted, camera
 * flies to it), clicking empty map clears the selection. The Mapbox access token is public by
 * design (it only authorizes map tiles/styles); the Mistral key never leaves the server.
 */
export const MapView = ({ selectedId, onSelect }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

  useEffect(() => {
    if (!containerRef.current || !token || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("areas", {
        type: "geojson",
        data: areasGeoJson(),
      });
      map.addLayer({
        id: "areas-fill",
        type: "fill",
        source: "areas",
        paint: {
          "fill-color": "#e8590c",
          "fill-opacity": 0.2,
        },
      });
      map.addLayer({
        id: "areas-outline",
        type: "line",
        source: "areas",
        paint: {
          "line-color": "#e8590c",
          "line-width": 2,
        },
      });
      map.addLayer({
        id: "areas-fill-selected",
        type: "fill",
        source: "areas",
        paint: {
          "fill-color": "#e8590c",
          "fill-opacity": 0.45,
        },
        filter: ["==", ["get", "id"], ""],
      });
      map.addLayer({
        id: "areas-outline-selected",
        type: "line",
        source: "areas",
        paint: {
          "line-color": "#862e04",
          "line-width": 3,
        },
        filter: ["==", ["get", "id"], ""],
      });
    });

    map.on("click", "areas-fill", (event) => {
      const feature = event.features?.[0] as
        | { properties?: { id?: string } }
        | undefined;
      const id = feature?.properties?.id;
      if (id) {
        const area = AREAS.find((candidate) => candidate.id === id);
        onSelectRef.current(id);
        if (area) {
          map.flyTo({ center: area.center, zoom: 14 });
        }
      }
    });

    map.on("click", (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["areas-fill"],
      });
      if (features.length === 0) {
        onSelectRef.current(null);
      }
    });

    map.on("mousemove", "areas-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "areas-fill", () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // The map is created once; selection changes are applied by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("areas-fill-selected")) {
      return;
    }
    const filter = ["==", ["get", "id"], selectedId ?? ""] as mapboxgl.FilterSpecification;
    map.setFilter("areas-fill-selected", filter);
    map.setFilter("areas-outline-selected", filter);
  }, [selectedId]);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-600">
        <p>
          Set <code className="rounded bg-gray-100 px-1">VITE_MAPBOX_ACCESS_TOKEN</code> in{" "}
          <code className="rounded bg-gray-100 px-1">apps/web/.env</code> with a public Mapbox token
          to see the map.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
};
