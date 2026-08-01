import { LayoutDashboard, FileText } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'laporan';

const TABS: Array<{ key: ActiveTab; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'laporan', label: 'Laporan IKU', icon: FileText },
];

export function TabNav({ active, onChange }: { active: ActiveTab; onChange: (tab: ActiveTab) => void }) {
  return (
    <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="inline-flex bg-white rounded-xl shadow-lg p-1 gap-1 border border-gray-100">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#0f2358] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
