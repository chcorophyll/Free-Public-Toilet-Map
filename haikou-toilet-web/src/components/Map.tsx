// src/components/Map.tsx
'use client'; // 声明为客户端组件，因为它需要与浏览器DOM交互

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // 引入 Leaflet 的基础 CSS
import { Toilet } from '@/data/mock-toilets';
import L from 'leaflet'; // 引入 Leaflet 库本身
import { useEffect } from 'react';

// 【重要】修复 Leaflet 默认图标在 Webpack/Next.js 环境下可能丢失的问题
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

// 一个内部辅助组件，用于在 props 变化时以动画形式移动地图视野
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap(); // 获取父级 MapContainer 的实例
  useEffect(() => {
    // 当 center prop 变化时，平滑地将地图视图移动到新的中心点
    map.setView(center, 14); // 14 是地图的缩放级别
  }, [center, map]);
  return null; // 这个组件不渲染任何可见的UI
}

// 定义 Map 组件接收的属性（Props）类型
interface MapProps {
  toilets: Toilet[];
  center: [number, number];
  onMarkerClick: (toilet: Toilet) => void;
}

// 主地图组件
const Map: React.FC<MapProps> = ({ toilets, center, onMarkerClick }) => {
  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
      {/* 加载一个子组件来动态改变视图 */}
      <ChangeView center={center} />
      
      {/* 地图瓦片层，我们选择了 CartoDB 的深色主题地图 */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* 遍历厕所数据，为每个厕所在地图上创建一个标记点 */}
      {toilets.map(toilet => (
        <Marker 
          key={toilet._id} // 使用唯一ID作为key，优化React的渲染性能
          position={[toilet.location.coordinates[1], toilet.location.coordinates[0]]} // 注意：Leaflet 的纬度在前，经度在后
          // 为每个标记点绑定点击事件处理器
          eventHandlers={{
            click: () => {
              onMarkerClick(toilet); // 当点击时，调用从父组件传入的回调函数
            },
          }}
        >
          {/* 点击标记点后弹出的信息窗口 */}
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