import { ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { ADMIN_USER_TYPE } from "../../constants/constants";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate } from "react-router";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import AlertModal from "../../components/Alert/AlertModal";
import TopBar from "../../components/TopBar/TopBar";
import useUrlQuery from "../../hooks/useUrlQuery";
import Pagination from "../../components/Pagination/Pagination";
import { useProjectsStore } from "../../zustand-store/projects";
import useOrganizationStore from "../../zustand-store/organizations";

const pageSize = 11;

const discussions = [
  {
    id: 1,
    author: "Ajit Kumar",
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    slug: "slug_" + Math.ceil(Math.random() * 10000),
    name: "organization1",
    description: "description",
    contact: {
      email: "a@email.com",
      mobileNumber: "9999999999",
      location: "some location",
    },
  },
  {
    id: 2,
    author: "Ajit Kumar",
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    slug: "slug_" + Math.ceil(Math.random() * 10000),
    name: "organization2",
    description: "description",
    contact: {
      email: "a@email.com",
      mobileNumber: "9999999999",
      location: "some location",
    },
  },
  {
    id: Math.ceil(Math.random() * 100),
    author: "Ajit Kumar",
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    slug: "slug_" + Math.ceil(Math.random() * 10000),
    name: "organization3",
    description: "description",
    contact: {
      email: "a@email.com",
      mobileNumber: "9999999999",
      location: "some location",
    },
  },
  {
    id: Math.ceil(Math.random() * 100),
    author: "Ajit Kumar",
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    slug: "slug_" + Math.ceil(Math.random() * 10000),
    name: "organization4",
    description: "description",
    contact: {
      email: "a@email.com",
      mobileNumber: "9999999999",
      location: "some location",
    },
  },
];

export default function OrganizationsPage() {
  const [currentOrg, setCurrentOrg] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const { deleteOrganization } = useOrganizationStore();
  const [deleteId, setDeletId] = useState(null);
  let urlQuery = useUrlQuery();
  const currentPage = parseInt(urlQuery.get("page"));

  const projects_obj = useProjectsStore((state) => state.projects_obj);
  const { audinoUserData } = useSelector((state) => state.loginReducer);
  const org_obj = useOrganizationStore((state) => state.org_obj);
  const organizations = useOrganizationStore((state) => state.org_obj.results);

  // console.log("Zustand store :", organizations);
  const navigate = useNavigate();

  const handleOrgClick = (orgId) => {
    localStorage.setItem("currentOrganization", orgId);
    setCurrentOrg(orgId);
  };
  const handleRemoveOrgClick = () => {
    localStorage.removeItem("currentOrganization");
    setCurrentOrg("");
  };

  const filterHandler = (event) => {
    if (event.target.checked) {
    } else {
    }
  };

  const handleDeleteProject = () => {
    const organizationIdToDelete = deleteId;
    deleteOrganization(organizationIdToDelete);

    setDeleteModal(false);
  };

  useEffect(() => {
    const storedCurrentOrg = parseInt(
      localStorage.getItem("currentOrganization")
    );

    if (storedCurrentOrg) {
      setCurrentOrg(storedCurrentOrg);
    }
  }, []);

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
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
         
          <TopBar
            onFilter={filterHandler}
            appliedFilters={appliedFilters}
            setSearchValue={setSearchValue}
          >
            {/* New org */}
            {audinoUserData.userType === ADMIN_USER_TYPE ? (
              <button
                type="button"
                className="flex items-center gap-x-2 ml-auto rounded-md bg-audino-primary px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-audino-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-audino-primary"
                onClick={() => navigate("create?page=1")}
              >
                Create new org
                <PlusIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
          </TopBar>

          <div className=" border-b-2 border-gray-200 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap">
            <div
              className="flex justify-start items-center gap-10 w-full cursor-pointer"
              onClick={handleRemoveOrgClick}
            >
              <div className="pt-6">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  Personal Workspace
                </p>
                <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                  <p>{audinoUserData.username}</p>
                </div>
              </div>
              {!currentOrg && (
                <span className="inline-flex flex-shrink-0 items-center rounded-full h-5 bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                  Default
                </span>
              )}
            </div>
          </div>

          {/* list of org */}
          <ul className="divide-y divide-gray-100">
            {organizations.map((organization) => (
              <li
                key={organization.id}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap "
              >
                <div
                  className="flex justify-start items-center gap-10 w-full cursor-pointer"
                  onClick={() => handleOrgClick(organization.id)}
                >
                  <div>
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                      {organization.name}
                    </p>
                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                      <p>Ajit singh</p>
                      <svg
                        viewBox="0 0 2 2"
                        className="h-0.5 w-0.5 fill-current"
                      >
                        <circle cx={1} cy={1} r={1} />
                      </svg>
                      <p>
                        <time dateTime="2 days ago">{organization.date}</time>
                      </p>
                    </div>
                  </div>

                  {currentOrg === organization.id && (
                    <span className="inline-flex flex-shrink-0 items-center rounded-full h-5 bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
                  {/* commenters */}
                  <div className="flex -space-x-0.5 items-center">
                    <dt className="sr-only">Commenters</dt>
                  </div>
                  {/* action buttons */}
                  <div className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
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
                                onClick={() =>
                                  navigate(`${organization.id}?page=1`)
                                }
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "block px-3 py-1 text-sm leading-6 text-gray-900 w-full text-left"
                                )}
                              >
                                Settings
                                <span className="sr-only">
                                  {organization.slug}
                                </span>
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
                                  setDeletId(organization.id);
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

          {/* pagination */}
          <Pagination
            resultObj={org_obj}
            pageSize={pageSize}
            currentPage={currentPage}
            page="organizations"
          />
          {console.log(org_obj)}
        </div>

        {/* confirmation modal */}
        <AlertModal
          open={deleteModal}
          setOpen={setDeleteModal}
          onSuccess={handleDeleteProject}
          onCancel={() => setDeleteModal(false)}
          text="Are you sure, you want to delete this project?"
          // isLoading={}
        />
      </main>
    </>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
