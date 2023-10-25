import React from "react";
import { NavLink } from "react-router-dom";

function PageNotFound() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 bg-primary-background bg-center bg-no-repeat bg-cover"
      id="error-page"
    >
      <div className="text-center">
        <p className="text-base font-semibold text-audino-primary-dark">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <NavLink
            to="/"
            className="rounded-md bg-audino-primary-dark px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-audino-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-audino-primary-dark"
          >
            Go back home
          </NavLink>
          <NavLink to="/login" className="text-sm font-semibold text-gray-900">
            Login <span aria-hidden="true">&rarr;</span>
          </NavLink>
        </div>
      </div>
    </main>
  );
}

export default PageNotFound;
