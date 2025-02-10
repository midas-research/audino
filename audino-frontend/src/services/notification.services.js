import axios from "axios";
import authHeader from "./auth-header";
import { handleDjangoErrors } from "../utils/errorHandler";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchNotificationsApi = async (data) => {
  try {
    const response = await axios.post(BASE_URL + `/notifications/fetch`, data, {
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const markAllAsReadApi = async (data) => {
  try {
    const response = await axios.post(
      BASE_URL + `/notifications/markallread`,
      data,
      {
        headers: { ...authHeader() },
      }
    );
    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};
