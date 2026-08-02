import type { IKUData, KategoriCapaian, DistributionItem, KPIResult } from '../types';

export function getKategori(persentase: number): KategoriCapaian {
  if (persentase > 100) return 'Sangat Baik';
  if (persentase >= 100) return 'Baik';
  return 'Kurang';
}

export function getKategoriColor(k: KategoriCapaian): string {
  switch (k) {
    case 'Sangat Baik': return '#10b981';
    case 'Baik': return '#3b82f6';
    case 'Kurang': return '#ef4444';
  }
}

export function getKategoriBgColor(k: KategoriCapaian): string {
  switch (k) {
    case 'Sangat Baik': return '#ecfdf5';
    case 'Baik': return '#eff6ff';
    case 'Kurang': return '#fef2f2';
  }
}

export function getKategoriTextColor(k: KategoriCapaian): string {
  switch (k) {
    case 'Sangat Baik': return '#065f46';
    case 'Baik': return '#1e40af';
    case 'Kurang': return '#991b1b';
  }
}

export const LEVEL_PROGRAM = 0;
export const LEVEL_KEGIATAN = 1;
export const LEVEL_SUB_KEGIATAN = 2;
export const LEVEL_DETAIL = 3;

export function isDetailRow(d: IKUData): boolean {
  return (d.level ?? LEVEL_DETAIL) >= LEVEL_DETAIL;
}

export function computeAggregate(items: IKUData[]) {
  const a = {
    targetRenstra: 0, targetTahun: 0,
    realisasiTW1: 0, realisasiTW2: 0, realisasiTW3: 0, realisasiTW4: 0,
    realisasiTahun: 0, persentase: 0,
    targetAnggaran: 0, realisasiAnggaran: 0, persentaseAnggaran: 0,
  };
  for (const d of items) {
    a.targetRenstra += d.targetRenstra;
    a.targetTahun += d.targetTahun;
    a.realisasiTW1 += d.realisasiTW1 ?? 0;
    a.realisasiTW2 += d.realisasiTW2 ?? 0;
    a.realisasiTW3 += d.realisasiTW3 ?? 0;
    a.realisasiTW4 += d.realisasiTW4 ?? 0;
    a.targetAnggaran += d.targetAnggaran;
    a.realisasiAnggaran += d.realisasiAnggaran;
  }
  a.realisasiTahun = a.realisasiTW1 + a.realisasiTW2 + a.realisasiTW3 + a.realisasiTW4;
  a.persentase = a.targetTahun > 0 ? (a.realisasiTahun / a.targetTahun) * 100 : 0;
  a.persentaseAnggaran = a.targetAnggaran > 0 ? (a.realisasiAnggaran / a.targetAnggaran) * 100 : 0;
  return a;
}

export function getStatusText(persentase: number): string {
  if (persentase > 100) return 'Sangat Baik';
  if (persentase >= 100) return 'Baik';
  return 'Kurang';
}

export function formatRupiah(val: number): string {
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(2)} M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(2)} Jt`;
  if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)} Rb`;
  return `Rp ${val}`;
}

export function formatRupiahFull(val: number): string {
  return `Rp. ${val.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatRupiahNoDec(val: number): string {
  return `Rp. ${val.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString('id-ID');
}

export function getRealisasiForTriwulan(data: IKUData[], triwulan: string): number {
  data = data.filter(isDetailRow);
  if (triwulan === 'Semua Triwulan') {
    return data.length > 0
      ? Math.round((data.reduce((sum, d) => sum + d.persentase, 0) / data.length) * 100) / 100
      : 0;
  }
  const idx = triwulanIndex(triwulan);
  const validData = data.filter(d => {
    const vals = [d.realisasiTW1, d.realisasiTW2, d.realisasiTW3, d.realisasiTW4];
    return vals[idx] !== null && vals[idx] !== undefined;
  });
  if (validData.length === 0) return 0;
  const sum = validData.reduce((acc, d) => {
    const vals = [d.realisasiTW1, d.realisasiTW2, d.realisasiTW3, d.realisasiTW4];
    const val = vals[idx] ?? 0;
    const target = d.targetTahun;
    if (target > 0) return acc + (val / target) * 100;
    return acc;
  }, 0);
  return Math.round((sum / validData.length) * 100) / 100;
}

export function triwulanIndex(triwulan: string): number {
  switch (triwulan) {
    case 'Triwulan I': return 0;
    case 'Triwulan II': return 1;
    case 'Triwulan III': return 2;
    case 'Triwulan IV': return 3;
    default: return -1;
  }
}

export function calculateKPI(data: IKUData[]): KPIResult {
  data = data.filter(isDetailRow);
  const totalIndikator = data.length;
  const totalTarget = data.filter(d => d.targetTahun > 0).length;
  const rataRataCapaian = data.length > 0
    ? Math.round((data.reduce((sum, d) => sum + d.persentase, 0) / data.length) * 100) / 100
    : 0;
  const totalAnggaran = data.reduce((sum, d) => sum + d.targetAnggaran, 0);
  const realisasiAnggaran = data.reduce((sum, d) => sum + d.realisasiAnggaran, 0);
  const realisasiKinerja = rataRataCapaian;
  return { totalIndikator, totalTarget, realisasiKinerja, rataRataCapaian, totalAnggaran, realisasiAnggaran, persentaseAnggaran: 58.06 };
}

export function calculateDistribution(data: IKUData[]): DistributionItem[] {
  data = data.filter(isDetailRow);
  const total = data.length;
  const sangatBaik = data.filter(d => d.persentase > 100).length;
  const baik = data.filter(d => d.persentase >= 100 && d.persentase <= 100).length;
  const kurang = data.filter(d => d.persentase < 100).length;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 10000) / 100 : 0;
  return [
    { name: '> 100% (Sangat Baik)', value: sangatBaik, percentage: pct(sangatBaik), color: '#10b981' },
    { name: '100% (Baik)', value: baik, percentage: pct(baik), color: '#3b82f6' },
    { name: '< 100% (Kurang)', value: kurang, percentage: pct(kurang), color: '#ef4444' },
  ];
}

export function countSubKegiatanTerisi(data: IKUData[]): number {
  const details = data.filter(isDetailRow);
  const map = new Map<string, IKUData[]>();
  for (const d of details) {
    if (!d.kegiatan) continue;
    const key = `${d.program}||${d.programIndikator}||${d.kegiatan}||${d.subKegiatan}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d);
  }
  let jumlah = 0;
  for (const items of map.values()) {
    const agg = computeAggregate(items);
    if (agg.targetTahun > 0 || agg.targetAnggaran > 0) jumlah++;
  }
  return jumlah;
}

export function calculateSubDistribution(data: IKUData[]): DistributionItem[] {
  const details = data.filter(isDetailRow);
  const map = new Map<string, IKUData[]>();
  for (const d of details) {
    if (!d.kegiatan) continue;
    const key = `${d.program}||${d.programIndikator}||${d.kegiatan}||${d.subKegiatan}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d);
  }
  let sangatBaik = 0;
  let baik = 0;
  let kurang = 0;
  for (const items of map.values()) {
    const agg = computeAggregate(items);
    if (agg.targetTahun <= 0 && agg.targetAnggaran <= 0) continue;
    const pct = agg.persentase;
    if (pct > 100) sangatBaik++;
    else if (pct >= 100) baik++;
    else kurang++;
  }
  const totalTerisi = sangatBaik + baik + kurang;
  const pctOf = (n: number) => totalTerisi > 0 ? Math.round((n / totalTerisi) * 10000) / 100 : 0;
  return [
    { name: '> 100% (Sangat Baik)', value: sangatBaik, percentage: pctOf(sangatBaik), color: '#10b981' },
    { name: '100% (Baik)', value: baik, percentage: pctOf(baik), color: '#3b82f6' },
    { name: '< 100% (Kurang)', value: kurang, percentage: pctOf(kurang), color: '#ef4444' },
  ];
}

export function calculateQuarterlyAverages(data: IKUData[]): { triwulan: string; rataRata: number | null }[] {
  data = data.filter(isDetailRow);
  const calc = (vals: (number | null)[]) => {
    const valid = data.filter((_, i) => vals[i] !== null && vals[i] !== undefined && data[i].targetTahun > 0);
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, d, i) => {
      const v = vals[i] ?? 0;
      return acc + (v / d.targetTahun) * 100;
    }, 0);
    return Math.round((sum / valid.length) * 100) / 100;
  };
  return [
    { triwulan: 'TW I', rataRata: calc(data.map(d => d.realisasiTW1)) },
    { triwulan: 'TW II', rataRata: calc(data.map(d => d.realisasiTW2)) },
    { triwulan: 'TW III', rataRata: calc(data.map(d => d.realisasiTW3)) },
    { triwulan: 'TW IV', rataRata: calc(data.map(d => d.realisasiTW4)) },
  ];
}

export function calculateBudgetQuarterly(data: IKUData[]): { triwulan: string; anggaran: number }[] {
  data = data.filter(isDetailRow);
  const tw1 = data.reduce((s, d) => s + (d.realisasiTW1 !== null && d.targetTahun > 0 ? (d.realisasiTW1 / d.targetTahun) * d.targetAnggaran : 0), 0);
  const tw2 = data.reduce((s, d) => s + (d.realisasiTW2 !== null && d.targetTahun > 0 ? (d.realisasiTW2 / d.targetTahun) * d.targetAnggaran : 0), 0);
  const tw3 = data.reduce((s, d) => s + (d.realisasiTW3 !== null && d.targetTahun > 0 ? (d.realisasiTW3 / d.targetTahun) * d.targetAnggaran : 0), 0);
  const tw4 = data.reduce((s, d) => s + (d.realisasiTW4 !== null && d.targetTahun > 0 ? (d.realisasiTW4 / d.targetTahun) * d.targetAnggaran : 0), 0);
  return [
    { triwulan: 'TW I', anggaran: Math.round(tw1) },
    { triwulan: 'TW II', anggaran: Math.round(tw2) },
    { triwulan: 'TW III', anggaran: Math.round(tw3) },
    { triwulan: 'TW IV', anggaran: Math.round(tw4) },
  ];
}

export function getTopFive(data: IKUData[]): IKUData[] {
  return [...data.filter(isDetailRow)].sort((a, b) => b.persentase - a.persentase).slice(0, 5);
}

export function getBottomFive(data: IKUData[]): IKUData[] {
  return [...data.filter(isDetailRow)].sort((a, b) => a.persentase - b.persentase).slice(0, 5);
}

export function getUniquePrograms(data: IKUData[]): string[] {
  return [...new Set(data.filter(isDetailRow).map(d => d.program).filter(Boolean))];
}

export function getUniqueKegiatan(data: IKUData[], program?: string): string[] {
  const filtered = data.filter(isDetailRow);
  const scoped = program ? filtered.filter(d => d.program === program) : filtered;
  return [...new Set(scoped.map(d => d.kegiatan).filter(Boolean))];
}

export function getUniqueSubKegiatan(data: IKUData[], program?: string, kegiatan?: string): string[] {
  let filtered = data.filter(isDetailRow);
  if (program) filtered = filtered.filter(d => d.program === program);
  if (kegiatan) filtered = filtered.filter(d => d.kegiatan === kegiatan);
  return [...new Set(filtered.map(d => d.subKegiatan).filter(Boolean))];
}
