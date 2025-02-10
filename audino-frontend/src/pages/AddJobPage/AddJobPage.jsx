import React, { useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import AddTaskPageLoader from "../AddTaskPage/components/AddTaskPageLoader";
import CustomInput from "../../components/CustomInput/CustomInput";
import CustomSelect from "../../components/CustomInput/CustomSelect";
import { createJobAllValidation } from "../../validation/allValidation";
import useSingleFieldValidation from "../../utils/inputDebounce";
import { jobAddSingleFieldValidation } from "../../validation/singleValidation";
import AudinoPopover from "../../components/Popover/Popover";
import { useTask } from '../../services/Task/useQueries';
import { useCreateJobMutation } from "../../services/Jobs/useMutations";

const initialData = {
  type: "ground_truth",
  frame_selection_method: "random_uniform",
  quantity: 0,
  frame_count: 0,
};

const jobTypes = [{ label: "Ground Truth", value: "ground_truth" }];
const frameMethods = [{ label: "Random", value: "random_uniform" }];

export default function AddJobPage() {
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const [formValue, setFormValue] = useState(initialData);
  const [taskData, setTaskdata] = useState(null);
  const [formError, setFormError] = useState({
    type: null,
    frame_selection_method: null,
    quantity: null,
    // frame_count: null,
  });
  const { debouncedValidation: debouncedAddValidation } =
    useSingleFieldValidation(
      jobAddSingleFieldValidation,
      1000,
      formError,
      setFormError
    );

  const { isTaskLoading } = useSelector((state) => state.taskReducer);

  const handleInputChange = async (name, value) => {
    debouncedAddValidation({ name, value });
    if (name === "quantity") {
      if (value >= 100) value = 100;
      const frame_count = Math.floor((taskData?.size / 100) * value);
      setFormValue((prev) => ({ ...prev, quantity: value, frame_count }));
      return;
    } else if (name === "frame_count") {
      const quantity = Math.floor((value / taskData?.size) * 100);
      setFormValue((prev) => ({ ...prev, quantity, frame_count: value }));
      return;
    }
    setFormValue((prev) => ({ ...prev, [name]: value }));
  };


  const getTaskQuery = useTask({
    queryConfig: {
      queryKey: [taskId],
      apiParams: {
        id: taskId,
      },
      enabled: false,
      staleTime: Infinity,
      onSuccess: (data) => {
        setTaskdata(data);
      },
    }
  });
  useEffect(() => {
    if (taskId) getTaskQuery.refetch();
    else setFormValue(initialData);
  }, [taskId]);

  const handleSave = () => {
    const { isValid, error } = createJobAllValidation(formValue);
    if (isValid) {
      createJobMutation.mutate({ ...formValue, task_id: taskId });
    } else {
      setFormError(error);
    }
  };



  const createJobMutation = useCreateJobMutation({
    mutationConfig: {
      onSuccess: (data) => {
        navigate(-1);
      },
    },
  })

  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Create a new job
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {isTaskLoading ? (
          <AddTaskPageLoader />
        ) : (
          <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full ">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 dark:text-white text-gray-900 mb-2"
              >
                Job type <span className="text-red-600 dark:text-audino-primary">*</span>
              </label>

              <CustomSelect
                id="type"
                name="type"
                options={jobTypes}
                formError={formError}
                value={formValue.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 dark:text-white text-gray-900 mb-2"
              >
                Frame selection method <span className="text-red-600 dark:text-audino-primary">*</span>
              </label>
              <CustomSelect
                id="frame_selection_method"
                name="frame_selection_method"
                options={frameMethods}
                formError={formError}
                value={formValue.frame_selection_method}
                onChange={(e) =>
                  handleInputChange("frame_selection_method", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-12 gap-x-3">
              <div className="mb-4 col-span-12">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="mobileNumber"
                    className="block text-sm font-medium leading-6 dark:text-white text-gray-900 mb-2"
                  >
                    Quantity (%)<span className="text-red-600 dark:text-audino-primary">*</span>
                  </label>
                  <AudinoPopover
                    content={
                      "5-15% of the total frames are recommended for the job."
                    }
                  />
                </div>

                <CustomInput
                  type="number"
                  name="quantity"
                  id="quantity"
                  formError={formError}
                  value={formValue.quantity}
                  placeholder="Enter Quantity"
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                />
              </div>
              {/* <div className="mb-4 col-span-6">
                <label
                  htmlFor="frame_count"
                  className="block text-sm font-medium leading-6 text-gray-900 mb-2"
                >
                  Frame count<span className="text-red-600">*</span>
                </label>

                <CustomInput
                  type="number"
                  name="frame_count"
                  id="frame_count"
                  formError={formError}
                  value={formValue?.frame_count}
                  placeholder="Frame count"
                  onChange={(e) =>
                    handleInputChange("frame_count", e.target.value)
                  }
                />
              </div> */}
            </div>
            {/* Action buttons */}
            <div className="flex  justify-end border-t dark:border-audino-charcoal border-gray-200 mt-8 pt-4">
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="rounded-md bg-white dark:bg-transparent px-3 py-2 text-sm font-medium text-gray-900 dark:text-audino-light-gray shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-audino-charcoal hover:bg-gray-50"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleSave}
                  loading={createJobMutation.isLoading}
                >
                  Submit
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
