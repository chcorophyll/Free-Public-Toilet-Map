// src/components/MapClientWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Toilet } from '@/data/mock-toilets';
import { DetailsPanel } from '@/components/DetailsPanel';
import { FilterPanel } from '@/components/FilterPanel';
import ClientOnly from '@/components/ClientOnly';

// 【修复】这里是 FilterButton 组件的完整、正确的定义
const FilterButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="absolute top-4 right-8 z-20 bg-white text-black p-4 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.07 1.942l-3.22 1.61A2.25 2.25 0 014.5 19.227v-2.927a2.25 2.25 0 00-.659-1.591L.659 7.409A2.25 2.25 0 010 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
    </button>
);

interface Filters { isOpen24h: boolean; isAccessible: boolean; }
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MapClientWrapper() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ isOpen24h: false, isAccessible: false });
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        () => { setUserLocation([20.04, 110.32]); }
      );
    }
  }, []);

  const apiUrl = useMemo(() => {
    if (!userLocation) return null;
    const activeFilters = Object.entries(filters).filter(([, value]) => value).map(([key]) => key).join(',');
    let url = `${process.env.NEXT_PUBLIC_API_URL}/toilets?latitude=${userLocation[0]}&longitude=${userLocation[1]}`;
    if (activeFilters) {
      url += `&filters=${activeFilters}`;
    }
    return url;
  }, [userLocation, filters]);

  const { data: toilets, error, isLoading } = useSWR<Toilet[]>(apiUrl, fetcher);

  const Map = useMemo(() => dynamic(() => import('@/components/Map'), { 
    ssr: false, 
    loading: () => <p className="flex h-full w-full items-center justify-center text-white">地图加载中...</p> 
  }), []);
  
  const mapCenter: [number, number] = userLocation || [20.04, 110.32];

  const handleMarkerClick = (toilet: Toilet) => {
    setIsFilterPanelOpen(false); 
    setSelectedToilet(toilet);
    setFlyToPosition([toilet.location.coordinates[1], toilet.location.coordinates[0]]);
  };

  const handleFilterButtonClick = () => {
    setSelectedToilet(null); 
    setIsFilterPanelOpen(true);
  };

  const handleCloseDetailsPanel = () => {
    setSelectedToilet(null);
  };

  const handleCloseFilterPanel = () => {
    setIsFilterPanelOpen(false);
  };

  const handleFlyToAndClose = (coords: [number, number]) => {
    setFlyToPosition(coords);
    setIsFilterPanelOpen(false);
  };

  return (
    <div className={`w-full h-full relative transition-all duration-500 ease-in-out ${selectedToilet ? 'md:pl-96' : 'md:pl-0'}`}>
        <div className="absolute inset-0 z-10">
            <Map 
                toilets={toilets || []}
                center={mapCenter} 
                userLocation={userLocation}
                flyToPosition={flyToPosition}
                onMarkerClick={handleMarkerClick}
            />
        </div>
        
        <ClientOnly>
            <>
                <FilterButton onClick={handleFilterButtonClick} />
                {isLoading && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-3 rounded-md">正在寻找...</p>}
                
                <DetailsPanel 
                    toilet={selectedToilet}
                    userLocation={userLocation}
                    onClose={handleCloseDetailsPanel} 
                />
                <FilterPanel 
                    isOpen={isFilterPanelOpen}
                    toilets={toilets || []}
                    isLoading={isLoading}
                    userLocation={userLocation}
                    filters={filters}
                    onFilterChange={setFilters}
                    onClose={handleCloseFilterPanel}
                    onItemClick={handleFlyToAndClose}
                />
            </>
        </ClientOnly>
    </div>
  );
}