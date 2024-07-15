import { useMutation } from "@tanstack/react-query";
import { deleteProjectApi } from "../project.services";

export const useDeleteProjects = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteProjectApi,
    onMutate: ({ id }) => {
      return { id };
    },
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
