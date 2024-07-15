import { useMutation } from "@tanstack/react-query";
import {
  createOrganizationApi,
  updateOrganizationApi,
  deleteOrganizationApi,
} from "../organization.services";

export const useAddOrganizationMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createOrganizationApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};

export const useUpdateOrganizationMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateOrganizationApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};

export const useDeleteOrganizationMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteOrganizationApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};
