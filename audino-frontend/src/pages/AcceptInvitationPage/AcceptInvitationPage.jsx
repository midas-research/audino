import { NavLink, useLocation } from "react-router-dom";

export default function AcceptInvitationPage() {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const email = queryParams.get("email") || "";
  const key = queryParams.get("key") || "";

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-primary-background bg-center bg-no-repeat bg-cover">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-14 w-auto"
          src={require("../../assets/logos/logo.png")}
          alt="Audino"
        />
        <div className="mt-6 text-center tracking-tight text-gray-900">
          <h2 className="text-2xl leading-9 font-bold">
            You have been invited to join an organization
          </h2>

          <p className="mt-4 text-center text-sm text-gray-500">
            Please{" "}
            <NavLink
              to="/login"
              className="font-semibold leading-6 text-audino-primary hover:text-audino-primary-dark"
            >
              login
            </NavLink>{" "}
            if you already have an account or{" "}
            <NavLink
              to="/signup"
              className="font-semibold leading-6 text-audino-primary hover:text-audino-primary-dark"
            >
              register
            </NavLink>{" "}
            if you don't have an account.
          </p>
        </div>
      </div>
    </div>
  );
}
