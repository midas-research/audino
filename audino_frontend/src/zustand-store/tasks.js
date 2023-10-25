import { create } from 'zustand'

export const useTasksStore = create((set) => ({
    tasks_obj: { count: 0, next: null, previous: null, results: [] },

    setTasks: (data) => set((state) => ({ tasks_obj: data })),
}))
