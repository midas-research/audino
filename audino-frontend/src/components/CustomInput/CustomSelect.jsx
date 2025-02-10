import React, { useEffect, useState } from "react";

const CustomSelect = ({
  id,
  name,
  options,
  value,
  onChange,
  formError,
  className,
  isMultiple = false,
  disabled = false,
  defaultValue = "-- select an option --",
}) => {
  //   useEffect(() => {
  //     const fetchOptionsData = async () => {
  //       try {
  //         const response = await fetchOptions();
  //         setOptions(response);
  //       } catch (error) {
  //         console.error('Error fetching options:', error);
  //       }
  //     };

  //     fetchOptionsData();
  //   }, [fetchOptions]);

  return (
    <>
      <select
        id={id}
        name={name}
        className={`mt-2 block w-full rounded-md dark:bg-audino-light-navy border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset dark:ring-audino-charcoal focus:ring-2 text-sm sm:leading-6
                ${
                  formError && formError[name]
                    ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                    : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary dark:placeholder:text-audino-cloud-gray  text-gray-900 dark:text-audino-cloud-gray"
                } ${className}`}
        value={value}
        onChange={onChange}
        multiple={isMultiple}
        disabled={disabled}
      >
        <option hidden disabled defaultValue value="">
          {defaultValue}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            label={option.label}
            className="text-gray-700 dark:text-audino-cloud-gray block px-4 py-2 text-sm"
          >
            {option.label}
          </option>
        ))}
      </select>
      {formError && formError[name] && (
        <p className="mt-2 text-xs text-red-600" id="name-error">
          {formError[name][0]}
        </p>
      )}
    </>
  );
};

export default CustomSelect;
