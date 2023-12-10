import { Fragment, useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router";
import PrimaryIconButton from "../../components/PrimaryButton/PrimaryIconButton";
import AlertModal from "../../components/Alert/AlertModal";
import { NavLink } from "react-router-dom";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";

import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteTaskApi, fetchTasksApi } from "../../services/task.services";
import { useTasksStore } from "../../zustand-store/tasks";
import TopBar from "../../components/TopBar/TopBar";
import Pagination from "../../components/Pagination/Pagination";
import useUrlQuery from "../../hooks/useUrlQuery";

const pageSize = 10;

export default function TaskPage({
  prevFilter = null,
  isRemoveAppbar = false,
}) {
  const navigate = useNavigate();

  let urlQuery = useUrlQuery();
  const currentPage = parseInt(urlQuery.get("page"));

  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  const [deleteModal, setDeleteModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(
    prevFilter !== null ? [prevFilter] : []
  );
  const [searchValue, setSearchValue] = useState("");

  const tasks_obj = useTasksStore((state) => state.tasks_obj);
  const setTasks = useTasksStore((state) => state.setTasks);

  const getProgressText = (job) => {
    if (job.count) {
      if (job.completed === job.count) return "Completed";
      else if (job.completed) return "In progress";
      else return "Pending";
    } else return "Pending";
  };

  const isTaskEmpty = (task) => {
    // if (task?.size === 0 || task?.size === undefined) return true;
    // else return false;
    return false;
  };

  const getTasksQuery = useQuery({
    queryKey: ["tasks", currentPage, pageSize, appliedFilters, searchValue],
    enabled: true,
    // staleTime: 30000,
    queryFn: () =>
      fetchTasksApi({
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
    onSuccess: (data) => setTasks(data),
  });

  const handleDeleteProject = () => {
    deleteTaskMutation.mutate({ id: currentTaskId });
  };

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTaskApi,
    onMutate: ({ id }) => {
      return { id };
    },
    onSuccess: (data, { id, index }) => {
      setDeleteModal(false);
      setTasks({
        ...tasks_obj,
        results: tasks_obj.results.filter((res) => res.id !== id),
      });
    },
  });

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
            <h1 className="text-3xl font-bold tracking-tight text-gray-700">
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
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
          <TopBar
            onFilter={filterHandler}
            appliedFilters={appliedFilters}
            setSearchValue={setSearchValue}
          >
            <PrimaryIconButton onClick={() => navigate("create")}>
              Add new task
            </PrimaryIconButton>
          </TopBar>

          {/* list of tasks */}
          <ul className="divide-y divide-gray-100 mt-2">
            {getTasksQuery.isLoading || getTasksQuery.isRefetching
              ? [...Array(8).keys()].map((val) => (
                  <div
                    key={`taskloading-${val}`}
                    className="h-16 bg-gray-200 rounded-md w-full mb-2.5 mt-4 animate-pulse"
                  ></div>
                ))
              : tasks_obj.results.map((task, index) => (
                  <li
                    key={task.id}
                    className={classNames(
                      "flex flex-wrap items-center justify-between gap-x-6 py-5 sm:flex-nowrap",
                      isTaskEmpty(task) ? "opacity-50" : ""
                    )}
                  >
                    <div>
                      <div className="flex items-start gap-x-3">
                        <p className="text-sm font-medium leading-6 text-gray-900">
                          {/* <NavLink
                            to={`/annotate/${task.id}`}
                            className="hover:underline"
                          > */}
                          <span className="text-gray-500">#{task.id}:</span>{" "}
                          {task.name}
                          {/* </NavLink> */}
                        </p>
                        <p
                          className={classNames(
                            statuses[task.subset],
                            "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                          )}
                        >
                          {task.subset}
                        </p>
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
                          {dayjs(task.created_at).format("Do MMMM YYYY")}
                        </p>
                      </div>
                      <div className="flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                        <p>
                          Last updated{" "}
                          <time dateTime={task.updated_date}>
                            {dayjs(task.updated_at).fromNow()}
                          </time>
                        </p>
                        <div className="flex items-center gap-x-1.5">
                          <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-xs leading-5 text-gray-500">
                            {getProgressText(task.jobs)} {task.jobs.completed}{" "}
                            of {task.jobs.count}
                          </p>
                        </div>
                      </div>
                    </div>
                    <dl className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
                      <div className="flex -space-x-0.5">
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
                          {/* dfsdf */}
                        </dd>
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
                                  onClick={() => navigate(`${task.id}`)}
                                  className={classNames(
                                    active ? "bg-gray-50" : "",
                                    "block px-3 py-1 text-sm leading-6 text-gray-900 w-full text-left"
                                  )}
                                >
                                  Edit
                                  <span className="sr-only">, {task.name}</span>
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={classNames(
                                    active ? "bg-red-50" : "",
                                    "block px-3 py-1 text-sm leading-6 text-red-900 w-full text-left"
                                  )}
                                  onClick={() => {
                                    setDeleteModal(true);
                                    setCurrentTaskId(task.id);
                                  }}
                                >
                                  Delete
                                  <span className="sr-only">, {task.name}</span>
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </dl>
                  </li>
                ))}
          </ul>

          {/* pagination */}
          <Pagination
            resultObj={tasks_obj}
            pageSize={pageSize}
            currentPage={currentPage}
            page="tasks"
          />
        </div>
      </main>
      {/* confirmation modal */}
      <AlertModal
        open={deleteModal}
        setOpen={setDeleteModal}
        onSuccess={handleDeleteProject}
        onCancel={() => setDeleteModal(false)}
        text="Are you sure, you want to delete this task?"
        isLoading={deleteTaskMutation.isLoading}
      />
    </>
  );
}

const discussions = [
  {
    id: 1,
    title: "Atque perspiciatis et et aut ut porro voluptatem blanditiis?",
    href: "#",
    author: { name: "Leslie Alexander", href: "#" },
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    status: "Archived",
    totalComments: 24,
    commenters: [
      {
        id: 12,
        name: "Emma Dorsey",
        imageUrl:
          "https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 6,
        name: "Tom Cook",
        imageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 4,
        name: "Lindsay Walton",
        imageUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 16,
        name: "Benjamin Russel",
        imageUrl:
          "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 23,
        name: "Hector Gibbons",
        imageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
  {
    id: 2,
    title: "Et ratione distinctio nesciunt recusandae vel ab?",
    href: "#",
    author: { name: "Michael Foster", href: "#" },
    date: "2d ago",
    dateTime: "2023-01-23T19:20Z",
    status: "Complete",
    totalComments: 6,
    commenters: [
      {
        id: 13,
        name: "Alicia Bell",
        imageUrl:
          "https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 16,
        name: "Benjamin Russel",
        imageUrl:
          "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 3,
        name: "Dries Vincent",
        imageUrl:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
  {
    id: 3,
    title: "Blanditiis perferendis fugiat optio dolor minus ut?",
    href: "#",
    author: { name: "Dries Vincent", href: "#" },
    date: "3d ago",
    dateTime: "2023-01-22T12:59Z",
    status: "Archived",
    totalComments: 22,
    commenters: [
      {
        id: 19,
        name: "Lawrence Hunter",
        imageUrl:
          "https://images.unsplash.com/photo-1513910367299-bce8d8a0ebf6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 21,
        name: "Angela Fisher",
        imageUrl:
          "https://images.unsplash.com/photo-1501031170107-cfd33f0cbdcc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 14,
        name: "Jenny Wilson",
        imageUrl:
          "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 16,
        name: "Benjamin Russel",
        imageUrl:
          "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
  {
    id: 4,
    title: "Voluptatum ducimus voluptatem qui in eum quasi consequatur vel?",
    href: "#",
    author: { name: "Lindsay Walton", href: "#" },
    date: "5d ago",
    dateTime: "2023-01-20T10:04Z",
    status: "In progress",
    totalComments: 8,
    commenters: [
      {
        id: 10,
        name: "Emily Selman",
        imageUrl:
          "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 11,
        name: "Kristin Watson",
        imageUrl:
          "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
  {
    id: 5,
    title: "Perferendis cum qui inventore ut excepturi nostrum occaecati?",
    href: "#",
    author: { name: "Courtney Henry", href: "#" },
    date: "5d ago",
    dateTime: "2023-01-20T20:12Z",
    status: "Complete",
    totalComments: 15,
    commenters: [
      {
        id: 11,
        name: "Kristin Watson",
        imageUrl:
          "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 6,
        name: "Tom Cook",
        imageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 10,
        name: "Emily Selman",
        imageUrl:
          "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 16,
        name: "Benjamin Russel",
        imageUrl:
          "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
];
const statuses = {
  Train: "text-green-700 bg-green-50 ring-green-600/20",
  Validation: "text-yellow-600 bg-yellow-50 ring-yellow-500/10",
  Test: "text-gray-800 bg-gray-50 ring-gray-600/20",
};
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
