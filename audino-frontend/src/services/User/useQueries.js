import { fetchCurrentUserApi, fetchUsersApi } from "../../services/user.services";
import { useQuery } from "@tanstack/react-query";
import { AUDINO_ORG } from "../../constants/constants";

export const USERS_KEY = "users";
export const SELF_USER = "selfUser";

export const useUserQuery = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [USERS_KEY,  ...queryKey],
    queryFn: () =>
      fetchUsersApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

export const useSelfUserQuery = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;

  return useQuery({
    queryKey: [SELF_USER, ...queryKey],
    queryFn: () =>
      fetchCurrentUserApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
}