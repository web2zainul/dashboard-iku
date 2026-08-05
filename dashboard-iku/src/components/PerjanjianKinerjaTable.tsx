import { useState } from 'react';
import { Eye } from 'lucide-react';
import { pegawaiBkpsdm, type Pegawai } from '../data/pegawaiBkpsdm';
import { PerjanjianDetailModal } from './PerjanjianDetailModal';

export function PerjanjianKinerjaTable() {
  const [selected, setSelected] = useState<Pegawai | null>(null);

  return (
    <div id="perjanjian-kinerja" className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          PERJANJIAN KINERJA PEGAWAI — BKPSDM KOTA CIREBON
        </h3>
        <p className="text-[10px] text-gray-400 mt-1">
          Sumber: Data Pegawai BKPSDM Kota Cirebon — {pegawaiBkpsdm.length} pegawai
        </p>
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
            {pegawaiBkpsdm.map((p) => (
              <tr key={p.no} className="transition-colors hover:bg-gray-50/60">
                <td className="px-2 py-1.5 text-center text-gray-400">{p.no}</td>
                <td className="px-2 py-1.5 text-gray-800 font-medium align-top">{p.nama}</td>
                <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap align-top">{p.nip || '-'}</td>
                <td className="px-2 py-1.5 text-gray-600 align-top">{p.jabatan || '-'}</td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    onClick={() => setSelected(p)}
                    className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                    title="Lihat"
                  >
                    <Eye className="w-4 h-4 text-blue-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <PerjanjianDetailModal pegawai={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
