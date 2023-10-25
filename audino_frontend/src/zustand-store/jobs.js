import { create } from 'zustand'

export const useJobStore = create((set) => ({
    jobs_obj: { count: 0, next: null, previous: null, results: [] },

    setJobs: (data) => set((state) => ({ jobs_obj: data })),
}))
