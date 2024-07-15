import { useQuery } from "@tanstack/react-query";
import {
  fetchJobsApi,
  fetchJobDetailApi,
  fetchJobMetaDataApi,
} from "../../services/job.services";
import { AUDINO_ORG } from "../../constants/constants";

export const JOB_META_DATA_KEY = "job-meta-data";
export const JOBS_KEY = "jobs";
export const JOB_DETAIL_KEY = "job-detail";

export const useJobs = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [JOBS_KEY,  ...queryKey],
    queryFn: () =>
      fetchJobsApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

export const useJobDetail = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [JOB_DETAIL_KEY, ...queryKey],
    queryFn: () =>
      fetchJobDetailApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

export const useJobMetaData = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [JOB_META_DATA_KEY, ...queryKey],
    queryFn: () =>
      fetchJobMetaDataApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};
