import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import chunkUpload from "../functions/chunkUpload";
import { toast } from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchJobsApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs", {
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
  } catch (e) {
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const fetchJobDetailApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs/" + data.jobId, {
      params: {
        org: data?.org,
        // page: data?.page,
        // page_size: data?.page_size,
        // filter: data?.filter,
        // search: data?.searchValue,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const fetchAnnotationDataApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs/" + data.id + "/data", {
      responseType: 'arraybuffer',
      params: {
        org: data?.org,
        ...globalParams(),
        type : "chunk",
        quality : "compressed",
        number : 0
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const fetchAllAnnotationApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/jobs/" + data.id + "/annotations", {
      params: {
        org: data?.org,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};


export const patchJobMetaApi = async ({ jobId, data }) => {
  try {
    const res = await axios.patch(
      BASE_URL + "/jobs/" + jobId + "/data/meta",
      {
        deleted_frames : [0]
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
          action : "create"
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
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
          action : "update"
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
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
          action : "delete"
        },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};
