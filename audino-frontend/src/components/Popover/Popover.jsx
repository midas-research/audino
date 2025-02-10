import { Popover, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function AudinoPopover({ button, content }) {
  return (
    <Popover className="relative flex">
      <Popover.Button className="focus:outline-none">
        {button ? (
          button
        ) : (
          <InformationCircleIcon
            className="h-5 w-5 flex-shrink-0 stroke-slate-500 group-hover:stroke-slate-700"
            aria-hidden="true"
          />
        )}
      </Popover.Button>

      <Transition
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
        className={"relative z-50"}
      >
        <Popover.Panel className="absolute right-0 mt-5 flex w-screen max-w-max px-4">
          <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white dark:bg-audino-deep-space dark:bg-text-white dark:text-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 px-4 py-2 ">
            {content}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
