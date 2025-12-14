import { useQuery } from "@tanstack/react-query";
import { AUDINO_ORG } from "../../constants/constants";
import { fetchGuideApi } from "../guide.services";

export const GUIDES_KEY = "guides";

export const useGetGuide = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [GUIDES_KEY, ...queryKey],
    queryFn: () =>
      fetchGuideApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};


