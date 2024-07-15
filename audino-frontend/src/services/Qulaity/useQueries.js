import { useQuery } from "@tanstack/react-query";
import {
  fetchQualityReport,
  fetchQualityReportData,
  fetchQualityReportSettings,
} from "../quality.services";
import { AUDINO_ORG } from "../../constants/constants";

export const ANALYTICS_KEY = "analytics";
export const ANALYTICS_DATA_KEY = "analyticsData";
export const ANALYTICS_SETTING_KEY = "analyticsSetting";

export const useQualityReport = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [ANALYTICS_KEY, ...queryKey],
    queryFn: () =>
      fetchQualityReport({
        params: apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

export const useQualityReportData = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [ANALYTICS_DATA_KEY, ...queryKey],
    queryFn: () =>
      fetchQualityReportData({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

export const useQualityReportSetting = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [ANALYTICS_SETTING_KEY, ...queryKey],
    queryFn: () =>
      fetchQualityReportSettings({
        params: apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};