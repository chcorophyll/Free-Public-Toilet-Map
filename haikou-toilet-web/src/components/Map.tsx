// src/components/Map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Toilet } from '@/data/mock-toilets';
import L from 'leaflet';
import { useEffect } from 'react';

const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

// 一个内部组件，用于当地图中心点变化时，平滑移动地图视野
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14); // 第二个参数是缩放级别
  }, [center, map]);
  return null;
}

interface MapProps {
  toilets: Toilet[];
  center: [number, number]; // 接收一个中心点坐标
  onMarkerClick: (toilet: Toilet) => void; // 【新增】接收一个点击事件的回调函数
}

const Map: React.FC<MapProps> = ({ toilets, center, onMarkerClick }) => {
  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {toilets.map(toilet => (
        <Marker 
          key={toilet._id} 
          position={[toilet.location.coordinates[1], toilet.location.coordinates[0]]}
          // 【新增】为 Marker 添加事件处理器
          eventHandlers={{
            click: () => {
              onMarkerClick(toilet);
            },
          }}
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