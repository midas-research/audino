import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import { toast } from "react-hot-toast";
import { handleDjangoErrors } from "../utils/errorHandler";
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

//  Dummy response
const response = {
  id: Math.ceil(Math.random() * 100),
  author: "Ajit Kumar",
  date: "2d ago",
  dateTime: "2023-01-23T22:34Z",
  slug: "slug_" + Math.ceil(Math.random() * 10000),
  name: "organization" + Math.ceil(Math.random() * 100),
  description: "description",
  contact: {
    email: "a@email.com",
    mobileNumber: "9999999999",
    location: "some location",
  },
};

export const createOrganizationApi = async ({ data }) => {
  try {
    const res = await axios.post(BASE_URL + "/organizations/", data, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "Something went wrong");
  }
};

export const updateOrganizationApi = async ({ data, id }) => {
  try {
    const res = await axios.patch(BASE_URL + `/organizations/${id}/`, data, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "Something went wrong");
  }
};

export const fetchOrganizationApi = async ({ id = "" }) => {
  try {
    const response = await axios.get(BASE_URL + `/organizations/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const fetchOrganizationsApi = async (data) => {
  try {
    const response = await axios.get(BASE_URL + "/organizations", {
      params: {
        page: data?.page,
        page_size: data?.page_size,
        filter: data?.filter,
        search: data?.searchValue,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });

    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const deleteOrganizationApi = async ({ id }) => {
  try {
    const response = await axios.delete(BASE_URL + `/organizations/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.message ?? "Something went wrong");
  }
};
