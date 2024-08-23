import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { loginAllValidation } from "../../validation/allValidation";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "../../store/Actions/loginAction";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import { ReactComponent as EyeCrossIcon } from "../../assets/svgs/cross-eye.svg";
import { ReactComponent as EyeIcon } from "../../assets/svgs/heye.svg";

function LoginPage({}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState({
    email: null,
    password: null,
  });
  const [seePassword, setSeePassword] = useState(false);
  const loginState = useSelector((state) => state.loginReducer);

  const isValidEmail = (input) => {
    var validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (input.match(validRegex)) {
      return true;
    }
    return false;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { isValid, error } = loginAllValidation({
      email: event.target.email.value,
      password: event.target.password.value,
    });
    if (isValid) {
      // console.log(event.target);
      dispatch(
        loginRequest({
          payload: {
            ...(isValidEmail(event.target.email.value)
              ? { email: event.target.email.value }
              : { username: event.target.email.value }),
            password: event.target.password.value,
          },
        })
      );
    }
    setFormError(error);
  };

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   console.log(event.target[0].value);
  //   console.log(event.target.elements.email.value);
  // };

  useEffect(() => {
    if (loginState.audinoKey) {
      navigate("/");
    }
  }, [loginState.audinoKey]);

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
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email or Username
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className={`block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ${
                      formError && formError["email"]
                        ? "ring-red-300 placeholder:text-red-300 focus:ring-red-500 text-red-900"
                        : "ring-gray-300 placeholder:text-gray-300 focus:ring-audino-primary text-gray-900 "
                    }  focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none`}
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
                    className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-audino-primary !outline-none sm:text-sm sm:leading-6"
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
                </div>
                {formError && formError["password"]
                  ? formError["password"][0]
                  : ""}
              </div>

              <div className="flex items-center justify-end">
                {/* <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-audino-primary focus:ring-audino-primary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm leading-6 text-gray-900"
                  >
                    Remember me
                  </label>
                </div> */}

                <div className="text-sm leading-6">
                  <NavLink
                    to="/auth/forgot-password"
                    className="font-semibold text-audino-primary hover:text-audino-primary-dark"
                  >
                    Forgot password?
                  </NavLink>
                </div>
              </div>

              <PrimaryButton
                type="submit"
                loading={loginState.isLoginLoading}
                className="w-full"
              >
                Sign in
              </PrimaryButton>
            </form>

            {/* <div>
              <div className="relative mt-10">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-white px-6 text-gray-900">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <NavLink
                  to="/"
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-[#4285f4] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285f4]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-google"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />{" "}
                  </svg>
                  <span className="text-sm font-semibold leading-6">
                    Google
                  </span>
                </NavLink>

                <NavLink
                  to="/"
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold leading-6">
                    GitHub
                  </span>
                </NavLink>
              </div>
            </div> */}
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{" "}
            <NavLink
              to="/signup"
              className="font-semibold leading-6 text-audino-primary hover:text-audino-primary-dark"
            >
              SignUp here
            </NavLink>
          </p>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
