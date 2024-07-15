import { NavLink } from "react-router-dom";

export default function EmailVerificationFailPage() {
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
            Email Verification Failed
          </h2>
          <h1 className="mt-2">
            This e-mail confirmation link expired or is invalid.
          </h1>
          <p className="mt-2">
            Please issue a new e-mail confirmation request.
          </p>
          <p className="mt-10 text-center text-sm text-gray-500">
            <NavLink
              to="/login"
              className="font-semibold leading-6 text-audino-primary hover:text-audino-primary-dark"
            >
              Go to login page
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
