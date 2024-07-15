import {
  CREATE_TASK_REQUEST,
  CREATE_TASK_REQUEST_SUCCESS,
  CREATE_TASK_REQUEST_FAILED,
  FETCH_TASKS_REQUEST,
  FETCH_TASKS_REQUEST_SUCCESS,
  FETCH_TASKS_REQUEST_FAILED,
  DELETE_TASK_REQUEST,
  DELETE_TASK_REQUEST_SUCCESS,
  DELETE_TASK_REQUEST_FAILED,
  FETCH_TASK_REQUEST,
  FETCH_TASK_REQUEST_SUCCESS,
  FETCH_TASK_REQUEST_FAILED,
  UPDATE_TASK_REQUEST,
  UPDATE_TASK_REQUEST_SUCCESS,
  UPDATE_TASK_REQUEST_FAILED,

} from "../Constants/taskTypes";


export const createTaskRequest = (data) => {
  return { type: CREATE_TASK_REQUEST, payload: data };
};
export const createTaskSuccess = (data) => {
  return { type: CREATE_TASK_REQUEST_SUCCESS, payload: data };
};
export const createTaskFailed = (data) => {
  return { type: CREATE_TASK_REQUEST_FAILED, payload: data };
};

export const fetchTasksRequest = (data) => {
  return { type: FETCH_TASKS_REQUEST, payload: data };
};
export const fetchTasksSuccess = (data) => {
  return { type: FETCH_TASKS_REQUEST_SUCCESS, payload: data };
};
export const fetchTasksFailed = (data) => {
  return { type: FETCH_TASKS_REQUEST_FAILED, payload: data };
};

export const deleteTaskRequest = (data) => {
  return { type: DELETE_TASK_REQUEST, payload: data };
};
export const deleteTaskSuccess = (data) => {
  return { type: DELETE_TASK_REQUEST_SUCCESS, payload: data };
};
export const deleteTaskFailed = (data) => {
  return { type: DELETE_TASK_REQUEST_FAILED, payload: data };
};

export const fetchTaskRequest = (data) => {
  return { type: FETCH_TASK_REQUEST, payload: data };
};
export const fetchTaskSuccess = (data) => {
  return { type: FETCH_TASK_REQUEST_SUCCESS, payload: data };
};
export const fetchTaskFailed = (data) => {
  return { type: FETCH_TASK_REQUEST_FAILED, payload: data };
};

export const updateTaskRequest= (data) => {
  return { type: UPDATE_TASK_REQUEST, payload: data };
};
export const updateTaskSuccess = (data) => {
  return { type: UPDATE_TASK_REQUEST_SUCCESS, payload: data };
};
export const updateTaskFailed = (data) => {
  return { type: UPDATE_TASK_REQUEST_FAILED, payload: data };
};
