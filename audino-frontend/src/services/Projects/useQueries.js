import { useQuery } from "@tanstack/react-query";
import { fetchProjectsApi } from "../project.services";
import { AUDINO_ORG } from "../../constants/constants";

export const PROJECT_KEY = "projects";

export const useProjects = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [PROJECT_KEY,  ...queryKey],
    queryFn: () =>
      fetchProjectsApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};
