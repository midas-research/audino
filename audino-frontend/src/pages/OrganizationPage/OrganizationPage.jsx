import { Cog6ToothIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { AUDINO_ORG } from "../../constants/constants";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate } from "react-router";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import AlertModal from "../../components/Alert/AlertModal";
import TopBar from "../../components/TopBar/TopBar";
import useUrlQuery from "../../hooks/useUrlQuery";
import Pagination from "../../components/Pagination/Pagination";

import { useOrganizationStore } from "../../zustand-store/organizations";
import CardLoader from "../../components/loader/cardLoader";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useFetchOrganizations } from "../../services/Organization/useQueries";
import { useDeleteOrganizationMutation } from "../../services/Organization/useMutations";
import {ReactComponent as AddOrg} from '../../assets/svgs/addOrg.svg';

const pageSize = 11;
const filters = [
  // {
  //   id: "quick_filter",
  //   name: "Quick Filter",
  //   options: [
  //     {
  //       label: "Assigned to me",
  //       value: '{"and":[{"==":[{"var":"assignee"},"<username>"]}]}',
  //     },
  //     {
  //       label: "Not completed",
  //       value: '{"!":{"and":[{"==":[{"var":"status"},"completed"]}]}}',
  //     },
  //   ],
  // },
];

export default function OrganizationsPage() {
  const [currentOrg, setCurrentOrg] = useState(
    localStorage.getItem(AUDINO_ORG)
  );
  const [deleteOrg, setDeleteOrg] = useState("");
  const [deleteOrgId, setdeleteOrgId] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  let urlQuery = useUrlQuery();
  const navigate = useNavigate();
  const currentPage = parseInt(urlQuery.get("page"));

  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  const { audinoUserData } = useSelector((state) => state.loginReducer);

  const setOrganizations = useOrganizationStore((state) => state.setOrgs);
  const organizations = useOrganizationStore((state) => state.orgs_obj);



  const { isLoading } = useFetchOrganizations({
    queryConfig: {
      queryKey: [currentOrg, currentPage, appliedFilters, pageSize, searchValue],
      apiParams: {
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
      },
      onSuccess: (data) => {
        setOrganizations(data);
      },
    }
  })

  // Check if data is available and there are no errors before setting it

  const handleOrgClick = (orgSlug) => {
    localStorage.setItem(AUDINO_ORG, orgSlug);
    toast.success(`Organization updated to ${orgSlug}`);
    setCurrentOrg(orgSlug);
  };
  const handleRemoveOrgClick = () => {
    localStorage.removeItem(AUDINO_ORG);
    toast.success("Organization updated to personal workspace");
    setCurrentOrg("");
  };

  const filterHandler = (event) => {
    if (event.target.checked) {
    } else {
    }
  };

  const handleDeleteProject = () => {
    delteOrgMutation.mutate({ id: deleteOrgId });
  };

  //delete organization mutation
  const delteOrgMutation = useDeleteOrganizationMutation({
    mutationConfig: {
      onSuccess: (data, { id }) => {
        setDeleteModal(false);
        if (deleteOrg === currentOrg) {
          localStorage.removeItem(AUDINO_ORG);
          setCurrentOrg("");
        }
        setOrganizations({
          ...organizations,
          results: organizations.results.filter((res) => res.id !== id),
        });
      },
    }
  })

  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Organizations
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full">
          <TopBar
            filters={filters}
            onFilter={filterHandler}
            appliedFilters={appliedFilters}
            setSearchValue={setSearchValue}
            showFilters={false}
          >
            <button
              type="button"
              className="flex items-center  gap-x-2 ml-auto rounded-md bg-audino-primary dark:bg-audino-gradient px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-audino-primary-dark dark:hover:bg-audino-gradient focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-audino-primary"
              onClick={() => navigate("create")}
            >
               {/* <span className="md:text-xs lg:text-sm hidden md:inline">Create new org</span>
              <PlusIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" title="Create new org" /> */}
              <AddOrg className="h-5 w-5"/>
            </button>
          </TopBar>

          {/* list of org */}
          <ul className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(5).keys()].map((load) => (
                <li
                  className="col-span-1 divide-y divide-gray-200 dark:divide-[#797A7F] rounded-lg bg-white dark:bg-audino-navy  cursor-pointer py-8 sm:py-0"
                  // onClick={() => navigate("create")}
                  key={`CardLoader-${load}`}
                >
                  <CardLoader />
                </li>
              ))
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-[#797A7F]">
                <div className="  flex flex-wrap items-center justify-start md:justify-between gap-x-6 gap-y-2 py-5 pr-5 ">
                  <div
                    className="rounded-lg flex justify-start py-2 items-center gap-10 w-full cursor-pointer"
                    onClick={handleRemoveOrgClick}
                  >
                    <div className="">
                      <p className="text-sm  flex gap-4 items-center font-semibold leading-6 text-gray-900 dark:text-[#E5E7EB]">
                        Personal Workspace
                        {!currentOrg && (
                          <span className="inline-flex flex-shrink-0 items-center rounded-full h-5 bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                            Active
                          </span>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 dark:text-[#A8A4A4] text-gray-500">
                        <p>{audinoUserData.username}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {organizations.results.map((organization) => (
                  <li
                    key={organization.id}
                    className="flex  items-center justify-between gap-x-6 gap-y-4 py-5  "
                  >
                    <div
                      className="flex justify-start items-center gap-10 w-full cursor-pointer"
                      onClick={() => handleOrgClick(organization.slug)}
                    >
                      <div>
                        <p className="text-sm flex items-center font-medium leading-6 dark:text-audino-light-gray text-gray-900">
                          <span className="font-semibold mr-1">
                            {organization.slug}
                          </span>
                          ({organization.name})
                          {currentOrg === organization.slug && (
                            <span className="inline-flex flex-shrink-0 items-center rounded-full h-5 bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 ml-4">
                              Active
                            </span>
                          )}
                        </p>
                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 dark:text-[#9B9B9B] text-gray-500">
                          <p>
                            Created by {organization.owner?.username} on{" "}
                            {dayjs(organization.created_date).format(
                              "Do MMMM YYYY"
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-x-2 text-xs leading-5 dark:text-[#9B9B9B] text-gray-500">
                          <p>
                            Last updated{" "}
                            <time dateTime={organization.updated_date}>
                              {dayjs(organization.updated_date).fromNow()}
                            </time>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-none items-center justify-between gap-x-6 sm:w-auto">
                      {/* Settings icon */}
                      {currentOrg === organization.slug ? (
                        <div
                          className="flex items-center justify-center py-4 cursor-pointer  text-gray-400 hover:text-gray-700"
                          onClick={() => navigate(`${organization.id}?page=1`)}
                        >
                          <Cog6ToothIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>
                      ) : null}
                      {/* action buttons */}
                      <div className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
                        <Menu as="div" className="relative flex-none">
                          <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 dark:hover:text-white hover:text-gray-900">
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
                            <Menu.Items className="absolute  right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white dark:bg-audino-light-navy py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={classNames(
                                      active ? "bg-red-50 dark:bg-audino-teal-blue" : "",
                                      "block px-3 py-1 text-sm leading-6 text-red-900 dark:text-red-200 w-full text-left"
                                    )}
                                    onClick={() => {
                                      setdeleteOrgId(organization.id);
                                      setDeleteOrg(organization.slug);
                                      setDeleteModal(true);
                                    }}
                                  >
                                    Delete
                                    <span className="sr-only">
                                      , {organization.slug}
                                    </span>
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ul>

          {/* pagination */}
          <Pagination
            resultObj={organizations}
            pageSize={pageSize}
            currentPage={currentPage}
            page="organizations"
          />
        </div>

        {/* confirmation modal */}
        <AlertModal
          open={deleteModal}
          setOpen={setDeleteModal}
          onSuccess={handleDeleteProject}
          onCancel={() => setDeleteModal(false)}
          text="Are you sure, you want to delete this project?"
          isLoading={delteOrgMutation.isLoading}
        />
      </main>
    </>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
