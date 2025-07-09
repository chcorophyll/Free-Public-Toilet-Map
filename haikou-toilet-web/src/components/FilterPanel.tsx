// src/components/FilterPanel.tsx
"use client";

import { useMemo } from "react";
import { Toilet } from "@/data/mock-toilets";
import { getDistanceInKm, formatDistance } from "@/utils/distance";

type Filters = { isOpen24h: boolean; isAccessible: boolean };
interface FilterPanelProps {
  isOpen: boolean;
  filters: Filters;
  toilets: Toilet[];
  isLoading: boolean;
  userLocation: [number, number] | null;
  onFilterChange: (newFilters: Filters) => void;
  onClose: () => void;
}

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

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  filters,
  toilets,
  isLoading,
  userLocation,
  onFilterChange,
  onClose,
}) => {
  // 点击筛选标签时，立即调用父组件传递的 onFilterChange (即 setFilters)
  // 这会触发父组件的 SWR 重新请求数据
  const handleToggleFilter = (filterKey: keyof Filters) => {
    onFilterChange({
      ...filters,
      [filterKey]: !filters[filterKey],
    });
  };

  // 【核心逻辑】使用 useMemo 来计算并排序厕所列表
  const displayList = useMemo(() => {
    if (!toilets || !userLocation) return [];

    // 1. 为每个厕所计算出距离
    const toiletsWithDistance = toilets.map((toilet) => ({
      ...toilet,
      distanceInKm: getDistanceInKm(
        userLocation[0],
        userLocation[1],
        toilet.location.coordinates[1],
        toilet.location.coordinates[0]
      ),
    }));

    // 2. 按距离排序
    const sortedToilets = toiletsWithDistance.sort(
      (a, b) => a.distanceInKm - b.distanceInKm
    );

    // 3. 如果没有任何筛选条件，则只显示最近的10个
    const noFiltersApplied = !filters.isOpen24h && !filters.isAccessible;
    if (noFiltersApplied) {
      return sortedToilets.slice(0, 10);
    }

    // 4. 如果有筛选条件，则返回所有符合条件的结果（后端已处理筛选，前端只需排序）
    return sortedToilets;
  }, [toilets, userLocation, filters]); // 依赖项：当这些数据变化时，重新计算列表

  const panelClasses = `fixed bottom-0 left-0 right-0 p-6 bg-[#1E1E1E] text-white transform transition-transform duration-500 ease-in-out rounded-t-2xl border-t border-gray-700 z-40 ${
    isOpen ? "translate-y-0" : "translate-y-full"
  }`;

  return (
    <div className={panelClasses}>
      <div className="flex flex-col gap-6 h-full">
        {/* ... (头部和筛选标签部分保持不变) ... */}
        <div className="flex justify-between items-center flex-shrink-0">
          {" "}
          <h2 className="text-3xl font-bold">筛选</h2>{" "}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            {" "}
            <CloseIcon />{" "}
          </button>{" "}
        </div>
        <div className="flex flex-wrap gap-4 flex-shrink-0">
          {" "}
          <FilterTag
            label="24小时开放"
            isSelected={filters.isOpen24h}
            onClick={() => handleToggleFilter("isOpen24h")}
          />{" "}
          <FilterTag
            label="无障碍设施"
            isSelected={filters.isAccessible}
            onClick={() => handleToggleFilter("isAccessible")}
          />{" "}
        </div>
        <div className="border-t border-gray-700 my-2 flex-shrink-0"></div>

        <div className="flex-grow overflow-y-auto">
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
                <li key={toilet._id} className="border-b border-gray-800 pb-3">
                  <p className="font-semibold text-white">{toilet.name}</p>
                  <p className="text-sm text-gray-400">{toilet.address}</p>
                  <p className="text-sm text-green-400 font-bold mt-1">
                    {formatDistance(toilet.distanceInKm)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-shrink-0">
          {" "}
          <button
            onClick={onClose}
            className="w-full mt-4 p-4 bg-white text-black text-lg font-bold rounded-lg hover:opacity-90"
          >
            {" "}
            关闭{" "}
          </button>{" "}
        </div>
      </div>
    </div>
  );
};
