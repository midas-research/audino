import { useQuery } from "@tanstack/react-query";
import { fetchLabelsApi } from "../project.services";
import { AUDINO_ORG } from "../../constants/constants";

export const LABEL_KEY = "labels";

export const useLabelsQuery = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;
  return useQuery({
    queryKey: [LABEL_KEY,  ...queryKey],
    queryFn: () =>
      fetchLabelsApi({
        params: apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};
