import axios from "axios";
import authHeader from "./auth-header";
import { handleDjangoErrors } from "../utils/errorHandler";
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const getInvitationApi = async (key = "", org = "") => {
  try {
    const response = await axios.get(
      BASE_URL + `/invitations/${key}?org=${org}`,
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

export const createInvitationApi = async ({
  invitationData,
  organizationSlug,
}) => {
  try {
    const response = await axios.post(
      BASE_URL + `/invitations/?org=${organizationSlug}`,
      invitationData,
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
