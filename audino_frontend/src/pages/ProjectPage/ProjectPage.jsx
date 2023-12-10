import { useEffect, useState } from "react";

import {
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate } from "react-router";
import CardLoader from "../../components/loader/cardLoader";
import AlertModal from "../../components/Alert/AlertModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteProjectApi,
  fetchProjectsApi,
} from "../../services/project.services";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { useProjectsStore } from "../../zustand-store/projects";
import useUrlQuery from "../../hooks/useUrlQuery";
import TopBar from "../../components/TopBar/TopBar";
import Pagination from "../../components/Pagination/Pagination";

const pageSize = 11;

export default function ProjectPage() {
  const navigate = useNavigate();

  let urlQuery = useUrlQuery();
  dayjs.extend(relativeTime);

  const [deleteModal, setDeleteModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const currentPage = parseInt(urlQuery.get("page"));

  const projects_obj = useProjectsStore((state) => state.projects_obj);
  const setProjects = useProjectsStore((state) => state.setProjects);

  const getProjectsQuery = useQuery({
    queryKey: ["projects", currentPage, pageSize, appliedFilters, searchValue],
    enabled: true,
    staleTime: 30000,
    queryFn: () =>
      fetchProjectsApi({
        org: "",
        page: currentPage,
        page_size: pageSize,
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
    onSuccess: (data) => setProjects(data),
  });

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate({ id: currentProjectId });
  };

  // Delete projects
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectApi,
    onMutate: ({ id }) => {
      return { id };
    },
    onSuccess: (data, { id, index }) => {
      setDeleteModal(false);
      setProjects({
        ...projects_obj,
        results: projects_obj.results.filter((res) => res.id !== id),
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

  console.log(searchValue);
  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Projects
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
          <TopBar
            onFilter={filterHandler}
            appliedFilters={appliedFilters}
            setSearchValue={setSearchValue}
          />

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {/* new project  */}
            <li
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow cursor-pointer py-8 sm:py-0"
              onClick={() => navigate("create")}
            >
              <div className="text-center flex justify-center items-center flex-col h-full p-6">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>

                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new project.
                </p>
              </div>
            </li>
            {getProjectsQuery.isLoading || getProjectsQuery.isRefetching
              ? [...Array(5).keys()].map((load) => (
                  <li
                    className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow cursor-pointer py-8 sm:py-0"
                    onClick={() => navigate("create")}
                    key={`CardLoader-${load}`}
                  >
                    <CardLoader />
                  </li>
                ))
              : projects_obj.results.map((project) => (
                  <li
                    key={project.id}
                    className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
                  >
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="truncate text-md font-medium text-gray-900">
                            {project.name}
                          </h3>
                          <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {project.status}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-sm text-gray-500">
                          Created by {project.owner?.username}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          Last updated {dayjs(project.updated_at).fromNow()}
                        </p>
                      </div>
                      {/* <img
                    className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
                    src={project.imageUrl}
                    alt=""
                  /> */}
                    </div>
                    <div className="-mt-px flex divide-x divide-gray-200">
                      {/* <div className="flex w-0 flex-1 items-center justify-center py-4 cursor-pointer  text-gray-400 hover:text-gray-700">
                        <ArrowDownTrayIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </div> */}
                      <div
                        className="flex w-0 flex-1 items-center justify-center py-4 cursor-pointer  text-gray-400 hover:text-gray-700"
                        onClick={() => navigate(`${project.id}?page=1`)}
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div
                        className="flex w-0 flex-1 items-center justify-center py-4 cursor-pointer  text-gray-400 hover:text-gray-700"
                        onClick={() => {
                          setDeleteModal(true);
                          setCurrentProjectId(project.id);
                        }}
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                  </li>
                ))}
          </ul>

          {/* pagination */}
          <Pagination
            resultObj={projects_obj}
            pageSize={pageSize}
            currentPage={currentPage}
            page="projects"
          />
        </div>

        {/* confirmation modal */}
        <AlertModal
          open={deleteModal}
          setOpen={setDeleteModal}
          onSuccess={handleDeleteProject}
          onCancel={() => setDeleteModal(false)}
          text="Are you sure, you want to delete this project?"
          isLoading={deleteProjectMutation.isLoading}
        />
      </main>
    </>
  );
}
