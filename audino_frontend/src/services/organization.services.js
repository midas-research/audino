import axios from "axios";
import authHeader from "./auth-header";
import { toast } from "react-hot-toast";
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
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (errorData) {
    toast.error(`Unable to load data: ${errorData.message}`);
    throw Error(errorData.response?.data ?? "Something went wrong");
  }
};

export const updateOrganizationApi = async ({ data, id }) => {
  try {
    const res = await axios.patch(BASE_URL + `/organizations/${id}/`, data, {
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (errorData) {
    toast.error(`Unable to load data: ${errorData.message}`);
    throw Error(errorData.response?.data ?? "Something went wrong");
  }
};

export const fetchOrganizationApi = async ({ id = "" }) => {
  try {
    const response = await axios.get(BASE_URL + `/organizations/${id}`, {
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    toast.error(`unable to fetch organization: ${errorData.message}`);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const fetchOrganizationsApi = async (data) => {
  try {
    const response = await axios.get(BASE_URL + "/organizations", {
      params: {
        org: data?.org,
        page: data?.page,
        page_size: data?.page_size,
        filter: data?.filter,
        search: data?.searchValue,
      },
      headers: { ...authHeader() },
    });

    return response.data;
  } catch (errorData) {
    toast.error(`unable to fetch organizations: ${errorData.message}`);
    throw Error(errorData.response?.data ?? "something went wrong");
  }
};

export const deleteOrganizationApi = async ({ id }) => {
  try {
   
    const response = await axios.delete(BASE_URL + `/organizations/${id}`, {
      headers: { ...authHeader() },
    });
  } catch (errorData) {
    toast.error(`Unable to delete organization : ${errorData.message}`);
    throw Error(errorData.message ?? "Something went wrong");
  }
};
