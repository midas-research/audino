import { useMutation } from "@tanstack/react-query";
import { updateAnalyticsSettingApi } from "../quality.services";

export const useUpdateQualitySettings = ({ mutationConfig }) => {
    const { onSuccess, ...restConfig } = mutationConfig || {};
  
    return useMutation({
      mutationFn: updateAnalyticsSettingApi,
      onSuccess: (...args) => {
        onSuccess?.(...args);
      },
  
      ...restConfig,
    });
  };