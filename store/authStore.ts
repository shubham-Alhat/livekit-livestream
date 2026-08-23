import { create } from "zustand";

interface User {
  id: string;
  username: string;
}

interface AuthState {
  authUser: User | null;
  setAuthUser: (user: User | null) => void;
  livekitToken: null | string;
  setLivekitToken: (value: string | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  setAuthUser: (user: User | null) => {
    set({ authUser: user });
  },
  livekitToken: null,
  setLivekitToken: (value: string | null) => {
    set({ livekitToken: value });
  },
}));

export default useAuthStore;
