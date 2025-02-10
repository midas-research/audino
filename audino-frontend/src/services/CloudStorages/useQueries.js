import { useQuery } from "@tanstack/react-query";
import {
  cloudStorageContentApi,
  fetchCloudStoragesApi,
} from "../cloudstorages.services";
import { AUDINO_ORG } from "../../constants/constants";

export const CLOUDSTORAGES_KEY = "cloudstorages";
// export const CLOUDSTORAGES_CONTENT_KEY = "cloudstoragesContent";

export const useGetCloud = ({ queryConfig }) => {
  const { queryKey, apiParams, ...restConfig } = queryConfig;
  const OrgSlug = localStorage.getItem(AUDINO_ORG);
  apiParams.org = OrgSlug;

  return useQuery({
    queryKey: [CLOUDSTORAGES_KEY, ...queryKey],
    queryFn: () =>
      fetchCloudStoragesApi({
        ...apiParams,
      }),
    refetchOnWindowFocus: false,
    ...restConfig,
  });
};

// export const useCloudContent = ({ queryConfig }) => {
//   const { queryKey, apiParams, ...restConfig } = queryConfig;
//   const OrgSlug = localStorage.getItem(AUDINO_ORG);
//   apiParams.org = OrgSlug;

//   return useQuery({
//     queryKey: [CLOUDSTORAGES_CONTENT_KEY, ...queryKey],
//     queryFn: () =>
//       cloudStorageContentApi({
//         ...apiParams,
//       }),
//     refetchOnWindowFocus: false,
//     ...restConfig,
//   });
// };
