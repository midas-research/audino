import { create } from 'zustand'

export const useTasksStore = create((set) => ({
    tasks_obj: { count: 0, next: null, previous: null, results: [] },
    current_task_details: { isDeleteModal: false, isExportModal: false, currentTaskId: null },

    setTasks: (data) => set((state) => ({ tasks_obj: data })),
    setCurrentTask: (data) => set((state) => ({ current_task_details: data }))
}))
