// src/components/MapClientWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Toilet } from '@/data/mock-toilets';
import { DetailsPanel } from '@/components/DetailsPanel';
import { FilterPanel } from '@/components/FilterPanel';
import ClientOnly from '@/components/ClientOnly'; // 【新增】引入 ClientOnly 组件

// ... 其他辅助组件和函数保持不变 ...
const FilterButton = ({ onClick }: { onClick: () => void }) => ( <button onClick={onClick} className="absolute top-4 right-8 z-20 bg-white text-black p-4 rounded-full shadow-lg"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.07 1.942l-3.22 1.61A2.25 2.25 0 014.5 19.227v-2.927a2.25 2.25 0 00-.659-1.591L.659 7.409A2.25 2.25 0 010 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /> </svg> </button> );
interface Filters { isOpen24h: boolean; isAccessible: boolean; }
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MapClientWrapper() {
  // ... 所有 state 和 hook 逻辑保持不变 ...
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ isOpen24h: false, isAccessible: false });
  useEffect(() => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition( (position) => { const { latitude, longitude } = position.coords; setUserLocation([latitude, longitude]); }, () => { setUserLocation([20.04, 110.32]); } ); } }, []);
  const apiUrl = useMemo(() => { if (!userLocation) return null; const activeFilters = Object.entries(filters).filter(([, value]) => value).map(([key]) => key).join(','); let url = `${process.env.NEXT_PUBLIC_API_URL}/toilets?latitude=${userLocation[0]}&longitude=${userLocation[1]}`; if (activeFilters) { url += `&filters=${activeFilters}`; } return url; }, [userLocation, filters]);
  const { data: toilets, error, isLoading } = useSWR<Toilet[]>(apiUrl, fetcher);
  
  // Map 组件已经通过 dynamic import (ssr: false) 实现了客户端渲染，所以它不需要 ClientOnly 包装
  const Map = useMemo(() => dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <p className="flex h-full w-full items-center justify-center text-white">地图加载中...</p>  }), []);
  
  const mapCenter: [number, number] = userLocation || [20.04, 110.32];

  return (
    <div className={`
        w-full h-full relative 
        transition-all duration-500 ease-in-out
        ${selectedToilet ? 'md:pl-96' : 'md:pl-0'}
    `}>
        <div className="absolute inset-0 z-10">
            <Map 
                toilets={toilets || []}
                center={mapCenter} 
                onMarkerClick={setSelectedToilet} 
            />
        </div>
        
        {/* 【核心修改】将所有浮层UI组件用 <ClientOnly> 包裹起来 */}
        <ClientOnly>
            <>
                <FilterButton onClick={() => setIsFilterPanelOpen(true)} />

                {isLoading && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-3 rounded-md">正在寻找...</p>}
                {error && <p className="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white p-3 rounded-md">数据加载失败。</p>}

                <DetailsPanel 
                    toilet={selectedToilet}
                    userLocation={userLocation}
                    onClose={() => setSelectedToilet(null)} 
                />
                <FilterPanel 
                    isOpen={isFilterPanelOpen}
                    filters={filters}
                    onFilterChange={setFilters}
                    onClose={() => setIsFilterPanelOpen(false)}
                />
            </>
        </ClientOnly>
    </div>
  );
}