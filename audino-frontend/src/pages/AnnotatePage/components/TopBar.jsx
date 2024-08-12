import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import AppBar from "../../../components/AppBar/AppBar";
import CustomSelect from "../../../components/CustomInput/CustomSelect";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../../components/PrimaryButton/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton/SecondaryButton";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function TopBar({
  isScrolled,
  jobId,
  getJobDetailQuery,
  jobUpdateMutation,
  handleStateChange,
  onSave,
  saveLoading,
}) {
  const navigate = useNavigate();
  
  return (
    <AppBar>
      <header className="py-10">
        <div
          className={` ${
            isScrolled ? "" : " max-w-full lg:px-8  px-4 sm:px-6"
          }`}
        >
          <nav className="flex items-center space-x-4">
            <div
              className="flex items-center mb-2 hover:cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ChevronLeftIcon
                className="h-5 w-5 flex-shrink-0 text-gray-100"
                aria-hidden="true"
              />
              <button className="ml-2 text-sm font-medium text-gray-100 hover:text-gray-50">
                Back
              </button>
            </div>
          </nav>

          <div
            className={`items-center grid grid-cols-12 grid-rows-1 ${
              isScrolled
                ? "fixed w-full lg:px-16 px-4 sm:px-6 pt-6 pb-12 top-0 z-10 bg-audino-primary"
                : ""
            }`}
          >
            <h1 className="text-3xl font-bold tracking-tight text-white col-span-10">
              Annotate #{jobId}
              {getJobDetailQuery.data?.task &&
                `- ${getJobDetailQuery.data?.task.name}`}
            </h1>
            <div className="col-span-2 justify-end gap-2 flex">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-5 text-white">
                  State:
                </p>
                {jobUpdateMutation.isLoading ? (
                  <div className="h-8 bg-gray-200 rounded-md w-full animate-pulse"></div>
                ) : (
                  <CustomSelect
                    id="state"
                    name="state"
                    options={[
                      "new",
                      "in progress",
                      "completed",
                      "rejected",
                    ].map((val) => {
                      return { label: val, value: val };
                    })}
                    formError={{}}
                    value={getJobDetailQuery.data?.state ?? ""}
                    onChange={(e) => handleStateChange("state", e.target.value)}
                    defaultValue="Change job state"
                    className={"!mt-0 !text-xs !ring-audino-primary-dark"}
                  />
                )}
              </div>
              <SecondaryButton
                onClick={() => onSave()}
                loading={saveLoading}
                className="text-audino-primary-dark ring-audino-primary-dark hover:bg-audino-primary-dark hover:text-white"
              >
                Save
              </SecondaryButton>
            </div>
          </div>
        </div>
      </header>
    </AppBar>
  );
}
