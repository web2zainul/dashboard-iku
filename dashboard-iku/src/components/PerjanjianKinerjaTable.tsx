import { useState } from 'react';
import { Eye, Pencil, Check, X, Plus, Trash2, Download } from 'lucide-react';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
} from 'docx';
import type { Pegawai } from '../data/pegawaiBkpsdm';
import { normalizeNip } from '../data/pegawaiBkpsdm';
import { usePegawai, pegawaiToDb, pegawaiFromDb } from '../context/PegawaiContext';
import { supabase } from '../lib/supabase';
import { PerjanjianDetailModal } from './PerjanjianDetailModal';
import { Notification } from './Notification';
import { TabNav, type ActiveTab } from './TabNav';

async function downloadDocx(pegawaiList: Pegawai[]) {
  const header = (text: string) =>
    new TableCell({
      shading: { fill: '0F2358' },
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18 })] })],
    });

  const cell = (text: string, bold = false) =>
    new TableCell({
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text: text || '-', bold, size: 18 })] })],
    });

  const rows: TableRow[] = [
    new TableRow({ tableHeader: true, children: [header('No'), header('Nama'), header('NIP'), header('Jabatan')] }),
    ...pegawaiList.map(p =>
      new TableRow({ children: [cell(String(p.no)), cell(p.nama, true), cell(p.nip), cell(p.jabatan)] })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'PERJANJIAN KINERJA PEGAWAI', bold: true, size: 32 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'BKPSDM KOTA CIREBON', bold: true, size: 28 })],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Paragraph({ text: `Jumlah Pegawai: ${pegawaiList.length}`, spacing: { after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Perjanjian-Kinerja-Pegawai.docx';
  a.click();
  URL.revokeObjectURL(url);
}

export function PerjanjianKinerjaTable({ activeTab, onTabChange }: { activeTab: ActiveTab; onTabChange: (tab: ActiveTab) => void }) {
  const { rows, dispatch } = usePegawai();
  const [selected, setSelected] = useState<Pegawai | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ nama: string; nip: string; jabatan: string }>({ nama: '', nip: '', jabatan: '' });
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [downloading, setDownloading] = useState(false);

  const startEdit = (p: Pegawai) => {
    setEditingId(p.no);
    setEditData({ nama: p.nama, nip: p.nip, jabatan: p.jabatan });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ nama: '', nip: '', jabatan: '' });
  };

  const addPegawai = () => {
    const nextNo = rows.length > 0 ? Math.max(...rows.map(p => p.no)) + 1 : 1;
    setEditingId(nextNo);
    setEditData({ nama: '', nip: '', jabatan: '' });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    const clean = { nama: editData.nama.trim(), nip: normalizeNip(editData.nip), jabatan: editData.jabatan.trim() };
    if (!clean.nama) {
      setNotif({ type: 'error', message: 'Nama tidak boleh kosong' });
      return;
    }
    try {
      const dbFields = pegawaiToDb(clean);
      const filtered = Object.fromEntries(Object.entries(dbFields).filter(([_, v]) => v !== undefined));
      const exists = rows.some(p => p.no === editingId);
      if (exists) {
        const { error } = await supabase.from('pegawai').update(filtered).eq('no', editingId);
        if (error) throw error;
        setNotif({ type: 'success', message: 'Perubahan berhasil disimpan' });
        dispatch({ type: 'UPDATE_ROW', payload: { id: editingId, changes: clean } });
      } else {
        const { data, error } = await supabase.from('pegawai').insert({ ...filtered, no: editingId }).select();
        if (error) throw error;
        setNotif({ type: 'success', message: 'Pegawai berhasil ditambahkan' });
        if (data?.[0]) dispatch({ type: 'ADD_ROW', payload: pegawaiFromDb(data[0]) });
      }
    } catch (err) {
      console.error('Pegawai Supabase save error:', err);
      setNotif({ type: 'error', message: 'Gagal menyimpan ke database: ' + (err as Error).message });
    }
    cancelEdit();
  };

  const deletePegawai = async (p: Pegawai) => {
    if (!window.confirm(`Yakin ingin menghapus ${p.nama}?`)) return;
    try {
      const { error } = await supabase.from('pegawai').delete().eq('no', p.no);
      if (error) throw error;
      setNotif({ type: 'success', message: 'Pegawai berhasil dihapus' });
    } catch (err) {
      console.error('Pegawai Supabase delete error:', err);
      setNotif({ type: 'error', message: 'Gagal menghapus dari database: ' + (err as Error).message });
    }
    dispatch({ type: 'DELETE_ROW', payload: p.no });
    if (selected?.no === p.no) setSelected(null);
    if (editingId === p.no) cancelEdit();
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadDocx(rows);
    } catch (err) {
      console.error('DOCX download error:', err);
      setNotif({ type: 'error', message: 'Gagal membuat dokumen' });
    } finally {
      setDownloading(false);
    }
  };

  const inputClass = "w-full px-1.5 py-1 text-[10px] border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-blue-50/60";

  return (
    <div id="perjanjian-kinerja" className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            PERJANJIAN KINERJA PEGAWAI — BKPSDM KOTA CIREBON
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">
            Sumber: Data Pegawai BKPSDM Kota Cirebon — {rows.length} pegawai
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <TabNav active={activeTab} onChange={onTabChange} />
          <span className="w-px h-6 bg-gray-200" />
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <Download className="w-3 h-3" /> {downloading ? 'Membuat...' : 'Download Dokumen'}
          </button>
          <button
            onClick={addPegawai}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Tambah Pegawai
          </button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[10px] table-bordered" style={{ tableLayout: 'auto' }}>
          <thead className="bg-[#0f2358] text-white text-[9px] uppercase sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1.5 font-semibold whitespace-nowrap text-center">No</th>
              <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap">NAMA</th>
              <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap">NIP</th>
              <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap">JABATAN</th>
              <th className="px-2 py-1.5 font-semibold text-center whitespace-nowrap">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((p, idx) => {
              const isEditing = editingId === p.no;
              return (
                <tr key={p.no} className={`transition-colors ${isEditing ? 'bg-blue-50/70' : 'hover:bg-gray-50/60'}`}>
                  <td className="px-2 py-1.5 text-center text-gray-400">{idx + 1}</td>
                  <td className="px-2 py-1.5 text-gray-800 font-medium align-top">
                    {isEditing
                      ? <input type="text" value={editData.nama} onChange={e => setEditData(prev => ({ ...prev, nama: e.target.value }))} placeholder="Nama" className={inputClass} />
                      : p.nama}
                  </td>
                  <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap align-top">
                    {isEditing
                      ? <input type="text" value={editData.nip} onChange={e => setEditData(prev => ({ ...prev, nip: e.target.value }))} placeholder="NIP" className={inputClass} />
                      : p.nip || '-'}
                  </td>
                  <td className="px-2 py-1.5 text-gray-600 align-top">
                    {isEditing
                      ? <input type="text" value={editData.jabatan} onChange={e => setEditData(prev => ({ ...prev, jabatan: e.target.value }))} placeholder="Jabatan" className={inputClass} />
                      : p.jabatan || '-'}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 hover:bg-green-100 rounded transition-colors" title="Simpan">
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 hover:bg-red-100 rounded transition-colors" title="Batal">
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setSelected(p)} className="p-1.5 hover:bg-blue-50 rounded transition-colors" title="Lihat">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                          <button onClick={() => startEdit(p)} className="p-1.5 hover:bg-yellow-50 rounded transition-colors" title="Edit">
                            <Pencil className="w-4 h-4 text-yellow-500" />
                          </button>
                          <button onClick={() => deletePegawai(p)} className="p-1.5 hover:bg-red-50 rounded transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <PerjanjianDetailModal pegawai={selected} onClose={() => setSelected(null)} />}
      {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}
    </div>
  );
}
