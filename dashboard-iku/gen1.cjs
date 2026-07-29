const fs = require('fs');
const path = require('path');
const base = 'C:/renja/dashboard-iku/src';

function w(rel, content) {
  const full = path.join(base, '..', rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('OK:', rel);
}

w('vite.config.ts', import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
}));

w('src/index.css', @import "tailwindcss";

@theme {
  --color-navy-50: #f0f3ff;
  --color-navy-100: #dce3ff;
  --color-navy-200: #b6c5ff;
  --color-navy-300: #7a94ff;
  --color-navy-400: #3d63ff;
  --color-navy-500: #1a3a8a;
  --color-navy-600: #152e6e;
  --color-navy-700: #0f2358;
  --color-navy-800: #0a1842;
  --color-navy-900: #060e2d;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #f1f5f9;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes countUp {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
.animate-count-up { animation: countUp 0.6s ease-out forwards; }
.card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12); }
.scrollbar-thin::-webkit-scrollbar { width: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
@media print { .no-print { display: none !important; } });

console.log('Part 1 done');