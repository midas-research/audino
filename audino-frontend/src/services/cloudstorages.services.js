import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import { handleDjangoErrors } from "../utils/errorHandler";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchCloudStoragesApi = async (data) => {
  try {
    const response = await axios.get(BASE_URL + `/cloudstorages`, {
      params: {
        ...data,
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

export const fetchCloudStorageApi = async ({ id }) => {
  try {
    const res = await axios.get(BASE_URL + `/cloudstorages/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const createCloudStorageApi = async ({ data, params }) => {
  try {
    const res = await axios.post(BASE_URL + "/cloudstorages", data, {
      params: {
        org: params.org,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    console.log(res.data);
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const updateCloudStorageApi = async ({ data , id}) => {
  try {
    const res = await axios.patch(BASE_URL + `/cloudstorages/${id}`,data, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const deleteCloudStorageApi = async ({ id }) => {
  try {
    const res = await axios.delete(BASE_URL + `/cloudstorages/${id}`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const cloudStorageContentApi = async ({ id, prefix }) => {
  try {
    const res = await axios.get(BASE_URL + `/cloudstorages/${id}/content-v2`, {
      params: { ...globalParams(), prefix },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const cloudStorageStatusApi = async ({ id }) => {
  try {
    const res = await axios.get(BASE_URL + `/cloudstorages/${id}/status`, {
      params: { ...globalParams() },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};
