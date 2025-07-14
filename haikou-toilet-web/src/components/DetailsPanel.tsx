// src/components/DetailsPanel.tsx
'use client';

import { Toilet } from "@/data/mock-toilets";
import { getDistanceInKm, formatDistance } from "@/utils/distance";
import { openAmapNavigation } from '@/utils/navigation';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/zh-cn';
import { useState, useEffect } from "react";

// 配置 dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// --- 图标辅助组件 (新增/修改) ---
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconRuler = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const IconUpdate = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" /></svg>;
const IconLocation = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const Icon24h = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconAccessible = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 1.5a1.5 1.5 0 01.994 2.753l-1.99 1.99A5.002 5.002 0 0112 11a5 5 0 01-5-5c0-1.42.57-2.71 1.5-3.667l-1.99-1.99A1.5 1.5 0 015.244.507L12 1.5zm6.89 7.426l-1.41 1.41a3 3 0 01-4.24 0l-1.41-1.41a3 3 0 010-4.24l1.41-1.41a3 3 0 014.24 0l1.41 1.41a3 3 0 010 4.24zM12 13.5a1.5 1.5 0 011.5 1.5v5.25a1.5 1.5 0 01-3 0V15a1.5 1.5 0 011.5-1.5z" /></svg>;
const IconBaby = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

interface DetailsPanelProps { toilet: (Toilet & { updatedAt?: string }) | null; userLocation: [number, number] | null; onClose: () => void; }

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ toilet, userLocation, onClose }) => {
  const [clientDistance, setClientDistance] = useState<string | null>(null);
  const [clientUpdatedAt, setClientUpdatedAt] = useState<string | null>(null);
  const [copyText, setCopyText] = useState('复制');

  useEffect(() => {
    if (userLocation && toilet) {
      const distInKm = getDistanceInKm(userLocation[0], userLocation[1], toilet.location.coordinates[1], toilet.location.coordinates[0]);
      setClientDistance(formatDistance(distInKm));
    } else { setClientDistance(null); }
    if (toilet?.updatedAt) { setClientUpdatedAt(dayjs(toilet.updatedAt).fromNow()); } else { setClientUpdatedAt(null); }
    // 当厕所切换时，重置复制按钮的文本
    setCopyText('复制');
  }, [userLocation, toilet]);

  const handleNavigate = () => { openAmapNavigation(userLocation, toilet); };

  // 新增：处理坐标复制
  const handleCopyCoords = () => {
    if (!toilet) return;
    const coordsString = `${toilet.location.coordinates[1].toFixed(5)}, ${toilet.location.coordinates[0].toFixed(5)}`;
    navigator.clipboard.writeText(coordsString).then(() => {
      setCopyText('已复制!');
      setTimeout(() => setCopyText('复制'), 2000); // 2秒后恢复
    }).catch(err => {
      console.error('复制失败: ', err);
      setCopyText('复制失败');
      setTimeout(() => setCopyText('复制'), 2000);
    });
  };
  
  // 响应式布局和动画的 CSS 类
  const panelClasses = `fixed bg-[#1E1E1E] transform transition-transform duration-500 ease-in-out z-30 ${toilet ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:-translate-x-full'} bottom-0 left-0 right-0 rounded-t-2xl border-t border-gray-700 md:top-0 md:h-screen md:w-96 md:rounded-none md:border-t-0 md:border-r`;

  // --- 渲染 ---
  return (
    <div className={panelClasses}>
      {toilet && (
        <div className="flex flex-col h-full text-white">
          {/* --- 1. 固定头部 --- */}
          <div className="flex-shrink-0 p-6 flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold">{toilet.name}</h2>
            </div>
            <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-gray-700"> <CloseIcon /> </button>
          </div>
          
          {/* --- 2. 可滚动内容区 --- */}
          <div className="flex-grow overflow-y-auto px-6 pb-6">
            <div className="flex flex-col gap-6">

              {/* --- 核心指标区 --- */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <IconRuler />
                  <p className="mt-1 text-lg font-bold">{clientDistance || '--'}</p>
                  <p className="text-xs text-gray-400">距离您</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <IconClock />
                  <p className="mt-1 text-lg font-bold">{toilet.openingHours || '未知'}</p>
                  <p className="text-xs text-gray-400">开放时间</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <IconUpdate />
                  <p className="mt-1 text-lg font-bold">{clientUpdatedAt || '暂无'}</p>
                  <p className="text-xs text-gray-400">信息更新</p>
                </div>
              </div>

              {/* --- 设施与服务区 --- */}
              <div>
                <h3 className="font-bold mb-3 text-gray-300">设施与服务</h3>
                <div className="space-y-3 text-sm">
                  {toilet.properties.isOpen24h && <div className="flex items-center"><Icon24h />24小时开放</div>}
                  {toilet.properties.isAccessible && <div className="flex items-center"><IconAccessible />提供无障碍设施</div>}
                  {toilet.properties.hasBabyCare && <div className="flex items-center"><IconBaby />提供母婴室</div>}
                </div>
              </div>

              {/* --- 位置信息区 --- */}
              <div>
                <h3 className="font-bold mb-3 text-gray-300">位置信息</h3>
                <div className="p-4 bg-gray-800 rounded-lg space-y-3">
                    <div className="flex items-start">
                        <IconLocation />
                        <p className="flex-1 text-sm">{toilet.address}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-gray-400">{`${toilet.location.coordinates[1].toFixed(5)}, ${toilet.location.coordinates[0].toFixed(5)}`}</p>
                        <button onClick={handleCopyCoords} className="flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded">
                            <IconCopy /> {copyText}
                        </button>
                    </div>
                </div>
              </div>

            </div>
          </div>

          {/* --- 3. 固定底部操作按钮 --- */}
          <div className="flex-shrink-0 p-6 border-t border-gray-800">
            <button onClick={handleNavigate} className="w-full p-4 bg-[#CEFF00] text-black text-lg font-bold rounded-lg hover:opacity-90">
              开始导航
            </button>
          </div>
        </div>
      )}
    </div>
  );
};