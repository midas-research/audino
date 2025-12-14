import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import { handleDjangoErrors } from "../utils/errorHandler";
import "./axios-config";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchQualityReport = async ({ params }) => {
  try {
    const res = await axios.get(BASE_URL + `/quality/reports`, {
      params: { ...globalParams(), ...params },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const fetchQualityReportData = async ({ id }) => {
  try {
    const res = await axios.get(BASE_URL + `/quality/reports/${id}/data`, {
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const fetchQualityReportSettings = async ({ params }) => {
  try {
    const res = await axios.get(BASE_URL + `/quality/settings`, {
      params: { ...globalParams(), ...params },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const updateAnalyticsSettingApi = async ({ params, data }) => {
  try {
    const res = await axios.patch(
      BASE_URL + `/quality/settings/${params.id}`,
      data,
      {
        params: { ...globalParams() },
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const fetchAnnotationConflicts = async (id) => {
  try {
    const res = await axios.get(BASE_URL + `/quality/conflicts`, {
      params: {
        report_id: id,
        ...globalParams(),
      },
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const fetchJobQualityReportApi = async ({ jobId }) => {
  try {
    const res = await axios.post(
      BASE_URL + `/quality/reports/immediate-reports`,
      {
        job_id: jobId,
      },
      {
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    // handleDjangoErrors(e);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};