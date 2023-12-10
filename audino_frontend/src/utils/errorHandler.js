import toast from "react-hot-toast";

export const handleDjangoErrors = (errorData) => {
  const error = errorData.response.data;
  Object.keys(error).forEach((field) => {
    if (Array.isArray(error)) {
      error.forEach((message) => {
        toast.error(`${message}`);
      });
    } else
      error[field].forEach((message) => {
        toast.error(`${field}: ${message}`);
      });
  });
};
