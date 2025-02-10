import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import CardLoader from "../../../components/loader/cardLoader";
import { useGetAnalyticsConflictsData } from "../../../services/Conflicts/useQueries";
import { useJobs } from "../../../services/Jobs/useQueries";
import { useQualityReport } from "../../../services/Qulaity/useQueries";
import { useGetAllAnnotation } from "../../../services/Annotations/useQueries";
import { useParams } from "react-router-dom";

const types = [
  "mismatching_label",
  "mismatching_transcript",
  "mismatching_attributes",
  "mismatching_extra_parameters",
];

export default function ConflictsList({
  conflicts,
  setConflicts,
  oneTimeApiCallRef,
  handleRegionClick,
  currentAnnotationIndex,
  setGtAnnotations,
  regions,
}) {
  const { id: jobId, taskId } = useParams();
  const [resultsId, setResultsId] = useState("");
  const [groundTruthId, setGroundTruthId] = useState("");
  const queryClient = useQueryClient();

  // Fetch reports data
  const getAnalyticsReportsData = useQualityReport({
    queryConfig: {
      queryKey: [jobId],
      apiParams: {
        job_id: jobId,
        target: "job",
        page_size: 1,
        sort: "-created_date",
      },
      enabled: !oneTimeApiCallRef.current,
      onSuccess: (data) => {
        if (data?.results?.length) {
          const results_id = data?.results[0]?.id;
          setResultsId(results_id);
          // Refetch conflicts data with the new resultsId
          queryClient.invalidateQueries(["conflictsList", results_id]);
        }
      },
    },
  });

  // Fetch conflicts data
  const getAnalyticsConflictsData = useGetAnalyticsConflictsData({
    queryConfig: {
      queryKey: [resultsId], // Including resultsId as part of the query key
      apiParams: resultsId,
      enabled: !oneTimeApiCallRef.current && !!resultsId,
      staleTime: Infinity,
      onSuccess: (data) => {
        setConflicts(data?.results || []);
        // Refetch ground truth data with the new taskId
        queryClient.invalidateQueries(["groundTruthList", taskId]);
      },
    },
  });

  // Fetch ground truth data
  const getGroundTruthId = useJobs({
    queryConfig: {
      queryKey: [taskId], // Including taskId as part of the query key
      apiParams: { task_id: taskId, type: "ground_truth" },
      enabled: !oneTimeApiCallRef.current && !!taskId,
      staleTime: Infinity,
      onSuccess: (data) => {
        const groundTruthId = data?.results[0]?.id;
        setGroundTruthId(groundTruthId);
        // Refetch annotations data with the new groundTruthId
        queryClient.invalidateQueries(["annotationsList", groundTruthId]);
      },
    },
  });

  // Fetch annotations data
  const getAllAnnotationsFromGroundTruthId = useGetAllAnnotation({
    queryConfig: {
      queryKey: [groundTruthId],
      apiParams: {
        id: groundTruthId,
      },
      enabled: !oneTimeApiCallRef.current && !!groundTruthId,
      staleTime: Infinity,
      onSuccess: (data) => {
        setGtAnnotations(data?.shapes || []);
        oneTimeApiCallRef.current = true;
      },
    },
  });

  // Trigger reports data fetching on component mount
  useEffect(() => {
    if (!oneTimeApiCallRef.current) {
      getAnalyticsReportsData.refetch();
    }
  }, []);

  const getAnnotationId = (conflict) => {
    console.log(conflict);
    if (types.includes(conflict?.type)) {
      return conflict?.annotation_ids[1]?.obj_id;
    } else {
      return conflict?.annotation_ids[0]?.obj_id;
    }
  };

  return (
    <div>
      {/* FIX: negative margin & padding to overflow the tooltip */}
      <div className="flex flex-col h-[calc(100vh-180px)] rounded-lg overflow-y-scroll no-scrollbar pr-12 -mr-12 bg-clip-content">
        {getAnalyticsReportsData.isFetching ||
        getAnalyticsConflictsData.isFetching ||
        getGroundTruthId.isFetching ||
        getAllAnnotationsFromGroundTruthId.isFetching ? (
          <CardLoader />
        ) : (
          <>
            {conflicts.length ? (
              <>
                {conflicts.map((conflict, index) => {
                  return (
                    <div
                      key={conflict?.id}
                      onClick={(e) => {
                        handleRegionClick(getAnnotationId(conflict), e);
                      }}
                      className={`flex  border-l-4 flex-col dark:bg-audino-light-navy py-2 my-2 justify-center shadow rounded p-2 
                      ${
                        currentAnnotationIndex >= 0 &&
                        regions[currentAnnotationIndex]?.id ===
                          getAnnotationId(conflict)
                          ? conflict?.severity === "error"
                            ? "border-l-red-700"
                            : "border-l-yellow-800"
                          : "border-l-white dark:border-l-audino-light-navy"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-sm inline-flex items-center gap-2  font-medium leading-6 text-gray-900 dark:text-audino-light-silver">
                          #{conflict?.id}{" "}
                          <div className="p-[3px] bg-black dark:bg-gray-500 rounded-full"></div>{" "}
                          Conflict
                        </dt>

                        <span
                          className={`inline-flex items-center rounded-md ${
                            conflict?.severity === "error"
                              ? "bg-red-50 text-red-700 ring-red-600/10"
                              : "bg-yellow-50 text-yellow-800 ring-yellow-600/10"
                          }  px-2 py-1 text-xs font-medium  ring-1 ring-inset ring-red-600/10`}
                        >
                          {conflict?.severity}
                        </span>
                      </div>
                      <div className="flex   gap-2">
                        <dd className="mt-1 text-sm leading-6 dark:text-gray-400 text-gray-700 sm:col-span-2 sm:mt-0">
                          {conflict?.type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (char) =>
                              char.toUpperCase()
                            )}{" "}
                          (#{getAnnotationId(conflict)})
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="my-2 text-xs text-gray-400 text-center">
                No conflicts found!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
