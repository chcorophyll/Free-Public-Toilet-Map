// src/components/FilterPanel.tsx
'use client';

// 定义 Filters 状态的类型
type Filters = {
  isOpen24h: boolean;
  isAccessible: boolean;
};

// 定义组件 Props 的类型
interface FilterPanelProps {
  isOpen: boolean;
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  onClose: () => void;
}

// 关闭图标
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// 可复用的筛选标签按钮组件
const FilterTag = ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void; }) => {
    const baseClasses = "px-6 py-2 rounded-lg text-sm font-semibold transition-colors";
    const selectedClasses = "bg-[#CEFF00] text-black"; // 选中样式
    const unselectedClasses = "bg-gray-700 text-white hover:bg-gray-600"; // 未选中样式

    return (
        <button onClick={onClick} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
            {label}
        </button>
    );
};


export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, filters, onFilterChange, onClose }) => {
  
  // 处理点击筛选标签的事件，切换对应状态
  const handleToggleFilter = (filterKey: keyof Filters) => {
    onFilterChange({
      ...filters,
      [filterKey]: !filters[filterKey],
    });
  };
  
  // 控制面板滑入滑出的CSS类
  const panelClasses = `
    fixed bottom-0 left-0 right-0 p-6 bg-[#1E1E1E] text-white
    transform transition-transform duration-500 ease-in-out
    rounded-t-2xl border-t border-gray-700 z-40
    ${isOpen ? 'translate-y-0' : 'translate-y-full'}
  `;

  return (
    <div className={panelClasses}>
       <div className="flex flex-col gap-6">
          {/* 面板头部 */}
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">筛选</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
              <CloseIcon />
            </button>
          </div>
          {/* 筛选选项 */}
          <div className="flex flex-wrap gap-4">
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
          {/* 查看结果按钮 */}
          <button
            onClick={onClose}
            className="w-full mt-4 p-4 bg-white text-black text-lg font-bold rounded-lg hover:opacity-90"
          >
            查看结果
          </button>
        </div>
    </div>
  );
};