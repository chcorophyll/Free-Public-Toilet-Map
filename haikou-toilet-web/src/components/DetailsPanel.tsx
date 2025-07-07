// src/components/DetailsPanel.tsx
'use client'; // 声明为客户端组件

import { Toilet } from "@/data/mock-toilets";
import { calculateDistance } from "@/utils/distance";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/zh-cn';
import { useState, useEffect } from "react";

// 配置 dayjs 使用相对时间插件和中文语言包
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 图标辅助组件
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconRuler = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12l2.25-2.25m0 0l2.25 2.25M6.75 12l2.25 2.25m-2.25-2.25L4.5 9.75M12 4.5l-2.25 2.25m2.25-2.25l2.25 2.25M12 19.5l-2.25-2.25m2.25-2.25l2.25 2.25m-10.5-2.25L4.5 12m2.25-2.25l-2.25 2.25" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

// 定义组件的 Props 类型
interface DetailsPanelProps {
  toilet: (Toilet & { updatedAt?: string }) | null;
  userLocation: [number, number] | null;
  onClose: () => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ toilet, userLocation, onClose }) => {
  // 【核心修复】使用 state 存储仅在客户端计算的数据，避免 hydration 错误
  const [clientDistance, setClientDistance] = useState<string | null>(null);
  const [clientUpdatedAt, setClientUpdatedAt] = useState<string | null>(null);

  // 【核心修复】使用 useEffect 在客户端进行计算，确保服务端与客户端首次渲染内容一致
  useEffect(() => {
    // 仅在客户端且依赖项（用户位置和厕所信息）都存在时执行
    if (userLocation && toilet) {
      const dist = calculateDistance(userLocation[0], userLocation[1], toilet.location.coordinates[1], toilet.location.coordinates[0]);
      setClientDistance(dist); // 更新距离状态
    } else {
      setClientDistance(null); // 重置状态
    }

    if (toilet?.updatedAt) {
      setClientUpdatedAt(dayjs(toilet.updatedAt).fromNow()); // 更新相对时间状态
    } else {
      setClientUpdatedAt(null); // 重置状态
    }
  }, [userLocation, toilet]); // 依赖项：当 userLocation 或 toilet 变化时重新运行此 effect

  // 处理点击导航按钮的事件
  const handleNavigate = () => {
    if (!toilet) return;
    const [longitude, latitude] = toilet.location.coordinates;
    const name = encodeURIComponent(toilet.name);
    // 构建高德地图的步行导航链接
    const url = `https://uri.amap.com/navigation?to=${longitude},${latitude},${name}&mode=walk&src=hainan-toilet-map`;
    window.open(url, '_blank');
  };

  // 如果没有选中的 toilet，组件不渲染任何东西
  if (!toilet) {
    return null;
  }

  // 渲染组件UI
  return (
    <div className="h-full w-full bg-[#1E1E1E] text-white overflow-y-auto">
        <div className="flex flex-col gap-4 h-full p-6">
            {/* 面板头部：标题和关闭按钮 */}
            <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold">{toilet.name}</h2>
                    <p className="text-gray-400 mt-2">{toilet.address}</p>
                </div>
                <button onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-700 flex-shrink-0">
                    <CloseIcon />
                </button>
            </div>
            {/* 分割线 */}
            <div className="border-t border-gray-700 my-2"></div>
            {/* 详细信息区域 */}
            <div className="space-y-3">
                {/* 条件渲染距离：计算完成前显示占位符 */}
                {clientDistance ? <div className="flex items-center"><IconRuler /> 距离您 {clientDistance}</div> : <div className="flex items-center text-gray-500"><IconRuler /> 正在计算距离...</div>}
                {/* 如果有开放时间信息，则显示 */}
                {toilet.openingHours && <div className="flex items-center"><IconClock /> {toilet.openingHours}</div>}
            </div>
            {/* 属性标签 */}
            <div className="flex gap-4 mt-2">
                {toilet.properties.isOpen24h && <span className="bg-green-800 text-green-300 text-xs font-medium px-2.5 py-1 rounded">24小时开放</span>}
                {toilet.properties.isAccessible && <span className="bg-blue-800 text-blue-300 text-xs font-medium px-2.5 py-1 rounded">无障碍</span>}
            </div>
            {/* 伸缩空间，将按钮推到底部 */}
            <div className="flex-grow"></div>
            {/* 底部操作区 */}
            <div className="flex-shrink-0">
                <button onClick={handleNavigate} className="w-full mt-4 p-4 bg-[#CEFF00] text-black text-lg font-bold rounded-lg hover:opacity-90">开始导航</button>
                {/* 条件渲染更新时间 */}
                {toilet.updatedAt && (clientUpdatedAt ? <p className="text-center text-xs text-gray-500 mt-2">信息更新于 {clientUpdatedAt}</p> : <p className="text-center text-xs text-gray-500 mt-2">信息更新于 [加载中...]</p>)}
            </div>
        </div>
    </div>
  );
};