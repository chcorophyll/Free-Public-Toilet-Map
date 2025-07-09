// src/components/DetailsPanel.tsx
"use client";

// ... (所有 import 和图标组件保持不变) ...
import { Toilet } from "@/data/mock-toilets";
import { getDistanceInKm, formatDistance } from "@/utils/distance";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { useState, useEffect } from "react";
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");
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
interface DetailsPanelProps {
  toilet: (Toilet & { updatedAt?: string }) | null;
  userLocation: [number, number] | null;
  onClose: () => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  toilet,
  userLocation,
  onClose,
}) => {
  const [clientDistance, setClientDistance] = useState<string | null>(null);
  const [clientUpdatedAt, setClientUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation && toilet) {
      const distInKm = getDistanceInKm(
        userLocation[0],
        userLocation[1],
        toilet.location.coordinates[1],
        toilet.location.coordinates[0]
      );
      setClientDistance(formatDistance(distInKm));
    } else {
      setClientDistance(null);
    }
    if (toilet?.updatedAt) {
      setClientUpdatedAt(dayjs(toilet.updatedAt).fromNow());
    } else {
      setClientUpdatedAt(null);
    }
  }, [userLocation, toilet]);

  const handleNavigate = () => {
    /* ... */
  };

  // 【核心修复】恢复了自我定位的样式逻辑
  const panelClasses = `
    fixed bg-[#1E1E1E] transform transition-transform duration-500 ease-in-out z-30 
    bottom-0 left-0 right-0 p-6 rounded-t-2xl border-t border-gray-700
    ${toilet ? "translate-y-0" : "translate-y-full"}
    md:top-0 md:left-0 md:bottom-auto md:right-auto md:h-screen md:w-96 
    md:rounded-none md:border-t-0 md:border-r
    ${toilet ? "md:translate-x-0" : "md:-translate-x-full"}
  `;

  return (
    <div className={panelClasses}>
      {toilet && (
        <div className="flex flex-col gap-4 h-full p-6 text-white overflow-y-auto">
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
          <div className="border-t border-gray-700 my-2"></div>
          {/* 【修改】确保所有信息都按要求显示 */}
          <div className="space-y-3 text-sm">
            {clientDistance && (
              <div className="flex items-center">
                <IconRuler /> 距离您 {clientDistance}
              </div>
            )}
            {toilet.openingHours && (
              <div className="flex items-center">
                <IconClock /> {toilet.openingHours}
              </div>
            )}
            <div className="flex items-center">
              <IconLocation /> {toilet.location.coordinates[1].toFixed(5)},{" "}
              {toilet.location.coordinates[0].toFixed(5)}
            </div>
          </div>
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
          <div className="flex-grow"></div>
          <div className="flex-shrink-0">
            <button
              onClick={handleNavigate}
              className="w-full mt-4 p-4 bg-[#CEFF00] text-black text-lg font-bold rounded-lg hover:opacity-90"
            >
              开始导航
            </button>
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
