import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import { ReactComponent as EyeCrossIcon } from "../../assets/svgs/cross-eye.svg";
import { ReactComponent as EyeIcon } from "../../assets/svgs/heye.svg";
import { resetPasswordApi } from "../../services/login.services";
import { toast } from "react-hot-toast";

function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const data = {
      uid: uid,
      token: token,
      new_password1: event.target.password.value,
      new_password2: event.target.confirmPassword.value,
    };

    const response = await resetPasswordApi(data);
    if (response) {
      toast.success(response.detail);
      navigate("/login");
    }
    setIsLoading(false);
  };
  return (
    <>
      <div className="flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-primary-background dark:bg-audino-gradient bg-center bg-no-repeat bg-cover">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-14 w-auto"
            src={require("../../assets/logos/logo.png")}
            alt="Audino"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Let's create a new one
          </h2>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white dark:bg-audino-deep-navy px-6 py-12 shadow sm:rounded-lg sm:px-12">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 dark:text-white text-gray-900"
                  >
                    New Password
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="password"
                      name="password"
                      type={seePassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className={`block w-full dark:bg-audino-midnight rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset   focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none ring-gray-300 dark:ring-audino-charcoal placeholder:text-gray-300 dark:placeholder:text-audino-silver-gray focus:ring-audino-primary dark:text-audino-silver-gray text-gray-900`}
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
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium leading-6 dark:text-white text-gray-900"
                  >
                    Confirm New Password
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={seeConfirmPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className={`block w-full dark:bg-audino-midnight rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none ring-gray-300 dark:ring-audino-charcoal placeholder:text-gray-300 dark:placeholder:text-audino-silver-gray focus:ring-audino-primary text-gray-900 dark:text-audino-silver-gray`}
                      aria-invalid="true"
                      aria-describedby="confirmPassword-error"
                    />

                    {seeConfirmPassword ? (
                      <EyeCrossIcon
                        onClick={() =>
                          setSeeConfirmPassword(!seeConfirmPassword)
                        }
                        title="View"
                        alt="view"
                        className="absolute w-5 h-5 right-[0.5rem] top-[0.45rem] cursor-pointer"
                      />
                    ) : (
                      <EyeIcon
                        fill="#666666"
                        fill-opacity="0.8"
                        onClick={() =>
                          setSeeConfirmPassword(!seeConfirmPassword)
                        }
                        title="View"
                        alt="view"
                        className="absolute w-5 h-5 right-[0.5rem] top-[0.45rem] cursor-pointer"
                      />
                    )}
                  </div>
                </div>

                <PrimaryButton type="submit" className="w-full">
                  {isLoading ? "Loading..." : "Reset Password"}
                </PrimaryButton>
              </form>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-300">
           Back to login?{" "}
            <NavLink
              to="/login"
              className="font-semibold leading-6 dark:text-white text-audino-primary hover:text-audino-primary-dark"
            >
              Click here
            </NavLink>
          </p>
      </div>
    </>
  );
}

export default ChangePasswordPage;
