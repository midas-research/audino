import { useMutation } from "@tanstack/react-query";
import {
  markAllAsReadApi,
  fetchNotificationsApi,
} from "../../services/notification.services";

export const useCreateFetchMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: fetchNotificationsApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

export const useMarkAllAsReadMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: markAllAsReadApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};
