import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X, ArrowRight, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDashboard } from '../context/DashboardContext';
import { Notification } from './Notification';
import type { IKUData } from '../types';

interface PreviewData {
  headers: string[];
  rows: Record<string, unknown>[];
  sheetName: string;
}

interface MappingState {
  program: string;
  kegiatan: string;
  subKegiatan: string;
  indikator: string;
  satuan: string;
  targetTahun: string;
  realisasiTW1: string;
  realisasiTW2: string;
  realisasiTW3: string;
  realisasiTW4: string;
  targetAnggaran: string;
  realisasiAnggaran: string;
}

const EMPTY_MAPPING: MappingState = {
  program: '', kegiatan: '', subKegiatan: '', indikator: '', satuan: '',
  targetTahun: '', realisasiTW1: '', realisasiTW2: '', realisasiTW3: '', realisasiTW4: '',
  targetAnggaran: '', realisasiAnggaran: '',
};

const LABELS: Record<keyof MappingState, string> = {
  program: 'Program', kegiatan: 'Kegiatan', subKegiatan: 'Sub Kegiatan',
  indikator: 'Indikator Kinerja', satuan: 'Satuan', targetTahun: 'Target Tahun',
  realisasiTW1: 'Realisasi TW I', realisasiTW2: 'Realisasi TW II',
  realisasiTW3: 'Realisasi TW III', realisasiTW4: 'Realisasi TW IV',
  targetAnggaran: 'Target Anggaran', realisasiAnggaran: 'Realisasi Anggaran',
};

const REQUIRED_FIELDS = ['indikator'];

function autoDetectMapping(headers: string[]): MappingState {
  const find = (keywords: string[]): string => {
    for (const h of headers) {
      const lower = h.toLowerCase();
      for (const kw of keywords) {
        if (lower.includes(kw)) return h;
      }
    }
    return '';
  };
  return {
    program: find(['program']),
    kegiatan: find(['kegiatan']),
    subKegiatan: find(['sub kegiatan', 'sub keg']),
    indikator: find(['indikator']),
    satuan: find(['satuan', 'unit']),
    targetTahun: find(['target tahun', 'target renja', 'target']),
    realisasiTW1: find(['tw i', 'triwulan i', 'tw1']),
    realisasiTW2: find(['tw ii', 'triwulan ii', 'tw2']),
    realisasiTW3: find(['tw iii', 'triwulan iii', 'tw3']),
    realisasiTW4: find(['tw iv', 'triwulan iv', 'tw4']),
    targetAnggaran: find(['target anggaran', 'anggaran']),
    realisasiAnggaran: find(['realisasi anggaran']),
  };
}

function mapDataToIKU(rows: Record<string, unknown>[], mapping: MappingState, idStart: number): IKUData[] {
  return rows
    .map((row, i) => {
      const indikator = String(row[mapping.indikator] || '').trim();
      if (!indikator) return null;
      const targetTahun = Number(row[mapping.targetTahun]) || 0;
      const tw1 = mapping.realisasiTW1 ? Number(row[mapping.realisasiTW1]) || null : null;
      const tw2 = mapping.realisasiTW2 ? Number(row[mapping.realisasiTW2]) || null : null;
      const tw3 = mapping.realisasiTW3 ? Number(row[mapping.realisasiTW3]) || null : null;
      const tw4 = mapping.realisasiTW4 ? Number(row[mapping.realisasiTW4]) || null : null;
      const vals = [tw1, tw2, tw3, tw4].filter(v => v !== null && v !== undefined);
      const realisasiTahun = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : 0;
      const persentase = targetTahun > 0 && vals.length > 0 ? Math.round((realisasiTahun / targetTahun) * 10000) / 100 : 0;
      const targetAnggaran = Number(row[mapping.targetAnggaran]) || 0;
      const realisasiAnggaran = Number(row[mapping.realisasiAnggaran]) || 0;
      const persentaseAnggaran = targetAnggaran > 0 ? Math.round((realisasiAnggaran / targetAnggaran) * 10000) / 100 : 0;

      return {
        id: idStart + i,
        program: String(row[mapping.program] || '').trim(),
        kegiatan: String(row[mapping.kegiatan] || '').trim(),
        subKegiatan: String(row[mapping.subKegiatan] || '').trim(),
        indikator,
        satuan: String(row[mapping.satuan] || '').trim(),
        targetRenstra: 0,
        targetTahun,
        realisasiTW1: tw1,
        realisasiTW2: tw2,
        realisasiTW3: tw3,
        realisasiTW4: tw4,
        realisasiTahun,
        persentase,
        targetAnggaran,
        realisasiAnggaran,
        persentaseAnggaran,
        tahun: 2026,
      };
    })
    .filter(Boolean) as IKUData[];
}

export function ImportData() {
  const { dispatch } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'idle' | 'preview' | 'mapping' | 'done'>('idle');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mapping, setMapping] = useState<MappingState>(EMPTY_MAPPING);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sheetList, setSheetList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        setSheetList(workbook.SheetNames);
        loadSheet(workbook, 0);
        setStep('preview');
      } catch {
        setNotification({ type: 'error', message: 'Gagal membaca file. Pastikan format Excel benar.' });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const loadSheet = (workbook: XLSX.WorkBook, idx: number) => {
    setSelectedSheet(idx);
    const ws = workbook.Sheets[workbook.SheetNames[idx]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    setPreview({ headers, rows: rows.slice(0, 5), sheetName: workbook.SheetNames[idx] });
    setMapping(autoDetectMapping(headers));
  };

  const handleImport = () => {
    if (!mapping.indikator) {
      setNotification({ type: 'error', message: 'Kolom Indikator wajib dipilih!' });
      return;
    }
    const fileInput = fileInputRef.current;
    if (!fileInput) return;
    const file = (fileInput as HTMLInputElement & { _file?: File })._file;
    if (!file) {
      setNotification({ type: 'error', message: 'File tidak ditemukan. Silakan upload ulang.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const ws = workbook.Sheets[workbook.SheetNames[selectedSheet]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const mappedData = mapDataToIKU(rows, mapping, 1);
        if (mappedData.length === 0) {
          setNotification({ type: 'error', message: 'Tidak ada data yang valid untuk diimport.' });
          return;
        }
        dispatch({ type: 'SET_DATA', payload: mappedData });
        setNotification({ type: 'success', message: `${mappedData.length} indikator berhasil diimport!` });
        setStep('done');
        setTimeout(() => setStep('idle'), 1500);
      } catch {
        setNotification({ type: 'error', message: 'Gagal mengimport data.' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileWithRef = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      (fileInputRef.current as (HTMLInputElement & { _file?: File }) | null)?._file && ((fileInputRef.current as HTMLInputElement & { _file?: File })._file = file);
      handleFile(e);
    }
  };

  return (
    <div className="relative">
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileWithRef} className="hidden" />
      <button onClick={() => { setStep('idle'); fileInputRef.current?.click(); }} className="flex items-center gap-2 bg-white border-2 border-dashed border-blue-200 text-blue-700 px-4 py-2.5 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium">
        <Upload className="w-4 h-4" />
        IMPORT DATA EXCEL
        <FileSpreadsheet className="w-4 h-4 text-green-500" />
      </button>

      {step === 'preview' && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Preview Data</h3>
                <p className="text-xs text-gray-500">Sheet: {preview.sheetName} | {preview.rows.length} baris preview | {preview.headers.length} kolom</p>
                {sheetList.length > 1 && (
                  <div className="flex gap-2 mt-2">
                    {sheetList.map((name, i) => (
                      <button key={name} className={`px-3 py-1 rounded-lg text-xs font-medium ${i === selectedSheet ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setStep('idle')} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="overflow-auto max-h-[40vh] p-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {preview.headers.slice(0, 10).map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {preview.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      {preview.headers.slice(0, 10).map(h => (
                        <td key={h} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[200px] truncate">{String(row[h] ?? '-')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setStep('idle')} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">Batal</button>
              <button onClick={() => setStep('mapping')} className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2">
                Mapping Kolom <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'mapping' && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Mapping Kolom Excel</h3>
              <button onClick={() => setStep('idle')} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="p-4 space-y-3">
              {(Object.keys(LABELS) as (keyof MappingState)[]).map(field => (
                <div key={field} className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-600 w-40 flex-shrink-0">
                    {LABELS[field]}
                    {REQUIRED_FIELDS.includes(field) && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <select
                    value={mapping[field]}
                    onChange={e => setMapping(prev => ({ ...prev, [field]: e.target.value }))}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">-- Tidak ada --</option>
                    {preview.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setStep('preview')} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">Kembali</button>
              <button onClick={handleImport} className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-2">
                <Check className="w-4 h-4" /> Import Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
    </div>
  );
}
