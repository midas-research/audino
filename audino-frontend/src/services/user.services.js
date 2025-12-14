import axios from "axios";
import authHeader from "./auth-header";
import { toast } from "react-hot-toast";
import globalParams from "./global-params";
import { handleDjangoErrors } from "../utils/errorHandler";
import './axios-config'

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchCurrentUserApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/users/self", {
      headers: { Authorization: "Token " + data.key },
    });
    return res.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.message ?? "Something went wrong");
  }
};

export const fetchUsersApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/users", {
      params: {
        ...data,
        ...globalParams()
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.message ?? "Something went wrong");
  }
};

