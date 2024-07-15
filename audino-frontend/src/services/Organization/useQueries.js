import { useQuery } from "@tanstack/react-query";
import {
  fetchOrganizationApi,
  fetchOrganizationsApi,
} from "../organization.services";
import { AUDINO_ORG } from "../../constants/constants";

export const ORGANIZATION_KEY = "organization";
export const ORGANIZATIONS_KEY = "organizations";

export const useFetchOrganization = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [ORGANIZATION_KEY,  ...queryKey],
    queryFn: () =>
      fetchOrganizationApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

export const useFetchOrganizations = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [ORGANIZATIONS_KEY,  ...queryKey],
    queryFn: () =>
      fetchOrganizationsApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};
