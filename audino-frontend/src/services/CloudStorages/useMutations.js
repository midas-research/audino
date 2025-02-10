import { useMutation } from "@tanstack/react-query";
import { deleteCloudStorageApi } from "../cloudstorages.services";

export const useDeleteCloudStorage = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteCloudStorageApi,
    onMutate: ({ id }) => {
      return { id };
    },
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
