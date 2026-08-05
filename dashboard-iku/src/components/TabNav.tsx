import { LayoutDashboard, FileText, FileSignature } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'laporan' | 'perjanjian';

const TABS: Array<{ key: ActiveTab; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'dashboard', label: 'RENJA', icon: LayoutDashboard },
  { key: 'laporan', label: 'Laporan IKU', icon: FileText },
  { key: 'perjanjian', label: 'Perjanjian Kinerja', icon: FileSignature },
];

export function TabNav({ active, onChange }: { active: ActiveTab; onChange: (tab: ActiveTab) => void }) {
  return (
    <nav className="inline-flex gap-1.5">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#0f2358] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-200' : 'text-gray-400'}`} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
