import { create } from "zustand";

export const useOrganizationStore = create((set) => ({
  orgs_obj: { count: 0, next: null, previous: null, results: [] },

  setOrgs: (data) => set((state) => ({ orgs_obj: data })),
}));
