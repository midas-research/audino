import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import { handleDjangoErrors } from "../utils/errorHandler";
import './axios-config';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const getInvitationApi = async ({key}) => {
  try {
    const response = await axios.get(BASE_URL + `/invitations/${key}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    // handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const getAllInvitationApi = async (data) => {
  try {
    const response = await axios.get(BASE_URL + `/invitations`, {
      params: { ...data.params, ...globalParams() },
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const createInvitationApi = async ({ invitationData }) => {
  try {
    const response = await axios.post(
      BASE_URL + `/invitations`,
      invitationData,
      {
        params: { ...globalParams() },
        headers: { ...authHeader() },
      }
    );

    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const changeInviationStatusApi = async ({ key, type }) => {
  try {
    const response = await axios.post(
      BASE_URL + `/invitations/${key}/${type}`,
      {},
      {
        params: { ...globalParams() },
        headers: { ...authHeader() },
      }
    );

    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};
