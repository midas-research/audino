import { create } from "zustand";

export const useNotificationsStore = create((set) => ({
  notifications_obj: { count: 0, next: null, previous: null, results: [] },

  setNotifications: (data) => set((state) => ({ notifications_obj: data })),
}));
