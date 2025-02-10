import { PROVIDER_OPTIONS } from "../../../../constants/providerOptions";
import CustomInput from "../../../../components/CustomInput/CustomInput";
import CustomSelect from "../../../../components/CustomInput/CustomSelect";
import AWSForm from "./AWSForm";

const AWSComponents = ({ formValue, formError, onInputChange, cloudStorageId }) => {
  return (
    <div className="ml-6 transition-transform duration-700 ease-in-out transform opacity-100 translate-y-2">
      <div className="my-4">
        <label
          htmlFor="bucket_name"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
        >
          Bucket name <span className="text-red-600 dark:text-audino-primary">*</span>
        </label>
        <CustomInput
          type="text"
          name="resource"
          id="resource"
          formError={formError}
          placeholder="Bucket name"
          value={formValue.resource}
          onChange={(e) => onInputChange("resource", e.target.value)}
          disabled={Boolean(cloudStorageId)}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="authentication_type"
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
        >
          Authentication type <span className="text-red-600 dark:text-audino-primary">*</span>
        </label>
        <>
          <CustomSelect
            id="credentials_type"
            name="credentials_type"
            options={PROVIDER_OPTIONS[0].config.authentication.map((val) => ({
              label: val.type,
              value: val.value
            }))}
            formError={formError}
            value={formValue.credentials_type}
            onChange={(e) => onInputChange("credentials_type", e.target.value)}
          />
          {formValue.credentials_type === "KEY_SECRET_KEY_PAIR" && (
            <AWSForm formValue={formValue} formError={formError} onInputChange={onInputChange} />
          )}
        </>

      </div>
    </div>
  );
};

export default AWSComponents;




