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
        className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6
                ${
                  formError && formError[name]
                    ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                    : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary text-gray-900"
                } ${className}`}
        value={value}
        onChange={onChange}
        multiple={isMultiple}
      >
        <option hidden disabled defaultValue value="">
          {defaultValue}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            label={option.label}
            className="text-gray-700 block px-4 py-2 text-sm"
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
