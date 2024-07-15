import { useQuery } from "@tanstack/react-query";
import { fetchAllAnnotationApi } from "../job.services";
import { AUDINO_ORG } from "../../constants/constants";

export const ANNOTATIONS_KEY = "annotations";

export const useGetAllAnnotation = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [ANNOTATIONS_KEY, ...queryKey],
    queryFn: () =>
      fetchAllAnnotationApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};


