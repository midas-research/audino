import { create } from "zustand";

export const useInvitationStore = create((set) => ({
  invitations_obj: { count: 0, next: null, previous: null, results: [] },

  setInvitations: (data) => set((state) => ({ invitations_obj: data })),
}));
