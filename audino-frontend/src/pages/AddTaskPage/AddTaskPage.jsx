import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  ACTIVE_FIELDS_OPTION,
  DATASET_MAPING,
  OPTIONS_TASK_TYPE,
} from "../../constants/constants";
import CustomButton from "../../components/CustomButton/CustomButton";
import { useGetCloud } from "../../services/CloudStorages/useQueries";
import { cloudStorageContentApi } from "../../services/cloudstorages.services";
import CustomSearch from "../../components/CustomInput/CustomSearch";
import NoContentMessage from "./components/NoContentMessage";
import { ALLOWED_FORMATS } from "../../constants/cloudStatus";

const initialData = {
  name: "",
  assign_to: "",
  // description: "",
  project: "",
  subset: "",
  files: null,
  cloud_storage_id: "",
  server_files: [],
  segment_duration: 600000, // 10 minutes in milliseconds
  start_frame: 0,
  stop_frame: 0,
  frame_step: "",
  flags: {
    is_gender: false,
    is_locale: false,
    is_start: true,
    is_end: true,
    is_transcription: false,
    is_accent: false,
    is_age: false,
    is_emotion: false,
  },
};

export default function AddTaskPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const prevIdsRef = useRef([]);
  const prevPrefixRef = useRef("/");
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

  const [activeOption, setActiveOption] = useState("myComputer");
  const [contents, setContents] = useState([]);
  const [displayedContent, setDisplayedContent] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [prefix, setPrefix] = useState("/");

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
      }
      setAudioPreview(previews);
      setFormValue((prev) => ({ ...prev, segment_duration: threshold }));
    }
    if (name === "segment_duration") {
      if (value > threshold) {
        toast.error(
          `Segment duration cannot be greater than ${threshold} milliseconds`
        );
        setFormValue((prev) => ({ ...prev, [name]: threshold }));
        return;
      } else {
        setFormValue((prev) => ({ ...prev, [name]: value }));
        return;
      }
    }
    if (name === "flags") {
      // const keys = Object.keys(value);
      // const highlighted = {};
      // keys.forEach((key) => {
      //   if (value[key]) {
      //     DATASET_MAPING[key].split(", ").forEach((field) => {
      //       highlighted[field] = true;
      //     });
      //   }
      // });
      // setHighlighted(highlighted);
    }

    setFormValue((prev) => ({ ...prev, [name]: value }));
    if (taskId) {
      debouncedEditValidation({ name, value });
    } else debouncedAddValidation({ name, value });
  };

  const handleActiveFieldChange = (name, value) => {
    // Create a copy of the current flags
    const updatedFlags = { ...formValue.flags };

    if (value) {
      updatedFlags[name] = true;
    } else {
      updatedFlags[name] = false;
    }

    // Update the form value with the new flags
    handleInputChange("flags", updatedFlags);
  };

  const handleSave = async () => {
    const hasTrueValue = Object.values(formValue.flags).includes(true);
    if (!hasTrueValue) {
      toast.error("At least one active field must be selected");
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
        const totalFiles =
          formValue.files?.length || formValue.server_files?.length;
        setTaskStatus(() => ({
          totalTasks: totalFiles,
          pendingTasks: totalFiles,
          successfulTasks: 0,
          failedTasks: 0,
          saveClicked: true,
        }));

        let file_length = 0;
        if (formValue.files) {
          file_length = formValue.files.length;
        } else if (formValue.server_files) {
          file_length = formValue.server_files.length;
        }
        for (let i = 0; i < 1; i++) {
          const updatedFormValue = {
            ...formValue,
          };
          const tempTaskDataSpec = {
            image_quality: 70,
            sorting_method: "lexicographical",
          };

          if (formValue.files || formValue.server_files) {
            if (formValue.server_files) {
              const unsupportedFormats = formValue.server_files
                .map((file) => file.split(".").pop().toLowerCase())
                .filter((ext) => !ALLOWED_FORMATS.includes(ext));

              if (unsupportedFormats.length > 0) {
                const uniqueFormats = [...new Set(unsupportedFormats)];
                toast.error(
                  `Unsupported file formats ${uniqueFormats.join(
                    ", "
                  )} this platform support  ${ALLOWED_FORMATS} formats`
                );
                return;
              }
            }

            const isFiles = formValue.files && formValue.files[i];
            const isServerFiles =
              formValue.server_files && formValue.server_files[i];
            const currentFile = isFiles
              ? formValue.files[i]
              : isServerFiles
              ? formValue.server_files[i]
              : null;

            if (currentFile) {
              let currentTaskName = formValue.name;
              currentTaskName = currentTaskName
                .replace(/{{index}}/g, i)
                .replace(/{{file_name}}/g, currentFile.name || currentFile);

              updatedFormValue.name = currentTaskName;

              if (isFiles) {
                // updatedFormValue.files = [currentFile];
                tempTaskDataSpec.client_files = updatedFormValue.files;
              } else if (isServerFiles) {
                // updatedFormValue.server_files = [currentFile];
                tempTaskDataSpec.server_files = updatedFormValue.server_files;
                tempTaskDataSpec.cloud_storage_id =
                  updatedFormValue.cloud_storage_id;

                if (!isMulti && i > 0) break;
              }
            }
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
                ...tempTaskDataSpec,
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

  const handleSelection = useCallback(
    (item, isChecked = false, click = false, index) => {
      const updatedContent = displayedContent.map((content, i) =>
        i === index ? { ...content, isSelected: isChecked } : content
      );
      if (item.type === "DIR") {
        if (click) {
          setPrefix((prevPrefix) => {
            const basePrefix = prefix === "/" ? "" : prevPrefix;
            return `datasets/${basePrefix}`;
          });
        }
      } else {
        setDisplayedContent(updatedContent);
      }
      setFormValue((prevFormValue) => {
        const updatedServerFiles = isChecked
          ? [...prevFormValue.server_files, item.name]
          : prevFormValue.server_files.filter(
              (fileName) => fileName !== item.name
            );

        const updatedForm = {
          ...prevFormValue,
          server_files: updatedServerFiles,
        };
        return updatedForm;
      });
    },
    [displayedContent, contents, setDisplayedContent, setFormValue, prefix]
  );

  const handleRefresh = () => {
    setShowSpinner(true);
    setTimeout(() => {
      const refreshedContent = displayedContent.map((item) => ({
        ...item,
        isSelected: false,
      }));
      setDisplayedContent(refreshedContent);
      setShowSpinner(false);
    }, 1000);
  };

  const filteredContent = useMemo(() => {
    if (!searchTerm.trim()) {
      return displayedContent;
    }
    return displayedContent.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayedContent, searchTerm]);

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

  const getCloudQuery = useGetCloud({
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

  const ids = useMemo(
    () => (getCloudQuery?.data?.results || []).map((val) => val.id),
    [getCloudQuery]
  );

  useEffect(() => {
    const idsChanged =
      ids.length !== prevIdsRef.current.length ||
      ids.some((id, index) => id !== prevIdsRef.current[index]);

    const prefixChanged = prefix !== prevPrefixRef.current;

    if (idsChanged || (prefixChanged && ids.length > 0 && prefix)) {
      const dataPromises = ids.map((id) =>
        cloudStorageContentApi({ id, prefix }).then((response) => ({
          id,
          content: response.content,
        }))
      );

      Promise.allSettled(dataPromises)
        .then((results) => {
          const successes = results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
          const errors = results
            .filter((result) => result.status === "rejected")
            .map((result) => result.reason);

          console.log("Fetched contents:", successes);
          if (errors.length) {
            console.error("Some requests failed:", errors);
          }
          setContents(successes);
        })
        .catch((err) => {
          console.error("Error fetching data:", err.message);
        });

      prevIdsRef.current = ids;
      prevPrefixRef.current = prefix;
    }
  }, [ids, prefix]);

  //  fetch users
  const getUsersQuery = useUserQuery({
    queryConfig: {
      queryKey: [],
      apiParams: {
        page_size: 50,
        page: 1,
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
      },
    },
  });

  useEffect(() => {
    setShowSpinner(true);

    setTimeout(() => {
      const directoryContent = contents.find(
        (item) => item.id === formValue.cloud_storage_id
      );
      setDisplayedContent(directoryContent ? directoryContent.content : []);
      setShowSpinner(false);
    }, 2000);
  }, [contents, prefix]);

  useEffect(() => {
    // Manually execute the query when the component mounts
    getProjectsQuery.refetch();
    getCloudQuery.refetch();
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
          <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full ">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
              >
                Task name{" "}
                <span className="text-red-600 dark:text-audino-primary">*</span>
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
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Project{" "}
                <span className="text-red-600 dark:text-audino-primary">*</span>
              </label>
              {getProjectsQuery.isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full mb-2.5 mt-2 animate-pulse"></div>
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
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
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
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Assigned to
              </label>
              {getUsersQuery.isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full mb-2.5 mt-2 animate-pulse"></div>
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
                <p className="text-sm font-medium leading-6 text-gray-900 mb-2 dark:text-white">
                  Active Fields{" "}
                  {/* <span className="text-red-600 dark:text-audino-primary">*</span> */}
                </p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  {ACTIVE_FIELDS_OPTION.map((field, index) => (
                    <CustomCheckbox
                      key={index}
                      name={field.name}
                      id={field.name}
                      formError={formError}
                      label={field.title}
                      value={formValue.flags[field.name] || false}
                      onChange={(e) =>
                        handleActiveFieldChange(field.name, e.target.checked)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            {!taskId && (
              <div className="mb-4">
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Select {isMulti ? "files" : "file"}{" "}
                  <span className="text-red-600 dark:text-audino-primary">
                    *
                  </span>
                </label>
                <div className="flex gap-2 border-b dark:border-audino-charcoal border-gray-300">
                  <CustomButton
                    type
                    label="My Computer"
                    onClick={() => setActiveOption("myComputer")}
                    className={
                      activeOption === "myComputer"
                        ? "text-gray-500 font-medium dark:text-audino-primary dark:border-audino-primary"
                        : "text-gray-500 bg-gray-50 dark:bg-transparent"
                    }
                  />
                  <CustomButton
                    type
                    label="Cloud Storage"
                    onClick={() => setActiveOption("cloudStorage")}
                    className={
                      activeOption === "cloudStorage"
                        ? "text-gray-500 font-medium dark:text-audino-primary dark:border-audino-primary"
                        : "text-gray-500 bg-gray-50 dark:bg-transparent"
                    }
                  />
                </div>
                {activeOption === "myComputer" && (
                  <>
                    <DragInput
                      handleInputChange={handleInputChange}
                      isMultiple={isMulti}
                    />
                    {audioPreview.length > 0 &&
                      audioPreview.map((url, index) => (
                        <audio
                          controls
                          className="mt-2 w-full sm:w-[20rem] rounded-md border-2 border-gray-300 border-dashed dark:border-audino-charcoal"
                          src={url}
                          onLoadedMetadata={onloadedmetadata}
                          key={index}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      ))}
                    {formError?.files && (
                      <p className="mt-2 text-sm text-red-600" id="files-error">
                        {formError.files[0]}
                      </p>
                    )}
                  </>
                )}

                {activeOption === "cloudStorage" && (
                  <>
                    <div className="my-4">
                      <label
                        htmlFor="cloud"
                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                      >
                        Select cloud storage{" "}
                        <span className="text-red-600 dark:text-audino-primary">
                          *
                        </span>
                      </label>
                      {getCloudQuery.isLoading ? (
                        <div className="h-8 bg-gray-200 dark:bg-audino-light-navy rounded-md w-full mb-2.5 mt-2 animate-pulse"></div>
                      ) : (
                        <CustomSelect
                          id="cloud"
                          name="cloud"
                          options={(getCloudQuery.data?.results ?? []).map(
                            (val, index) => ({
                              label: val.display_name,
                              value: val.id,
                            })
                          )}
                          formError={formError}
                          value={formValue.cloud_storage_id}
                          onChange={(e) => {
                            const selectedId = parseInt(e.target.value);
                            handleInputChange("cloud_storage_id", selectedId);
                            const selectedContent = contents.find(
                              (item) => item.id === selectedId
                            );
                            setDisplayedContent(
                              selectedContent ? selectedContent.content : []
                            );
                          }}
                        />
                      )}
                    </div>

                    {formValue.cloud_storage_id &&
                      displayedContent.length == 0 && <NoContentMessage />}

                    {displayedContent.length > 0 && (
                      <div className="mt-4">
                        <ul className="list-disc lg:px-10">
                          <div className="my-5">
                            <CustomSearch
                              onRefresh={handleRefresh}
                              onSearch={setSearchTerm}
                            />
                          </div>
                          {showSpinner ? (
                            <div className="flex justify-center items-center py-5">
                              <div className="w-6 h-6 border-4 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
                            </div>
                          ) : filteredContent.length > 0 ? (
                            filteredContent.map((item, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-1 my-1.5 items-center"
                              >
                                <CustomCheckbox
                                  name={item.name}
                                  id={index}
                                  formError={formError}
                                  label={item.name}
                                  value={item.isSelected || false}
                                  type={item.type}
                                  onClick={(e) => {
                                    handleSelection(item, false, true, index);
                                  }}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    handleSelection(
                                      item,
                                      isChecked,
                                      false,
                                      index
                                    );
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            <NoContentMessage />
                          )}
                        </ul>
                      </div>
                    )}

                    {formError?.files && (
                      <p className="mt-2 text-sm text-red-600" id="files-error">
                        {formError.files[0]}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {!taskId && (
              <section aria-labelledby="details-heading" className="mt-12">
                <h2 id="details-heading" className="sr-only">
                  Additional details
                </h2>

                <div className="divide-y divide-gray-200 dark:border-audino-charcoal dark:divide-audino-charcoal border-y">
                  <Disclosure as="div">
                    {({ open }) => (
                      <>
                        <h3>
                          <Disclosure.Button className="group relative flex w-full items-center justify-between py-6 px-6 text-left bg-gray-50 dark:bg-audino-light-navy">
                            <span
                              className={classNames(
                                open
                                  ? "text-audino-primary"
                                  : "text-gray-900 dark:text-white",
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
                                className="text-sm font-medium leading-6 text-gray-900 dark:text-audino-cloud-gray mb-2 flex items-center justify-between"
                              >
                                <p>
                                  Segment duration{" "}
                                  <span className="font-normal text-xs">
                                    (in milliseconds)
                                  </span>
                                </p>
                                <Tooltip message="Define a duration for a job">
                                  <InformationCircleIcon className="w-5 h-5 dark:text-audino-cloud-gray" />
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
            <div className="flex justify-end border-t border-gray-200 dark:border-audino-slate-gray mt-8 pt-4">
              <div className="flex space-x-3 ">
                <button
                  type="button"
                  className="rounded-md bg-white dark:bg-transparent px-3 py-2 text-sm font-medium text-gray-900 dark:text-audino-medium-gray shadow-sm ring-1 ring-inset dark:ring-audino-steel ring-gray-300 hover:bg-gray-50"
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
