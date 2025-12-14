import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import CustomSelect from "../../../components/CustomInput/CustomSelect";
import { exportAnnotationSingleFieldValidation } from "../../../validation/singleValidation";
import { useJobStore } from "../../../zustand-store/jobs";
import { toast } from "react-hot-toast";
import { useAutoAnnotationMutation } from "../../../services/Annotations/useMutations";

export default function AutoAnnotateModal({ open, setOpen, currentId }) {
  const cancelButtonRef = useRef(null);
  const [formValue, setFormValue] = useState({
    lang: "ENG",
  });
  const [formError, setFormError] = useState({
    lang: null,
  });

  const jobs_obj = useJobStore((state) => state.jobs_obj);
  const setJobs = useJobStore((state) => state.setJobs);

  const handleInputChange = (name, value) => {
    setFormValue((prev) => ({ ...prev, [name]: value }));

  };



  const autoAnnotationMutation = useAutoAnnotationMutation({
    mutationConfig: {
      onSuccess: (data, { jobId }) => {
        toast.success("Auto annotation started successfully");
        setOpen(false);
      },
      onError: (err, { jobId }) => {
        toast.error("Failed to start auto annotation. Please try again.");
        // change job status to not started
        setJobs({
          ...jobs_obj,
          results: jobs_obj.results.map((job) => {
            if (job.id === jobId) {
              return {
                ...job,
                ai_audio_annotation_status: "not started",
              };
            }
            return job;
          }),
        });
      },
    }
  })

  const handleAutoAnnotation = () => {
    const jobId = currentId;
    autoAnnotationMutation.mutate({ jobId, lang: formValue.lang });

    // change job status to in progress
    setJobs({
      ...jobs_obj,
      results: jobs_obj.results.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            ai_audio_annotation_status: "in progress",
          };
        }
        return job;
      }),
    });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg dark:bg-audino-navy bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white dark:bg-audino-navy">
                  {/* Header */}
                  <div className="bg-gray-50 dark:bg-audino-navy px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between space-x-3">
                      <div className="space-y-1">
                        <Dialog.Title className="text-base font-semibold leading-6 dark:text-audino-light-gray text-gray-900">
                          {`Start auto annotation process of #${currentId}`}
                        </Dialog.Title>
                        <p className="text-sm text-gray-500">
                          Please select the language of the audio file.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-6 sm:px-6">
                    <div className="mb-4">
                      <label
                        htmlFor="lang"
                        className="block text-sm font-medium leading-6 dark:text-audino-light-gray text-gray-900"
                      >
                        Language <span className="text-red-600 dark:text-audino-primary">*</span>
                      </label>
                      <CustomSelect
                        id="lang"
                        name="lang"
                        options={[
                          { label: "English", value: "ENG" },
                          { label: "Hindi", value: "HIN" },
                          { label: "Arabic", value: "ARA" },
                          { label: "General", value: "UNKNOWN"}
                        ]}
                        formError={formError}
                        value={formValue.lang}
                        onChange={(e) =>
                          handleInputChange("lang", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-audino-navy px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md dark:bg-audino-gradient bg-audino-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                    onClick={handleAutoAnnotation}
                    disabled={autoAnnotationMutation.isLoading}
                  >
                    {autoAnnotationMutation.isLoading ? "Starting..." : "Start"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md dark:bg-transparent bg-white px-3 py-2 text-sm font-semibold text-gray-900 dark:text-audino-light-gray shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-audino-gray hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
