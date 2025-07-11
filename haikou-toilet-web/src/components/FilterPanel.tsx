// src/components/FilterPanel.tsx

/**
 * @file FilterPanel.tsx
 * @description 这是一个多功能筛选面板。
 * 用户可以在此设置筛选条件（如24小时、无障碍），这些条件会立即触发数据重新请求。
 * 同时，面板会实时显示根据筛选结果按距离排序的厕所列表。
 * 如果没有筛选条件，则默认显示最近的10个。
 * 列表项支持点击地图联动和调用导航。
 */

"use client"; // 声明为客户端组件，因为它包含大量状态和交互

import { useMemo } from "react";
import { Toilet } from "@/data/mock-toilets";
import { getDistanceInKm, formatDistance } from "@/utils/distance";
import { openAmapNavigation } from "@/utils/navigation";

// --- 类型定义 ---
type Filters = {
  isOpen24h: boolean;
  isAccessible: boolean;
};

// 定义组件接收的 Props 类型
interface FilterPanelProps {
  isOpen: boolean; // 面板是否打开
  filters: Filters; // 当前的筛选条件对象
  toilets: Toilet[]; // 从父组件传入的厕所数据列表
  isLoading: boolean; // 是否正在加载数据
  userLocation: [number, number] | null; // 用户当前位置
  onFilterChange: (newFilters: Filters) => void; // 筛选条件变化时的回调
  onClose: () => void; // 关闭面板的回调
  onItemClick: (coords: [number, number]) => void; // 列表项被点击时的回调
}

// --- 图标辅助组件 ---
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
const FilterTag = ({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const baseClasses =
    "px-6 py-2 rounded-lg text-sm font-semibold transition-colors";
  const selectedClasses = "bg-[#CEFF00] text-black";
  const unselectedClasses = "bg-gray-700 text-white hover:bg-gray-600";
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${
        isSelected ? selectedClasses : unselectedClasses
      }`}
    >
      {label}
    </button>
  );
};
const NavigateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    {" "}
    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A3.75 3.75 0 005.565 10h8.87a3.75 3.75 0 002.872-1.836l1.414-4.925a.75.75 0 00-.826-.95A48.667 48.667 0 0010 1.5a48.667 48.667 0 00-6.895.789z" />{" "}
    <path d="M2.25 10.043a3.75 3.75 0 002.872 1.836h8.87a3.75 3.75 0 002.872-1.836l.003-.005a.75.75 0 00-.826-.95l-1.414-4.925a.75.75 0 00-.95.826l.823 2.881a2.25 2.25 0 01-1.722 1.085H5.565a2.25 2.25 0 01-1.722-1.085l.823-2.881a.75.75 0 00-.95-.826L2.25 10.038a.75.75 0 000 .005z" />{" "}
  </svg>
);

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  filters,
  toilets,
  isLoading,
  userLocation,
  onFilterChange,
  onClose,
  onItemClick,
}) => {
  // --- 事件处理器 ---
  // 点击筛选标签时，立即调用父组件传递的 onFilterChange (即 setFilters)
  // 这会触发父组件的 SWR 重新请求数据
  const handleToggleFilter = (filterKey: keyof Filters) => {
    onFilterChange({
      ...filters,
      [filterKey]: !filters[filterKey], // 切换布尔值
    });
  };

  // 点击列表项中的导航按钮
  const handleNavigateClick = (e: React.MouseEvent, toilet: Toilet) => {
    e.stopPropagation(); // 阻止事件冒泡到父级 li，避免触发 onItemClick
    openAmapNavigation(userLocation, toilet);
  };

  // --- 派生状态与计算 ---
  // 使用 useMemo 对列表进行排序和裁剪，避免在每次渲染时都进行昂贵的计算
  const displayList = useMemo(() => {
    // 依赖的数据不全时，返回空列表
    if (!toilets || !userLocation) return [];

    // 1. 为每个厕所计算出以公里为单位的精确距离（数字类型）
    const toiletsWithDistance = toilets.map((toilet) => ({
      ...toilet,
      distanceInKm: getDistanceInKm(
        userLocation[0],
        userLocation[1],
        toilet.location.coordinates[1],
        toilet.location.coordinates[0]
      ),
    }));

    // 2. 根据数字类型的距离进行升序排序（从近到远）
    const sortedToilets = toiletsWithDistance.sort(
      (a, b) => a.distanceInKm - b.distanceInKm
    );

    // 3. 检查是否应用了任何筛选条件
    const noFiltersApplied = !filters.isOpen24h && !filters.isAccessible;

    // 4. 如果没有任何筛选条件，则只返回最近的 10 个
    if (noFiltersApplied) {
      return sortedToilets.slice(0, 10);
    }

    // 5. 如果有筛选条件，则返回所有符合条件的结果（后端已处理筛选，前端只需排序）
    return sortedToilets;
  }, [toilets, userLocation, filters]); // 依赖项：当这些数据变化时，重新计算列表

  // --- 样式定义 ---
  const panelClasses = `
    fixed bottom-0 left-0 right-0 p-6 bg-[#1E1E1E] text-white
    transform transition-transform duration-500 ease-in-out
    rounded-t-2xl border-t border-gray-700 z-40
    ${isOpen ? "translate-y-0" : "translate-y-full"}
  `;

  // --- 渲染 ---
  return (
    <div className={panelClasses}>
      <div className="flex flex-col gap-6 h-full">
        {/* 1. 头部区域 */}
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 className="text-3xl font-bold">筛选</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            <CloseIcon />
          </button>
        </div>
        {/* 2. 筛选标签区域 */}
        <div className="flex flex-wrap gap-4 flex-shrink-0">
          <FilterTag
            label="24小时开放"
            isSelected={filters.isOpen24h}
            onClick={() => handleToggleFilter("isOpen24h")}
          />
          <FilterTag
            label="无障碍设施"
            isSelected={filters.isAccessible}
            onClick={() => handleToggleFilter("isAccessible")}
          />
        </div>
        <div className="border-t border-gray-700 my-2 flex-shrink-0"></div>

        {/* 3. 结果列表区域 */}
        <div className="flex-grow overflow-y-auto">
          {/* 根据不同状态显示不同提示 */}
          {!userLocation ? (
            <p className="text-center text-yellow-400">
              请允许获取位置信息以查看附近列表。
            </p>
          ) : isLoading ? (
            <p className="text-center text-gray-400">正在查找...</p>
          ) : displayList.length === 0 ? (
            <p className="text-center text-gray-400">
              附近没有找到符合条件的公共厕所。
            </p>
          ) : (
            <ul className="space-y-4">
              {displayList.map((toilet) => (
                <li
                  key={toilet._id}
                  className="border-b border-gray-800 pb-3 flex justify-between items-center cursor-pointer hover:bg-gray-800 p-2 rounded-md"
                  onClick={() =>
                    onItemClick([
                      toilet.location.coordinates[1],
                      toilet.location.coordinates[0],
                    ])
                  }
                >
                  <div>
                    <p className="font-semibold text-white">{toilet.name}</p>
                    <p className="text-sm text-gray-400">{toilet.address}</p>
                    {/* 在显示时才将距离数字格式化为字符串 */}
                    <p className="text-sm text-green-400 font-bold mt-1">
                      {formatDistance(toilet.distanceInKm)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleNavigateClick(e, toilet)}
                    className="p-3 rounded-full bg-sky-500 text-white hover:bg-sky-400 flex-shrink-0 ml-4"
                    aria-label={`导航至${toilet.name}`}
                  >
                    <NavigateIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 4. 底部关闭按钮 */}
        <div className="flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full mt-4 p-4 bg-white text-black text-lg font-bold rounded-lg hover:opacity-90"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
