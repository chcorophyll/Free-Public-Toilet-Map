// src/components/FilterPanel.tsx
'use client';

import { useMemo } from 'react';
import { Toilet } from '@/data/mock-toilets';
import { getDistanceInKm, formatDistance } from '@/utils/distance';

type Filters = {
  isOpen24h: boolean;
  isAccessible: boolean;
};

interface FilterPanelProps {
  isOpen: boolean;
  filters: Filters;
  toilets: Toilet[];
  isLoading: boolean;
  userLocation: [number, number] | null;
  onFilterChange: (newFilters: Filters) => void;
  onClose: () => void;
  onItemClick: (coords: [number, number]) => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const FilterTag = ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void; }) => {
    const baseClasses = "px-6 py-2 rounded-lg text-sm font-semibold transition-colors";
    const selectedClasses = "bg-[#CEFF00] text-black";
    const unselectedClasses = "bg-gray-700 text-white hover:bg-gray-600";
    return (
        <button onClick={onClick} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
            {label}
        </button>
    );
};

const NavigateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A3.75 3.75 0 005.565 10h8.87a3.75 3.75 0 002.872-1.836l1.414-4.925a.75.75 0 00-.826-.95A48.667 48.667 0 0010 1.5a48.667 48.667 0 00-6.895.789z" />
    <path d="M2.25 10.043a3.75 3.75 0 002.872 1.836h8.87a3.75 3.75 0 002.872-1.836l.003-.005a.75.75 0 00-.826-.95l-1.414-4.925a.75.75 0 00-.95.826l.823 2.881a2.25 2.25 0 01-1.722 1.085H5.565a2.25 2.25 0 01-1.722-1.085l.823-2.881a.75.75 0 00-.95-.826L2.25 10.038a.75.75 0 000 .005z" />
  </svg>
);


// 【核心修复】确保在组件定义前有 `export` 关键字
export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, filters, toilets, isLoading, userLocation, onFilterChange, onClose, onItemClick }) => {
  
  const handleToggleFilter = (filterKey: keyof Filters) => {
    onFilterChange({
      ...filters,
      [filterKey]: !filters[filterKey],
    });
  };
  
  const displayList = useMemo(() => {
    if (!toilets || !userLocation) return [];
    const toiletsWithDistance = toilets.map(toilet => ({
      ...toilet,
      distanceInKm: getDistanceInKm(userLocation[0], userLocation[1], toilet.location.coordinates[1], toilet.location.coordinates[0])
    }));
    const sortedToilets = toiletsWithDistance.sort((a, b) => a.distanceInKm - b.distanceInKm);
    const noFiltersApplied = !filters.isOpen24h && !filters.isAccessible;
    if (noFiltersApplied) {
      return sortedToilets.slice(0, 10);
    }
    return sortedToilets;
  }, [toilets, userLocation, filters]);

  const handleNavigateClick = (e: React.MouseEvent, toilet: Toilet) => {
    e.stopPropagation();
    const [longitude, latitude] = toilet.location.coordinates;
    const name = encodeURIComponent(toilet.name);
    const url = `https://uri.amap.com/navigation?to=${longitude},${latitude},${name}&mode=walk&src=hainan-toilet-map`;
    window.open(url, '_blank');
  };

  const panelClasses = `fixed bottom-0 left-0 right-0 p-6 bg-[#1E1E1E] text-white transform transition-transform duration-500 ease-in-out rounded-t-2xl border-t border-gray-700 z-40 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;

  return (
    <div className={panelClasses}>
       <div className="flex flex-col gap-6 h-full">
          <div className="flex justify-between items-center flex-shrink-0">
            <h2 className="text-3xl font-bold">筛选</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-wrap gap-4 flex-shrink-0">
            <FilterTag 
              label="24小时开放"
              isSelected={filters.isOpen24h}
              onClick={() => handleToggleFilter('isOpen24h')}
            />
            <FilterTag 
              label="无障碍设施"
              isSelected={filters.isAccessible}
              onClick={() => handleToggleFilter('isAccessible')}
            />
          </div>
          <div className="border-t border-gray-700 my-2 flex-shrink-0"></div>
          <div className="flex-grow overflow-y-auto">
            {!userLocation ? (
                <p className="text-center text-yellow-400">请允许获取位置信息以查看附近列表。</p>
            ) : isLoading ? (
                <p className="text-center text-gray-400">正在应用筛选，请稍候...</p>
            ) : displayList.length === 0 ? (
                <p className="text-center text-gray-400">附近没有找到符合条件的公共厕所。</p>
            ) : (
                <ul className="space-y-4">
                  {displayList.map(toilet => (
                    <li 
                      key={toilet._id} 
                      className="border-b border-gray-800 pb-3 flex justify-between items-center cursor-pointer hover:bg-gray-800 p-2 rounded-md"
                      onClick={() => onItemClick([toilet.location.coordinates[1], toilet.location.coordinates[0]])}
                    >
                      <div>
                        <p className="font-semibold text-white">{toilet.name}</p>
                        <p className="text-sm text-gray-400">{toilet.address}</p>
                        <p className="text-sm text-green-400 font-bold mt-1">{formatDistance(toilet.distanceInKm)}</p>
                      </div>
                      <button 
                        onClick={(e) => handleNavigateClick(e, toilet)}
                        className="p-3 rounded-full bg-sky-500 text-white hover:bg-sky-400 flex-shrink-0"
                      >
                        <NavigateIcon />
                      </button>
                    </li>
                  ))}
                </ul>
            )}
          </div>
          <div className="flex-shrink-0">
            <button onClick={onClose} className="w-full mt-4 p-4 bg-white text-black text-lg font-bold rounded-lg hover:opacity-90">
              关闭
            </button>
          </div>
        </div>
    </div>
  );
};