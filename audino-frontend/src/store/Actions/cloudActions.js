import {
    CREATE_CLOUD_STORAGE_REQUEST,
    CREATE_CLOUD_STORAGE_REQUEST_SUCCESS,
    CREATE_CLOUD_STORAGE_REQUEST_FAILED,
    FETCH_CLOUD_STORAGES_REQUEST,
    FETCH_CLOUD_STORAGES_REQUEST_SUCCESS,
    FETCH_CLOUD_STORAGES_REQUEST_FAILED,
    DELETE_CLOUD_STORAGE_REQUEST,
    DELETE_CLOUD_STORAGE_REQUEST_SUCCESS,
    DELETE_CLOUD_STORAGE_REQUEST_FAILED,
    FETCH_CLOUD_STORAGE_REQUEST,
    FETCH_CLOUD_STORAGE_REQUEST_SUCCESS,
    FETCH_CLOUD_STORAGE_REQUEST_FAILED,
    UPDATE_CLOUD_STORAGE_REQUEST_FAILED,
    UPDATE_CLOUD_STORAGE_REQUEST_SUCCESS,
    UPDATE_CLOUD_STORAGE_REQUEST,
  } from "../Constants/cloudTypes";
  
  
  export const createCloudStorageRequest = (data) => {
    return { type: CREATE_CLOUD_STORAGE_REQUEST, payload: data };
  };
  export const createCloudStorageSuccess = (data) => {
    return { type: CREATE_CLOUD_STORAGE_REQUEST_SUCCESS, payload: data };
  };
  export const createCloudStorageFailed = (data) => {
    return { type: CREATE_CLOUD_STORAGE_REQUEST_FAILED, payload: data };
  };
  
  export const fetchCloudStoragesRequest = (data) => {
    return { type: FETCH_CLOUD_STORAGES_REQUEST, payload: data };
  };
  export const fetchCloudStoragesSuccess = (data) => {
    return { type: FETCH_CLOUD_STORAGES_REQUEST_SUCCESS, payload: data };
  };
  export const fetchCloudStoragesFailed = (data) => {
    return { type: FETCH_CLOUD_STORAGES_REQUEST_FAILED, payload: data };
  };
  
  export const deleteCloudStorageRequest = (data) => {
    return { type: DELETE_CLOUD_STORAGE_REQUEST, payload: data };
  };
  export const deleteCloudStorageSuccess = (data) => {
    return { type: DELETE_CLOUD_STORAGE_REQUEST_SUCCESS, payload: data };
  };
  export const deleteCloudStorageFailed = (data) => {
    return { type: DELETE_CLOUD_STORAGE_REQUEST_FAILED, payload: data };
  };
  
  export const fetchCloudStorageRequest = (data) => {
    return { type: FETCH_CLOUD_STORAGE_REQUEST, payload: data };
  };
  export const fetchCloudStorageSuccess = (data) => {
    return { type: FETCH_CLOUD_STORAGE_REQUEST_SUCCESS, payload: data };
  };
  export const fetchCloudStorageFailed = (data) => {
    return { type: FETCH_CLOUD_STORAGE_REQUEST_FAILED, payload: data };
  };
  
  export const updateCloudStorageRequest = (data) => {
    return { type: UPDATE_CLOUD_STORAGE_REQUEST, payload: data };
  };
  export const updateCloudStorageSuccess = (data) => {
    return { type: UPDATE_CLOUD_STORAGE_REQUEST_SUCCESS, payload: data };
  };
  export const updateCloudStorageFailed = (data) => {
    return { type: UPDATE_CLOUD_STORAGE_REQUEST_FAILED, payload: data };
  };
  