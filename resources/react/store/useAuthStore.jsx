import { create } from "zustand";
import Axios from "../api/Axios";

export const useAuthStore = create((set) => ({
    user: null,

    setUser: (userData) => set({ user: userData }),

    logout: () => set({ user: null }),

    restoreLogin: async () => {
        try {
            const res = await Axios.get("/user");
            set({ user: res.data });
        } catch (error) {
            set({ user: null });
        }
    },
}));
