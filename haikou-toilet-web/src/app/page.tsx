// src/app/page.tsx
'use client'; // 因为我们将使用 hooks 和动态导入，整个页面也设为客户端组件

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { mockToilets } from '@/data/mock-toilets'; // 导入我们的模拟数据

export default function Home() {
  // 使用 next/dynamic 动态导入地图组件，并禁用服务端渲染 (ssr: false)
  const Map = useMemo(() => dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <p className="flex h-full w-full items-center justify-center">Loading map...</p> 
  }), []);

  // 在这里，我们直接使用模拟数据。
  // 未来，我们会用一个数据请求 hook (如 SWR) 来替换这里
  const toilets = mockToilets;

  return (
    <main className="h-screen w-screen bg-[#111111]">
      {/* 在这里可以添加UI覆盖层，例如顶部的搜索栏 */}
      <div className="h-full w-full">
        <Map toilets={toilets} />
      </div>
      {/* 在这里可以添加UI覆盖层，例如底部的面板 */}
    </main>
  );
}