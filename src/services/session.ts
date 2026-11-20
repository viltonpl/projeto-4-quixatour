import { Platform } from 'react-native';

export type UserRole = 'turista' | 'prestador';

export interface Session {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  /** Preenchido quando a conta é de um prestador (guia). */
  guideId?: number;
  guideName?: string;
}

const STORAGE_KEY = 'quixatour.session';

/**
 * Sessão do usuário logado.
 * Na web fica no sessionStorage (cada aba pode ter um usuário diferente:
 * ex. uma aba como turista e outra como prestador). No celular fica em memória.
 */
let current: Session | null = null;

function storage(): Storage | null {
  if (Platform.OS !== 'web') return null;
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export const SessionStore = {
  get(): Session | null {
    if (current) return current;
    try {
      const raw = storage()?.getItem(STORAGE_KEY);
      if (raw) current = JSON.parse(raw);
    } catch {
      // armazenamento indisponível: segue sem sessão
    }
    return current;
  },

  set(session: Session) {
    current = session;
    try {
      storage()?.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignora
    }
  },

  clear() {
    current = null;
    try {
      storage()?.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
  },

  /** guideId do prestador logado (ou null se for turista / sem sessão). */
  guideId(): number | null {
    const s = SessionStore.get();
    return s?.role === 'prestador' && s.guideId ? s.guideId : null;
  },
};
