import { useMutation } from "@tanstack/react-query";
import {
  deleteMembershipApi,
  updateMembershipApi,
} from "../membership.services";

export const useDeleteMembershipMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteMembershipApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};

export const useUpdateMembershipMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateMembershipApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};
