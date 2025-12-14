import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ResultModal({ open, setOpen, result }) {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                {/* {getJobQualityQuery.isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    Please wait, fetching results...
                  </div>
                ) : ( */}
                  <div className="bg-white dark:bg-audino-navy">
                    {/* Header */}

                    {/* Body */}
                    <div
                      className={`mx-auto flex size-12 items-center justify-center rounded-full ${
                        result.expected_score <= result.score
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {result.expected_score <= result.score ? (
                        <CheckIcon
                          aria-hidden="true"
                          className="size-6 text-green-600"
                        />
                      ) : (
                        <XMarkIcon
                          aria-hidden="true"
                          className="size-6 text-red-600"
                        />
                      )}
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-semibold text-gray-900"
                      >
                        Annotation{" "}
                        {result.score >= result.expected_score
                          ? "Accepted"
                          : "Rejected"}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          <span
                            className={` ${
                              result.expected_score <= result.score
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            <span className="font-semibold">Your Score:</span>{" "}
                            {result.score * 100}%
                          </span>{" "}
                          <br />
                          <span className="font-semibold">
                            Expected Score:
                          </span>{" "}
                          {result.expected_score * 100}% <br />
                          <br />
                        </p>
                      </div>
                    </div>
                  </div>
                {/* )} */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
