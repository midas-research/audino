import { create } from "zustand";

export const useCloudStore = create((set) => ({
  cloud_obj: { count: 0, next: null, previous: null, results: [] },
  current_cloud_details: { isDeleteModal: false, currentCloudId: null },

  setCloudStorage: (data) => set((state) => ({ cloud_obj: data })),
  setCurrentCloudStorage: (data) =>
    set((state) => ({ current_cloud_details: data })),
}));
