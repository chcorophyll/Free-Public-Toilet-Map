// src/components/MapClientWrapper.tsx
"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import { Toilet } from "@/data/mock-toilets";
import { DetailsPanel } from "@/components/DetailsPanel";
import { FilterPanel } from "@/components/FilterPanel";
import ClientOnly from "@/components/ClientOnly";

// 筛选按钮组件
const FilterButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute top-4 right-8 z-20 bg-white text-black p-4 rounded-full shadow-lg"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.07 1.942l-3.22 1.61A2.25 2.25 0 014.5 19.227v-2.927a2.25 2.25 0 00-.659-1.591L.659 7.409A2.25 2.25 0 010 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
      />
    </svg>
  </button>
);

interface Filters {
  isOpen24h: boolean;
  isAccessible: boolean;
}
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MapClientWrapper() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    isOpen24h: false,
    isAccessible: false,
  });

  // ... (useEffect 和 SWR hook 逻辑保持不变) ...

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        () => {
          setUserLocation([20.04, 110.32]);
        }
      );
    }
  }, []);
  const apiUrl = useMemo(() => {
    if (!userLocation) return null;
    const activeFilters = Object.entries(filters)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(",");
    let url = `${process.env.NEXT_PUBLIC_API_URL}/toilets?latitude=${userLocation[0]}&longitude=${userLocation[1]}`;
    if (activeFilters) {
      url += `&filters=${activeFilters}`;
    }
    return url;
  }, [userLocation, filters]);
  const { data: toilets, error, isLoading } = useSWR<Toilet[]>(apiUrl, fetcher);
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        ssr: false,
        loading: () => (
          <p className="flex h-full w-full items-center justify-center text-white">
            地图加载中...
          </p>
        ),
      }),
    []
  );
  const mapCenter: [number, number] = userLocation || [20.04, 110.32];

  // 【核心修复】创建清晰的事件处理器，并添加 console.log 用于调试
  const handleMarkerClick = (toilet: Toilet) => {
    console.log(
      "【Debug】Marker Clicked. Closing filter panel, opening details panel for:",
      toilet.name
    );
    setIsFilterPanelOpen(false); // 先关闭筛选面板
    setSelectedToilet(toilet); // 再设置选中的厕所
  };

  const handleFilterButtonClick = () => {
    console.log(
      "【Debug】Filter Button Clicked. Closing details panel, opening filter panel."
    );
    setSelectedToilet(null); // 先关闭详情面板
    setIsFilterPanelOpen(true); // 再打开筛选面板
  };

  const handleCloseDetailsPanel = () => {
    console.log("【Debug】Closing Details Panel.");
    setSelectedToilet(null);
  };

  const handleCloseFilterPanel = () => {
    console.log("【Debug】Closing Filter Panel.");
    setIsFilterPanelOpen(false);
  };

  return (
    <div
      className={`w-full h-full relative transition-all duration-500 ease-in-out ${
        selectedToilet ? "md:pl-96" : "md:pl-0"
      }`}
    >
      <div className="absolute inset-0 z-10">
        <Map
          toilets={toilets || []}
          center={mapCenter}
          onMarkerClick={handleMarkerClick} // 使用新的处理器
        />
      </div>

      <ClientOnly>
        <>
          <FilterButton onClick={handleFilterButtonClick} />{" "}
          {/* 使用新的处理器 */}
          {/* ... 加载和错误提示 ... */}
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
          />
        </>
      </ClientOnly>
    </div>
  );
}
