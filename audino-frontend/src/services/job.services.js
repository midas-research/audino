import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import { handleDjangoErrors } from "../utils/errorHandler";
import './axios-config';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchJobsApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs", {
      params: {
        ...data,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const fetchJobDetailApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs/" + data.jobId, {
      params: {
        org: data?.org,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const fetchJobMetaDataApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs/" + data.jobId + '/data/meta', {
      params: {
        org: data?.org,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const fetchAnnotationDataApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs/" + data.id + "/data", {
      responseType: "arraybuffer",
      params: {
        org: data?.org,
        ...globalParams(),
        type: "chunk",
        quality: "compressed",
        number: data.number,
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const fetchAllAnnotationApi = async (data) => {
  try {
    const res = await axios.get(
      BASE_URL + "/jobs/" + data.id + "/annotations",
      {
        params: {
          org: data?.org,
          ...globalParams(),
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const patchJobMetaApi = async ({ jobId, data }) => {
  try {
    const res = await axios.patch(
      BASE_URL + "/jobs/" + jobId + "/data/meta",
      {
        deleted_frames: [0],
      },
      {
        params: {
          org: data?.org,
          ...globalParams(),
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const patchJobApi = async ({ jobId, data }) => {
  try {
    const res = await axios.patch(BASE_URL + "/jobs/" + jobId, data, {
      params: {
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const postAnnotationApi = async ({ data, jobId }) => {
  try {
    const res = await axios.patch(
      BASE_URL + "/jobs/" + jobId + "/annotations",
      data,
      {
        params: {
          org: data?.org,
          ...globalParams(),
          action: "create",
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const putAnnotationApi = async ({ data, jobId }) => {
  try {
    const res = await axios.patch(
      BASE_URL + "/jobs/" + jobId + "/annotations/",
      data,
      {
        params: {
          org: data?.org,
          ...globalParams(),
          action: "update",
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const getAllAnnotationApi = async ({ data, jobId }) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs/" + jobId + "/annotations", {
      params: {
        org: data?.org,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const deleteAnnotationAPi = async ({ data, jobId }) => {
  try {
    const res = await axios.patch(
      BASE_URL + "/jobs/" + jobId + "/annotations/",
      data,
      {
        params: {
          org: data?.org,
          ...globalParams(),
          action: "delete",
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const autoAnnotationApi = async (data) => {
  try {
    const res = await axios.post(
      BASE_URL + "/ai-audio-annotation/ai-annotate",
      data,
      {
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data.msg ?? "Something went wrong");
  }
};

export const createJobAnnotationApi = async (data) => {
  try {
    const res = await axios.post(
      BASE_URL + "/jobs",
      data,
      {
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data.msg ?? "Something went wrong");
  }
};

export const deleteJobsApi = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + `/jobs/${id}`, {
      headers: { ...authHeader() },
    });
    return response.data;
  } catch (errorData) {
    handleDjangoErrors(errorData);
    throw Error(errorData.message ?? "Something went wrong");
  }
};
