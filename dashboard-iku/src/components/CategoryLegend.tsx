export function CategoryLegend() {
  const categories = [
    { label: '≥ 90% : Sangat Baik', color: '#10b981' },
    { label: '75% – 89% : Baik', color: '#3b82f6' },
    { label: '50% – 74% : Cukup', color: '#f59e0b' },
    { label: '< 50% : Kurang', color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 card-hover">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        KETERANGAN KATEGORI
      </h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-gray-600">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
