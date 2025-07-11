// src/components/DetailsPanel.tsx

/**
 * @file DetailsPanel.tsx
 * @description 这是一个用于展示单个厕所详细信息的面板组件。
 * 它具备响应式布局能力：在移动端作为底部滑出面板，在桌面端作为左侧固定面板。
 * 同时，它能安全地处理仅在客户端可用的数据（如距离、相对时间），以避免 Next.js 的 hydration 错误。
 */

"use client"; // 声明为客户端组件，因为它包含状态和事件处理

// 引入依赖
import { Toilet } from "@/data/mock-toilets";
import { getDistanceInKm, formatDistance } from "@/utils/distance";
import { openAmapNavigation } from "@/utils/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // 导入 dayjs 插件用于计算相对时间
import "dayjs/locale/zh-cn"; // 导入中文语言包
import { useState, useEffect } from "react";

// 配置 dayjs 使用插件和中文
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// --- 图标辅助组件 ---
const IconClock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2 text-gray-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconRuler = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2 text-gray-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12l2.25-2.25m0 0l2.25 2.25M6.75 12l2.25 2.25m-2.25-2.25L4.5 9.75M12 4.5l-2.25 2.25m2.25-2.25l2.25 2.25M12 19.5l-2.25-2.25m2.25-2.25l2.25 2.25m-10.5-2.25L4.5 12m2.25-2.25l-2.25 2.25"
    />
  </svg>
);
const IconLocation = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2 text-gray-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);
const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// 定义组件接收的属性（Props）类型
interface DetailsPanelProps {
  toilet: (Toilet & { updatedAt?: string }) | null; // 选中的厕所对象，可能为 null
  userLocation: [number, number] | null; // 用户当前位置，可能为 null
  onClose: () => void; // 关闭面板的回调函数
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  toilet,
  userLocation,
  onClose,
}) => {
  // --- 状态管理 ---
  // 使用 state 存储仅在客户端计算的数据，初始值为 null
  // 这是避免 hydration 错误的关键
  const [clientDistance, setClientDistance] = useState<string | null>(null);
  const [clientUpdatedAt, setClientUpdatedAt] = useState<string | null>(null);

  // ---副作用钩子---
  // 使用 useEffect 在客户端进行计算，确保服务端与客户端首次渲染内容一致
  useEffect(() => {
    // 计算距离
    if (userLocation && toilet) {
      const distInKm = getDistanceInKm(
        userLocation[0],
        userLocation[1],
        toilet.location.coordinates[1],
        toilet.location.coordinates[0]
      );
      setClientDistance(formatDistance(distInKm)); // 计算后格式化，并更新 state
    } else {
      setClientDistance(null); // 如果缺少信息，则重置 state
    }
    // 计算相对更新时间
    if (toilet?.updatedAt) {
      setClientUpdatedAt(dayjs(toilet.updatedAt).fromNow()); // 更新 state
    } else {
      setClientUpdatedAt(null); // 重置 state
    }
  }, [userLocation, toilet]); // 依赖项：当用户位置或选中的厕所变化时，重新运行此 Effect

  // --- 事件处理器 ---
  // 导航按钮的点击事件，调用通用的导航函数
  const handleNavigate = () => {
    openAmapNavigation(userLocation, toilet);
  };

  // --- 样式定义 ---
  // 使用 CSS 类控制面板的响应式布局和显示/隐藏动画
  const panelClasses = `
    /* 基础样式：fixed 定位, z-30 确保它在按钮(z-20)和地图(z-10)之上 */
    fixed bg-[#1E1E1E]
    transform transition-transform duration-500 ease-in-out
    z-30 

    /* 移动端样式 (默认): 表现为底部滑出面板 */
    bottom-0 left-0 right-0
    rounded-t-2xl border-t border-gray-700
    ${toilet ? "translate-y-0" : "translate-y-full"}

    /* 桌面端样式 (md:): 表现为左侧固定面板 */
    md:top-0 md:left-0 md:bottom-auto md:right-auto
    md:h-screen md:w-96 
    md:rounded-none md:border-t-0 md:border-r
    ${toilet ? "md:translate-x-0" : "md:-translate-x-full"}
  `;

  // --- 渲染 ---
  return (
    <div className={panelClasses}>
      {/* 仅在 toilet 对象存在时才渲染面板内容，以提高性能 */}
      {toilet && (
        <div className="flex flex-col gap-4 h-full p-6 text-white overflow-y-auto">
          {/* 1. 头部区域：名称、地址和关闭按钮 */}
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold">{toilet.name}</h2>
              <p className="text-gray-400 mt-2">{toilet.address}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-700 flex-shrink-0"
            >
              {" "}
              <CloseIcon />{" "}
            </button>
          </div>

          {/* 2. 分割线 */}
          <div className="border-t border-gray-700 my-2"></div>

          {/* 3. 核心信息区：距离、时间、坐标 */}
          <div className="space-y-3 text-sm">
            {/* 条件渲染距离：计算完成前显示占位符，避免 hydration 错误 */}
            {clientDistance ? (
              <div className="flex items-center">
                <IconRuler /> 距离您 {clientDistance}
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <IconRuler /> 正在计算距离...
              </div>
            )}
            {/* 如果有开放时间信息，则显示 */}
            {toilet.openingHours && (
              <div className="flex items-center">
                <IconClock /> {toilet.openingHours}
              </div>
            )}
            {/* 显示经纬度坐标，保留5位小数 */}
            <div className="flex items-center">
              <IconLocation /> {toilet.location.coordinates[1].toFixed(5)},{" "}
              {toilet.location.coordinates[0].toFixed(5)}
            </div>
          </div>

          {/* 4. 属性标签区 */}
          <div className="flex flex-wrap gap-2 mt-2">
            {toilet.properties.isOpen24h && (
              <span className="bg-green-800 text-green-300 text-xs font-medium px-2.5 py-1 rounded">
                24小时开放
              </span>
            )}
            {toilet.properties.isAccessible && (
              <span className="bg-blue-800 text-blue-300 text-xs font-medium px-2.5 py-1 rounded">
                无障碍设施
              </span>
            )}
            {toilet.properties.hasBabyCare && (
              <span className="bg-purple-800 text-purple-300 text-xs font-medium px-2.5 py-1 rounded">
                母婴室
              </span>
            )}
          </div>

          {/* 5. 伸缩空间，将导航按钮和更新时间推到底部 */}
          <div className="flex-grow"></div>

          {/* 6. 底部操作区 */}
          <div className="flex-shrink-0">
            <button
              onClick={handleNavigate}
              className="w-full mt-4 p-4 bg-[#CEFF00] text-black text-lg font-bold rounded-lg hover:opacity-90"
            >
              开始导航
            </button>
            {/* 条件渲染更新时间，计算完成前显示占位符 */}
            {toilet.updatedAt &&
              (clientUpdatedAt ? (
                <p className="text-center text-xs text-gray-500 mt-2">
                  信息更新于 {clientUpdatedAt}
                </p>
              ) : (
                <p className="text-center text-xs text-gray-500 mt-2">
                  信息更新于 [加载中...]
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
