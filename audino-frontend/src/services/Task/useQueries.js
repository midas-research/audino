import { useQuery } from "@tanstack/react-query";
import { fetchTasksApi, fetchTaskApi } from "../task.services";
import { AUDINO_ORG } from "../../constants/constants";

export const TASKS_KEY = "tasks";
export const TASK_KEY = "task";

export const useTasks = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [TASKS_KEY,  ...queryKey],
    queryFn: () =>
      fetchTasksApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

export const useTask = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [TASK_KEY,  ...queryKey],
    queryFn: () => fetchTaskApi(apiParams),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};
