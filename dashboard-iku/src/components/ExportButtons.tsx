import { Download, FileText, Image, Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useDashboard } from '../context/DashboardContext';
import { getKategori, isDetailRow } from '../utils/calculations';

export function ExportButtons() {
  const { state } = useDashboard();
  const detailRows = state.data.filter(isDetailRow);

  const exportExcel = () => {
    const wsData = detailRows.map((d, i) => ({
      No: i + 1,
      Program: d.program,
      Kegiatan: d.kegiatan,
      'Sub Kegiatan': d.subKegiatan,
      'Indikator Kinerja': d.indikator,
      Satuan: d.satuan,
      'Target Tahun': d.targetTahun,
      'TW I': d.realisasiTW1 ?? '-',
      'TW II': d.realisasiTW2 ?? '-',
      'TW III': d.realisasiTW3 ?? '-',
      'TW IV': d.realisasiTW4 ?? '-',
      'Realisasi Tahun': d.realisasiTahun,
      '% Capaian': d.persentase.toFixed(2) + '%',
      'Target Anggaran': d.targetAnggaran,
      'Realisasi Anggaran': d.realisasiAnggaran,
      '% Anggaran': d.persentaseAnggaran.toFixed(2) + '%',
      Status: getKategori(d.persentase),
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data RENJA');
    XLSX.writeFile(wb, `Dashboard_RENJA_${state.tahun}_${state.triwulan.replace(/\s/g, '_')}.xlsx`);
  };

  const exportCSV = () => {
    const headers = ['No', 'Program', 'Kegiatan', 'Sub Kegiatan', 'Indikator Kinerja', 'Satuan', 'Target Tahun', 'TW I', 'TW II', 'TW III', 'TW IV', 'Realisasi Tahun', '% Capaian', 'Target Anggaran', 'Realisasi Anggaran', '% Anggaran', 'Status'];
    const rows = detailRows.map((d, i) => [
      i + 1, d.program, d.kegiatan, d.subKegiatan, d.indikator, d.satuan,
      d.targetTahun, d.realisasiTW1 ?? '-', d.realisasiTW2 ?? '-', d.realisasiTW3 ?? '-', d.realisasiTW4 ?? '-',
      d.realisasiTahun, d.persentase.toFixed(2) + '%',
      d.targetAnggaran, d.realisasiAnggaran, d.persentaseAnggaran.toFixed(2) + '%',
      getKategori(d.persentase),
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Dashboard_RENJA_${state.tahun}_${state.triwulan.replace(/\s/g, '_')}.csv`;
    link.click();
  };

  const exportPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Dashboard_RENJA_${state.tahun}_${state.triwulan.replace(/\s/g, '_')}.pdf`);
  };

  const exportPNG = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
    const link = document.createElement('a');
    link.download = `Dashboard_RENJA_${state.tahun}_${state.triwulan.replace(/\s/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const printDashboard = () => window.print();

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={exportExcel} className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm hover:shadow-md">
        <Download className="w-3.5 h-3.5" /> Excel
      </button>
      <button onClick={exportCSV} className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm hover:shadow-md">
        <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
      </button>
      <button onClick={exportPDF} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm hover:shadow-md">
        <FileText className="w-3.5 h-3.5" /> PDF
      </button>
      <button onClick={exportPNG} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm hover:shadow-md">
        <Image className="w-3.5 h-3.5" /> PNG
      </button>
      <button onClick={printDashboard} className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm hover:shadow-md">
        <Printer className="w-3.5 h-3.5" /> Cetak
      </button>
    </div>
  );
}
