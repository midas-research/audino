import { useQuery } from "@tanstack/react-query";
import { getInvitationApi, getAllInvitationApi } from "../invitation.services";
import { AUDINO_ORG } from "../../constants/constants";

export const INVITATION_KEY = "invitation";
export const INVITATIONS_KEY = "invitations";

export const useGetInvitation = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [INVITATION_KEY,  ...queryKey],
    queryFn: () =>
      getInvitationApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

export const useGetAllInvitation = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [INVITATIONS_KEY,  ...queryKey],
    queryFn: () =>
      getAllInvitationApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};
