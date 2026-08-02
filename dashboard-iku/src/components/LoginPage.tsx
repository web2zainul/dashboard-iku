import { useState } from 'react';
import { Building2, Lock, User, LogIn } from 'lucide-react';

const VALID_USERNAME = 'prokeu1';
const VALID_PASSWORD = 'prokeu1';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      onLogin();
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1842] via-[#0f2358] to-[#152e6e] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-[#0f2358] p-4 rounded-2xl mb-4">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#0f2358]">DASHBOARD KINERJA DAN ANGGARAN</h1>
          <p className="text-xs text-gray-500 mt-1">BADAN KEPEGAWAIAN DAN PENGEMBANGAN SDM KOTA CIREBON</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</label>
            <div className="relative mt-1">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#0f2358] hover:bg-[#152e6e] text-white font-semibold rounded-xl py-2.5 transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" /> Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
