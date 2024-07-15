import toast from "react-hot-toast";

export const handleDjangoErrors = (errorData) => {
  const error = errorData.response?.data ?? "Something went wrong...";

  if (Array.isArray(error)) {
    error.forEach((message) => {
      toast.error(`${message}`);
    });
  } else if (typeof error === "object") {
    Object.keys(error).forEach((field) => {
      if (Array.isArray(error[field])) {
        error[field].forEach((message) => {
          toast.error(`${message}`);
        });
      } else {
        toast.error(`${error[field]}`);
      }
    });
  } else {
    toast.error(`${error}`);
  }
};
