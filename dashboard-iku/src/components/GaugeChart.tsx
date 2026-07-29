import { useDashboard } from '../context/DashboardContext';
import { calculateKPI, getStatusText, getKategoriColor } from '../utils/calculations';

export function GaugeChart() {
  const { state } = useDashboard();
  const kpi = calculateKPI(state.data);
  const percentage = kpi.rataRataCapaian;
  const status = getStatusText(percentage);

  const statusColor = getKategoriColor(
    percentage >= 90 ? 'Sangat Baik' : percentage >= 50 ? 'Baik' : 'Kurang'
  );

  const svgWidth = 280;
  const svgHeight = 175;
  const cx = svgWidth / 2;
  const cy = 150;
  const outerR = 120;
  const strokeWidth = 20;
  const innerR = outerR - strokeWidth;

  const segments = [
    { start: 0, end: 50, color: '#ef4444' },
    { start: 50, end: 90, color: '#3b82f6' },
    { start: 90, end: 100, color: '#10b981' },
  ];

  const toAngle = (pct: number) => Math.PI + (pct / 100) * Math.PI;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-hover h-full">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        1. RATA-RATA CAPAIAN KINERJA
      </h3>
      <div className="flex flex-col items-center">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {segments.map((seg, i) => {
            const sa = toAngle(seg.start);
            const ea = toAngle(seg.end);
            const largeArc = (seg.end - seg.start) > 50 ? 1 : 0;

            const os = { x: cx + outerR * Math.cos(sa), y: cy + outerR * Math.sin(sa) };
            const oe = { x: cx + outerR * Math.cos(ea), y: cy + outerR * Math.sin(ea) };
            const ie = { x: cx + innerR * Math.cos(ea), y: cy + innerR * Math.sin(ea) };
            const is_ = { x: cx + innerR * Math.cos(sa), y: cy + innerR * Math.sin(sa) };

            return (
              <path
                key={i}
                d={`M ${os.x} ${os.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${oe.x} ${oe.y} L ${ie.x} ${ie.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${is_.x} ${is_.y} Z`}
                fill={seg.color}
                opacity={0.3}
              />
            );
          })}

          {(() => {
            const clamped = Math.min(Math.max(percentage, 0), 100);
            const needleAngle = toAngle(clamped);
            const needleLen = innerR - 8;
            const tipX = cx + needleLen * Math.cos(needleAngle);
            const tipY = cy + needleLen * Math.sin(needleAngle);
            return (
              <>
                <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke={statusColor} strokeWidth={3} strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={7} fill={statusColor} />
                <circle cx={cx} cy={cy} r={3.5} fill="white" />
              </>
            );
          })()}

          <text x={cx} y={cy - 35} textAnchor="middle" fill={statusColor} fontSize={30} fontWeight="bold">
            {percentage.toFixed(2)}%
          </text>
          <rect x={cx - 52} y={cy - 22} width={104} height={20} rx={10} fill={statusColor} opacity={0.15} />
          <text x={cx} y={cy - 8} textAnchor="middle" fill={statusColor} fontSize={11} fontWeight="bold">
            {status}
          </text>

          {[0, 25, 50, 75, 100].map(pct => {
            const a = toAngle(pct);
            const labelR = outerR + 18;
            const lx = cx + labelR * Math.cos(a);
            const ly = cy + labelR * Math.sin(a);
            return (
              <text key={pct} x={lx} y={ly + 4} textAnchor="middle" fontSize={10} fill="#94a3b8">
                {pct}%
              </text>
            );
          })}
        </svg>
        <p className="text-xs text-gray-400 mt-1 text-center">Rata-rata Capaian Kinerja</p>
      </div>
    </div>
  );
}
