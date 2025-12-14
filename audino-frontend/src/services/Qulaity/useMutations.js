import { useMutation } from "@tanstack/react-query";
import { fetchJobQualityReportApi, updateAnalyticsSettingApi } from "../quality.services";

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


export const useGetJobQualityReport = ({ mutationConfig }) => {
    const { onSuccess, ...restConfig } = mutationConfig || {};
  
    return useMutation({
      mutationFn: fetchJobQualityReportApi,
      onSuccess: (...args) => {
        onSuccess?.(...args);
      },
  
      ...restConfig,
    });
  };