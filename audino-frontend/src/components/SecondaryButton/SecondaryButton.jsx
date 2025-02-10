import React from "react";
import Spinner from "../loader/spinner";

export default function SecondaryButton({
  type = "button",
  className = "",
  children,
  onClick,
  loading,
}) {
  return (
    <button
      className={`flex items-center rounded-md bg-white dark:bg-audino-light-navy dark:text-audino-cloud-gray px-3 text-sm font-medium shadow-sm ring-1 ring-inset ${className}`}
      onClick={onClick}
      type={type}
      disabled={loading}
    >
      {loading ? <Spinner className={"!text-audino-primary-dark"} /> : children}
    </button>
  );
}
