import axios from "axios";
import authHeader from "./auth-header";
import { handleDjangoErrors } from "../utils/errorHandler";
import "./axios-config";

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

export const forgotPasswordApi = async ({ email }) => {
  try {
    const res = await axios.post(BASE_URL + "/auth/password/reset", {
      email: email,
    });
    return res.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData?.message ?? "Something went wrong");
  }
};

export const resetPasswordApi = async (data) => {
  try {
    const res = await axios.post(
      BASE_URL + "/auth/password/reset/confirm",
      data
    );
    return res.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    // throw Error(errorData?.message ?? "Something went wrong");
  }
};
