// src/components/MapClientWrapper.tsx
'use client'; // 关键：声明这是一个客户端组件

import dynamic from 'next/dynamic'; // 用于动态导入组件
import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr'; // 用于数据请求
import { Toilet } from '@/data/mock-toilets';
import { DetailsPanel } from '@/components/DetailsPanel';
import { FilterPanel } from '@/components/FilterPanel';

// 浮动的筛选按钮
const FilterButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="absolute bottom-8 right-8 z-20 bg-white text-black p-4 rounded-full shadow-lg md:bottom-auto md:top-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.07 1.942l-3.22 1.61A2.25 2.25 0 014.5 19.227v-2.927a2.25 2.25 0 00-.659-1.591L.659 7.409A2.25 2.25 0 010 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
    </button>
);

interface Filters { isOpen24h: boolean; isAccessible: boolean; }
const fetcher = (url: string) => fetch(url).then(res => res.json());

// 这个组件包含了所有客户端的交互逻辑
export default function MapClientWrapper() {
  // 状态管理：用户位置、选中的厕所、筛选面板开关、筛选条件
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ isOpen24h: false, isAccessible: false });

  // Effect Hook：在组件挂载后获取用户地理位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        () => { setUserLocation([20.04, 110.32]); } // 失败时使用默认位置
      );
    }
  }, []); // 空依赖数组表示此 effect 只运行一次

  // Memoized Hook：根据用户位置和筛选条件，动态构建并缓存 API URL
  const apiUrl = useMemo(() => {
    if (!userLocation) return null; // 如果没有位置信息，则不请求
    const activeFilters = Object.entries(filters).filter(([, value]) => value).map(([key]) => key).join(',');
    let url = `${process.env.NEXT_PUBLIC_API_URL}/toilets?latitude=${userLocation[0]}&longitude=${userLocation[1]}`;
    if (activeFilters) {
      url += `&filters=${activeFilters}`;
    }
    return url;
  }, [userLocation, filters]); // 当位置或筛选条件变化时，重新计算 URL

  // SWR Hook：进行数据请求，并管理加载、错误等状态
  const { data: toilets, error, isLoading } = useSWR<Toilet[]>(apiUrl, fetcher);

  // Memoized Hook：动态导入地图组件，避免其在服务端渲染
  const Map = useMemo(() => dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <p className="flex h-full w-full items-center justify-center text-white">地图加载中...</p> 
  }), []);
  
  const mapCenter: [number, number] = userLocation || [20.04, 110.32];

  // 返回最终的响应式布局
  return (
    <div className="w-full h-full md:flex">
      {/* 详情面板容器 */}
      <div className={`
        transition-all duration-500 ease-in-out
        flex-shrink-0 h-full overflow-hidden
        ${selectedToilet ? 'w-full md:w-2/5' : 'w-0'}
      `}>
          <DetailsPanel 
              toilet={selectedToilet}
              userLocation={userLocation}
              onClose={() => setSelectedToilet(null)} 
          />
      </div>

      {/* 地图区域容器 */}
      <div className="flex-grow h-full relative">
          <Map 
              toilets={toilets || []}
              center={mapCenter} 
              onMarkerClick={setSelectedToilet} 
          />
          <FilterButton onClick={() => setIsFilterPanelOpen(true)} />
          {isLoading && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-3 rounded-md">正在寻找...</p>}
          {error && <p className="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white p-3 rounded-md">数据加载失败。</p>}
      </div>

      {/* 筛选面板 */}
      <FilterPanel 
        isOpen={isFilterPanelOpen}
        filters={filters}
        onFilterChange={setFilters}
        onClose={() => setIsFilterPanelOpen(false)}
      />
    </div>
  );
}