import { useQuery } from "@tanstack/react-query";
import { getAllMembershipsApi } from "../membership.services";
import { AUDINO_ORG } from "../../constants/constants";

export const MEMBERSHIPS_KEY = "memberships";

export const useGetAllMembership = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [MEMBERSHIPS_KEY,  ...queryKey],
    queryFn: () =>
      getAllMembershipsApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};
