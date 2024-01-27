import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import chunkUpload from "../functions/chunkUpload";
import { toast } from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const createTaskApi = async ({ taskSpec, taskDataSpec, onUpdate }) => {
  const params = {}; // enableOrganization();

  async function wait(id) {
    return new Promise((resolve, reject) => {
      async function checkStatus() {
        try {
          const response = await axios.get(`${BASE_URL}/tasks/${id}/status`, {
            params:{...globalParams()},
            headers: { ...authHeader() },
          });
          if (["Queued", "Started"].includes(response.data.state)) {
            if (response.data.message !== "") {
              onUpdate(response.data.message, response.data.progress || 0);
            }
            setTimeout(checkStatus, 1000);
          } else if (response.data.state === "Finished") {
            resolve();
          } else if (response.data.state === "Failed") {
            // If request has been successful, but task hasn't been created
            // Then passed data is wrong and we can pass code 400 - ToDo
            const message = `
                          Could not create the task on the server. ${response.data.message}.
                      `;
            toast.error(message);
            reject(Error(message));
          } else {
            // If server has another status, it is unexpected
            // Therefore it is server error and we can pass code 500
            const message = `Unknown task state has been received: ${response.data.state}`;
            toast.error(message);
            reject(Error(message));
          }
        } catch (errorData) {
          const message = `Could not fetch task status  ${errorData.message}`;
          toast.error(message);
          reject(Error(message));
        }
      }

      setTimeout(checkStatus, 1000);
    });
  }
  // console.log(taskSpec, taskDataSpec, onUpdate);

  const chunkSize = 100 * 1024 * 1024; // threshold for chunksize
  const clientFiles = taskDataSpec.client_files;
  const chunkFiles = [];
  const bulkFiles = [];
  let totalSize = 0;
  let totalSentSize = 0;
  for (const file of clientFiles) {
    if (file.size > chunkSize) {
      chunkFiles.push(file);
    } else {
      bulkFiles.push(file);
    }
    totalSize += file.size;
  }
  delete taskDataSpec.client_files;

  const taskData = new FormData();
  for (const [key, value] of Object.entries(taskDataSpec)) {
    if (Array.isArray(value)) {
      value.forEach((element, idx) => {
        taskData.append(`${key}[${idx}]`, element);
      });
    } else {
      taskData.set(key, value);
    }
  }

  let response = null;

  onUpdate("The task is being created on the server..", null);
  try {
    response = await axios.post(`${BASE_URL}/tasks`, taskSpec, {
      params:{...globalParams()},
      headers: { ...authHeader() },
    });
  } catch (errorData) {
    toast.error(errorData.message);
  }

  onUpdate("The data are being uploaded to the server..", null);

  async function bulkUpload(taskId, files) {
    const fileBulks = files.reduce(
      (fileGroups, file) => {
        const lastBulk = fileGroups[fileGroups.length - 1];
        if (chunkSize - lastBulk.size >= file.size) {
          lastBulk.files.push(file);
          lastBulk.size += file.size;
        } else {
          fileGroups.push({ files: [file], size: file.size });
        }
        return fileGroups;
      },
      [{ files: [], size: 0 }]
    );
    const totalBulks = fileBulks.length;
    let currentChunkNumber = 0;
    while (currentChunkNumber < totalBulks) {
      for (const [idx, element] of fileBulks[
        currentChunkNumber
      ].files.entries()) {
        taskData.append(`client_files[${idx}]`, element);
      }
      const percentage = totalSentSize / totalSize;
      onUpdate("The data are being uploaded to the server", percentage);
      await axios.post(`${BASE_URL}/tasks/${taskId}/data`, taskData, {
        params:{...globalParams()},
        headers: { "Upload-Multiple": true, ...authHeader() },
      });
      for (let i = 0; i < fileBulks[currentChunkNumber].files.length; i++) {
        taskData.delete(`client_files[${i}]`);
      }
      totalSentSize += fileBulks[currentChunkNumber].size;
      currentChunkNumber++;
    }
  }

  try {
    await axios.post(`${BASE_URL}/tasks/${response.data.id}/data`, taskData, {
      params:{...globalParams()},
      headers: { "Upload-Start": true, ...authHeader() },
    });
    const uploadConfig = {
      endpoint: `${BASE_URL}/tasks/${response.data.id}/data/`,
      onUpdate: (percentage) => {
        onUpdate("The data are being uploaded to the server", percentage);
      },
      chunkSize,
      totalSize,
      totalSentSize,
    };
    for (const file of chunkFiles) {
      uploadConfig.totalSentSize += await chunkUpload(file, uploadConfig);
    }
    if (bulkFiles.length > 0) {
      await bulkUpload(response.data.id, bulkFiles);
    }
    await axios.post(`${BASE_URL}/tasks/${response.data.id}/data`, taskData, {
      params:{...globalParams()},
      headers: { "Upload-Finish": true, ...authHeader() },
    });
  } catch (errorData) {
    await deleteTaskApi({ id: response.data.id });
    toast.error(`Unable to upload data : ${errorData.message}`);
  }

  try {
    await wait(response.data.id);
  } catch (createException) {
    // await deleteTaskApi({ id: response.data.id });
    throw createException;
  }

  // to be able to get the task after it was created, pass frozen params
  const createdTask = await fetchTaskApi({ id: response.data.id });
  onUpdate("The task is created on the server successfully", null);
  return createdTask;
};

export const createTaskWithDataApi = async ({ taskSpec, taskDataSpec, onUpdate }) => {
  const params = {}; // enableOrganization();

  async function wait(id) {
    return new Promise((resolve, reject) => {
      async function checkStatus() {
        try {
          const response = await axios.get(`${BASE_URL}/tasks/${id}/status`, {
            params,
            headers: { ...authHeader() },
          });
          if (["Queued", "Started"].includes(response.data.state)) {
            if (response.data.message !== "") {
              onUpdate(response.data.message, response.data.progress || 0);
            }
            setTimeout(checkStatus, 1000);
          } else if (response.data.state === "Finished") {
            resolve();
          } else if (response.data.state === "Failed") {
            // If request has been successful, but task hasn't been created
            // Then passed data is wrong and we can pass code 400 - ToDo
            const message = `
                          Could not create the task on the server. ${response.data.message}.
                      `;
            toast.error(message);
            reject(Error(message));
          } else {
            // If server has another status, it is unexpected
            // Therefore it is server error and we can pass code 500
            const message = `Unknown task state has been received: ${response.data.state}`;
            toast.error(message);
            reject(Error(message));
          }
        } catch (errorData) {
          const message = `Could not fetch task status  ${errorData.message}`;
          toast.error(message);
          reject(Error(message));
        }
      }

      setTimeout(checkStatus, 1000);
    });
  }
  console.log(taskSpec, taskDataSpec, onUpdate);

  const chunkSize = 100 * 1024 * 1024; // threshold for chunksize
  const clientFiles = taskDataSpec.client_files;
  const chunkFiles = [];
  const bulkFiles = [];
  let totalSize = 0;
  let totalSentSize = 0;
  for (const file of clientFiles) {
    if (file.size > chunkSize) {
      chunkFiles.push(file);
    } else {
      bulkFiles.push(file);
    }
    totalSize += file.size;
  }
  delete taskDataSpec.client_files;

  const taskData = new FormData();
  for (const [key, value] of Object.entries(taskDataSpec)) {
    if (Array.isArray(value)) {
      value.forEach((element, idx) => {
        taskData.append(`${key}[${idx}]`, element);
      });
    } else {
      taskData.set(key, value);
    }
  }

  let response = null;

  onUpdate("The task is being created on the server..", null);
  try {
    response = await axios.post(`${BASE_URL}/tasks`, taskSpec, {
      params,
      headers: { ...authHeader() },
    });
  } catch (errorData) {
    toast.error(errorData.message);
  }

  onUpdate("The data are being uploaded to the server..", null);

  async function bulkUpload(taskId, files) {
    const fileBulks = files.reduce(
      (fileGroups, file) => {
        const lastBulk = fileGroups[fileGroups.length - 1];
        if (chunkSize - lastBulk.size >= file.size) {
          lastBulk.files.push(file);
          lastBulk.size += file.size;
        } else {
          fileGroups.push({ files: [file], size: file.size });
        }
        return fileGroups;
      },
      [{ files: [], size: 0 }]
    );
    const totalBulks = fileBulks.length;
    let currentChunkNumber = 0;
    while (currentChunkNumber < totalBulks) {
      for (const [idx, element] of fileBulks[
        currentChunkNumber
      ].files.entries()) {
        taskData.append(`client_files[${idx}]`, element);
      }
      const percentage = totalSentSize / totalSize;
      onUpdate("The data are being uploaded to the server", percentage);
      await axios.post(`${BASE_URL}/tasks/${taskId}/data`, taskData, {
        ...params,
        headers: { "Upload-Multiple": true, ...authHeader() },
      });
      for (let i = 0; i < fileBulks[currentChunkNumber].files.length; i++) {
        taskData.delete(`client_files[${i}]`);
      }
      totalSentSize += fileBulks[currentChunkNumber].size;
      currentChunkNumber++;
    }
  }

  try {
    await axios.post(`${BASE_URL}/tasks/${response.data.id}/data`, taskData, {
      ...params,
      headers: { "Upload-Start": true, ...authHeader() },
    });
    const uploadConfig = {
      endpoint: `${BASE_URL}/tasks/${response.data.id}/data/`,
      onUpdate: (percentage) => {
        onUpdate("The data are being uploaded to the server", percentage);
      },
      chunkSize,
      totalSize,
      totalSentSize,
    };
    for (const file of chunkFiles) {
      uploadConfig.totalSentSize += await chunkUpload(file, uploadConfig);
    }
    if (bulkFiles.length > 0) {
      await bulkUpload(response.data.id, bulkFiles);
    }
    await axios.post(`${BASE_URL}/tasks/${response.data.id}/data`, taskData, {
      ...params,
      headers: { "Upload-Finish": true, ...authHeader() },
    });
  } catch (errorData) {
    await deleteTaskApi({ id: response.data.id });
    toast.error(`Unable to upload data : ${errorData.message}`);
  }

  try {
    await wait(response.data.id);
  } catch (createException) {
    // await deleteTaskApi({ id: response.data.id });
    throw createException;
  }

  // to be able to get the task after it was created, pass frozen params
  const createdTask = await fetchTaskApi({ id: response.data.id });
  onUpdate("The task is created on the server successfully", null);
  return createdTask;
};

// export const createTaskWithDataApi = async ({
//   taskSpec,
//   taskDataSpec,
//   onUpdate,
// }) => {
//   const response = null;
//   try {
//     onUpdate("The task is being created on the server..", null);
//     const response = await axios.post(`${BASE_URL}/tasks`, taskSpec, {
//       params:{...globalParams()},
//       headers: { ...authHeader() },
//     });
//     onUpdate("The data are being uploaded to the server..", null);
//     const taskData = new FormData();
//     for (const [key, value] of Object.entries(taskDataSpec)) {
//       taskData.append(key, value);
//     }
//     console.log("headers", {
//       "Content-Type": "multipart/form-data",
//       ...authHeader(),
//     });
//     await axios.post(`${BASE_URL}/tasks/${response.data.id}/data`, taskData, {
//       params:{...globalParams()},
//       headers: { "Content-Type": "multipart/form-data", ...authHeader() },
//     });
//   } catch (errorData) {
//     await deleteTaskApi({ id: response.data.id });
//     toast.error(`Unable to upload data : ${errorData.message}`);
//   }
// };

export const fetchTasksApi = async (data) => {
  try {
    const res = await axios.get(BASE_URL + "/tasks", {
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
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const deleteTaskApi = async ({ id }) => {
  try {
    const res = await axios.delete(BASE_URL + `/tasks/${id}`, {
      params:{...globalParams()},
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (errorData) {
    toast.error(`Unable to delete task : ${errorData.message}`);
    throw Error(errorData.message ?? "Something went wrong");
  }
};

export const fetchTaskApi = async ({ id }) => {
  try {
    const res = await axios.get(BASE_URL + `/tasks/${id}`, {
      params:{...globalParams()},
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const updateTaskApi = async ({ id, data }) => {
  try {
    const res = await axios.patch(BASE_URL + `/tasks/${id}`, data, {
      params:{...globalParams()},
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    throw Error(e.response?.data ?? "Something went wrong");
  }
};
