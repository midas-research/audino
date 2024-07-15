import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

const CustomInput = ({
  type,
  inputType = "input",
  name,
  id,
  formError,
  placeholder,
  value,
  onChange,
  refs = null,
  min = 0,
  step = 0,
  ...restParams
}) => {
  return (
    <>
      <div className={`relative rounded-md shadow-sm w-full`}>
        {inputType === "input" ? (
          <input
            type={type}
            min={min}
            name={name}
            {...(step ? { step: step } : {})}
            id={id}
            className={`block w-full rounded-md border-0 py-1.5 ring-1 ring-inset ${formError && formError[name]
                ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary text-gray-900"
            }
            ${
              type === "number" && !formError?.[name] ? "" : "pr-10"
            }  focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none`}
            placeholder={placeholder}
            aria-invalid="true"
            aria-describedby={`${name}-error`}
            value={value}
            onChange={(e) => {
              if (type === "number" && e.target.value < 0) {
              } else {
                onChange(e);
              }
            }}
            {...restParams}
          />
        ) : (
          <textarea
            rows={4}
            name={name}
            ref={refs}
            id={id}
            className={`block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ${formError && formError["email"]
                ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary text-gray-900 "
              }  focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none`}
            placeholder={placeholder}
            aria-invalid="true"
            aria-describedby={`${name}-error`}
            value={value}
            onChange={onChange}
            {...restParams}
          />
        )}
        {formError && formError[name] && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {formError && formError[name] && (
        <p className="mt-2 text-sm text-red-600" id="name-error">
          {formError[name][0]}
        </p>
      )}
    </>
  );
};

export default CustomInput;
