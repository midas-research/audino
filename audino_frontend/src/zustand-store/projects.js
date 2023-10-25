import { create } from 'zustand'

export const useProjectsStore = create((set) => ({
    projects_obj: { count: 0, next: null, previous: null, results: [] },

    setProjects: (data) => set((state) => ({ projects_obj: data })),
}))
