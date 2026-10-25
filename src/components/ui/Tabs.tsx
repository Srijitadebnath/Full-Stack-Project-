import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 border-b border-slate-200/80 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
