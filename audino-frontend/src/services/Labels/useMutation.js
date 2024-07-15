import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLabelApi } from "../project.services";
import { LABEL_KEY } from "./useQueries";

const useDeleteLabelMutation = (mutationConfig) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteLabelApi,

    onSuccess: (...args) => {
      queryClient.invalidateQueries(LABEL_KEY);
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

export default useDeleteLabelMutation;
