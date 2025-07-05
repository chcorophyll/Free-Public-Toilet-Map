// src/app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Toilet } from '@/data/mock-toilets';
import { DetailsPanel } from '@/components/DetailsPanel'; // 【新增】引入详情面板组件

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null); // 已添加

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("获取地理位置失败:", error);
          setUserLocation([20.04, 110.32]);
        }
      );
    }
  }, []);

  const apiUrl = userLocation
    ? `${process.env.NEXT_PUBLIC_API_URL}/toilets?latitude=${userLocation[0]}&longitude=${userLocation[1]}`
    : null;

  const { data: toilets, error, isLoading } = useSWR<Toilet[]>(apiUrl, fetcher);

  const Map = useMemo(() => dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <p className="flex h-full w-full items-center justify-center text-white">地图加载中...</p> 
  }), []);
  
  const mapCenter: [number, number] = userLocation || [20.04, 110.32];

  return (
    <main className="h-screen w-screen bg-[#111111] relative overflow-hidden">
      <div className="h-full w-full">
        {isLoading && <p className="flex h-full w-full items-center justify-center text-white">正在寻找附近的厕所...</p>}
        {error && <p className="flex h-full w-full items-center justify-center text-red-500">数据加载失败。</p>}
        {toilets && (
            <Map 
                toilets={toilets} 
                center={mapCenter} 
                // 【修改】将设置选中厕所的函数传递给地图组件
                onMarkerClick={(toilet) => {
                  console.log("点击了标记点:", toilet.name); // 添加这句日志
                  setSelectedToilet(toilet);
                }} 
            />
        )}
      </div>

      {/* 【新增】有条件地渲染详情面板 */}
      {/* 【修改】为 DetailsPanel 添加 userLocation prop */}
      <DetailsPanel 
          toilet={selectedToilet} 
          userLocation={userLocation}
          onClose={() => setSelectedToilet(null)} 
      />
    </main>
  );
}