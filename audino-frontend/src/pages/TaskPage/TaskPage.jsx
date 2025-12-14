import { useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate } from "react-router";
import PrimaryIconButton from "../../components/PrimaryButton/PrimaryIconButton";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
// import { Menu, Transition } from '@headlessui/react';
// import { Fragment } from 'react';
import dayjs from "dayjs";
import { useTasksStore } from "../../zustand-store/tasks";
import TopBar from "../../components/TopBar/TopBar";
import Pagination from "../../components/Pagination/Pagination";
import useUrlQuery from "../../hooks/useUrlQuery";
import ProgressIndicator from "./components/ProgressIndicator";
import TaskMenu from "../../components/TaskComponent/TaskMenu";
import AlertExportTaskModal from "../../components/TaskComponent/AlertExportTaskModal";
import { useTasks } from "../../services/Task/useQueries";
import { Popover } from "@headlessui/react";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { ReactComponent as NoTaskLogo } from "../../../src/assets/svgs/noTask.svg";
import PrimarButton from "../../components/PrimaryButton/PrimaryButton";
import { ReactComponent as TaskAdd } from "../../assets/svgs/taskAdd.svg";
const pageSize = 10;

export default function TaskPage({
  prevFilter = null,
  isRemoveAppbar = false,
  projectId = null,
}) {
  const navigate = useNavigate();

  let urlQuery = useUrlQuery();
  const currentPage = parseInt(urlQuery.get("page"));

  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);
  const [appliedFilters, setAppliedFilters] = useState(
    prevFilter !== null ? [prevFilter] : []
  );
  const [searchValue, setSearchValue] = useState("");

  const tasks_obj = useTasksStore((state) => state.tasks_obj);
  const setTasks = useTasksStore((state) => state.setTasks);

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
          label: "Owned by me",
          value: '{"and":[{"==":[{"var":"owner"},"<username>"]}]}',
        },
        {
          label: "Not completed",
          value: '{"!":{"and":[{"==":[{"var":"status"},"completed"]}]}}',
        },
      ],
    },
  ];

  const isTaskEmpty = (task) => {
    // if (task?.size === 0 || task?.size === undefined) return true;
    // else return false;
    return false;
  };

  const getTasksQuery = useTasks({
    queryConfig: {
      queryKey: [currentPage, pageSize, appliedFilters, searchValue],
      apiParams: {
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
      },
      enabled: true,
      onSuccess: (data) => setTasks(data),
    },
  });

  // const deleteTaskMutation = use
  const filterHandler = (event) => {
    if (event.target.checked) {
      setAppliedFilters([...appliedFilters, event.target.value]);
    } else {
      setAppliedFilters(
        appliedFilters.filter((filterTag) => filterTag !== event.target.value)
      );
    }
  };
  // console.log("task obj", tasks_obj);
  return (
    <>
      {isRemoveAppbar ? (
        <header className="py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-700 dark:text-white">
              Tasks
            </h1>
          </div>
        </header>
      ) : (
        <AppBar>
          <header className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Tasks
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
            <Popover className="relative">
              <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 dark:bg-audino-gradient bg-audino-primary p-2 rounded-md">
                {/* <PlusCircleIcon className="h-7 w-7 text-audino-primary-dark dark:text-audino-gradient" /> */}
                <TaskAdd className="h-5 w-5" />
              </Popover.Button>

              <Popover.Panel
                transition
                className="absolute bg-white dark:bg-audino-light-navy  left-1/2 z-10  flex w-screen max-w-max xl:-translate-x-1/2 -translate-x-[130px]  px-4 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in rounded-md p-2  flex-col gap-2 shadow-md"
              >
                <PrimarButton
                  onClick={() =>
                    navigate("/tasks/create", {
                      state: { projectId },
                    })
                  }
                >
                  Add new task
                </PrimarButton>
                {/* <PrimarButton
                  onClick={() =>
                    navigate("/tasks/create?multi=true", {
                      state: { projectId },
                    })
                  }
                >
                  Add multiple task
                </PrimarButton> */}
              </Popover.Panel>
            </Popover>
          </TopBar>

          {/* list of tasks */}
          <ul className="divide-y divide-gray-100 dark:divide-audino-gray mt-2">
            {getTasksQuery.isLoading || getTasksQuery.isRefetching ? (
              [...Array(8).keys()].map((val) => (
                <div
                  key={`taskloading-${val}`}
                  className="h-16 bg-gray-200 dark:bg-audino-midnight rounded-md w-full mb-2.5 mt-4 animate-pulse"
                ></div>
              ))
            ) : tasks_obj.results.length === 0 ? (
              <div className="flex flex-col justify-center items-center my-14 text-gray-500 dark:text-white text-sm">
                <NoTaskLogo className="h-24 text-gray-500 dark:text-white" />
                <div className="flex flex-col justify-center items-center text-center">
                  <h2 className="font-bold">No task found...</h2>
                  <p className="dark:text-gray-400">To add a new task</p>
                  <p
                    className="text-audino-primary-dark cursor-pointer"
                    onClick={() =>
                      navigate("/tasks/create", {
                        state: { projectId },
                      })
                    }
                  >
                    add new task
                  </p>
                  {/* <p
                    className="text-audino-primary-dark cursor-pointer"
                    onClick={() =>
                      navigate("/tasks/create?multi=true", {
                        state: { projectId },
                      })
                    }
                  >
                    add multiple task
                  </p> */}
                </div>
              </div>
            ) : (
              tasks_obj.results.map((task, index) => (
                <li
                  key={task.id}
                  className={classNames(
                    "grid grid-cols-12 grid-rows-1 items-center justify-between gap-2 py-5 group",
                    isTaskEmpty(task) ? "opacity-50" : ""
                  )}
                >
                  <div
                    className="hover:cursor-pointer md:col-span-6 lg:col-span-8 col-span-12"
                    onClick={() => navigate(`/tasks/${task.id}?page=1`)}
                  >
                    <div className="flex items-start gap-x-3">
                      <p className="text-sm font-medium leading-6 text-gray-900 dark:text-white group-hover:underline">
                        {/* <NavLink
                          to={`/annotate/${task.id}`}
                          className="hover:underline"
                        > */}
                        <span className="text-gray-500 dark:text-white">
                          #{task.id}:
                        </span>{" "}
                        {task.name}
                        {/* </NavLink> */}
                      </p>
                      {task.subset && (
                        <p
                          className={classNames(
                            statuses[task.subset],
                            "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                          )}
                        >
                          {task.subset}
                        </p>
                      )}
                      {isTaskEmpty(task) ? (
                        <p
                          className={classNames(
                            "mt-0.5 px-1.5 py-0.5 text-xs font-normal text-red-500 "
                          )}
                        >
                          Task are not fully created yet
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                      <p>
                        Created by {task.owner?.username} on{" "}
                        {dayjs(task.created_date).format("Do MMMM YYYY")}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                      <p>
                        Last updated{" "}
                        <time dateTime={task.updated_date}>
                          {dayjs(task.updated_date).fromNow()}
                        </time>
                      </p>
                    </div>
                  </div>
                  <dl className="flex w-full justify-between gap-x-8 sm:w-auto md:col-span-6 lg:col-span-4 col-span-12">
                    <div className="w-full">
                      <>
                        {" "}
                        <div className="flex items-center gap-x-1.5">
                          {task.jobs.completed ? (
                            <>
                              <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </div>
                              <p className="text-xs leading-5 text-gray-500">
                                {/* {getProgressText(task.jobs)} {task.jobs.completed}{" "}
                            of {task.jobs.count} */}
                                {/* {task.jobs.completed ? task.jobs.completed + " done": ""}  */}
                                {task.jobs.completed + " done"}
                              </p>
                            </>
                          ) : null}

                          {task.jobs.validation ? (
                            <>
                              <div className="flex-none rounded-full bg-yellow-500/20 p-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                              </div>
                              <p className="text-xs leading-5 text-gray-500">
                                {task.jobs.validation + " in review"}
                              </p>
                            </>
                          ) : null}
                          <div className="flex-none rounded-full bg-gray-400/20 p-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          </div>
                          <p className="text-xs leading-5 text-gray-500">
                            {task.jobs.count -
                              (task.jobs.completed + task.jobs.validation) +
                              " annotating"}
                          </p>

                          <p className="text-xs leading-5 text-gray-500">
                            {"out of " + task.jobs.count}
                          </p>
                        </div>
                      </>
                      <ProgressIndicator
                        done={task.jobs.completed}
                        inReview={task.jobs.validation}
                        annotating={
                          task.jobs.count -
                          (task.jobs.completed + task.jobs.validation)
                        }
                        total={task.jobs.count}
                      />
                    </div>
                    {/* <div className="flex -space-x-0.5">
                      <dt className="sr-only">Commenters</dt>
                      {discussions[0].commenters.map((commenter) => (
                        <dd key={commenter.id}>
                          <img
                            className="h-6 w-6 rounded-full bg-gray-50 ring-2 ring-white"
                            src={commenter.imageUrl}
                            alt={commenter.name}
                          />
                        </dd>
                      ))}
                    </div>
                    <div className="flex gap-x-2.5">
                      <dt>
                        <span className="sr-only">Total comments</span>
                        <ChatBubbleLeftIcon
                          className="h-6 w-6 text-gray-400"
                          aria-hidden="true"
                        />
                      </dt>
                      <dd className="text-sm leading-6 text-gray-900">
                        {discussions[0].totalComments}
                      </dd>
                    </div> */}
                    <TaskMenu
                      task={task}
                      isShowText={false}
                      isShowEdit={true}
                    />
                  </dl>
                </li>
              ))
            )}
          </ul>
          {/* pagination */}
          {tasks_obj?.results?.length > 0 && (
            <Pagination
              resultObj={tasks_obj}
              pageSize={pageSize}
              currentPage={currentPage}
            />
          )}
        </div>
      </main>
      {/* confirmation modal */}
      <AlertExportTaskModal isBackAfterSuccess={false} />
    </>
  );
}

const statuses = {
  Train: "text-green-700 bg-green-50 ring-green-600/20",
  Validation: "text-yellow-600 bg-yellow-50 ring-yellow-500/10",
  Test: "text-gray-800 bg-gray-50 ring-gray-600/20",
};
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
