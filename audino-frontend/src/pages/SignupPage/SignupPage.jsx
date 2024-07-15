import { NavLink, useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { signupAllValidation } from "../../validation/allValidation";
import { signupRequest } from "../../store/Actions/loginAction";
import { ReactComponent as EyeCrossIcon } from "../../assets/svgs/cross-eye.svg";
import { ReactComponent as EyeIcon } from "../../assets/svgs/heye.svg";

function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formError, setFormError] = useState({
    first_name: null,
    username: null,
    email: null,
    password: null,
  });
  const [seePassword, setSeePassword] = useState(false);
  const { isSignupLoading } = useSelector((state) => state.loginReducer);

  const handleSubmit = (event) => {
    event.preventDefault();
    const { first_name, last_name, username, password, email } = event.target;
    const { isValid, error } = signupAllValidation({
      first_name: first_name.value,
      username: username.value,
      email: email.value,
      password: password.value,
    });
    if (isValid) {
      dispatch(
        signupRequest({
          payload: {
            first_name: first_name.value,
            last_name: last_name.value,
            username: username.value,
            email: email.value,
            password1: password.value,
            password2: password.value,
          },
          callback: () => navigate("/login"),
        })
      );
    }
    setFormError(error);
  };

  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-primary-background bg-center bg-no-repeat bg-cover">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-14 w-auto"
            src={require("../../assets/logos/logo.png")}
            alt="Audino"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create a new account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  First Name
                </label>
                <div className="mt-2">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="first_name"
                    required
                    className={`block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ${formError && formError["first_name"]
                        ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                        : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary text-gray-900 "
                      }  focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none`}
                    aria-invalid="true"
                    aria-describedby="first_name-error"
                  />
                  {formError && formError["first_name"] && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                {formError && formError["first_name"] && (
                  <p
                    className="mt-2 text-sm text-red-600"
                    id="first_name-error"
                  >
                    {formError["first_name"][0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Last Name
                </label>
                <div className="mt-2">
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="last_name"
                    className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-audino-primary !outline-none sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={`block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ${formError && formError["username"]
                        ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                        : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary text-gray-900 "
                      }  focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none`}
                    aria-invalid="true"
                    aria-describedby="username-error"
                  />
                  {formError && formError["username"] && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                {formError && formError["username"] && (
                  <p className="mt-2 text-sm text-red-600" id="username-error">
                    {formError["username"][0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ${formError && formError["email"]
                        ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                        : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary text-gray-900 "
                      }  focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none`}
                    placeholder="you@example.com"
                    aria-invalid="true"
                    aria-describedby="email-error"
                  />
                  {formError && formError["email"] && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                {formError && formError["email"] && (
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {formError["email"][0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={seePassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ${formError && formError["password"]
                        ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                        : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary text-gray-900 "
                      }  focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none`}
                    aria-invalid="true"
                    aria-describedby="password-error"
                  />
                  {seePassword ? (
                    <EyeCrossIcon
                      onClick={() => setSeePassword(!seePassword)}
                      title="View"
                      alt="view"
                      className="absolute w-5 h-5 right-[0.5rem] top-[0.45rem] cursor-pointer"
                    />
                  ) : (
                    <EyeIcon
                      fill="#666666"
                      fill-opacity="0.8"
                      onClick={() => setSeePassword(!seePassword)}
                      title="View"
                      alt="view"
                      className="absolute w-5 h-5 right-[0.5rem] top-[0.45rem] cursor-pointer"
                    />
                  )}
                  {formError && formError["password"] && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                {formError && formError["password"] && (
                  <p className="mt-2 text-sm text-red-600" id="password-error">
                    {formError["password"][0]}
                  </p>
                )}
              </div>
              <PrimaryButton
                type="submit"
                loading={isSignupLoading}
                className="w-full"
              >
                Sign up
              </PrimaryButton>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Already a member?{" "}
              <NavLink
                to="/login"
                className="font-semibold leading-6 text-audino-primary hover:text-audino-primary-dark"
              >
                Login here
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignupPage;
