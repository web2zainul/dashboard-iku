import type { IKUData } from '../types';
import * as XLSX from 'xlsx';

interface ColumnMapping {
  program: string;
  kegiatan: string;
  subKegiatan: string;
  indikator: string;
  satuan: string;
  targetRenstra: string;
  targetTahun: string;
  realisasiTW1: string;
  realisasiTW2: string;
  realisasiTW3: string;
  realisasiTW4: string;
  realisasiTahun: string;
  targetAnggaran: string;
  realisasiAnggaran: string;
}

const DEFAULT_MAPPING_RENJA: ColumnMapping = {
  program: '__EMPTY_5',
  kegiatan: '__EMPTY_5',
  subKegiatan: '__EMPTY_5',
  indikator: '__EMPTY_6',
  satuan: '__EMPTY_7',
  targetRenstra: '__EMPTY_8',
  targetTahun: '__EMPTY_8',
  realisasiTW1: '__EMPTY_10',
  realisasiTW2: '__EMPTY_12',
  realisasiTW3: '__EMPTY_14',
  realisasiTW4: '__EMPTY_16',
  realisasiTahun: '__EMPTY_18',
  targetAnggaran: '__EMPTY_9',
  realisasiAnggaran: '__EMPTY_19',
};

function detectFormat(workbook: XLSX.WorkBook): 'renja' | 'generic' {
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
  for (const row of data.slice(0, 5)) {
    for (const cell of (row as unknown[])) {
      if (typeof cell === 'string' && (cell.includes('RENJA') || cell.includes('RENSTRA') || cell.includes('Kode Rekening'))) {
        return 'renja';
      }
    }
  }
  return 'generic';
}

export function parseRenjaExcel(workbook: XLSX.WorkBook): IKUData[] {
  const format = detectFormat(workbook);
  if (format === 'renja') return parseRenjaFormat(workbook);
  return parseGenericFormat(workbook);
}

function parseRenjaFormat(workbook: XLSX.WorkBook): IKUData[] {
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  const results: IKUData[] = [];
  let currentProgram = '';
  let currentKegiatan = '';
  let currentSubKegiatan = '';
  let id = 1;

  for (const row of rawData) {
    const empty5 = String(row['__EMPTY_5'] || '').trim();
    const empty6 = String(row['__EMPTY_6'] || '').trim();
    const empty3 = String(row['__EMPTY_3'] || '').trim();
    const empty4 = String(row['__EMPTY_4'] || '').trim();
    const target = Number(row[DEFAULT_MAPPING_RENJA.targetTahun]) || 0;

    if (empty5.startsWith('PROGRAM')) {
      currentProgram = empty5;
      currentKegiatan = '';
      currentSubKegiatan = '';
      if (empty6 && target > 0) {
        results.push(buildIndicator(row, id++, currentProgram, currentKegiatan, currentSubKegiatan, DEFAULT_MAPPING_RENJA));
      }
      continue;
    }

    if (empty5.startsWith('Kegiatan') || empty5.startsWith('Kegiatan ')) {
      currentKegiatan = empty5;
      currentSubKegiatan = '';
      if (empty6 && target > 0) {
        results.push(buildIndicator(row, id++, currentProgram, currentKegiatan, currentSubKegiatan, DEFAULT_MAPPING_RENJA));
      }
      continue;
    }

    if (empty5.startsWith('Sub Kegiatan') || empty5.startsWith('Sub kegiatan')) {
      currentSubKegiatan = empty5;
      if (empty6 && target > 0) {
        results.push(buildIndicator(row, id++, currentProgram, currentKegiatan, currentSubKegiatan, DEFAULT_MAPPING_RENJA));
      }
      continue;
    }

    if (empty3 && !empty5 && empty6 && target > 0) {
      results.push(buildIndicator(row, id++, currentProgram, currentKegiatan, currentSubKegiatan, DEFAULT_MAPPING_RENJA));
      continue;
    }

    if (!empty5 && !empty6 && empty4) {
      if (target > 0 && empty6) {
        results.push(buildIndicator(row, id++, currentProgram, currentKegiatan, currentSubKegiatan, DEFAULT_MAPPING_RENJA));
      }
      continue;
    }

    if (empty6 && target > 0 && id <= 100) {
      results.push(buildIndicator(row, id++, currentProgram, currentKegiatan, currentSubKegiatan, DEFAULT_MAPPING_RENJA));
    }
  }

  return results;
}

function buildIndicator(
  row: Record<string, unknown>,
  id: number,
  program: string,
  kegiatan: string,
  subKegiatan: string,
  mapping: ColumnMapping
): IKUData {
  const indikator = String(row[mapping.indikator] || '').trim();
  const satuan = String(row[mapping.satuan] || '').trim();
  const targetRenstra = Number(row[mapping.targetRenstra]) || 0;
  const targetTahun = Number(row[mapping.targetTahun]) || 0;
  const targetAnggaran = Number(row[mapping.targetAnggaran]) || 0;
  const realisasiAnggaran = Number(row[mapping.realisasiAnggaran]) || 0;
  const tw1 = row[mapping.realisasiTW1] !== undefined ? Number(row[mapping.realisasiTW1]) : null;
  const tw2 = row[mapping.realisasiTW2] !== undefined ? Number(row[mapping.realisasiTW2]) : null;
  const tw3 = row[mapping.realisasiTW3] !== undefined ? Number(row[mapping.realisasiTW3]) : null;
  const tw4 = row[mapping.realisasiTW4] !== undefined ? Number(row[mapping.realisasiTW4]) : null;

  const twValues = [tw1, tw2, tw3, tw4].filter(v => v !== null && v !== undefined);
  const realisasiTahun = twValues.length > 0 ? twValues.reduce((a, b) => a + b, 0) : 0;

  let persentase = 0;
  if (targetTahun > 0 && twValues.length > 0) {
    persentase = Math.round((realisasiTahun / targetTahun) * 10000) / 100;
  }

  const persentaseAnggaran = targetAnggaran > 0
    ? Math.round((realisasiAnggaran / targetAnggaran) * 10000) / 100
    : 0;

  return {
    id,
    program,
    kegiatan,
    subKegiatan,
    indikator,
    satuan,
    targetRenstra,
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
    level: 3,
  };
}

function parseGenericFormat(workbook: XLSX.WorkBook): IKUData[] {
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  if (data.length === 0) return [];

  const headers = Object.keys(data[0]);
  const mapping = autoDetectColumns(headers);
  const results: IKUData[] = [];
  let id = 1;

  for (const row of data) {
    const indikator = String(row[mapping.indikator] || '').trim();
    if (!indikator) continue;

    const program = String(row[mapping.program] || '').trim();
    const kegiatan = String(row[mapping.kegiatan] || '').trim();
    const subKegiatan = String(row[mapping.subKegiatan] || '').trim();
    const satuan = String(row[mapping.satuan] || '').trim();
    const targetRenstra = Number(row[mapping.targetRenstra]) || 0;
    const targetTahun = Number(row[mapping.targetTahun]) || 0;
    const targetAnggaran = Number(row[mapping.targetAnggaran]) || 0;
    const realisasiAnggaran = Number(row[mapping.realisasiAnggaran]) || 0;
    const tw1 = row[mapping.realisasiTW1] !== undefined ? Number(row[mapping.realisasiTW1]) : null;
    const tw2 = row[mapping.realisasiTW2] !== undefined ? Number(row[mapping.realisasiTW2]) : null;
    const tw3 = row[mapping.realisasiTW3] !== undefined ? Number(row[mapping.realisasiTW3]) : null;
    const tw4 = row[mapping.realisasiTW4] !== undefined ? Number(row[mapping.realisasiTW4]) : null;

    const twValues = [tw1, tw2, tw3, tw4].filter(v => v !== null && v !== undefined);
    const realisasiTahun = twValues.length > 0 ? twValues.reduce((a, b) => a + b, 0) : 0;

    let persentase = 0;
    if (targetTahun > 0 && twValues.length > 0) {
      persentase = Math.round((realisasiTahun / targetTahun) * 10000) / 100;
    }

    const persentaseAnggaran = targetAnggaran > 0
      ? Math.round((realisasiAnggaran / targetAnggaran) * 10000) / 100
      : 0;

    results.push({
      id: id++,
      program,
      kegiatan,
      subKegiatan,
      indikator,
      satuan,
      targetRenstra,
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
      level: 3,
    });
  }

  return results;
}

function autoDetectColumns(headers: string[]): ColumnMapping {
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
    subKegiatan: find(['sub kegiatan', 'sub keg', 'subkegiatan']),
    indikator: find(['indikator']),
    satuan: find(['satuan', 'unit']),
    targetRenstra: find(['target renstra', 'target 2029']),
    targetTahun: find(['target tahun', 'target renja', 'target 2026', 'target']),
    realisasiTW1: find(['tw i', 'triwulan i', 'tw1', 'realisasi i']),
    realisasiTW2: find(['tw ii', 'triwulan ii', 'tw2', 'realisasi ii']),
    realisasiTW3: find(['tw iii', 'triwulan iii', 'tw3', 'realisasi iii']),
    realisasiTW4: find(['tw iv', 'triwulan iv', 'tw4', 'realisasi iv']),
    realisasiTahun: find(['realisasi tahun', 'realisasi']),
    targetAnggaran: find(['target anggaran', 'anggaran']),
    realisasiAnggaran: find(['realisasi anggaran']),
  };
}

export function parseExcelFile(file: File): Promise<{ data: IKUData[]; sheets: string[]; headers: string[]; rawRows: Record<string, unknown>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheets = workbook.SheetNames;
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
        const parsedData = parseRenjaExcel(workbook);
        resolve({ data: parsedData, sheets, headers, rawRows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}
