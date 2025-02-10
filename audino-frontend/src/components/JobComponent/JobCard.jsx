import { Menu, Transition, Popover} from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import CustomSelect from "../../components/CustomInput/CustomSelect";
import { toast } from "react-hot-toast";
import { useJobDeleteMutation, useJobUpdateMutation } from "../../services/Jobs/useMutations";
import { useUserQuery } from "../../services/User/useQueries"
import classNames from "../../functions/classNames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useEffect, Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "../Alert/AlertModal";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

export default function JobCard({
  index,
  job,
  isRemoveAppbar,
  refetchAllJobs,
  handleAutoAnnotationClick,
  handleExportAnnotationClick,
}) {

  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);

  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  function getClassname(enumValue) {
    switch (enumValue) {
      case "new":
        return "text-blue-800 bg-blue-50 ring-blue-600/20";
      case "in progress":
        return "text-yellow-800 bg-yellow-50 ring-yellow-600/20";
      case "completed":
        return "text-green-800 bg-green-50 ring-green-600/20";
      case "rejected":
        return "text-gray-800 bg-gray-50 ring-gray-600/20";
      default:
        return "";
    }
  }

  function getAiStatus(enumValue) {
    switch (enumValue) {
      case "not started":
        return "text-blue-800 ";
      case "in progress":
        return "text-yellow-800 ";
      case "completed":
        return "text-green-800 ";
      case "failed":
        return "text-gray-800 ";
      default:
        return "";
    }
  }

  const aiStatusMapping = {
    "not started": "Not started",
    "in progress": "In progress",
    completed: "Completed",
    failed: "Failed",
  };


  const getUsersQuery = useUserQuery({
    queryConfig: {
      queryKey: [],
      apiParams: {
        limit: 10,
        is_active: true,
      },
    },
  });


  const jobUpdateMutation = useJobUpdateMutation({
    mutationConfig: {
      onSuccess: (resData, { data }) => {
        if (data.hasOwnProperty("assignee")) {
          toast.success(`Job assigned to ${resData?.assignee?.username}`);
        } else if (data.hasOwnProperty("stage") && data.hasOwnProperty("state")) {
          toast.success(
            `Job stage updated to ${resData?.stage} and state to ${resData?.state}`
          );
        } else if (data.hasOwnProperty("stage")) {
          toast.success(`Job stage updated to ${resData?.stage}`);
        }

        if (typeof refetchAllJobs === "function") refetchAllJobs();
      },
      onError: (err) => {
        toast.error("Failed to update the job. Please try again.");
      },

    }
  })


  const jobDeleteMutation = useJobDeleteMutation({
    mutationConfig: {
      onSuccess: (data) => {
        console.log("success data", data);
        toast.success(`Job deleted successfully!`);
        if (typeof refetchAllJobs === "function") refetchAllJobs();
      },
      onError: (err) => {
        toast.error("Failed to delete job to user. Please try again.");
      },
    }
  });

  const handleDeleteJob = async (id) => {
    await jobDeleteMutation.mutate(id);
  };

  const handleInputChange = (name, value, index, jobId) => {
    jobUpdateMutation.mutate({
      jobId,
      data: {
        [name]: value,
      },
    });
  };

  const handleFinishRenewJob = (jobId) => {
    jobUpdateMutation.mutate({
      jobId,
      data: {
        stage: job.stage === "acceptance" ? "annotation" : "acceptance",
        state: job.stage === "acceptance" ? "new" : "completed",
      },
    });
  };

  const isJobGroundTruth = job.type === "ground_truth";
  const isJobAnnotation = job.type === "annotation";
  return (
    <li
      key={job.id}
      className={classNames("py-5 grid grid-cols-12 grid-rows-1")}
    >
      <div
        className="col-span-7 hover:cursor-pointer"
        onClick={() => navigate(`/annotate/${job.task_id}/${job.id}`)}
      >
        <div className="flex items-start gap-x-3">
          <p className="text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver">
            <span className="text-gray-500 dark:text-audino-light-silver">Id:</span> #{job.id}
          </p>
          <p
            className={classNames(
              "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
              getClassname(job.state)
            )}
          >
            {job.state}
          </p>
          {isJobGroundTruth ? (
            <p
              className={classNames(
                "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-green-800 bg-green-50 ring-green-600/20"
              )}
            >
              {job.type
                .split("_")
                .filter((x) => x.length > 0)
                .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
                .join(" ")}
            </p>
          ) : null}
        </div>

        {/* <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
        <p>State: {job.state}</p>
      </div> */}
        <div className="flex items-center gap-x-2 text-xs leading-5 text-gray-500">
          <p>
            Audino AI annotation is
            <span
              className={classNames(
                "px-1.5 py-0.5 rounded-md",
                getAiStatus(job.ai_audio_annotation_status)
              )}
            >
              {aiStatusMapping[job.ai_audio_annotation_status]}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-x-2 text-xs leading-5 text-gray-500">
          <p>
            Created on {dayjs(job.created_date).format("Do MMMM YYYY")} & Last
            updated {dayjs(job.updated_date).fromNow()}
          </p>
        </div>
      </div>

      {isRemoveAppbar ? (
    <div className="col-span-4 flex gap-2 justify-center  items-center">
     
      <div className="block lg:hidden">
        <Popover className="relative">
          <Popover.Button className="text-gray-500 mt-1 hover:text-gray-900">
            <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Popover.Panel className="absolute z-10 w-48 origin-top left-1/2 transform -translate-x-1/2 bg-white dark:bg-audino-navy shadow-lg rounded-md ring-1 ring-black dark:ring-audino-light-navy ring-opacity-5 focus:outline-none">
              <div className="p-2">
                <div className="w-full mb-2">
                  <p className="text-xs font-normal leading-5 dark:text-white text-gray-500 mb-1">
                    Assignee:
                  </p>
                  {getUsersQuery.isRefetching || jobUpdateMutation.isLoading ? (
                    <div className="h-8 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full animate-pulse"></div>
                  ) : (
                    <CustomSelect
                      id="assignee"
                      name="assignee"
                      options={(getUsersQuery.data?.results ?? []).map((val) => {
                        return { label: val.username, value: val.id };
                      })}
                      formError={{}}
                      value={job.assignee?.id ?? ""}
                      onChange={(e) =>
                        handleInputChange("assignee", e.target.value, index, job.id)
                      }
                      defaultValue="Select an assignee"
                      className={"!mt-0 !text-xs"}
                    />
                  )}
                </div>
                <div className="w-full">
                  <p className="text-xs font-normal leading-5 dark:text-white text-gray-500 mb-1">
                    Stage:
                  </p>
                  {jobUpdateMutation.isLoading ? (
                    <div className="h-8 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full animate-pulse"></div>
                  ) : (
                    <CustomSelect
                      id="stage"
                      name="stage"
                      options={["annotation", "validation", "acceptance"].map(
                        (val) => {
                          return { label: val, value: val };
                        }
                      )}
                      formError={{}}
                      value={job.stage ?? ""}
                      onChange={(e) =>
                        handleInputChange("stage", e.target.value, index, job.id)
                      }
                      defaultValue="Select a stage"
                      className={"!mt-0 !text-xs"}
                    />
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
      </div>
      
      <div className="hidden lg:flex gap-2 items-center">
        <div className="w-full">
          <p className="text-xs font-normal leading-5 text-gray-500 mb-1">
            Assignee:
          </p>
          {getUsersQuery.isRefetching || jobUpdateMutation.isLoading ? (
            <div className="h-8 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full animate-pulse"></div>
          ) : (
            <CustomSelect
              id="assignee"
              name="assignee"
              options={(getUsersQuery.data?.results ?? []).map((val) => {
                return { label: val.username, value: val.id };
              })}
              formError={{}}
              value={job.assignee?.id ?? ""}
              onChange={(e) =>
                handleInputChange("assignee", e.target.value, index, job.id)
              }
              defaultValue="Select an assignee"
              className={"!mt-0 !text-xs"}
            />
          )}
        </div>
        <div className="w-full">
          <p className="text-xs font-normal leading-5 text-gray-500 mb-1">
            Stage:
          </p>
          {jobUpdateMutation.isLoading ? (
            <div className="h-8 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full animate-pulse"></div>
          ) : (
            <CustomSelect
              id="stage"
              name="stage"
              options={["annotation", "validation", "acceptance"].map(
                (val) => {
                  return { label: val, value: val };
                }
              )}
              formError={{}}
              value={job.stage ?? ""}
              onChange={(e) =>
                handleInputChange("stage", e.target.value, index, job.id)
              }
              defaultValue="Select a stage"
              className={"!mt-0 !text-xs"}
            />
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="col-span-4"></div>
  )}
      <Menu as="div" className="relative flex justify-end">
        <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 dark:text-white dark:hover:text-gray-500 hover:text-gray-900">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md dark:bg-audino-light-navy bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAutoAnnotationClick(job.id);
                  }}
                  disabled={isJobGroundTruth}
                  className={classNames(
                    active ? "bg-gray-50 dark:bg-audino-teal-blue" : "",
                    `block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white w-full text-left disabled:opacity-50 disabled:cursor-not-allowed`
                  )}
                >
                  Automatic annotation
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportAnnotationClick(job.id);
                  }}
                  className={classNames(
                    active ? "bg-gray-50 dark:bg-audino-teal-blue" : "",
                    "block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white w-full text-left"
                  )}
                >
                  Export annotation
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {jobUpdateMutation.isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full animate-pulse"></div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleFinishRenewJob(job.id);
                  }}
                  className={classNames(
                    "hover:bg-gray-50 dark:hover:bg-audino-teal-blue",
                    "block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white w-full text-left"
                  )}
                >
                  {job.stage === "acceptance"
                    ? "Renew the job"
                    : "Finish the job"}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteModal(true);
                    // handleDeleteJob(job.id);
                  }}
                  disabled={isJobAnnotation}
                  className={classNames(
                    active ? "bg-gray-50 dark:bg-audino-teal-blue" : "",
                    `block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white w-full text-left disabled:opacity-50 disabled:cursor-not-allowed`
                  )}
                >
                  Delete
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
      {/* } */}
      <AlertModal
        open={deleteModal}
        setOpen={setDeleteModal}
        onSuccess={() => handleDeleteJob(job.id)}
        onCancel={() => setDeleteModal(false)}
        text="Are you sure, you want to delete this job?"
        isLoading={jobDeleteMutation.isLoading}
      />
    </li>
  );
}
