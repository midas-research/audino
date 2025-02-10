import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast'
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate, useLocation, useParams } from "react-router";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import CustomSelect from "../../components/CustomInput/CustomSelect";
import CustomInput from "../../components/CustomInput/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeftIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { PROVIDER_OPTIONS } from "../../constants/providerOptions";
import AddCloudStorageLoader from "./components/AddCloudStorageLoader";
import AWSComponents from "./components/AWSComponents/AWSComponents";
import NewInputField from "../AddCloudStoragePage/components/NewInputField";
import {
  createCloudStorageRequest,
  fetchCloudStorageRequest,
  updateCloudStorageRequest,
} from "../../store/Actions/cloudActions";
import { cloudStorageAllValidation } from "../../validation/allValidation";
import { generateRandomDigit } from "../../functions/randomNumbers";


const initialData = {
  display_name: "",
  provider_type: "",
  resource: "",
  credentials_type: "",
  key: "",
  secret_key: "",
  manifests: [],
};

export default function AddCloudStoragePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: cloudStorageId } = useParams();
  const location = useLocation();
  const [formValue, setFormValue] = useState(initialData);
  const [formError, setFormError] = useState({});
  const { isCloudStorageLoading, isUpdateCloudStorageLoading, isCreateCloudStorageLoading, cloud } = useSelector((state) => state.cloudReducer);

  const handleInputChange = (name, value) => {
    setFormValue((prev) => ({ ...prev, [name]: value }));
  };

  // const handleNestedInputChange = (section, name, value) => {
  //   setFormValue((prev) => ({
  //     ...prev,
  //     [section]: { ...prev[section], [name]: value },
  //   }));
  // };

  const handleAddManifest = () => {
    setFormValue((prev) => ({
      ...prev,
      manifests: [...prev.manifests, { value: "", error: "" }],
    }));
  };

  const handleRemoveManifest = (index) => {
    setFormValue((prev) => ({
      ...prev,
      manifests: prev.manifests.filter((_, i) => i !== index),
    }));
  };

  const handleManifestChange = (index, value) => {
    setFormValue((prev) => ({
      ...prev,
      manifests: prev.manifests.map((manifest, i) =>
        i === index ? { ...manifest, value } : manifest
      ),
    }));
  };



  const handleSave = () => {
    const { isValid, error } = cloudStorageAllValidation({
      display_name: formValue.display_name,
      provider_type: formValue.provider_type,
      resource: formValue.resource,
      credentials_type: formValue.credentials_type,
    });
    let payload = {
      data: {},
      params: { org: "" },
    };

    if (cloudStorageId) {
      payload.data = {
        display_name: formValue.display_name,
        credentials_type: formValue.credentials_type,
      };
    } else {
      payload.data = {
        display_name: formValue.display_name,
        provider_type: formValue.provider_type,
        resource: formValue.resource,
        credentials_type: formValue.credentials_type,
        key: formValue.key,
        secret_key: formValue.secret_key,
        manifests: formValue.manifests,
      };
    }

    if (isValid) {
      if (cloudStorageId)
        dispatch(
          updateCloudStorageRequest({
            data: payload.data,
            id: cloudStorageId,
            callback: () => {
              toast.success("Cloud storage updated successfully")
              navigate('/cloud-storages?page=1')
            }
          })
        );
      else
        dispatch(
          createCloudStorageRequest({
            payload,
            callback: (data) => navigate('/cloud-storages?page=1'),
          })
        );
    }
    setFormError(error);
  };

  useEffect(() => {
    if (cloudStorageId) {
      dispatch(fetchCloudStorageRequest({ payload: { id: cloudStorageId } }));
      setFormValue((prev) => {
        return {
          ...prev,
          key: generateRandomDigit(40),
          secret_key: generateRandomDigit()
        }
      })
    } else {
      setFormValue(initialData);
    }
  }, [cloudStorageId]);

  useEffect(() => {
    console.log('cloud', cloud)
    if (cloudStorageId && cloud) {
      setFormValue((prev) => {
        return {
          ...prev,
          display_name: cloud.display_name ?? "",
          provider_type: cloud.provider_type ?? "",
          resource: cloud.resource ?? "",
          credentials_type: cloud.credentials_type ?? "",
        };
      });
    }
  }, [cloud, cloudStorageId]);


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
                {cloudStorageId ? "Update" : "Create"} a cloud storage
              </h1>
            </div>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {isCloudStorageLoading ? (
          <AddCloudStorageLoader />
        ) : (
          <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full">
            <div className="mb-4">
              <label
                htmlFor="display_name"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
              >
                Display name <span className="text-red-600 dark:text-audino-primary">*</span>
              </label>
              <CustomInput
                type="text"
                name="display_name"
                id="display_name"
                formError={formError}
                placeholder="Display name"
                value={formValue.display_name}
                onChange={(e) => handleInputChange("display_name", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="provider"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Provider <span className="text-red-600 dark:text-audino-primary">*</span>
              </label>

              <CustomSelect
                id="provider_type"
                name="provider_type"
                options={PROVIDER_OPTIONS.map((val) => ({
                  label: val.provider,
                  value: val.value,
                }))}
                formError={formError}
                value={formValue.provider_type}
                onChange={(e) => handleInputChange("provider_type", e.target.value)}
                disabled={Boolean(cloudStorageId)}
              />
              {formValue.provider_type === "AWS_S3_BUCKET" && (
                <AWSComponents
                  formValue={formValue}
                  formError={formError}
                  cloudStorageId={cloudStorageId}
                  onInputChange={(name, value) =>
                    handleInputChange(name, value)
                  }
                />
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="manifests"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
              >
                Manifests
              </label>
              {formValue.manifests.map((manifest, index) => (
                <div key={index} className="w-1/2 md:w-1/4 my-2">
                  <NewInputField
                    index={index}
                    value={manifest.value}
                    setValue={(val) => handleManifestChange(index, val)}
                    onRemoveLabel={() => handleRemoveManifest(index)}
                    error={manifest.error}
                  />
                </div>
              ))}
              <button
                className="my-4 flex gap-2 text-sm px-3 py-2 dark:bg-audino-light-navy dark:ring-audino-charcoal rounded-md ring-gray-300 text-black dark:text-audino-cloud-gray ring-1 ring-inset"
                onClick={handleAddManifest}
              >
                <PlusCircleIcon className="h-5 w-5 dark:text-audino-cloud-gray text-black" />
                Add manifest
              </button>
            </div>

            <div className="flex justify-end border-t border-gray-200 dark:border-audino-slate-gray mt-12 pt-4">
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="rounded-md bg-white dark:bg-transparent px-3 py-2 text-sm font-medium text-gray-900 dark:text-audino-medium-gray shadow-sm ring-1 ring-inset dark:ring-audino-steel ring-gray-300 hover:bg-gray-50"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <PrimaryButton loading={ isCreateCloudStorageLoading || isUpdateCloudStorageLoading} onClick={handleSave}>Save</PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
