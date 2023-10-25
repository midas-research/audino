import axios from "axios";
import authHeader from "./auth-header";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const createAnnotationApi = async (data) => {
  try {
    const res = await axios.post(BASE_URL + "/api/annotation", data, {
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

