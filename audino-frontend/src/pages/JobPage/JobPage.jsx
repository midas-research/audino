import { Fragment, useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import TopBar from "../../components/TopBar/TopBar";

import Pagination from "../../components/Pagination/Pagination";
import { useJobStore } from "../../zustand-store/jobs";
import useUrlQuery from "../../hooks/useUrlQuery";

import ExportAnnotationModal from "./components/ExportAnnotationModal";
import AutoAnnotateModal from "./components/AutoAnnotateModal";
import PrimaryIconButton from "../../components/PrimaryButton/PrimaryIconButton";
import JobCard from "../../components/JobComponent/JobCard";
import classNames from "../../functions/classNames";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../../services/Jobs/useQueries";
import { ReactComponent as AddJob } from "../../assets/svgs/addJob.svg";
import { ReactComponent as NoJob } from "../../assets/svgs/noJob.svg";

const pageSize = 10;

export default function JobPage({
  isRemoveAppbar = false,
  prevFilter = null,
  jobId = null,
}) {
  const navigate = useNavigate();
  let urlQuery = useUrlQuery();
  const currentPage = parseInt(urlQuery.get("page"));

  const [appliedFilters, setAppliedFilters] = useState(
    prevFilter !== null ? [prevFilter] : []
  );
  const [searchValue, setSearchValue] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [isAutoAnnoteModalOpen, setIsAutoAnnoteModalOpen] = useState(false);

  const jobs_obj = useJobStore((state) => state.jobs_obj);
  const setJobs = useJobStore((state) => state.setJobs);
  const filters = [
    {
      id: "quick_filter",
      name: "Quick Filter",
      options: [
        {
          label: "Assigned to me",
          value: '{"and":[{"==":[{"var":"assignee"},"<username>"]}]}',
        },
        {
          label: "Not completed",
          value:
            '{"!":{"or":[{"==":[{"var":"state"},"completed"]},{"==":[{"var":"stage"},"acceptance"]}]}}',

          // value: '{"!":{"and":[{"==":[{"var":"status"},"completed"]}]}}',
        },
      ],
    },
  ];

  const filterHandler = (event) => {
    if (event.target.checked) {
      setAppliedFilters([...appliedFilters, event.target.value]);
    } else {
      setAppliedFilters(
        appliedFilters.filter((filterTag) => filterTag !== event.target.value)
      );
    }
  };

  const getJobsQuery = useJobs({
    queryConfig: {
      queryKey: [currentPage, pageSize, appliedFilters, searchValue],
      apiParams: {
        page_size: pageSize,
        page: currentPage,
        search: searchValue,
        ...(appliedFilters.length > 1
          ? {
              filter: JSON.stringify({
                and: appliedFilters.map((filter) => JSON.parse(filter)),
              }),
            }
          : {
              filter: appliedFilters[0],
            }),
      },
      enabled: true,
      onSuccess: (data) => setJobs(data),
    },
  });

  useEffect(() => {
    if (!isExportModalOpen) {
      setCurrentJobId(null);
    }
  }, [isExportModalOpen]);

  const handleAutoAnnotationClick = (jobId) => {
    setCurrentJobId(jobId);
    setIsAutoAnnoteModalOpen(true);
  };

  const handleExportAnnotationClick = (jobId) => {
    setCurrentJobId(jobId);
    setIsExportModalOpen(true);
  };

  return (
    <>
      {isRemoveAppbar ? (
        <header className="py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-700 dark:text-white">
              Jobs
            </h1>
          </div>
        </header>
      ) : (
        <AppBar>
          <header className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Jobs
              </h1>
            </div>
          </header>
        </AppBar>
      )}
      <main
        className={classNames(
          isRemoveAppbar ? "mt-0" : "-mt-32 ",
          "mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
        )}
      >
        <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full">
          <TopBar
            filters={filters}
            onFilter={filterHandler}
            appliedFilters={appliedFilters}
            setSearchValue={setSearchValue}
          >
            {isRemoveAppbar ? (
              <button
                className="p-2 bg-audino-primary dark:bg-audino-gradient rounded-md"
                onClick={() =>
                  navigate(`jobs/create`, {
                    state: { jobId },
                  })
                }
              >
                {/* <span className="  hidden lg:inline">Add new job</span> */}
                <AddJob className="h-5 w-5" />
              </button>
            ) : null}
          </TopBar>

          {/* list of tasks */}
          <ul className="divide-y divide-gray-100 dark:divide-[#434558] mt-2">
            {getJobsQuery.isLoading || getJobsQuery.isRefetching ? (
              [...Array(8).keys()].map((val) => (
                <div
                  key={`taskloading-${val}`}
                  className="h-16 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full mb-2.5 mt-4 animate-pulse"
                ></div>
              ))
            ) : jobs_obj.results.length === 0 ? (
              <div className="flex flex-col justify-center items-center my-14 text-gray-500 dark:text-white text-sm">
                <NoJob className="h-24 text-gray-500 dark:text-white" />
                <div className="flex flex-col justify-center items-center text-center">
                  <h2 className="font-bold">No job found...</h2>
                </div>
              </div>
            ) : (
              jobs_obj.results.map((job, index) => (
                <>
                  {((job.type !== "ground_truth" && !isRemoveAppbar) ||
                    isRemoveAppbar) && (
                    <JobCard
                      index={index}
                      job={job}
                      isRemoveAppbar={isRemoveAppbar}
                      refetchAllJobs={() => getJobsQuery.refetch()}
                      handleAutoAnnotationClick={handleAutoAnnotationClick}
                      handleExportAnnotationClick={handleExportAnnotationClick}
                    />
                  )}
                </>
              ))
            )}
          </ul>
          {/* pagination */}
          {jobs_obj.results.length > 0 && (
            <Pagination
              resultObj={jobs_obj}
              pageSize={pageSize}
              currentPage={currentPage}
            />
          )}

          {/* Export annotation modal */}
          <ExportAnnotationModal
            open={isExportModalOpen}
            setOpen={setIsExportModalOpen}
            currentId={currentJobId}
            type="jobs"
          />

          {/* Autot annotation modal */}
          <AutoAnnotateModal
            open={isAutoAnnoteModalOpen}
            setOpen={setIsAutoAnnoteModalOpen}
            currentId={currentJobId}
          />
        </div>
      </main>
    </>
  );
}
