import axios from "axios";
import authHeader from "./auth-header";
import toast from "react-hot-toast";
import { handleDjangoErrors } from "../utils/errorHandler";
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const getAllMembershipsApi = async (organizationSlug = "") => {
  try {
    const response = await axios.get(
      BASE_URL + `/memberships?org=${organizationSlug}`,
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

export const deleteMembershipApi = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + `/memberships/${id}`, {
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.message ?? "Something went wrong");
  }
};

export const updateMembershipApi = async ({ newRole, id }) => {
  try {
    const response = await axios.patch(
      BASE_URL + `/memberships/${id}/`,
      { role: newRole }, // Assuming the backend expects the role property
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
