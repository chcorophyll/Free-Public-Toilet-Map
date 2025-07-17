// src/components/Map.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Toilet } from "@/data/mock-toilets";
import L from "leaflet"; // Importing 'L' here is safe because this component is client-only.
import { useEffect } from "react";

// Icon definitions (unchanged)
const defaultIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const selectedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const userLocationIcon = new L.divIcon({
  html: `<div class="relative flex h-4 w-4"><div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></div><div class="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white"></div></div>`,
  className: "bg-transparent border-0",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// This helper component now creates the bounds object internally.
const FitBounds = ({
  points,
  panelPadding,
}: {
  points: Array<[number, number]> | null;
  panelPadding: [number, number];
}) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      // [CORE FIX] Create the Leaflet bounds object here, inside the client-only component.
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, {
        paddingTopLeft: panelPadding,
        paddingBottomRight: [50, 50],
      });
    }
  }, [points, panelPadding, map]);
  return null;
};

interface MapProps {
  toilets: Toilet[];
  center: [number, number];
  userLocation: [number, number] | null;
  selectedToiletId: string | null;
  pointsToFit: Array<[number, number]> | null; // [CORE FIX] Prop name changed to reflect it's an array.
  panelPadding: [number, number];
  onMarkerClick: (toilet: Toilet) => void;
}

const Map: React.FC<MapProps> = ({
  toilets,
  center,
  userLocation,
  selectedToiletId,
  pointsToFit,
  panelPadding,
  onMarkerClick,
}) => {
  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <FitBounds points={pointsToFit} panelPadding={panelPadding} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>你在这里</Popup>
        </Marker>
      )}
      {toilets.map((toilet) => {
        const isSelected = toilet._id === selectedToiletId;
        return (
          <Marker
            key={toilet._id}
            position={[
              toilet.location.coordinates[1],
              toilet.location.coordinates[0],
            ]}
            eventHandlers={{
              click: () => {
                onMarkerClick(toilet);
              },
            }}
            icon={isSelected ? selectedIcon : defaultIcon}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup>
              <div className="text-black">
                <h3 className="font-bold">{toilet.name}</h3>
                <p>{toilet.address}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
