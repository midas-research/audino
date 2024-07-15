import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import toast from "react-hot-toast";
import { handleDjangoErrors } from "../utils/errorHandler";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const createAnnotationApi = async (data) => {
  try {
    const res = await axios.post(BASE_URL + "/api/annotation", data, {
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const patchAnnotationApi = async (data) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/jobs/${data.jobId}/annotations?action=${data.action}`,
      data.data,
      {
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const downloadAnnotationApi = async (data) => {
  async function wait({ currentId, format, type }) {
    let params = {
      ...globalParams(),
    };
    return new Promise((resolve, reject) => {
      async function checkStatus() {
        try {
          let url = `${BASE_URL}/${type}/${currentId}/annotations?format=${format}`;
          const response = await axios.get(url, {
            params: params,
            headers: { ...authHeader() },
            responseType: "arraybuffer",
          });

          if (response.status === 201) {
            params.action = "download";
            checkStatus();
          }
          if (response.status === 202) setTimeout(checkStatus, 3000);
          if (response.status === 200) resolve(response.data);
          // if (["Queued", "Started"].includes(response.data.state)) {
          //   if (response.data.message !== "") {
          //     onUpdate(response.data.message, response.data.progress || 0);
          //   }
          //   setTimeout(checkStatus, 1000);
          // } else if (response.data.state === "Finished") {
          //   resolve();
          // } else if (response.data.state === "Failed") {
          //   // If request has been successful, but task hasn't been created
          //   // Then passed data is wrong and we can pass code 400 - ToDo
          //   const message = `
          //                 Could not create the task on the server. ${response.data.message}.
          //             `;
          //   toast.error(message);
          //   reject(Error(message));
          // } else {
          //   // If server has another status, it is unexpected
          //   // Therefore it is server error and we can pass code 500
          //   const message = `Unknown task state has been received: ${response.data.state}`;
          //   toast.error(message);
          //   reject(Error(message));
          // }
        } catch (errorData) {
          const message = `Could not fetch status  ${errorData.message}`;
          toast.error(message);
          reject(Error(message));
        }
      }

      setTimeout(checkStatus);
    });
  }

  try {
    return await wait(data);
  } catch (createException) {
    throw createException;
  }
};

