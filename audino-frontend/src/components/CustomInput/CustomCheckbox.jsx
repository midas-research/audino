import React from "react";
import Tooltip from "../Tooltip/Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const CustomCheckbox = ({
  name,
  id,
  formError,
  label,
  description,
  value,
  onChange,
  refs = null,
  type,
  onClick = () => {},
  ...restParams
}) => {
  const customTextColor = type === 'DIR' ? "text-audino-primary" : "text-gray-900 dark:text-audino-cloud-gray";
  return (
    <div  onClick={onClick} className="relative flex items-start ring-gray-300 ring-1 dark:ring-audino-charcoal p-2 dark:bg-audino-light-navy rounded-md">
      <div className="flex h-6 items-center">
        <input
          id={id}
          name={name}
          type="checkbox"
          ref={refs}
          className={`h-4 w-4 rounded border-gray-300 dark:bg-audino-cloud-gray dark:text-audino-cloud-gray  text-audino-primary-dark focus:ring-0 focus:ring-offset-0 ${
            formError && formError[name]
              ? "border-red-300 focus:ring-red-500"
              : ""
          }`}
          checked={value}
          onChange={onChange}
          {...restParams}
        />
      </div>
      <div className="ml-3 leading-6 flex justify-between w-full">
        <label htmlFor={id} className={`font-medium ${customTextColor}  text-xs`}>
          {label}
        </label>
        {description && (
          <Tooltip message={description}>
            <InformationCircleIcon className="w-5 h-5 dark:text-audino-cloud-gray" />
          </Tooltip>
        )}
      </div>
      {formError && formError[name] && (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
          {formError[name][0]}
        </p>
      )}
    </div>
  );
};

export default CustomCheckbox;
