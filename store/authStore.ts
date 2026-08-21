import { create } from "zustand";

interface User {
  id: string;
  username: string;
}

interface AuthState {
  authUser: User | null;
  setAuthUser: (user: User | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  authUser: null,

  setAuthUser: (user: User | null) => {
    set({ authUser: user });
  },
}));

export default useAuthStore;
