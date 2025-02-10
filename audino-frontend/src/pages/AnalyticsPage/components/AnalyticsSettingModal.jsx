import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import CustomInput from "../../../components/CustomInput/CustomInput";
import useSingleFieldValidation from "../../../utils/inputDebounce";
import { analyticsSettingSingleFieldValidation } from "../../../validation/singleValidation";
import { analyticsSettingAllValidation } from "../../../validation/allValidation";
import PrimaryButton from "../../../components/PrimaryButton/PrimaryButton";
import { toast } from "react-hot-toast";
import { useUpdateQualitySettings } from "../../../services/Qulaity/useMutations";
import { useQualityReportSetting } from "../../../services/Qulaity/useQueries";

export default function AnalyticsSettingModal({ open, setOpen, taskId }) {
  const [currentReportSettingId, setCurrentReportSettingId] = useState(null);
  const [formValue, setFormValue] = useState({
    wer_threshold: 0.2,
    cer_threshold: 0.2,
    compare_extra_parameters: true,
    compare_attributes: true,
  });
  const [formError, setFormError] = useState({
    wer_threshold: null,
    cer_threshold: null,
  });

  const handleInputChange = (name, value) => {
    setFormValue((prev) => ({ ...prev, [name]: value }));
    debouncedValidation({ name, value });
  };

  const { debouncedValidation } = useSingleFieldValidation(
    analyticsSettingSingleFieldValidation,
    1000,
    formError,
    setFormError
  );

  const handleSave = (e) => {
    e.preventDefault();
    const { isValid, error } = analyticsSettingAllValidation(formValue);
    if (isValid) {
      updateAnalyticsSettingMutation.mutate({
        params: {
          id: currentReportSettingId,
        },
        data: formValue,
      });
    } else {
      setFormError(error);
    }
  };

  const getQualitySettings = useQualityReportSetting({
    queryConfig: {
      queryKey: [taskId],
      apiParams: {
        task_id: taskId,
      },
      enabled: open,
      onSuccess: (data) => {
        const currentSetting = data?.results[0];
        setCurrentReportSettingId(currentSetting?.id);
        setFormValue({
          wer_threshold: currentSetting?.wer_threshold,
          cer_threshold: currentSetting?.cer_threshold,
          compare_extra_parameters: currentSetting?.compare_extra_parameters,
          compare_attributes: currentSetting?.compare_attributes,
        });
      },
    },
  });

  const updateAnalyticsSettingMutation = useUpdateQualitySettings({
    mutationConfig: {
      onSuccess: (data) => {
        toast.success("Quality settings updated successfully");
        setOpen(false);
      },
    },
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700">
                  <form
                    className="flex h-full flex-col divide-y dark:divide-audino-slate-gray divide-gray-200 dark:bg-audino-navy bg-white shadow-xl"
                    onSubmit={handleSave}
                  >
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-audino-primary-dark px-4 py-6 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            Annotation Quality Settings
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-audino-primary-dark text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        {/* <div className="mt-1">
                          <p className="text-sm text-indigo-300">
                           Update the quality settings
                          </p>
                        </div> */}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y dark:divide-audino-slate-gray divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                htmlFor="project-name"
                                className="block text-sm font-medium leading-6 dark:text-audino-light-gray text-gray-900"
                              >
                                WER threshold
                              </label>
                              <div className="mt-2">
                                <CustomInput
                                  type="number"
                                  name="wer_threshold"
                                  id="wer_threshold"
                                  formError={formError}
                                  placeholder=""
                                  value={formValue.wer_threshold}
                                  step={0.1}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "wer_threshold",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="project-name"
                                className="block text-sm font-medium leading-6 dark:text-audino-light-gray text-gray-900"
                              >
                                CER threshold
                              </label>
                              <div className="mt-2">
                                <CustomInput
                                  type="number"
                                  name="cer_threshold"
                                  id="cer_threshold"
                                  formError={formError}
                                  placeholder=""
                                  step={0.1}
                                  value={formValue.cer_threshold}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "cer_threshold",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="flex items-center">
                              <input
                                id="compare_extra_parameters"
                                name="compare_extra_parameters"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-audino-primary focus:ring-0"
                                checked={formValue.compare_extra_parameters}
                                onChange={(e) => {
                                  setFormValue((prev) => ({
                                    ...prev,
                                    compare_extra_parameters: e.target.checked,
                                  }));
                                }}
                              />
                              <label
                                htmlFor="compare_extra_parameters"
                                className="ml-3 block text-sm leading-6 dark:text-audino-light-gray text-gray-900"
                              >
                                Compare extra parameters
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="compare_attributes"
                                name="compare_attributes"
                                type="checkbox"
                                checked={formValue.compare_attributes}
                                className="h-4 w-4 rounded border-gray-300 text-audino-primary focus:ring-0"
                                onChange={(e) => {
                                  setFormValue((prev) => ({
                                    ...prev,
                                    compare_attributes: e.target.checked,
                                  }));
                                }}
                              />
                              <label
                                htmlFor="compare_attributes"
                                className="ml-3 block text-sm leading-6 dark:text-audino-light-gray text-gray-900"
                              >
                                Compare attributes
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4 gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-white dark:bg-transparent px-3 py-2 text-sm font-semibold text-gray-900 dark:text-audino-light-gray shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-audino-slate-gray hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </button>
                      <PrimaryButton
                        onClick={handleSave}
                        loading={updateAnalyticsSettingMutation.isLoading}
                      >
                        Save
                      </PrimaryButton>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
