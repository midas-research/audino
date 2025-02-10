import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { saveAs } from "file-saver";
import CustomSelect from "../../../components/CustomInput/CustomSelect";
import { exportAnnotationAllValidation } from "../../../validation/allValidation";
import { exportAnnotationSingleFieldValidation } from "../../../validation/singleValidation";
import { useDownloadAnnotationMutation } from "../../../services/Annotations/useMutations";

export default function ExportAnnotationModal({
  open,
  setOpen,
  currentId,
  type,
}) {
  const cancelButtonRef = useRef(null);
  const [formValue, setFormValue] = useState({
    format: "",
  });
  const [formError, setFormError] = useState({
    format: null,
  });

  const handleInputChange = (name, value) => {
    // check with single field validation
    const { isValid, error } = exportAnnotationSingleFieldValidation({
      key: name,
      value: value,
    });
    if (!isValid) setFormError((prev) => ({ ...prev, [name]: error[name] }));
    else {
      setFormError((prev) => ({ ...prev, [name]: null }));
      setFormValue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const downloadAnnotationMutation = useDownloadAnnotationMutation({
    mutationConfig: {
      onSuccess: (data) => {
        if (data) {
          const blob = new Blob([data], {
            type: "application/zip",
          });
          const filename = `${type}-${currentId}-${formValue.format}.zip`;
          saveAs(blob, filename);
        }
        setOpen(false);
        setFormValue({
          format: "",
        });
        setFormError({
          format: null,
        });
      },
    },
  });

  const handleDownloadAnnotations = () => {
    const { isValid, error } = exportAnnotationAllValidation(formValue);
    if (isValid) {
      downloadAnnotationMutation.mutate({
        type: type,
        currentId: currentId,
        format: formValue.format,
      });
    } else setFormError(error);
  };

  // console.log("open", open, currentId);

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
                          Export #{currentId} as a dataset{" "}
                        </Dialog.Title>
                        <p className="text-sm text-gray-500">
                          Select a preferred file format to export your {type}{" "}
                          data as a comprehensive dataset.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-4 py-6 sm:px-6">
                    <div className="mb-4">
                      <label
                        htmlFor="format"
                        className="block text-sm font-medium leading-6 dark:text-audino-light-gray text-gray-900"
                      >
                        Export format <span className="text-red-600 dark:text-audino-primary">*</span>
                      </label>
                      <CustomSelect
                        id="format"
                        name="format"
                        options={[
                          { label: "Common Voice", value: "Common Voice" },
                          { label: "Librispeech", value: "Librispeech" },
                          { label: "VoxPopuli", value: "VoxPopuli" },
                          { label: "Ted-Lium", value: "Ted-Lium" },
                          { label: "VoxCeleb", value: "VoxCeleb" },
                          { label: "VCTK Corpus", value: "VCTK_Corpus" },
                          { label: "LibriVox", value: "LibriVox" },
                        ]}
                        formError={formError}
                        value={formValue.format}
                        onChange={(e) =>
                          handleInputChange("format", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-audino-navy px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md dark:bg-audino-gradient bg-audino-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                    onClick={handleDownloadAnnotations}
                    disabled={downloadAnnotationMutation.isLoading}
                  >
                    {downloadAnnotationMutation.isLoading
                      ? "Downloading..."
                      : "Download"}
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
