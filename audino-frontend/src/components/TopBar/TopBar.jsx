import {
  Dialog,
  Disclosure,
  Menu,
  Popover,
  Transition,
} from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { getPredefinedFilter } from "../../utils/getPredefinedFilter";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// const sortOptions = [
//   { name: "Assignee", href: "#" },
//   { name: "Owner", href: "#" },
//   { name: "Status", href: "#" },
// ];

// const filters = [
//   {
//     id: "quick_filter",
//     name: "Quick Filter",
//     options: [
//       {
//         label: "Assigned to me",
//         value: '{"and":[{"==":[{"var":"assignee"},"<username>"]}]}',
//       },
//       {
//         label: "Owned by me",
//         value: '{"and":[{"==":[{"var":"owner"},"<username>"]}]}',
//       },
//       {
//         label: "Not completed",
//         value: '{"!":{"and":[{"==":[{"var":"status"},"completed"]}]}}',
//       },
//     ],
//   },
// ];

export default function TopBar({
  filters,
  onFilter,
  setSearchValue,
  appliedFilters,
  children,
}) {
  const { audinoUserData } = useSelector((state) => state.loginReducer);
  const [open, setOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchValue(searchInputValue);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInputValue]);

  return (
    <>
      {/* Mobile filter dialog */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 sm:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-audino-primary-dark"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4">
                  {filters.map((section) => (
                    <Disclosure
                      as="div"
                      key={section.name}
                      className="border-t border-gray-200 px-4 py-6"
                    >
                      {({ open }) => (
                        <>
                          <h3 className="-mx-2 -my-3 flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
                              <span className="font-medium text-gray-900">
                                {section.name}
                              </span>
                              <span className="ml-6 flex items-center">
                                <ChevronDownIcon
                                  className={classNames(
                                    open ? "-rotate-180" : "rotate-0",
                                    "h-5 w-5 transform"
                                  )}
                                  aria-hidden="true"
                                />
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-6">
                            <div className="space-y-6">
                              {section.options.map((option, optionIdx) => {
                                const filterWithUsername = getPredefinedFilter(
                                  audinoUserData,
                                  option
                                );
                                return (
                                  <div
                                    key={option.value}
                                    className="flex items-center"
                                  >
                                    <input
                                      id={`filter-mobile-${section.id}-${optionIdx}`}
                                      name={`${section.id}[]`}
                                      value={filterWithUsername.value}
                                      checked={appliedFilters?.includes(
                                        filterWithUsername.value
                                      )}
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-audino-primary focus:ring-audino-primary-dark"
                                      onChange={onFilter}
                                    />
                                    <label
                                      htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                      className="ml-3 text-sm text-gray-500"
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="mx-auto text-center">
        <section aria-labelledby="filter-heading" className="">
          <h2 id="filter-heading" className="sr-only">
            project filters
          </h2>

          <div className="flex items-center justify-between">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative text-gray-400 focus-within:text-audino-primary">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  className="block w-full rounded-md border-2 border-gray-300 py-1 pl-10 pr-3 text-gray-900 focus:ring-offset-1 focus:ring-offset-audino-primary focus:border-transparent focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Search"
                  type="search"
                  name="search"
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-5">
              {/* <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                        Sort
                        <ChevronDownIcon
                          className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          {sortOptions.map((option) => (
                            <Menu.Item key={option}>
                              {({ active }) => (
                                <a
                                  href={option.href}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm font-medium text-gray-900"
                                  )}
                                >
                                  {option.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu> */}
              <button
                type="button"
                className="inline-flex text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
                onClick={() => setOpen(true)}
              >
                Filters{" "}
                {appliedFilters.length > 0 ? (
                  <span className="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700">
                    {appliedFilters.length}
                  </span>
                ) : null}
              </button>
              <div className="flex gap-5">
                <Popover.Group className="hidden sm:flex sm:items-baseline sm:space-x-8">
                  {filters.map((section, sectionIdx) => (
                    <Popover
                      as="div"
                      key={section.name}
                      id={`desktop-menu-${sectionIdx}`}
                      className="relative inline-block text-left"
                    >
                      <div>
                        <Popover.Button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                          <span>{section.name}</span>
                          {appliedFilters.length > 0 ? (
                            <span className="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700">
                              {appliedFilters.length}
                            </span>
                          ) : null}
                          <ChevronDownIcon
                            className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                        </Popover.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Popover.Panel className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <form className="space-y-4">
                            {section.options.map((option, optionIdx) => {
                              const filterWithUsername = getPredefinedFilter(
                                audinoUserData,
                                option
                              );
                              return (
                                <div
                                  key={option.value}
                                  className="flex items-center"
                                >
                                  <input
                                    id={`filter-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    value={filterWithUsername.value}
                                    checked={appliedFilters?.includes(
                                      filterWithUsername.value
                                    )}
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-audino-primary focus:ring-audino-primary-dark"
                                    onChange={onFilter}
                                  />
                                  <label
                                    htmlFor={`filter-${section.id}-${optionIdx}`}
                                    className="ml-3 whitespace-nowrap pr-6 text-sm font-medium text-gray-900"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              );
                            })}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  ))}
                </Popover.Group>
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
