import { Menu, Transition } from "@headlessui/react";
import classNames from "../../../functions/classNames";
import Tooltip from "../../../components/Tooltip/Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function AnalyticsCard({ name, value, tooltip, bottomElement }) {
  return (
    <li className="rounded-xl border border-gray-200 dark:border-none dark:bg-audino-midnight">
      <div className="flex items-center rounded-xl gap-x-4 border-b border-gray-900/5 dark:bg-audino-light-navy bg-gray-50 p-6">
        <div className="h-12 w-12 flex items-center dark:text-audino-light-silver justify-center rounded-lg bg-white dark:bg-audino-navy ring-1 ring-gray-900/10 dark:ring-audino-light-gray">
          {value}
        </div>
        <div className="text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver">
          {name}
        </div>

        {tooltip && (
          <Tooltip message={tooltip} className="ml-auto">
            <InformationCircleIcon className="w-5 h-5 dark:text-audino-light-gray" />
          </Tooltip>
        )}
      </div>
      {bottomElement && (
        <dl className="-my-3 divide-y divide-gray-100 dark:divide-audino-neutral-gray px-6 py-4 text-sm leading-6">
          <div className="flex justify-between dark:text-audino-light-gray gap-x-4 py-3">
            {" "}
            {bottomElement}
          </div>
        </dl>
      )}
    </li>
  );
}
