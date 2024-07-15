import { useMutation } from "@tanstack/react-query";
import {
  deleteJobsApi,
  patchJobApi,
  createJobAnnotationApi,
  patchJobMetaApi,
} from "../../services/job.services";

export const useJobDeleteMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteJobsApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};

export const useJobUpdateMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: patchJobApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};

export const useCreateJobMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createJobAnnotationApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};

export const usePatchJobMetaMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: patchJobMetaApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};
