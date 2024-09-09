import { useEffect, useMemo, useState } from "react";
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
import { useTask } from "../../services/Task/useQueries";
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
import DragInput from "./components/DragInput";
import CustomCheckbox from "../../components/CustomInput/CustomCheckbox";
import { DATASET_MAPING, OPTIONS_TASK_TYPE } from "../../constants/constants";


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
  flags: {
    is_librivox: false,
    is_vctx: false,
    is_voxceleb: false,
    is_librispeech: false,
    is_voxpopuli: false,
    is_tedlium: false,
    is_commonvoice: false,
  },
};

export default function AddTaskPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isMulti = searchParams.get("multi");

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
  const [audioPreview, setAudioPreview] = useState([]);
  const [audioDuration, setAudioDuration] = useState([]);

  const [taskStatus, setTaskStatus] = useState({
    totalTasks: 0,
    successfulTasks: 0,
    failedTasks: 0,
    pendingTasks: 0,
    saveClicked: false,
  });

  const [highlighted, setHighlighted] = useState({});
  const [selectedTaskTypes, setSelectedTaskTypes] = useState({});

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

  const threshold = 600000;
  const handleInputChange = async (name, value) => {
    if (name === "files") {
      const files = Array.from(value);
      const previews = [];
      const durations = [];

      for (const file of files) {
        const previewURL = URL.createObjectURL(file);
        previews.push(previewURL);

        const duration = await getDuration(previewURL);

        if (duration === Infinity) {
          toast.error(
            "Unable to extract metadata from this file. Please check the file format and try again."
          );
          return;
        }
        durations.push(duration * 1000);
      }
      setAudioDuration(durations);
      setAudioPreview(previews);

      if (!isMulti && durations[0] > threshold) {
        setFormValue((prev) => ({ ...prev, segment_duration: threshold }));
      } else {
        setFormValue((prev) => ({ ...prev, segment_duration: 0 }));
      }
    }
    if (name === "segment_duration") {
      if (value > audioDuration?.[0] && !isMulti) {
        toast.error("Segment duration cannot be greater than audio duration");
        setFormValue((prev) => ({
          ...prev,
          [name]: Math.trunc(audioDuration[0]),
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
    if (name === "flags") {
      const keys = Object.keys(value);
      const highlighted = {};
      keys.forEach((key) => {
        if (value[key]) {
          DATASET_MAPING[key].split(", ").forEach((field) => {
            highlighted[field] = true;
          });
        }
      });
      setHighlighted(highlighted);
    }

    setFormValue((prev) => ({ ...prev, [name]: value }));
    if (taskId) {
      debouncedEditValidation({ name, value });
    } else debouncedAddValidation({ name, value });
  };

  const handleTaskTypeChange = (name, value) => {
    // Update the selected task types state
    setSelectedTaskTypes((prev) => ({ ...prev, [name]: value }));

    // Create a copy of the current flags
    const updatedFlags = { ...formValue.flags };

    // Find the task type object based on the name
    const taskType = OPTIONS_TASK_TYPE.find((task) => task.name === name);

    if (taskType) {
      // Update the flags based on the task type change
      if (value) {
        // If the task type is selected, set the corresponding datasets to true
        taskType.datasets.forEach((dataset) => {
          updatedFlags[dataset] = true;
        });
      } else {
        // If the task type is deselected, set the corresponding datasets to false
        taskType.datasets.forEach((dataset) => {
          updatedFlags[dataset] = false;
        });
      }
    }

    // Update the form value with the new flags
    handleInputChange("flags", updatedFlags);
  };

  const handleSave = async () => {

    const hasTrueValue = Object.values(formValue.flags).includes(true);
    if (!hasTrueValue) {
      toast.error("At least one dataset must be selected");
      return;
    }

    if (taskId) {
      const { isValid, error } = taskEditAllValidation(formValue);
      if (isValid)
        dispatch(
          updateTaskRequest({
            payload: {
              data: {
                name: formValue.name,
                project_id: formValue.project,
                subset: formValue.subset,
                assignee_id: parseInt(formValue.assign_to),
                flags: formValue.flags,
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
        const taskPromises = [];
        setTaskStatus(() => ({
          totalTasks: formValue.files.length,
          pendingTasks: formValue.files.length,
          successfulTasks: 0,
          failedTasks: 0,
          saveClicked: true,
        }));

        for (let i = 0; i < formValue.files.length; i++) {
          const currentFile = formValue.files[i];
          let currentTaskName = formValue.name;
          currentTaskName = currentTaskName
            .replace(/{{index}}/g, i)
            .replace(/{{file_name}}/g, currentFile.name);

          // Update the form value with the current file and task name
          const updatedFormValue = {
            ...formValue,
            name: currentTaskName,
            files: [currentFile],
          };

          if (audioDuration[i] > threshold) {
            updatedFormValue.segment_duration = threshold;
          } else {
            updatedFormValue.segment_duration = Math.trunc(audioDuration[i]);
          }

          const taskPromise = addTaskMutation
            .mutateAsync({
              taskSpec: {
                name: updatedFormValue.name,
                project_id: updatedFormValue.project,
                subset: updatedFormValue.subset,
                assignee_id: parseInt(updatedFormValue.assign_to),
                segment_duration: updatedFormValue.segment_duration,
                overlap: "0",
                flags: updatedFormValue.flags,
              },
              taskDataSpec: {
                image_quality: 70,
                sorting_method: "lexicographical",
                client_files: updatedFormValue.files,
              },
              onUpdate: (msg, status) => setResponseMsg({ msg, status }),
            })
            .then((res) => {
              console.log(`Task ${i} is succeeded`, res);
              setTaskStatus((prevStatus) => ({
                ...prevStatus,
                successfulTasks: prevStatus.successfulTasks + 1,
              }));
            })
            .catch((err) => {
              console.error(`Task ${i} is failed`, err);
              setTaskStatus((prevStatus) => ({
                ...prevStatus,
                failedTasks: prevStatus.failedTasks + 1,
              }));
            })
            .finally(() => {
              setTaskStatus((prevStatus) => ({
                ...prevStatus,
                pendingTasks: prevStatus.pendingTasks - 1,
              }));
            });

          taskPromises.push(taskPromise);
        }

        // Wait for all promises to resolve
        await Promise.all(taskPromises).then(() => {
          navigate("/tasks?page=1");
        });
      } else {
        setFormError(error);
      }
    }
  };

  const addTaskMutation = useAddTaskMutation({});

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
    },
  });

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
  });
  // fetch task data if task id exists
  const getTaskQuery = useTask({
    queryConfig: {
      queryKey: [taskId],
      apiParams: {
        id: taskId,
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
            flags: data.flags ?? initialData.flags,

          };
        });
        if (data.flags) {
          const highlighted = {};
          const newSelectedTaskTypes = {};


          Object.keys(data.flags).forEach((key) => {
            if (data.flags[key]) {
              DATASET_MAPING[key].split(", ").forEach((field) => {
                highlighted[field] = true;

              });


              OPTIONS_TASK_TYPE.forEach((taskType) => {
                if (taskType.datasets.includes(key)) {
                  newSelectedTaskTypes[taskType.name] = true;
                }



              });
            }

          })



          setSelectedTaskTypes(newSelectedTaskTypes);
          setHighlighted(highlighted);

        }

      },
    },
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

  useEffect(() => {
    if (isMulti) {
      setFormValue((prev) => ({ ...prev, name: "{{file_name}}" }));
    }
  }, [isMulti]);

  function getUniqueMetadataFields(metadataMap) {
    const allFields = new Set();
    Object.values(metadataMap).forEach((fields) => {
      fields.split(", ").forEach((field) => allFields.add(field));
    });
    return Array.from(allFields);
  }

  const uniqueFields = useMemo(
    () => getUniqueMetadataFields(DATASET_MAPING),
    [DATASET_MAPING]
  );

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
            {taskId && (
              <TaskMenu
                isShowText={true}
                task={getTaskQuery.data}
                isShowEdit={false}
              />
            )}
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
            <div className="mb-4">
              <div className="">
                <p className="text-sm font-medium leading-6 text-gray-900 mb-2">
                  Task Types
                </p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  {OPTIONS_TASK_TYPE.map((taskType, index) => (
                    <CustomCheckbox
                      key={index}
                      name={taskType.name}
                      id={index}
                      formError={formError}
                      label={taskType.name}
                      value={selectedTaskTypes[taskType.name] || false}
                      onChange={(e) => handleTaskTypeChange(taskType.name, e.target.checked)}
                    />
                  ))}
                </div>

              </div>
            </div>



            <div className="mb-4">
              <div className="">
                <p className="text-sm font-medium leading-6 text-gray-900 mb-2">
                  Select Datasets <span className="text-red-600">*</span>
                </p>
                <fieldset>
                  <legend className="sr-only">Datasets</legend>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                    <CustomCheckbox
                      name="librivox"
                      id="librivox"
                      formError={formError}
                      label="LibriVox"
                      description={DATASET_MAPING["is_librivox"]}
                      value={formValue.flags.is_librivox}
                      onChange={(e) =>
                        handleInputChange("flags", {
                          ...formValue.flags,
                          is_librivox: e.target.checked,
                        })
                      }
                    />

                    <CustomCheckbox
                      name="vctx"
                      id="vctx"
                      formError={formError}
                      label="VCTK"
                      description={DATASET_MAPING["is_vctx"]}
                      value={formValue.flags.is_vctx}
                      onChange={(e) =>
                        handleInputChange("flags", {
                          ...formValue.flags,
                          is_vctx: e.target.checked,
                        })
                      }
                    />

                    <CustomCheckbox
                      name="voxceleb"
                      id="voxceleb"
                      formError={formError}
                      label="VoxCeleb"
                      description={DATASET_MAPING["is_voxceleb"]}
                      value={formValue.flags.is_voxceleb}
                      onChange={(e) =>
                        handleInputChange("flags", {
                          ...formValue.flags,
                          is_voxceleb: e.target.checked,
                        })
                      }
                    />

                    <CustomCheckbox
                      name="librispeech"
                      id="librispeech"
                      formError={formError}
                      label="LibriSpeech"
                      description={DATASET_MAPING["is_librispeech"]}
                      value={formValue.flags.is_librispeech}
                      onChange={(e) =>
                        handleInputChange("flags", {
                          ...formValue.flags,
                          is_librispeech: e.target.checked,
                        })
                      }
                    />

                    <CustomCheckbox
                      name="voxpopuli"
                      id="voxpopuli"
                      formError={formError}
                      label="VoxPopuli"
                      description={DATASET_MAPING["is_voxpopuli"]}
                      value={formValue.flags.is_voxpopuli}
                      onChange={(e) =>
                        handleInputChange("flags", {
                          ...formValue.flags,
                          is_voxpopuli: e.target.checked,
                        })
                      }
                    />

                    <CustomCheckbox
                      name="tedlium"
                      id="tedlium"
                      formError={formError}
                      label="TED-LIUM"
                      description={DATASET_MAPING["is_tedlium"]}
                      value={formValue.flags.is_tedlium}
                      onChange={(e) =>
                        handleInputChange("flags", {
                          ...formValue.flags,
                          is_tedlium: e.target.checked,
                        })
                      }
                    />

                    <CustomCheckbox
                      name="commonvoice"
                      id="commonvoice"
                      formError={formError}
                      label="Common Voice"
                      description={DATASET_MAPING["is_commonvoice"]}
                      value={formValue.flags.is_commonvoice}
                      onChange={(e) =>
                        handleInputChange("flags", {
                          ...formValue.flags,
                          is_commonvoice: e.target.checked,
                        })
                      }
                    />
                  </div>
                </fieldset>
              </div>
              <div className="mt-4 flex gap-2">
                {uniqueFields.map((field) => (
                  <span
                    className={`inline-flex items-center rounded-md  px-2 py-1 text-xs font-medium ring-1 ring-inset 
                    ${highlighted && highlighted[field]
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "ring-gray-500/10 bg-gray-50 text-gray-600"
                      }`}
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            {!taskId && (
              <div className="mb-4">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Select {isMulti ? "files" : "file"}{" "}
                  <span className="text-red-600">*</span>
                </label>
                <DragInput
                  handleInputChange={handleInputChange}
                  isMultiple={isMulti}
                />

                {audioPreview.length >= 0
                  ? audioPreview.map((url, index) => (
                    <audio
                      controls
                      className="mt-2 rounded-md border-2 border-gray-300 border-dashed"
                      src={url}
                      onLoadedMetadata={onloadedmetadata}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  ))
                  : null}
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
            <div className="flex justify-between mt-2 pt-4">
              <p className=" text-sm text-gray-500" id="files-error">
                {taskStatus.saveClicked && isMulti && (
                  <div className="mt-6">
                    <div className="mt-2 flex gap-4">
                      <p>Total: {taskStatus.totalTasks}</p>
                      <p>Completed: {taskStatus.successfulTasks}</p>
                      <p>Failed: {taskStatus.failedTasks}</p>
                      <p>Pending: {taskStatus.pendingTasks}</p>
                    </div>
                  </div>
                )}
                {responseMsg.msg}{" "}
                {responseMsg.status ? (
                  <span className="text-audino-primary-dark">
                    {(responseMsg.status * 100).toFixed(2) + "%"}
                  </span>
                ) : (
                  ""
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end border-t border-gray-200 mt-8 pt-4">
              <div className="flex space-x-3 ">
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
