import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";

export default function KeyShortcutModal({ open, setOpen }) {

  return (
    <Transition show={open}>
      <Dialog className="relative z-50" onClose={setOpen}>
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 w-full ">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:full sm:p-6 ">
                <div>
                  {" "}
                  <div className="px-4 sm:px-0">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">
                      Audino Shortcuts
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                      Here are some shortcuts to help you navigate Audino
                    </p>
                  </div>
                  <div className="grid grid-cols-12 mt-6 border-t border-gray-100">
                    <dl className="divide-y col-span-6 divide-gray-100">
                      <div className="bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Space Bar
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Play/Pause the audio
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Delete Key
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Delete the current annotation
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          ctrl/command + z
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Undo the last action
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          ctrl/command + y
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Redo the last action
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Arrow right
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Forward 10 seconds
                        </dd>
                      </div>
                    </dl>
                    <dl className="divide-y col-span-6 divide-gray-100">
                      <div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          ctrl/command + Arrow right
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Go to next region
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          ctrl/command + Arrow left
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Go to previous region
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Shift + Mousewheel
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Zoom in/out audio wave vertically
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Alt + Mousewheel
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Zoom in/out audio wave horizontally
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-3">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Arrow left
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          Backward 10 seconds
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
