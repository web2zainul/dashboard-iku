import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const noopError = { message: 'Supabase tidak dikonfigurasi' };

function createNoopBuilder() {
  return {
    select: () => createNoopBuilder(),
    insert: () => createNoopBuilder(),
    update: () => createNoopBuilder(),
    delete: () => createNoopBuilder(),
    eq: () => createNoopBuilder(),
    neq: () => createNoopBuilder(),
    order: () => createNoopBuilder(),
    then: (resolve: (value: { data: null; error: typeof noopError }) => void) => resolve({ data: null, error: noopError }),
  };
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { from: () => createNoopBuilder() };
