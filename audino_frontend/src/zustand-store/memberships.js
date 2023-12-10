import { create } from "zustand";

export const useMembershipStore = create((set) => ({
  memberships_obj: { count: 0, next: null, previous: null, results: [] },

  setMemberships: (data) => set((state) => ({ memberships_obj: data })),
}));
