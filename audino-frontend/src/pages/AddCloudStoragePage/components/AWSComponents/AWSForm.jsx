import CustomInput from "../../../../components/CustomInput/CustomInput";

const AWSForm = ({ formValue, formError, onInputChange }) => {
    return (
        <div className="ml-6 transition-transform duration-700 ease-in-out transform opacity-100 translate-y-0">
            <div className="my-4">
                <label
                    htmlFor="bucket_name"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                >
                    Access key ID <span className="text-red-600 dark:text-audino-primary">*</span>
                </label>
                <CustomInput
                    type="password"
                    name="key"
                    id="key"
                    formError={formError}
                    placeholder="Access key id"
                    value={formValue.key}
                    onChange={(e) => onInputChange("key", e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label
                    htmlFor="authentication_type"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                >
                    Secret access key <span className="text-red-600 dark:text-audino-primary">*</span>
                </label>
                <CustomInput
                    type="password"
                    name="secret_key"
                    id="secret_key"
                    formError={formError}
                    placeholder="Secret access key"
                    value={formValue.secret_key}
                    onChange={(e) => onInputChange("secret_key", e.target.value)}
                />
            </div>
        </div>
    )
}

export default AWSForm;
