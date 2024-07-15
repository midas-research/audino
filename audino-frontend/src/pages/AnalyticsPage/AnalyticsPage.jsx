import { useParams } from "react-router-dom";
import AppBar from "../../components/AppBar/AppBar";
import PrimaryIconButton from "../../components/PrimaryButton/PrimaryIconButton";
import { ArrowDownTrayIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

import JobCard from "../../components/JobComponent/JobCard";
import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import AnalyticsCard from "./components/AnalyticsCard";
import { percent } from "../../functions/percent";
import AnalyticsSettingModal from "./components/AnalyticsSettingModal";
import { useQualityReport, useQualityReportData } from "../../services/Qulaity/useQueries";

export default function AnalyticsPage() {
  const { id: taskId } = useParams();
  const [analyticsData, setAnalyticsData] = useState([]);
  const [qualitySummary, setQualitySummary] = useState({});
  const [analyticsSettingModal, setAnalyticsSettingModal] = useState(false);

  // fetch analytics data
  const getAnalytics = useQualityReport({
    queryConfig: {
      queryKey: [taskId],
      apiParams: {
        task_id: taskId,
        target: "task",
        page_size: 1,
        sort: "-created_date",
      },
      onSuccess: (data) => {
        const { results } = data;
        setAnalyticsData(results);
      },
    }
  })

  const getAnalyticsData = useQualityReportData({
    queryConfig: {
      queryKey: [taskId],
      apiParams: {
        id: analyticsData?.[0]?.id,
      },
      enabled: false,
      staleTime: Infinity,
      onSuccess: (data) => {
        if (data) {
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          });
          const filename = `quality-report-task_${taskId}_${analyticsData[0].id}.json`;
          saveAs(blob, filename);
        }
      },
    }
  })

  useEffect(() => {
    if (analyticsData.length > 0) {
      const summary = analyticsData[0]?.summary || {};
      setQualitySummary({
        frameCount: summary?.frame_count || 0,
        frameSharePercentage: summary?.frame_share_percentage || 0,
        conflictCount: summary.conflict_count || 0,
        validCount: summary.valid_count || 0,
        dsCount: summary.ds_count || 0,
        gtCount: summary.gt_count || 0,
        accuracy:
          (summary.valid_count /
            (summary.ds_count + summary.gt_count - summary.valid_count)) *
          100 || 0,
        precision: (summary.valid_count / summary.gt_count) * 100 || 0,
        recall: (summary.valid_count / summary.ds_count) * 100 || 0,
        conflictsByType: {
          extraAnnotations: summary.conflicts_by_type?.extra_annotation || 0,
          missingAnnotations:
            summary.conflicts_by_type?.missing_annotation || 0,
          mismatchingLabel: summary.conflicts_by_type?.mismatching_label || 0,
          mismatchingExtraParameters: summary.conflicts_by_type?.mismatching_extra_parameters || 0,
          // lowOverlap: summary.conflicts_by_type?.low_overlap || 0,
          // mismatchingDirection:
          //   summary.conflicts_by_type?.mismatching_direction || 0,
          mismatchingAttributes:
            summary.conflicts_by_type?.mismatching_attributes || 0,
          mismatchingTranscript: summary.conflicts_by_type?.mismatching_transcript || 0,
          // mismatchingGroups: summary.conflicts_by_type?.mismatching_groups || 0,
          // coveredAnnotation: summary.conflicts_by_type?.covered_annotation || 0,
          
        },
        errorCount: summary.error_count || 0,
        warningCount: summary.warning_count || 0,
        wer: summary.word_error_rate || 0,
        cer: summary.character_error_rate || 0,
      });
    }
  }, [analyticsData.length]);

  const isAnalyticsData = analyticsData.length > 0;

  const currentAnalyticsData = analyticsData[0] || {};
 
  return (
    <>
      {" "}
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Analytics for task #{taskId}
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {getAnalytics.isLoading ? (
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
            <p className="text-gray-700">Loading...</p>
          </div>
        ) : isAnalyticsData ? (
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Quality</h2>

              <div className="flex items-start gap-2">
                <PrimaryIconButton
                  onClick={() => {
                    setAnalyticsSettingModal(true);
                  }}
                  icon={
                    <Cog6ToothIcon className="h-6 w-5 text-audino-primary" />
                  }
                ></PrimaryIconButton>
                <div className="flex flex-col-reverse items-end gap-1">
                  <p className="text-xs text-gray-500">
                    Last updated{" "}
                    {dayjs(currentAnalyticsData?.created_date).fromNow()}
                  </p>

                  <PrimaryIconButton
                    onClick={() => getAnalyticsData.refetch()}
                    icon={
                      <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-white" />
                    }
                    isLoading={getAnalyticsData.isFetching}
                    className={"!bg-audino-primary text-white"}
                  >
                    Quality Report
                  </PrimaryIconButton>
                </div>
              </div>
            </div>

            <ul
              role="list"
              className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
            >
              <AnalyticsCard
                name={"Mean Annotation Quality"}
                value={Math.trunc(qualitySummary.accuracy) + "%"}
                tooltip={
                  <div className="text-left">
                    <p className="mb-1">Mean annotation quality consists of:</p>
                    <p>
                      Correct annotations:&nbsp;
                      {qualitySummary?.validCount}
                    </p>
                    <p>
                      Task annotations:&nbsp;
                      {qualitySummary?.dsCount}
                    </p>
                    <p>
                      GT annotations:&nbsp;
                      {qualitySummary?.gtCount}
                    </p>
                    <p>
                      Accuracy:&nbsp;
                      {qualitySummary?.accuracy}
                    </p>
                    <p>
                      Precision:&nbsp;
                      {qualitySummary?.precision}
                    </p>
                    <p>
                      Recall:&nbsp;
                      {qualitySummary?.recall}
                    </p>
                  </div>
                }
                bottomElement={
                  <>
                    <dt className="text-gray-500">
                      Character Error Rate: {qualitySummary?.cer}
                    </dt>
                    <dd className="text-gray-700">
                      Word Error Rate: {qualitySummary?.wer}
                    </dd>
                  </>
                }
              />
              <AnalyticsCard
                name={"GT Conflicts"}
                value={qualitySummary.conflictCount}
                tooltip={
                  <div className="flex text-left">
                    <div className="flex flex-col ">
                      <p className="mb-1">Warnings</p>
                     
                      <p>
                        Mismatching attributes:&nbsp;
                        {qualitySummary?.conflictsByType
                          ?.mismatchingAttributes || 0}
                      </p>
                      <p>
                        Mismatching Extra Parameters:&nbsp;
                        {qualitySummary?.conflictsByType?.mismatchingExtraParameters ||
                          0}
                      </p>
                    </div>

                    <div className="flex flex-col ml-4">
                      <p className="mb-1">Errors</p>
                      <p>
                        Extra annotations:&nbsp;
                        {qualitySummary?.conflictsByType?.extraAnnotations || 0}
                      </p>
                      <p>
                        Missing annotations:&nbsp;
                        {qualitySummary?.conflictsByType?.missingAnnotations ||
                          0}
                      </p>
                      <p>
                        Mismatching label:&nbsp;
                        {qualitySummary?.conflictsByType?.mismatchingLabel || 0}
                      </p>
                      <p>
                        Mismatching transcript:&nbsp;
                        {qualitySummary?.conflictsByType?.mismatchingTranscript || 0}
                      </p>
                    </div>
                  </div>
                }
                bottomElement={
                  <>
                    <dt className="text-gray-500">
                      {" "}
                      Errors: {qualitySummary?.errorCount}
                      {qualitySummary?.errorCount
                        ? ` (${percent(
                          qualitySummary?.errorCount,
                          qualitySummary?.conflictCount
                        )})`
                        : ""}
                    </dt>
                    <dd className="text-gray-700">
                      {" "}
                      Warnings: {qualitySummary?.warningCount}
                      {qualitySummary?.warningCount
                        ? ` (${percent(
                          qualitySummary?.warningCount,
                          qualitySummary?.conflictCount
                        )})`
                        : ""}
                    </dd>
                  </>
                }
              />
              {/* <AnalyticsCard
              name={"Issues"}
              value={qualitySummary.errorCount}
  
              bottomElement={
                <dt className="text-gray-500">
                  Resolved: {qualitySummary?.validCount}
                </dt>
              }
            /> */}
            </ul>

            {/* <div className="border rounded-lg px-6 mt-6">
            <JobCard index="1" job={{}} isRemoveAppbar={true} />
          </div> */}
          </div>
        ) : (
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
            <p className="text-gray-700">No data available</p>
            <p className="text-gray-500 text-sm mt-1">
              {" "}
              Quality reports are not computed unless the GT job is in the&nbsp;
              <strong>completed state</strong>
              &nbsp;and&nbsp;
              <strong>acceptance stage.</strong>
            </p>
          </div>
        )}
      </main>
      {/* setting modal */}
      <AnalyticsSettingModal
        open={analyticsSettingModal}
        setOpen={setAnalyticsSettingModal}
        taskId={taskId}
      />
    </>
  );
}
