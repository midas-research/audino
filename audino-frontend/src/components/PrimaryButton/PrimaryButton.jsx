// export default function PrimaryButton({ className, children, onClick }) {
//     return <button onClick={onClick} type="button" className={`text-white bg-audino-primary hover:bg-audino-primary-dark font-semibold rounded-md text-sm px-3 py-2 text-center flex items-center ${className}`}>
//         {children}
//     </button>
// }

import React, { useState } from "react";
import Spinner from "../loader/spinner";

const PrimaryButton = ({
  type = "button",
  className = "",
  children,
  onClick,
  loading,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`text-white text-center flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-audino-primary bg-audino-primary dark:bg-audino-gradient hover:bg-audino-primary-dark ${className}`}
      disabled={loading}
    >
      {loading ? (
        <span className='mr-1'><Spinner /></span>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default PrimaryButton;
