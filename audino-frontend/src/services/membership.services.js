import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import toast from "react-hot-toast";
import { handleDjangoErrors } from "../utils/errorHandler";
import './axios-config'

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const getAllMembershipsApi = async (params) => {
  try {
    const response = await axios.get(BASE_URL + `/memberships`, {
      params: { ...globalParams(), ...params },
      headers: { ...authHeader() },
    });

    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const deleteMembershipApi = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + `/memberships/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.message ?? "Something went wrong");
  }
};

export const updateMembershipApi = async ({ id, payload }) => {
  try {
    const response = await axios.patch(
      BASE_URL + `/memberships/${id}`,
      payload,
      {
        headers: { ...authHeader() },
      }
    );
    toast.success("Role updated successfully.");
    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "Something went wrong");
  }
};
