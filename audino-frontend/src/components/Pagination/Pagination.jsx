import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

export default function Pagination({ currentPage, pageSize, resultObj }) {
  const location = useLocation();

  const totalPages = Math.ceil(resultObj.count / pageSize);

  const PAGE_RANGE_DISPLAYED = 3; // Number of page numbers to display before/after ellipsis
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    let renderedPageNumbers = pageNumbers.map((number) => {
      if (
        number === 1 ||
        number === totalPages ||
        (number >= currentPage - PAGE_RANGE_DISPLAYED &&
          number <= currentPage + PAGE_RANGE_DISPLAYED)
      ) {
        return (
          <NavLink
            key={number}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
              number === currentPage
                ? "bg-audino-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-audino-primary"
                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-audino-teal-blue dark:text-white focus:outline-offset-0"
            }`}
            to={`${location.pathname}?page=${number}`}
          >
            {number}
          </NavLink>
        );
      }
      return null;
    });

    // Add ellipsis for preceding pages
    if (currentPage - PAGE_RANGE_DISPLAYED > 2) {
      renderedPageNumbers = [
        ...renderedPageNumbers.slice(0, 1),
        <p
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${"text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-audino-teal-blue focus:outline-offset-0"}`}
        >
          ...
        </p>,
        ...renderedPageNumbers.slice(
          currentPage - PAGE_RANGE_DISPLAYED - 1,
          currentPage - 1
        ),
        ...renderedPageNumbers.slice(currentPage - 1),
      ];
    }

    // Add ellipsis for succeeding pages
    if (currentPage + PAGE_RANGE_DISPLAYED < totalPages - 1) {
      renderedPageNumbers = [
        ...renderedPageNumbers.slice(0, currentPage),
        ...renderedPageNumbers.slice(currentPage, currentPage + 1),
        ...renderedPageNumbers.slice(
          currentPage + 1,
          currentPage + PAGE_RANGE_DISPLAYED + 1
        ),
        <p
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${"text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:hover:bg-audino-teal-blue hover:bg-gray-50 focus:outline-offset-0"}`}
        >
          ...
        </p>,
        ...renderedPageNumbers.slice(totalPages - 1),
      ];
    }

    return renderedPageNumbers;
  };

  return (
    <>
      <div className="flex items-center justify-between border-t dark:border-t-audino-slate-gray border-gray-200 dark:bg-audino-navy bg-white px-4 py-3 sm:px-6 mt-8">
        <div className="flex flex-1 justify-between sm:hidden">
          {resultObj.previous && (
            <NavLink
              to={`${location.pathname}?page=${currentPage - 1}`}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:bg-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-audino-teal-blue dark:text-white"
            >
              Previous
            </NavLink>
          )}
          {resultObj.next && (
            <NavLink
              to={`${location.pathname}?page=${currentPage + 1}`}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white dark:bg-transparent px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-audino-teal-blue dark:text-white"
            >
              Next
            </NavLink>
          )}
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, resultObj.count)}
              </span>{" "}
              of <span className="font-medium">{resultObj.count}</span> results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              {resultObj.previous && (
                <NavLink
                  to={`${location.pathname}?page=${currentPage - 1}`}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-audino-teal-blue focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </NavLink>
              )}

              {renderPageNumbers()}

              {resultObj.next && (
                <NavLink
                  to={`${location.pathname}?page=${currentPage + 1}`}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-audino-teal-blue   focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </NavLink>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
