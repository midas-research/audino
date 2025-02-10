import React, { useState } from "react";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import { toast } from "react-hot-toast";
import { forgotPasswordApi } from "../../services/login.services";

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const isValidEmail = (input) => {
    var validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (input.match(validRegex)) {
      return true;
    }
    return false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    if (isValidEmail(event.target.email.value)) {
      const resData = await forgotPasswordApi({
        email: event.target.email.value,
      });
      if (resData) {
        toast.success(resData.detail);
      }
    } else {
      toast.error("Email not valid, enter a valid Email");
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
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight dark:text-white text-gray-900">
            Reset password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white dark:bg-audino-deep-navy px-6 py-12 shadow  dark:shadow-md dark:shadow-gray-500 sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 dark:text-white text-gray-900"
                >
                  Email
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className={`block w-full dark:bg-audino-midnight rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !focus:outline-none ring-gray-300 dark:ring-audino-charcoal  dark:placeholder:text-audino-silver-gray placeholder:text-gray-300 dark:text-audino-silver-gray focus:ring-audino-primary text-gray-900`}
                    aria-invalid="true"
                    aria-describedby="email-error"
                  />
                </div>
              </div>

              <PrimaryButton type="submit" className="w-full">
                {isLoading ? "Loading..." : "Reset Password"}
              </PrimaryButton>
            </form>
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-200">
          We will send link to your email
        </p>
      </div>
    </>
  );
}

export default ForgotPasswordPage;
