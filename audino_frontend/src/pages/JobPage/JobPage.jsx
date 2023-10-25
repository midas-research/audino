import { Fragment, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import TopBar from "../../components/TopBar/TopBar";
import { useNavigate } from "react-router";
import PrimaryIconButton from "../../components/PrimaryButton/PrimaryIconButton";
import { NavLink } from "react-router-dom";
import dayjs from "dayjs";
import Pagination from "../../components/Pagination/Pagination";
import AlertModal from "../../components/Alert/AlertModal";
import { useJobStore } from "../../zustand-store/jobs";
import { useMutation, useQuery } from "@tanstack/react-query";
import useUrlQuery from "../../hooks/useUrlQuery";
import { fetchJobsApi, getAllAnnotationApi } from "../../services/job.services";

import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

const pageSize = 10;

export default function JobPage({ isRemoveAppbar = false, prevFilter = null }) {
  let urlQuery = useUrlQuery();
  const currentPage = parseInt(urlQuery.get("page"));

  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  const [appliedFilters, setAppliedFilters] = useState(
    prevFilter !== null ? [prevFilter] : []
  );
  const [searchValue, setSearchValue] = useState("");

  const jobs_obj = useJobStore((state) => state.jobs_obj);
  const setJobs = useJobStore((state) => state.setJobs);

  const filterHandler = (event) => {
    if (event.target.checked) {
      setAppliedFilters([...appliedFilters, event.target.value]);
    } else {
      setAppliedFilters(
        appliedFilters.filter((filterTag) => filterTag !== event.target.value)
      );
    }
  };

  const getJobsQuery = useQuery({
    queryKey: ["jobs", currentPage, pageSize, appliedFilters, searchValue],
    enabled: true,
    // staleTime: 30000,
    queryFn: () =>
      fetchJobsApi({
        org: "",
        page_size: pageSize,
        page: currentPage,
        searchValue: searchValue,
        ...(appliedFilters.length > 1
          ? {
              filter: JSON.stringify({
                and: appliedFilters.map((filter) => JSON.parse(filter)),
              }),
            }
          : {
              filter: appliedFilters[0],
            }),
      }),
    onSuccess: (data) => setJobs(data),
  });

  const downloadAnnotationMutation = useMutation({
    mutationFn: getAllAnnotationApi,
    onSuccess: (data, { jobId }) => {
      // console.log("downloaded", data);
      // Convert the array to a JSON string
      const jsonData = JSON.stringify(data, null, 2); // The 'null, 2' arguments pretty-print the JSON

      // Create a Blob (Binary Large Object) with the JSON data
      const blob = new Blob([jsonData], { type: "application/json" });

      // Create a download link for the Blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `annotation-data-${jobId}.json`;

      // Append the link to the document and trigger the click event
      document.body.appendChild(a);
      a.click();

      // Clean up by removing the link
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  const handleDownloadAnnotations = (jobId) => {
    downloadAnnotationMutation.mutate({ data: { org: "" }, jobId: jobId });
  };

  return (
    <>
      {isRemoveAppbar ? (
        <header className="py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-700">
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
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
          <TopBar
            onFilter={filterHandler}
            appliedFilters={appliedFilters}
            setSearchValue={setSearchValue}
          ></TopBar>

          {/* list of tasks */}
          <ul className="divide-y divide-gray-100 mt-2">
            {getJobsQuery.isLoading || getJobsQuery.isRefetching
              ? [...Array(8).keys()].map((val) => (
                  <div
                    key={`taskloading-${val}`}
                    className="h-16 bg-gray-200 rounded-md w-full mb-2.5 mt-4 animate-pulse"
                  ></div>
                ))
              : jobs_obj.results.map((job, index) => (
                  <li
                    key={job.id}
                    className={classNames(
                      "flex flex-wrap items-center justify-between gap-x-6 py-5 sm:flex-nowrap"
                    )}
                  >
                    <div>
                      <div className="flex items-start gap-x-3">
                        <p className="text-sm font-medium leading-6 text-gray-900">
                          <NavLink
                            to={`/annotate/${job.id}`}
                            className="hover:underline"
                          >
                            <span className="text-gray-500">Id:</span> #{job.id}
                          </NavLink>
                        </p>
                        <p
                          className={classNames(
                            "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                          )}
                        >
                          {job.task.name}
                        </p>
                      </div>

                      <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                        <p>State: {job.state}</p>
                      </div>
                      <div className="flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                        <p>Stage: {job.stage} </p>
                      </div>
                    </div>
                    <Menu as="div" className="relative flex-none">
                      <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                        <span className="sr-only">Open options</span>
                        <EllipsisVerticalIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDownloadAnnotations(job.id);
                                }}
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "block px-3 py-1 text-sm leading-6 text-gray-900 w-full text-left"
                                )}
                                disabled={downloadAnnotationMutation.isLoading}
                              >
                                {downloadAnnotationMutation.isLoading
                                  ? "Downloading..."
                                  : "Download annotations"}
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </li>
                ))}
          </ul>

          {/* pagination */}
          <Pagination
            resultObj={jobs_obj}
            pageSize={pageSize}
            currentPage={currentPage}
            page="tasks"
          />
        </div>
      </main>
    </>
  );

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
}
