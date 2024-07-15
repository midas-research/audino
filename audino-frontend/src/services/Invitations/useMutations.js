import { useMutation } from "@tanstack/react-query";
import {
  createInvitationApi,
  changeInviationStatusApi,
} from "../invitation.services";

export const useCreateInvitationMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createInvitationApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};

export const useAcceptTaskMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: changeInviationStatusApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};

export const useDeclineTaskMutation = ({ mutationConfig }) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: changeInviationStatusApi,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },

    ...restConfig,
  });
};
