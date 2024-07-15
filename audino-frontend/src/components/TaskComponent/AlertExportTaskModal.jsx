import React from 'react'
import AlertModal from '../Alert/AlertModal'
import ExportAnnotationModal from '../../pages/JobPage/components/ExportAnnotationModal'
import { useTasksStore } from '../../zustand-store/tasks';
import { useMutation } from '@tanstack/react-query';
import { deleteTaskApi } from '../../services/task.services';
import { useNavigate } from 'react-router-dom';

export default function AlertExportTaskModal({ isBackAfterSuccess }) {
    const navigate = useNavigate();
    const tasks_obj = useTasksStore((state) => state.tasks_obj);
    const setTasks = useTasksStore((state) => state.setTasks);
    const current_task = useTasksStore((state) => state.current_task_details);
    const setCurrentTask = useTasksStore((state) => state.setCurrentTask);
    const handleDeleteProject = () => {
        deleteTaskMutation.mutate({ id: current_task?.currentTaskId });
    };

    // Delete task
    const deleteTaskMutation = useMutation({
        mutationFn: deleteTaskApi,
        onMutate: ({ id }) => {
            return { id };
        },
        onSuccess: (data, { id, index }) => {
            setCurrentTask({ ...current_task, isDeleteModal: false })
            if (isBackAfterSuccess) {
                navigate(-1);
            } else {
                setTasks({
                    ...tasks_obj,
                    results: tasks_obj.results.filter((res) => res.id !== id),
                });
            }
        },
    });
    return (
        <div>
            <AlertModal
                open={current_task?.isDeleteModal}
                setOpen={() => setCurrentTask({ ...current_task, isDeleteModal: false })}
                onSuccess={handleDeleteProject}
                onCancel={() => setCurrentTask({ ...current_task, isDeleteModal: false })}
                text="Are you sure, you want to delete this task?"
                isLoading={deleteTaskMutation.isLoading}
            />

            {/* Export annotation modal */}
            <ExportAnnotationModal
                open={current_task?.isExportModal}
                setOpen={() => setCurrentTask({ ...current_task, isExportModal: false })}
                currentId={current_task?.currentTaskId}
                type="tasks"
            />
        </div>
    )
}
