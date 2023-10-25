import axios from "axios";
import authHeader from "./auth-header";
import { toast } from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const loginRequestApi = async (data) => {
  try {
    const res = await axios.post(BASE_URL + "/auth/login", data, {
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    // const error = e.response.data;
    // Object.keys(error).forEach((field) => {
    //   console.log(error, field, error[field]);
    //   if (Array.isArray(error)) {
    //     error.forEach((message) => {
    //       toast.error(`${message}`);
    //     });
    //   } else
    //     error[field].forEach((message) => {
    //       toast.error(`${field}: ${message}`);
    //     });
    // });
    toast.error(e.response?.data.error ?? "Something went wrong");
    throw Error(e.response?.data.error ?? "Something went wrong");
  }
};

export const signupRequestApi = async (data) => {
  try {
    const res = await axios.post(BASE_URL + "/auth/register", data, {
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    const error = e.response.data;
    Object.keys(error).forEach((field) => {
      console.log(error, field, error[field]);
      if (Array.isArray(error)) {
        error.forEach((message) => {
          toast.error(`${message}`);
        });
      } else
        error[field].forEach((message) => {
          toast.error(`${field}: ${message}`);
        });
    });
    throw Error(e.response?.data ?? "Something went wrong");
  }
};
