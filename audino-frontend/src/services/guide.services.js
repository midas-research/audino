import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import { handleDjangoErrors } from "../utils/errorHandler";
import './axios-config'

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchGuideApi = async ({id}) => {
  try {
    const response = await axios.get(BASE_URL + `/guides/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    // handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};