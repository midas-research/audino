import { Fragment, useCallback, useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import AttributeModal from "./components/AttributeModal";
import PrimaryIconButton from "../../components/PrimaryButton/PrimaryIconButton";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import { useNavigate, useParams } from "react-router";
import { projectAllValidation } from "../../validation/allValidation";
import CustomInput from "../../components/CustomInput/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import {
  createProjectRequest,
  fetchLabelsRequest,
  fetchProjectRequest,
  updateProjectRequest,
} from "../../store/Actions/projectAction";
import AddProjectPageLoader from "./components/AddProjectPageLoader";
import useSingleFieldValidation from "../../utils/inputDebounce";
import { projectSingleFieldValidation } from "../../validation/singleValidation";
import NewValueField from "./components/NewValueField";
import dayjs from "dayjs";
import { useLabelStore, default_labels_obj } from "../../zustand-store/labels";
import TaskPage from "../TaskPage/TaskPage";
import CustomSelect from "../../components/CustomInput/CustomSelect";
import { SketchPicker } from "react-color";
import toast from "react-hot-toast";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useLabelsQuery } from '../../services/Labels/useQueries';
import useDeleteLabelMutation from '../../services/Labels/useMutation';
import { useUserQuery } from "../../services/User/useQueries";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const initialData = {
  name: "",
  description: "",
  assign_to: "",
};

export default function AddProjectPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: projectId } = useParams();
  const {
    isCreateProjectLoading,
    isProjectLoading,
    project,
    isUpdateProjectLoading,
  } = useSelector((state) => state.projectReducer);
  const labels_obj = useLabelStore((state) => state.labels_obj);
  const setLabels = useLabelStore((state) => state.setLabels);

  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState({
    name: null,
    description: null,
  });
  const [formValue, setFormValue] = useState(initialData);
  const [currentLabelIndex, setCurrentLabelIndex] = useState(-1);
  var advancedFormat = require("dayjs/plugin/advancedFormat");
  dayjs.extend(advancedFormat);



  const [showEmojiList, setShowEmojiList] = useState(
    Array.from({ length: labels_obj.results.length }, () => false)
  );
  const [showColorList, setShowColorList] = useState(
    Array.from({ length: labels_obj.results.length }, () => false)
  );
  const { debouncedValidation } = useSingleFieldValidation(
    projectSingleFieldValidation,
    1000,
    formError,
    setFormError
  );

  const handleInputChange = (name, value) => {
    setFormValue((prev) => ({ ...prev, [name]: value }));
    debouncedValidation({ name, value });
  };

  const handleSave = () => {
    const { isValid, error } = projectAllValidation({
      name: formValue.name,
      labels: labels_obj.results,
    });
    const payload = {
      data: {
        name: formValue.name,
        labels: labels_obj.results,
        assignee_id: parseInt(formValue.assign_to),
        source_storage: { location: "local" },
        target_storage: { location: "local" },
      },
      params: { org: "" },
    };
    if (isValid) {
      if (projectId)
        dispatch(
          updateProjectRequest({
            payload: { ...payload, params: { ...payload.params, projectId } },
            callback: () => toast.success("Project updated successfully"),
          })
        );
      else
        dispatch(
          createProjectRequest({
            payload,
            callback: (data) =>
              navigate(`/projects/${data.id}?page=1`, { replace: true }),
          })
        );
    }
    setFormError(error);
  };

  const handleAddLabel = () => {
    setLabels({
      ...labels_obj,
      results: [
        ...labels_obj.results,
        {
          name: "",
          type: "any",
          color:
            "#" +
            ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"),
          attributes: [],
        },
      ],
    });
    // setShowEmojiList((prev) => [...prev, false]);
  };

  const handleDeleteLabel = (id, index) => {
    // setShowEmojiList((prev) => prev.filter((val, ind) => ind !== index));
    if (id) {
      const updatedLabels = labels_obj.results.filter(
        (labelVal, labelInd) => labelVal.id !== id
      );
      setLabels({ ...labels_obj, results: updatedLabels });
      deleteLabelMutation.mutate({ id, index });
    } else {
      const updatedLabels = labels_obj.results.filter(
        (labelVal, labelInd) => labelInd !== index
      );
      setLabels({ ...labels_obj, results: updatedLabels });
    }
  };

  const handleValueChange = (val, index, key) => {
    console.log(index);
    const updatedLabels = [...labels_obj.results];
    console.log(updatedLabels);
    updatedLabels[index][key] = val;
    setLabels({ ...labels_obj, results: updatedLabels });
  };

  // fetch project data if project id exists
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectRequest({ payload: { id: projectId } }));
    } else {
      setFormValue(initialData);
      setLabels(default_labels_obj);
    }
  }, [projectId]);

  // set project data if available
  useEffect(() => {
    if (projectId && project) {
      setFormValue((prev) => {
        return {
          ...prev,
          name: project.name ?? "",
          // description: project.description,
          assign_to: project.assignee?.id ?? "",
        };
      });
    }
  }, [project, projectId]);

  // fetch labels when project data is fetched
  useEffect(() => {
    if (project?.id !== undefined && projectId !== undefined) {
      // Manually execute the query when the component mounts
      getLabelsQuery.refetch();
    }
  }, [project?.id, projectId]);



  const getLabelsQuery = useLabelsQuery({
    queryConfig: {
      queryKey: [projectId],
      apiParams: {
        project_id: projectId,
        page_size: 500,
        page: 1,
      },
      staleTime: Infinity,
      enabled: false,
      onSuccess: (data) => setLabels({ ...labels_obj, results: data }),
    }
  })



  const deleteLabelMutation = useDeleteLabelMutation({
    mutationConfig: {
      onSuccess: (data, { id }) => {
        setLabels({
          ...labels_obj,

        });
      },
      onMutate: ({ id }) => {
        return { id };
      },
    },
  });




  //   fetch users
  const getUsersQuery = useUserQuery({
    queryConfig: {
      queryKey: [],
      apiParams: {
        limit: 10,
        is_active: true,
      },
      enabled: true,

    }
  })

  useEffect(() => {
    if (labels_obj.results.length) {
      const boolArray = Array.from(
        { length: labels_obj.results.length },
        () => false
      );
      setShowEmojiList(boolArray);
      setShowColorList(boolArray);
    }
  }, [labels_obj.results.length]);





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
              {projectId ? "Update" : "Create a new"} project
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {isProjectLoading ? (
          <AddProjectPageLoader />
        ) : (
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full ">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Project name <span className="text-red-600">*</span>
              </label>
              <CustomInput
                type="text"
                name="name"
                id="name"
                formError={formError}
                placeholder="Test"
                value={formValue.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            {/* <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Project description
              </label>
              <CustomInput
                type="text"
                inputType="textarea"
                name="description"
                id="description"
                formError={formError}
                placeholder="Testing"
                value={formValue.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div> */}

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

            <div className="flex justify-between">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Labels
              </label>
              <PrimaryIconButton onClick={() => handleAddLabel()}>
                Add new label
              </PrimaryIconButton>
            </div>

            {labels_obj.results.length > 0 ? (
              <div className="-mx-4 mt-3 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-center text-sm font-medium text-gray-900"
                      >
                        Color
                      </th>

                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-center text-sm font-medium text-gray-900 lg:table-cell"
                      >
                        Attribute Names
                      </th>

                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Select</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {labels_obj.results.slice(1).map((label, labelIdx) => (
                      <tr key={`label-${labelIdx}`}>
                        <td
                          className={classNames(
                            labelIdx === 0 ? "" : "border-t border-transparent",
                            "relative py-4 pl-4 pr-3 text-sm sm:pl-6"
                          )}
                        >
                          <div className="font-medium text-gray-900">
                            <NewValueField
                              key={`label-name-${labelIdx}`}
                              index={labelIdx + 1}
                              setShowEmojiList={setShowEmojiList}
                              showEmojiList={showEmojiList}
                              value={label.name}
                              setValue={(val) =>
                                handleValueChange(val, labelIdx + 1, "name")
                              }
                              placeholder="Label name"
                              isColorPicker={true}
                            />
                          </div>

                          {labelIdx !== 0 ? (
                            <div className="absolute -top-px left-6 right-0 h-px bg-gray-200" />
                          ) : null}
                        </td>
                        <td
                          className={classNames(
                            labelIdx === 0 ? "" : "border-t border-gray-200",
                            " px-3 py-3.5 text-sm text-gray-500 text-center"
                          )}
                        >
                          <div
                            className={
                              "bg-white rounded cursor-pointer flex justify-center"
                            }
                            onClick={() =>
                              setShowColorList((prev) =>
                                prev.map((val, ind) => {
                                  if (ind === labelIdx) {
                                    return !val;
                                  } else return false;
                                })
                              )
                            }
                          >
                            <div
                              className={`w-8 h-6 rounded`}
                              style={{ backgroundColor: label.color }}
                            />
                          </div>
                          {showColorList[labelIdx] && (
                            <div
                              className={`absolute z-10 ${!showColorList[labelIdx] ? "hidden" : ""
                                }`}
                            >
                              <div
                                className="fixed inset-0"
                                onClick={() =>
                                  setShowColorList((prev) =>
                                    prev.map((val, ind) => {
                                      if (ind === labelIdx) {
                                        return !val;
                                      } else return false;
                                    })
                                  )
                                }
                              />
                              <SketchPicker
                                color={label.color}
                                onChange={(newColor) =>
                                  handleValueChange(
                                    newColor.hex,
                                    labelIdx + 1,
                                    "color"
                                  )
                                }
                              />
                            </div>
                          )}
                        </td>
                        <td
                          className={classNames(
                            labelIdx === 0 ? "" : "border-t border-gray-200",
                            "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell text-center"
                          )}
                        >
                          {label.attributes.length
                            ? label.attributes.map(
                              (attrib) => attrib.name + " "
                            )
                            : ""}
                        </td>
                        <td
                          className={classNames(
                            labelIdx === 0 ? "" : "border-t border-transparent",
                            "relative py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                          )}
                        >
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              setOpen(true);
                              setCurrentLabelIndex(labelIdx + 1);
                            }}
                            disabled={!label.name}
                          >
                            {label.attributes.length ? "Edit" : "Add"}{" "}
                            attributes
                            <span className="sr-only">, {label.name}</span>
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-sm font-medium text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white ml-2"
                            onClick={() =>
                              handleDeleteLabel(label?.id, labelIdx + 1)
                            }
                          >
                            {deleteLabelMutation.isLoading &&
                              deleteLabelMutation.variables.id === label?.id ? (
                              <svg
                                aria-hidden="true"
                                role="status"
                                className="h-5 w-5 mr-2 animate-spin text-white"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                  fill="#E5E7EB"
                                />
                                <path
                                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                  fill="currentColor"
                                />
                              </svg>
                            ) : (
                              "Delete"
                            )}{" "}
                            <span className="sr-only">, {label.name}</span>
                          </button>
                          {labelIdx !== 0 ? (
                            <div className="absolute -top-px left-0 right-6 h-px bg-gray-200" />
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* Action buttons */}
            <div className="flex justify-between items-center flex-shrink-0 border-t border-gray-200 mt-8 pt-4">
              <p className="text-sm font-normal leading-6 text-gray-500 ">
                {projectId
                  ? `Project #${project?.id} created by ${project?.owner?.username
                  } on ${dayjs(project?.created_date).format("MMMM Do YYYY")}`
                  : null}
              </p>
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
                  loading={isCreateProjectLoading || isUpdateProjectLoading}
                >
                  Save
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Attribute slider */}
      <AttributeModal
        open={open}
        setOpen={setOpen}
        currentLabelIndex={currentLabelIndex}
        setCurrentLabelIndex={setCurrentLabelIndex}
      />

      {projectId && (
        <TaskPage
          prevFilter={`{"and":[{"==":[{"var":"project_id"},${projectId}]}]}`}
          isRemoveAppbar={true}
          projectId={projectId}
        />
      )}
    </>
  );
}
