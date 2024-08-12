import axios from "axios";
import authHeader from "./auth-header";
import { handleDjangoErrors } from "../utils/errorHandler";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const loginRequestApi = async (data) => {
  try {
    const res = await axios.post(BASE_URL + "/auth/login", data, {
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
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
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};
