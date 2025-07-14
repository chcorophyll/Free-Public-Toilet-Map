// src/components/MapClientWrapper.tsx
'use client';

// [CORE FIX] Remove the leaflet import from this file.
// import L, { LatLngBoundsExpression } from 'leaflet'; 
import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Toilet } from '@/data/mock-toilets';
import { DetailsPanel } from '@/components/DetailsPanel';
import { FilterPanel } from '@/components/FilterPanel';
import ClientOnly from '@/components/ClientOnly';

// FilterButton component (unchanged)
const FilterButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="absolute top-4 right-8 z-20 bg-white text-black p-4 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.07 1.942l-3.22 1.61A2.25 2.25 0 014.5 19.227v-2.927a2.25 2.25 0 00-.659-1.591L.659 7.409A2.25 2.25 0 010 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
    </button>
);

interface Filters { isOpen24h: boolean; isAccessible: boolean; }
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MapClientWrapper() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ isOpen24h: false, isAccessible: false });
  
  // [CORE FIX] This state now holds a pure array of coordinates, not a Leaflet-specific object.
  const [pointsToFit, setPointsToFit] = useState<Array<[number, number]> | null>(null);
  
  const [panelPadding, setPanelPadding] = useState<[number, number]>([50, 50]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setUserLocation([position.coords.latitude, position.coords.longitude]); },
        () => { setUserLocation([20.04, 110.32]); }
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && selectedToilet) {
      setPanelPadding([384 + 50, 50]);
    } else {
      setPanelPadding([50, 50]);
    }
  }, [selectedToilet]);

  const apiUrl = useMemo(() => {
    if (!userLocation) return null;
    const activeFilters = Object.entries(filters).filter(([, value]) => value).map(([key]) => key).join(',');
    let url = `${process.env.NEXT_PUBLIC_API_URL}/toilets?latitude=${userLocation[0]}&longitude=${userLocation[1]}`;
    if (activeFilters) { url += `&filters=${activeFilters}`; }
    return url;
  }, [userLocation, filters]);

  const { data: toilets, error, isLoading } = useSWR<Toilet[]>(apiUrl, fetcher);

  const Map = useMemo(() => dynamic(() => import('@/components/Map'), { 
    ssr: false, 
    loading: () => <p className="flex h-full w-full items-center justify-center text-white">地图加载中...</p> 
  }), []);
  
  const mapCenter: [number, number] = userLocation || [20.04, 110.32];

  const handleSelectToilet = (toilet: Toilet) => {
    setIsFilterPanelOpen(false);
    setSelectedToilet(toilet);
    if (userLocation) {
      // [CORE FIX] Create a simple array of coordinates. Do not use `L.latLngBounds`.
      const points: Array<[number, number]> = [
        [userLocation[0], userLocation[1]],
        [toilet.location.coordinates[1], toilet.location.coordinates[0]],
      ];
      setPointsToFit(points);
    }
  };

  const handleOpenFilterPanel = () => {
    setSelectedToilet(null);
    setIsFilterPanelOpen(true);
    if (userLocation && toilets && toilets.length > 0) {
      const points = toilets.map(t => [t.location.coordinates[1], t.location.coordinates[0]] as [number, number]);
      points.push([userLocation[0], userLocation[1]]);
      setPointsToFit(points);
    } else if (userLocation) {
      setPointsToFit([userLocation]);
    }
  };

  const handleClosePanels = () => {
    setSelectedToilet(null);
    setIsFilterPanelOpen(false);
    setPointsToFit(null); 
  };
  
  return (
    <div className="w-full h-full relative">
        <div className="absolute inset-0 z-10">
            <Map 
                toilets={toilets || []}
                center={mapCenter} 
                userLocation={userLocation}
                selectedToiletId={selectedToilet?._id || null}
                pointsToFit={pointsToFit} // Pass the pure coordinate array
                panelPadding={panelPadding}
                onMarkerClick={handleSelectToilet}
            />
        </div>
        <ClientOnly>
            <>
                <FilterButton onClick={handleOpenFilterPanel} />
                {isLoading && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-3 rounded-md">正在寻找...</p>}
                <DetailsPanel toilet={selectedToilet} userLocation={userLocation} onClose={handleClosePanels} />
                <FilterPanel 
                    isOpen={isFilterPanelOpen}
                    toilets={toilets || []}
                    isLoading={isLoading}
                    userLocation={userLocation}
                    filters={filters}
                    onFilterChange={setFilters}
                    onClose={handleClosePanels}
                    onItemClick={handleSelectToilet}
                />
            </>
        </ClientOnly>
    </div>
  );
}