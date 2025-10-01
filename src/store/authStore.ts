import { create } from 'zustand';

interface AuthState {
  currentUserId: string | null;
  currentUser: { id: string; name: string; phone: string } | null;
  setCurrentUser: (user: { id: string; name: string; phone: string } | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUserId: null,
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user, currentUserId: user?.id || null }),
  logout: () => set({ currentUser: null, currentUserId: null }),
}));
