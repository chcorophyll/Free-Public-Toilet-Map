// src/app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Toilet } from '@/data/mock-toilets'; // 我们仍然复用这个类型定义

// 定义一个 fetcher 函数，SWR 会用它来请求数据
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  // 使用 React State 来存储用户的地理位置
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // 在组件加载时，请求用户的地理位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("获取地理位置失败:", error);
          // 如果用户拒绝或获取失败，给一个默认位置（海口）
          setUserLocation([20.04, 110.32]);
        }
      );
    }
  }, []); // 空依赖数组表示这个 effect 只在组件挂载时运行一次

  // 根据用户位置动态构建 API URL
  const apiUrl = userLocation
    ? `${process.env.NEXT_PUBLIC_API_URL}/toilets?latitude=${userLocation[0]}&longitude=${userLocation[1]}`
    : null;

  // 使用 SWR hook 来获取数据
  // 如果 apiUrl 为 null，SWR 将不会发起请求
  const { data: toilets, error, isLoading } = useSWR<Toilet[]>(apiUrl, fetcher);

  // 动态导入地图组件
  const Map = useMemo(() => dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <p className="flex h-full w-full items-center justify-center text-white">地图加载中...</p> 
  }), []);
  
  // 决定地图的中心点
  const mapCenter: [number, number] = userLocation || [20.04, 110.32];

  return (
    <main className="h-screen w-screen bg-[#111111]">
      <div className="h-full w-full">
        {isLoading && <p className="flex h-full w-full items-center justify-center text-white">正在寻找附近的厕所...</p>}
        {error && <p className="flex h-full w-full items-center justify-center text-red-500">数据加载失败，请刷新重试。</p>}
        {/* 当数据加载成功后，渲染地图 */}
        {toilets && <Map toilets={toilets} center={mapCenter} />}
        {/* 如果没有位置信息，显示提示 */}
        {!userLocation && !isLoading && <p className="flex h-full w-full items-center justify-center text-white">正在获取您的位置...</p>}
      </div>
    </main>
  );
}