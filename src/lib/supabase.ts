import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const looksLikeRealSupabaseKey = (value?: string) => Boolean(value && /^eyJ/i.test(value));
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && looksLikeRealSupabaseKey(supabaseAnonKey)
);

const storage = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore local storage write failures in restricted environments
    }
  },
};

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const tableRows = (table: string) => storage.read<Record<string, unknown>[]>(`mock:${table}`, []);
const setTableRows = (table: string, rows: Record<string, unknown>[]) => storage.write(`mock:${table}`, rows);

const buildQuery = <T extends Record<string, any>>(table: string, initialRows: T[]) => {
  let rows = [...initialRows];
  let filters: Array<(row: T) => boolean> = [];
  let orderBy: { field: string; ascending: boolean } | null = null;
  let limit: number | null = null;

  const applyFilters = () => {
    let nextRows = [...rows];
    for (const filter of filters) {
      nextRows = nextRows.filter(filter);
    }

    if (orderBy) {
      nextRows = [...nextRows].sort((a, b) => {
        const av = a[orderBy.field];
        const bv = b[orderBy.field];
        if (av === bv) return 0;
        const result = av > bv ? 1 : -1;
        return orderBy.ascending ? result : -result;
      });
    }

    if (limit !== null) {
      nextRows = nextRows.slice(0, limit);
    }

    return nextRows;
  };

  const query: any = {
    select: () => query,
    eq: (field: string, value: unknown) => {
      filters.push((row) => row[field] === value);
      return query;
    },
    order: (field: string, options?: { ascending?: boolean }) => {
      orderBy = { field, ascending: options?.ascending ?? true };
      return query;
    },
    limit: (count: number) => {
      limit = count;
      return query;
    },
    maybeSingle: async () => {
      const result = applyFilters();
      return { data: result[0] ?? null, error: null };
    },
    single: async () => {
      const result = applyFilters();
      if (!result[0]) {
        return { data: null, error: { message: 'No matching record found' } };
      }
      return { data: result[0], error: null };
    },
    insert: async (payload: T | T[]) => {
      const items = Array.isArray(payload) ? payload : [payload];
      const nextRows = [...rows];
      const saved = items.map((item) => {
        const record = {
          ...item,
          id: item.id ?? makeId(),
          created_at: item.created_at ?? new Date().toISOString(),
          updated_at: item.updated_at ?? new Date().toISOString(),
        };
        nextRows.push(record);
        return record;
      });
      setTableRows(table, nextRows);
      return { data: saved.length === 1 ? saved[0] : saved, error: null };
    },
    delete: () => ({
      eq: async (field: string, value: unknown) => {
        const filtered = rows.filter((row) => row[field] !== value);
        setTableRows(table, filtered);
        return { data: null, error: null };
      },
    }),
    update: async (payload: Partial<T>) => {
      const nextRows = rows.map((row) => ({
        ...row,
        ...payload,
        updated_at: new Date().toISOString(),
      }));
      setTableRows(table, nextRows);
      return { data: nextRows, error: null };
    },
    then: (resolve: (value: any) => void) => {
      const result = { data: applyFilters(), error: null };
      resolve(result);
      return result;
    },
  };

  return query;
};

const mockAuth = {
  getSession: async () => {
    const user = storage.read<{ id: string; email: string; user_metadata?: { full_name?: string } } | null>('mock:session', null);
    return { data: { session: user ? { user } : null }, error: null };
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const subscription = {
      unsubscribe: () => undefined,
    };
    return { data: { subscription } };
  },
  signUp: async ({ email, password, options }: any) => {
    const users = storage.read<any[]>('mock:users', []);
    const existing = users.find((user) => user.email === email);
    const user = {
      id: existing?.id ?? makeId(),
      email,
      password,
      user_metadata: {
        full_name: options?.data?.full_name ?? '',
      },
      created_at: new Date().toISOString(),
    };

    if (!existing) {
      users.push(user);
      storage.write('mock:users', users);
    }

    storage.write('mock:session', user);
    return { data: { user }, error: null };
  },
  signInWithPassword: async ({ email, password }: any) => {
    const users = storage.read<any[]>('mock:users', []);
    const user = users.find((entry) => entry.email === email && entry.password === password);
    if (!user) {
      return { data: { user: null }, error: { message: 'Invalid login credentials' } };
    }
    storage.write('mock:session', user);
    return { data: { user }, error: null };
  },
  signOut: async () => {
    storage.write('mock:session', null);
    return { error: null };
  },
};

const mockFrom = (table: string) => {
  const rows = tableRows(table) as Record<string, any>[];
  return buildQuery(table, rows);
};

const mockClient = {
  auth: mockAuth,
  from: mockFrom,
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : (mockClient as any);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
