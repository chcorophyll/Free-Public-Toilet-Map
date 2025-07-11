// src/components/Map.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Toilet } from "@/data/mock-toilets";
import L from "leaflet";
import { useEffect } from "react";

// 定义厕所标记点的默认图标
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

// 定义用户位置的自定义图标
const userLocationIcon = new L.divIcon({
  html: `<div class="relative flex h-4 w-4">
           <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></div>
           <div class="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white"></div>
         </div>`,
  className: "bg-transparent border-0",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// ... ChangeView 和 FlyToView 组件保持不变 ...
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};
const FlyToView = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
};

interface MapProps {
  toilets: Toilet[];
  center: [number, number];
  userLocation: [number, number] | null;
  flyToPosition: [number, number] | null;
  onMarkerClick: (toilet: Toilet) => void;
}

const Map: React.FC<MapProps> = ({
  toilets,
  center,
  userLocation,
  flyToPosition,
  onMarkerClick,
}) => {
  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <ChangeView center={center} />
      <FlyToView position={flyToPosition} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>你在这里</Popup>
        </Marker>
      )}

      {/* 遍历厕所数据，创建标记点 */}
      {toilets.map((toilet) => (
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
          // 【核心修复】为每个厕所标记点明确传递 icon 属性
          icon={defaultIcon}
        >
          <Popup>
            <div className="text-black">
              <h3 className="font-bold">{toilet.name}</h3>
              <p>{toilet.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
