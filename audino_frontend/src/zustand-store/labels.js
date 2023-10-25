import { create } from 'zustand'

export const useLabelStore = create((set) => ({
    labels_obj: { count: 0, next: null, previous: null, results: [] },

    setLabels: (data) => set((state) => ({ labels_obj: data })),
}))