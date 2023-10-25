import { Fragment, useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate, useParams } from "react-router";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import CustomSelect from "../../components/CustomInput/CustomSelect";
import CustomInput from "../../components/CustomInput/CustomInput";
import useSingleFieldValidation from "../../utils/inputDebounce";
import { projectSingleFieldValidation, taskAddSingleFieldValidation, taskEditSingleFieldValidation } from "../../validation/singleValidation";
import {
  taskAddAllValidation,
  taskEditAllValidation,
} from "../../validation/allValidation";
import AudioPlayer from "../../components/AudioPlayer/AudioPlayer";
import { useDispatch, useSelector } from "react-redux";
import {
  createTaskRequest,
  fetchTaskRequest,
  updateTaskRequest,
} from "../../store/Actions/taskAction";
import { fetchProjectsRequest } from "../../store/Actions/projectAction";
import AddTaskPageLoader from "./components/AddTaskPageLoader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTaskApi,
  createTaskWithDataApi,
  fetchTaskApi,
} from "../../services/task.services";
import { fetchProjectsApi } from "../../services/project.services";
import { fetchUsersApi } from "../../services/user.services";

const initialData = {
  name: "",
  assign_to: "",
  // description: "",
  project: "",
  subset: "",
  files: null,
};

export default function AddTaskPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: taskId } = useParams();
  const queryClient = useQueryClient();
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
  const { debouncedValidation: debouncedAddValidation } = useSingleFieldValidation(
    taskAddSingleFieldValidation,
    1000,
    formError,
    setFormError
  );
  const { debouncedValidation:debouncedEditValidation } = useSingleFieldValidation(
    taskEditSingleFieldValidation,
    1000,
    formError,
    setFormError
  );
  const { isTaskLoading } = useSelector((state) => state.taskReducer);

  const handleInputChange = (name, value) => {
    if (name === "files") {
      const file = value;
      const previewURL = URL.createObjectURL(file);
      setAudioPreview(previewURL);
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
            callback: () => navigate("/tasks"),
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
          },
          taskDataSpec: {
            file: formValue.files,
          },
          onUpdate: (msg, status) => setResponseMsg({ msg, status }),
        });
      } else {
        setFormError(error);
      }
    }
  };

  const addTaskMutation = useMutation({
    mutationFn: createTaskWithDataApi,
    // onMutate: ({ id }) => {
    //   return { id };
    // },
    onSuccess: (data) => {
      // Invalidate and refetch
      // queryClient.invalidateQueries({ queryKey: ['labels'] })
      navigate("/tasks?page=1");
    },
  });

  const getProjectsQuery = useQuery({
    queryKey: ["projects"],
    enabled: false,
    staleTime: Infinity,
    queryFn: () =>
      fetchProjectsApi({
        org: "",
        page_size: 15,
        page: 1,
      }),
    onSuccess: (data) => console.log(data),
  });

  //  fetch users
  const getUsersQuery = useQuery({
    queryKey: ["users"],
    enabled: false,
    staleTime: Infinity,
    queryFn: () =>
      fetchUsersApi({
        limit: 10,
        is_active: true,
      }),
    // onSuccess: (data) => setProjects(data),
  });

  // fetch task data if task id exists
  const getTaskQuery = useQuery({
    queryKey: ["task", taskId],
    enabled: false,
    staleTime: Infinity,
    queryFn: () =>
      fetchTaskApi({
        id: taskId,
      }),
    onSuccess: (data) => {
      setFormValue((prev) => {
        return {
          ...prev,
          name: data.name ?? "",
          project: data.project ?? "",
          subset: data.subset ?? "",
          assign_to: data.owner?.id ?? "",
        };
      });
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

  // console.log(formValue, formError);
  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {taskId ? "Update" : "Create a new"} task
            </h1>
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
                Subset <span className="text-red-600">*</span>
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
                  Select files <span className="text-red-600">*</span>
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
                        Upload Audio/ Video file only
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      // accept=".mp3,audio/*"
                      onChange={(e) =>
                        handleInputChange("files", e.target.files[0])
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

            <p className="mt-2 text-sm text-gray-500" id="files-error">
              {responseMsg.msg}{" "}
              <span className="text-audino-primary-dark">
                {responseMsg.status}
              </span>
            </p>

            {/* Action buttons */}
            <div className="flex-shrink-0 border-t border-gray-200 mt-8 pt-4">
              <div className="flex justify-end space-x-3">
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
    </>
  );
}
