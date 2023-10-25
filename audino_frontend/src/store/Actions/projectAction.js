import {
  CREATE_PROJECT_REQUEST,
  CREATE_PROJECT_REQUEST_SUCCESS,
  CREATE_PROJECT_REQUEST_FAILED,
  FETCH_PROJECTS_REQUEST,
  FETCH_PROJECTS_REQUEST_SUCCESS,
  FETCH_PROJECTS_REQUEST_FAILED,
  DELETE_PROJECT_REQUEST,
  DELETE_PROJECT_REQUEST_SUCCESS,
  DELETE_PROJECT_REQUEST_FAILED,
  FETCH_PROJECT_REQUEST,
  FETCH_PROJECT_REQUEST_SUCCESS,
  FETCH_PROJECT_REQUEST_FAILED,
  UPDATE_PROJECT_REQUEST_FAILED,
  UPDATE_PROJECT_REQUEST_SUCCESS,
  UPDATE_PROJECT_REQUEST,
  FETCH_LABELS_REQUEST,
  FETCH_LABELS_REQUEST_SUCCESS,
  FETCH_LABELS_REQUEST_FAILED,
  SET_LABELS
} from "../Constants/projectTypes";


export const createProjectRequest = (data) => {
  return { type: CREATE_PROJECT_REQUEST, payload: data };
};
export const createProjectSuccess = (data) => {
  return { type: CREATE_PROJECT_REQUEST_SUCCESS, payload: data };
};
export const createProjectFailed = (data) => {
  return { type: CREATE_PROJECT_REQUEST_FAILED, payload: data };
};

export const fetchProjectsRequest = (data) => {
  return { type: FETCH_PROJECTS_REQUEST, payload: data };
};
export const fetchProjectsSuccess = (data) => {
  return { type: FETCH_PROJECTS_REQUEST_SUCCESS, payload: data };
};
export const fetchProjectsFailed = (data) => {
  return { type: FETCH_PROJECTS_REQUEST_FAILED, payload: data };
};

export const deleteProjectRequest = (data) => {
  return { type: DELETE_PROJECT_REQUEST, payload: data };
};
export const deleteProjectSuccess = (data) => {
  return { type: DELETE_PROJECT_REQUEST_SUCCESS, payload: data };
};
export const deleteProjectFailed = (data) => {
  return { type: DELETE_PROJECT_REQUEST_FAILED, payload: data };
};

export const fetchProjectRequest = (data) => {
  return { type: FETCH_PROJECT_REQUEST, payload: data };
};
export const fetchProjectSuccess = (data) => {
  return { type: FETCH_PROJECT_REQUEST_SUCCESS, payload: data };
};
export const fetchProjectFailed = (data) => {
  return { type: FETCH_PROJECT_REQUEST_FAILED, payload: data };
};

export const updateProjectRequest = (data) => {
  return { type: UPDATE_PROJECT_REQUEST, payload: data };
};
export const updateProjectSuccess = (data) => {
  return { type: UPDATE_PROJECT_REQUEST_SUCCESS, payload: data };
};
export const updateProjectFailed = (data) => {
  return { type: UPDATE_PROJECT_REQUEST_FAILED, payload: data };
};
