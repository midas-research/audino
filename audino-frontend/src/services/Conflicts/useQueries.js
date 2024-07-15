import { useQuery } from "@tanstack/react-query";
import { fetchAnnotationConflicts } from "../quality.services";

export const useGetAnalyticsConflictsData = ({ queryConfig }) => {
    const { queryKey, apiParams, ...restConfig } = queryConfig;
    return useQuery({
        queryKey: ["conflictsList", ...queryKey],
        queryFn: () =>
            fetchAnnotationConflicts(
                apiParams,
            ),
        refetchOnWindowFocus: false,
        ...restConfig,
    });
};


