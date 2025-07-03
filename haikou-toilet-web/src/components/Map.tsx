// src/components/Map.tsx
'use client'; // 声明这是一个客户端组件

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Toilet } from '@/data/mock-toilets'; // 引入我们的类型
import L from 'leaflet';

// Leaflet 的默认图标可能会丢失，我们手动修复它
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


interface MapProps {
  toilets: Toilet[];
}

const Map: React.FC<MapProps> = ({ toilets }) => {
  const position: [number, number] = [20.04, 110.32]; // 海口市中心大致纬度, 经度

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
      {/* 使用深色地图瓦片，以匹配我们的 Nike 风格设计 */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* 遍历厕所数据，在地图上创建标记点 */}
      {toilets.map(toilet => (
        <Marker key={toilet._id} position={[toilet.location.coordinates[1], toilet.location.coordinates[0]]}>
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