import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import { toast } from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const createProjectApi = async ({ data, params }) => {
  try {
    const res = await axios.post(BASE_URL + "/projects/", data, {
      params: {
        org: params.org,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const fetchProjectsApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/projects", {
      params: {
        org: data?.org,
        page: data?.page,
        page_size: data?.page_size,
        filter: data?.filter,
        search: data?.searchValue,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (errorData) {
    toast.error(`Unable to load data : ${errorData.message}`);
    throw Error(errorData.message ?? "Something went wrong");
  }
};

export const deleteProjectApi = async ({ id }) => {
  try {
    const res = await axios.delete(BASE_URL + `/projects/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const fetchProjectApi = async ({ id }) => {
  try {
    const res = await axios.get(BASE_URL + `/projects/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const updateProjectApi = async ({ params, data }) => {
  try {
    const res = await axios.patch(
      BASE_URL + `/projects/${params.projectId}`,
      data,
      {
        params: {
          org: params.org,
          ...globalParams(),
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const fetchLabelsApi = async ({ data, params:apiParams }) => {
  try {
    const res = await axios.get(BASE_URL + "/labels", {
      params: { ...apiParams, ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const deleteLabelApi = async ({ id }) => {
  try {
    const res = await axios.delete(BASE_URL + `/labels/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data ?? "Something went wrong");
  }
};
