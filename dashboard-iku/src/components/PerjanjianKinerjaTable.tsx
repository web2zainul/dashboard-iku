import { useEffect, useState } from 'react';
import { Eye, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { pegawaiBkpsdm, type Pegawai } from '../data/pegawaiBkpsdm';
import { PerjanjianDetailModal } from './PerjanjianDetailModal';
import { TabNav, type ActiveTab } from './TabNav';

const STORAGE_KEY = 'pegawai_pk_data';

function loadPegawai(): Pegawai[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return pegawaiBkpsdm;
    const parsed = JSON.parse(raw) as Pegawai[];
    if (!Array.isArray(parsed)) return pegawaiBkpsdm;
    return parsed;
  } catch (err) {
    console.error('Pegawai localStorage load error:', err);
    return pegawaiBkpsdm;
  }
}

export function PerjanjianKinerjaTable({ activeTab, onTabChange }: { activeTab: ActiveTab; onTabChange: (tab: ActiveTab) => void }) {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(loadPegawai);
  const [selected, setSelected] = useState<Pegawai | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ nama: string; nip: string; jabatan: string }>({ nama: '', nip: '', jabatan: '' });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pegawaiList));
    } catch (err) {
      console.error('Pegawai localStorage persist error:', err);
    }
  }, [pegawaiList]);

  const startEdit = (p: Pegawai) => {
    setEditingId(p.no);
    setEditData({ nama: p.nama, nip: p.nip, jabatan: p.jabatan });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ nama: '', nip: '', jabatan: '' });
  };

  const addPegawai = () => {
    const nextNo = pegawaiList.length > 0 ? Math.max(...pegawaiList.map(p => p.no)) + 1 : 1;
    setEditingId(nextNo);
    setEditData({ nama: '', nip: '', jabatan: '' });
  };

  const saveEdit = () => {
    if (editingId === null) return;
    const clean = { nama: editData.nama.trim(), nip: editData.nip.trim(), jabatan: editData.jabatan.trim() };
    if (!clean.nama) return;
    setPegawaiList(prev => {
      const exists = prev.some(p => p.no === editingId);
      if (exists) {
        return prev.map(p => (p.no === editingId ? { ...p, ...clean } : p));
      }
      return [...prev, { no: editingId, ...clean }];
    });
    cancelEdit();
  };

  const deletePegawai = (p: Pegawai) => {
    if (!window.confirm(`Yakin ingin menghapus ${p.nama}?`)) return;
    setPegawaiList(prev => prev.filter(x => x.no !== p.no));
    if (selected?.no === p.no) setSelected(null);
    if (editingId === p.no) cancelEdit();
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
            Sumber: Data Pegawai BKPSDM Kota Cirebon — {pegawaiList.length} pegawai
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <TabNav active={activeTab} onChange={onTabChange} />
          <span className="w-px h-6 bg-gray-200" />
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
            {pegawaiList.map((p, idx) => {
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
    </div>
  );
}
