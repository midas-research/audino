import axios from "axios";
import authHeader from "./auth-header";
import { toast } from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchCurrentUserApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/users/self", {
      headers: { Authorization: "Token " + data.key },
    });
    return res.data;
  } catch (errorData) {
    toast.error(`Unable to load data : ${errorData.message}`);
    throw Error(errorData.message ?? "Something went wrong");
  }
};

export const fetchUsersApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/users", {
      params: {
        limit: data?.limit,
        is_active: data?.is_active,
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (errorData) {
    toast.error(`Unable to load data : ${errorData.message}`);
    throw Error(errorData.message ?? "Something went wrong");
  }
};

