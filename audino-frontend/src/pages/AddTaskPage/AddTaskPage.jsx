import { useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate, useParams, useLocation } from "react-router";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import CustomSelect from "../../components/CustomInput/CustomSelect";
import CustomInput from "../../components/CustomInput/CustomInput";
import useSingleFieldValidation from "../../utils/inputDebounce";
import {
  taskAddSingleFieldValidation,
  taskEditSingleFieldValidation,
} from "../../validation/singleValidation";
import {
  taskAddAllValidation,
  taskEditAllValidation,
} from "../../validation/allValidation";
import { useDispatch, useSelector } from "react-redux";
import { updateTaskRequest } from "../../store/Actions/taskAction";
import AddTaskPageLoader from "./components/AddTaskPageLoader";
import { useTask } from "../../services/Task/useQueries"
import { useProjects } from "../../services/Projects/useQueries"; //
import { useUserQuery } from "../../services/User/useQueries";
import JobPage from "../JobPage/JobPage";
import { Disclosure } from "@headlessui/react";
import {
  ChevronLeftIcon,
  InformationCircleIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Tooltip from "../../components/Tooltip/Tooltip";
import { toast } from "react-hot-toast";
import TaskMenu from "../../components/TaskComponent/TaskMenu";
import AlertExportTaskModal from "../../components/TaskComponent/AlertExportTaskModal";
import { useAddTaskMutation } from "../../services/Task/useMutations";

const initialData = {
  name: "",
  assign_to: "",
  // description: "",
  project: "",
  subset: "",
  files: null,
  segment_duration: 0,
  start_frame: 0,
  stop_frame: 0,
  frame_step: "",
};

export default function AddTaskPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { id: taskId } = useParams();

  const [formValue, setFormValue] = useState(initialData);
  const [formError, setFormError] = useState({
    name: null,
    // description: null,
    project: null,
    subset: null,
    files: null,
  });
  const [responseMsg, setResponseMsg] = useState({ msg: "", status: null });
  const [audioPreview, setAudioPreview] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const { debouncedValidation: debouncedAddValidation } =
    useSingleFieldValidation(
      taskAddSingleFieldValidation,
      1000,
      formError,
      setFormError
    );
  const { debouncedValidation: debouncedEditValidation } =
    useSingleFieldValidation(
      taskEditSingleFieldValidation,
      1000,
      formError,
      setFormError
    );
  const { isTaskLoading } = useSelector((state) => state.taskReducer);

  async function getDuration(url) {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.muted = true;
      const source = document.createElement("source");
      source.src = url; //--> blob URL
      audio.preload = "metadata";
      audio.appendChild(source);
      audio.onloadedmetadata = function () {
        resolve(audio.duration);
      };
    });
  }

  const handleInputChange = async (name, value) => {
    const threshold = 600000;
    if (name === "files") {
      const file = value[0];
      if (file) {
        const previewURL = URL.createObjectURL(file);
        setAudioPreview(previewURL);
        const duration = await getDuration(previewURL);

        if (duration === Infinity) {
          toast.error("Unable to extract metadata from this file. Please check the file format and try again.");
          return
        }

        const tempAudioDuration = duration * 1000;
        setAudioDuration(tempAudioDuration);
        if (tempAudioDuration > threshold) {
          setFormValue((prev) => ({ ...prev, segment_duration: threshold }));
        } else {
          setFormValue((prev) => ({ ...prev, segment_duration: 0 }));
        }
      }
    }
    if (name === "segment_duration") {
      if (value > audioDuration) {
        toast.error("Segment duration cannot be greater than audio duration");
        setFormValue((prev) => ({
          ...prev,
          [name]: Math.trunc(audioDuration),
        }));
        return;
      } else if (value > threshold) {
        toast.error(
          `Segment duration cannot be greater than ${threshold} milliseconds`
        );
        setFormValue((prev) => ({ ...prev, [name]: threshold }));
        return;
      }
    }
    setFormValue((prev) => ({ ...prev, [name]: value }));
    if (taskId) {
      debouncedEditValidation({ name, value });
    } else debouncedAddValidation({ name, value });
  };

  const handleSave = () => {
    if (taskId) {
      const { isValid, error } = taskEditAllValidation(formValue);
      if (isValid)
        dispatch(
          updateTaskRequest({
            payload: {
              data: {
                labels: [],
                name: formValue.name,
                project_id: formValue.project,
                source_storage: { location: "local" },
                target_storage: { location: "local" },
                subset: formValue.subset,
                assignee_id: parseInt(formValue.assign_to),
              },
              id: taskId,
            },
            callback: () => navigate("/tasks?page=1"),
          })
        );
      else setFormError(error);
    } else {
      const { isValid, error } = taskAddAllValidation(formValue);
      if (isValid) {
        addTaskMutation.mutate({
          taskSpec: {
            labels: [],
            name: formValue.name,
            project_id: formValue.project,
            source_storage: { location: "local" },
            target_storage: { location: "local" },
            subset: formValue.subset,
            assignee_id: parseInt(formValue.assign_to),
            segment_duration: formValue.segment_duration,
            overlap: "0",
          },
          taskDataSpec: {
            image_quality: 70,
            use_zip_chunks: false,
            use_cache: false,
            sorting_method: "lexicographical",
            client_files: formValue.files,
            ...(formValue.start_frame && {
              start_frame: formValue.start_frame,
            }),
            ...(formValue.stop_frame && { stop_frame: formValue.stop_frame }),
          },
          onUpdate: (msg, status) => setResponseMsg({ msg, status }),
        });
      } else {
        setFormError(error);
      }
    }
  };


  const addTaskMutation = useAddTaskMutation({
    mutationConfig: {
      onSuccess: (data) => {
        navigate("/tasks?page=1");
      },
    }
  })



  const getProjectsQuery = useProjects({
    queryConfig: {
      queryKey: [],
      apiParams: {
        page_size: 15,
        page: 1,
      },
      enabled: false,
      staleTime: Infinity,
      onSuccess: (data) => console.log(data),
    }
  })

  //  fetch users
  const getUsersQuery = useUserQuery({
    queryConfig: {
      queryKey: [],
      apiParams: {
        limit: 10,
        is_active: true,
      },
      enabled: false,
      staleTime: Infinity,
    },
  })
  // fetch task data if task id exists
  const getTaskQuery = useTask({
    queryConfig: {
      queryKey: [taskId],
      apiParams: {
        id: taskId
      },
      enabled: false,
      staleTime: Infinity,
      onSuccess: (data) => {
        setFormValue((prev) => {
          return {
            ...prev,
            name: data.name ?? "",
            project: data.project_id ?? "",
            subset: data.subset ?? "",
            assign_to: data.assignee?.id ?? "",
          };
        });
      },
    }
  });

  useEffect(() => {
    // Manually execute the query when the component mounts
    getProjectsQuery.refetch();
    getUsersQuery.refetch();
  }, []);

  useEffect(() => {
    // Fetch once when taskId changes or component mounts
    if (taskId) getTaskQuery.refetch();
    else setFormValue(initialData);
  }, [taskId]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  // set project id from location state
  useEffect(() => {
    if (location.state && location.state?.projectId) {
      setFormValue((prev) => ({ ...prev, project: location.state.projectId }));
    }
  }, [location.state]);

  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto flex justify-between items-center max-w-7xl px-4 sm:px-6 lg:px-8">
            <div>
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
                {taskId ? "Update" : "Create a new"} task
              </h1>
            </div>
            {taskId &&
              <TaskMenu isShowText={true} task={getTaskQuery.data} isShowEdit={false} />}
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {isTaskLoading ? (
          <AddTaskPageLoader />
        ) : (
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full ">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Task name <span className="text-red-600">*</span>
              </label>
              <CustomInput
                type="text"
                name="name"
                id="name"
                formError={formError}
                placeholder="Task"
                value={formValue.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            {/* <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Task description
              </label>
              <CustomInput
                type="text"
                inputType="textarea"
                name="description"
                id="description"
                formError={formError}
                placeholder="Task description"
                value={formValue.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div> */}

            <div className="mb-4">
              <label
                htmlFor="project"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Project <span className="text-red-600">*</span>
              </label>
              {getProjectsQuery.isLoading ? (
                <div className="h-8 bg-gray-200 rounded-md w-full mb-2.5 mt-2 animate-pulse"></div>
              ) : (
                <CustomSelect
                  id="project"
                  name="project"
                  options={(getProjectsQuery.data?.results ?? []).map((val) => {
                    return { label: val.name, value: val.id };
                  })}
                  formError={formError}
                  value={formValue.project}
                  onChange={(e) => handleInputChange("project", e.target.value)}
                />
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="subset"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Subset
              </label>
              <CustomSelect
                id="subset"
                name="subset"
                options={[
                  { label: "Test", value: "Test" },
                  { label: "Train", value: "Train" },
                  { label: "Validation", value: "Validation" },
                ]}
                formError={formError}
                value={formValue.subset}
                onChange={(e) => handleInputChange("subset", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="assign_to"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Assigned to
              </label>
              {getUsersQuery.isLoading ? (
                <div className="h-8 bg-gray-200 rounded-md w-full mb-2.5 mt-2 animate-pulse"></div>
              ) : (
                <CustomSelect
                  id="assign_to"
                  name="assign_to"
                  options={(getUsersQuery.data?.results ?? []).map((val) => {
                    return { label: val.username, value: val.id };
                  })}
                  formError={formError}
                  value={formValue.assign_to}
                  onChange={(e) =>
                    handleInputChange("assign_to", e.target.value)
                  }
                />
              )}
            </div>

            {!taskId && (
              <div className="mb-4">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Select file <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center justify-center w-full mt-2">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Upload Audio file only
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      multiple
                      className="hidden"
                      accept=".mp3,audio/*"
                      onChange={(e) =>
                        handleInputChange("files", e.target.files)
                      }
                    />
                  </label>
                </div>
                {audioPreview ? (
                  // <AudioPlayer audioUrl={audioPreview} />

                  <audio
                    controls
                    className="mt-2 rounded-md border-2 border-gray-300 border-dashed"
                    src={audioPreview}
                    onLoadedMetadata={onloadedmetadata}
                  >
                    Your browser does not support the audio element.
                  </audio>
                ) : null}
                {formError && formError["files"] && (
                  <p className="mt-2 text-sm text-red-600" id="files-error">
                    {formError["files"][0]}
                  </p>
                )}
              </div>
            )}

            {!taskId && (
              <section aria-labelledby="details-heading" className="mt-12">
                <h2 id="details-heading" className="sr-only">
                  Additional details
                </h2>

                <div className="divide-y divide-gray-200 border-y">
                  <Disclosure as="div">
                    {({ open }) => (
                      <>
                        <h3>
                          <Disclosure.Button className="group relative flex w-full items-center justify-between py-6 px-6 text-left bg-gray-50">
                            <span
                              className={classNames(
                                open ? "text-audino-primary" : "text-gray-900",
                                "text-md font-normal"
                              )}
                            >
                              Advanced configuration
                            </span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusIcon
                                  className="block h-6 w-6 text-audino-primary group-hover:text-audino-primary-dark"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusIcon
                                  className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel
                          as="div"
                          className="prose prose-sm pb-6 px-6 pt-6 "
                        >
                          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="segment_duration"
                                className="text-sm font-medium leading-6 text-gray-900 mb-2 flex items-center justify-between"
                              >
                                <p>
                                  Segment duration{" "}
                                  <span className="font-normal text-xs">
                                    (in milliseconds)
                                  </span>
                                </p>
                                <Tooltip message="Define a duration for a job">
                                  <InformationCircleIcon className="w-5 h-5" />
                                </Tooltip>
                              </label>
                              <CustomInput
                                type="number"
                                name="segment_duration"
                                id="segment_duration"
                                formError={{}}
                                placeholder=""
                                value={formValue.segment_duration}
                                onChange={(e) =>
                                  handleInputChange(
                                    "segment_duration",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                              {formError && formError["segment_duration"] && (
                                <p
                                  className="mt-2 text-sm text-red-600"
                                  id="segment_duration-error"
                                >
                                  {formError["segment_duration"][0]}
                                </p>
                              )}
                            </div>

                            {/* <div className="sm:col-span-2">
                              <label
                                htmlFor="start_frame"
                                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
                              >
                                Start frame
                              </label>
                              <CustomInput
                                type="number"
                                name="start_frame"
                                id="start_frame"
                                formError={{}}
                                placeholder=""
                                value={formValue.start_frame}
                                onChange={(e) =>
                                  handleInputChange(
                                    "start_frame",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label
                                htmlFor="stop_frame"
                                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
                              >
                                Stop frame
                              </label>
                              <CustomInput
                                type="number"
                                name="stop_frame"
                                id="stop_frame"
                                formError={{}}
                                placeholder=""
                                value={formValue.stop_frame}
                                onChange={(e) =>
                                  handleInputChange(
                                    "stop_frame",
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </div> */}

                            {/* <div className="sm:col-span-2">
                            <label
                              htmlFor="frame_step"
                              className="block text-sm font-medium leading-6 text-gray-900 mb-2"
                            >
                              Frame step
                            </label>
                            <CustomInput
                              type="number"
                              name="frame_step"
                              id="frame_step"
                              formError={{}}
                              placeholder=""
                              value={formValue.frame_step}
                              onChange={(e) =>
                                handleInputChange(
                                  "frame_step",
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </div> */}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
              </section>
            )}

            {/* Action buttons */}
            <div className="flex justify-between border-t border-gray-200 mt-8 pt-4">
              <p className="mt-2 text-sm text-gray-500" id="files-error">
                {responseMsg.msg}{" "}
                {responseMsg.status ? (
                  <span className="text-audino-primary-dark">
                    {(responseMsg.status * 100).toFixed(2) + "%"}
                  </span>
                ) : (
                  ""
                )}
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <PrimaryButton
                  onClick={handleSave}
                  loading={addTaskMutation.isLoading}
                >
                  Save
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </main>
      <AlertExportTaskModal isBackAfterSuccess={true} />
      {taskId && (
        <JobPage
          prevFilter={`{"and":[{"==":[{"var":"task_id"},${taskId}]}]}`}
          isRemoveAppbar={true}
        />
      )}
    </>
  );
}
