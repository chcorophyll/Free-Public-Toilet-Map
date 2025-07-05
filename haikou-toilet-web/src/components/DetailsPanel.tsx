// src/components/DetailsPanel.tsx
'use client';

import { Toilet } from "@/data/mock-toilets";
import { calculateDistance } from "@/utils/distance";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/zh-cn';
import { useState, useEffect } from "react"; // 导入 useState 和 useEffect

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 图标组件
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconRuler = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12l2.25-2.25m0 0l2.25 2.25M6.75 12l2.25 2.25m-2.25-2.25L4.5 9.75M12 4.5l-2.25 2.25m2.25-2.25l2.25 2.25M12 19.5l-2.25-2.25m2.25-2.25l2.25 2.25m-10.5-2.25L4.5 12m2.25-2.25l-2.25 2.25" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


interface DetailsPanelProps {
  toilet: (Toilet & { updatedAt?: string }) | null;
  userLocation: [number, number] | null;
  onClose: () => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ toilet, userLocation, onClose }) => {
  // **【核心修改】**：新增两个状态来存储仅在客户端计算的数据。
  // 它们在服务器端渲染时为 null，确保一致性。
  const [clientDistance, setClientDistance] = useState<string | null>(null);
  const [clientUpdatedAt, setClientUpdatedAt] = useState<string | null>(null);

  // **【核心修改】**：使用 useEffect 在客户端挂载后计算距离和更新时间。
  // 这个 useEffect 仅在客户端运行，并且会在 `userLocation` 或 `toilet` 变化时重新计算。
  useEffect(() => {
    // 只有当 userLocation 和 toilet 都存在时才计算距离
    if (userLocation && toilet) {
      const dist = calculateDistance(userLocation[0], userLocation[1], toilet.location.coordinates[1], toilet.location.coordinates[0]);
      setClientDistance(dist);
    } else {
      // 如果 userLocation 或 toilet 不存在，则重置距离
      setClientDistance(null);
    }

    // 只有当 toilet.updatedAt 存在时才计算相对时间
    if (toilet?.updatedAt) {
      setClientUpdatedAt(dayjs(toilet.updatedAt).fromNow());
    } else {
      // 如果 toilet 或 updatedAt 不存在，则重置更新时间
      setClientUpdatedAt(null);
    }
  }, [userLocation, toilet]); // 依赖项：当 userLocation 或 toilet 变化时重新运行

  const panelClasses = `
    /* 基础样式 (移动端优先): 底部面板 */
    fixed bottom-0 left-0 right-0 p-6 bg-[#1E1E1E] text-white
    transform transition-transform duration-500 ease-in-out
    rounded-t-2xl border-t border-gray-700
    z-30

    /* 桌面端样式 (屏幕宽度 > 768px): 左侧面板 */
    md:top-0 md:left-0 md:bottom-auto md:right-auto
    md:h-screen md:w-96 /* 设置固定宽度和全屏高度 */
    md:rounded-t-none md:rounded-r-2xl /* 修改圆角位置 */
    md:border-t-0 md:border-r /* 修改边框位置 */

    /* 根据状态控制面板的显示/隐藏 */
    ${toilet
        ? 'translate-y-0 md:-translate-x-0' /* 显示时: Y轴和X轴都在原位 */
        : 'translate-y-full md:translate-y-0 md:-translate-x-full' /* 隐藏时: 移动端Y轴移出，桌面端X轴移出 */
    }
  `;

  const handleNavigate = () => {
    if (toilet) {
      const destination = `${toilet.location.coordinates[1]},${toilet.location.coordinates[0]}`;
      // 尝试在苹果地图中打开
      window.open(`maps://?q=${destination}`, '_system');
      // 备用：在浏览器地图中打开 (例如Google Maps)
      setTimeout(() => {
        if (!document.hidden) { // 检查页面是否仍然可见（即未跳转到外部应用）
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
        }
      }, 500); // 短暂延迟，以防自动跳转
    }
  };

  return (
    <div className={panelClasses}>
      {toilet && (
        <div className="flex flex-col gap-4 h-full">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold">{toilet.name}</h2>
                <p className="text-gray-400 mt-2">{toilet.address}</p>
            </div>
            <button onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-700 flex-shrink-0">
              <CloseIcon />
            </button>
          </div>

          <div className="border-t border-gray-700 my-2"></div>

          <div className="space-y-3">
              {/* **【核心修改】**：根据 clientDistance 状态来渲染距离信息。
                  在服务器渲染和客户端首次 Hydration 时，clientDistance 为 null，显示占位符。
                  在客户端计算完成后，clientDistance 会被更新，显示实际距离。
              */}
              {clientDistance ? (
                <div className="flex items-center"><IconRuler /> 距离您 {clientDistance}</div>
              ) : (
                <div className="flex items-center text-gray-500"><IconRuler /> 正在计算距离...</div>
              )}
              {toilet.openingHours && <div className="flex items-center"><IconClock /> {toilet.openingHours}</div>}
          </div>

          <div className="flex gap-4 mt-2">
            {toilet.properties.isOpen24h && <span className="bg-green-800 text-green-300 text-xs font-medium px-2.5 py-1 rounded">24小时开放</span>}
            {toilet.properties.isAccessible && <span className="bg-blue-800 text-blue-300 text-xs font-medium px-2.5 py-1 rounded">无障碍</span>}
          </div>

          {/* 使用 flex-grow 将导航按钮和更新时间推到底部 */}
          <div className="flex-grow"></div>

          <div className="flex-shrink-0">
            <button onClick={handleNavigate} className="w-full mt-4 p-4 bg-[#CEFF00] text-black text-lg font-bold rounded-lg hover:opacity-90">
              开始导航
            </button>
            {/* **【核心修改】**：根据 clientUpdatedAt 状态来渲染更新时间。
                在服务器渲染和客户端首次 Hydration 时，clientUpdatedAt 为 null，显示占位符。
                在客户端计算完成后，clientUpdatedAt 会被更新，显示实际的相对时间。
            */}
            {toilet.updatedAt && (
              clientUpdatedAt ? (
                <p className="text-center text-xs text-gray-500 mt-2">信息更新于 {clientUpdatedAt}</p>
              ) : (
                <p className="text-center text-xs text-gray-500 mt-2">信息更新于 [加载中...]</p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};