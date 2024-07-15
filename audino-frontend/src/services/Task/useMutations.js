import { useMutation } from "@tanstack/react-query";
import {
  deleteTaskApi,
  createTaskWithDataApi,
} from "../../services/task.services";

export const useDeleteTasks = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteTaskApi,
    onMutate: ({ id }) => {
      return { id };
    },
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

export const useAddTaskMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createTaskWithDataApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
