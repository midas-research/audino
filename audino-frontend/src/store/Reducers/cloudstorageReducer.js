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
    UPDATE_CLOUD_STORAGE_REQUEST,
    UPDATE_CLOUD_STORAGE_REQUEST_SUCCESS,
    UPDATE_CLOUD_STORAGE_REQUEST_FAILED,
  } from "../Constants/cloudTypes";
  
  
  const initialState = {
    cloud_obj: { count: 0, next: null, previous: null, results: [] },
    cloud: null,
    isCreateCloudStorageLoading: false,
    isCloudStoragesLoading: false,
    isDeleteCloudStorageLoading: false,
    isCloudStorageLoading: false,
    isUpdateCloudStorageLoading: false,
  };
  
  export const cloudReducer = (state = initialState, action) => {
    switch (action.type) {
  
      case CREATE_CLOUD_STORAGE_REQUEST: {
        return { ...state, isCreateCloudStorageLoading: true };
      }
  
      case CREATE_CLOUD_STORAGE_REQUEST_SUCCESS: {
        const { data, callback } = action.payload;
        callback(data);
        return {
          ...state,
          isCreateCloudStorageLoading: false
        };
      }
  
      case CREATE_CLOUD_STORAGE_REQUEST_FAILED:
        return { ...state, isCreateCloudStorageLoading: false };
  
      case FETCH_CLOUD_STORAGES_REQUEST: {
        return { ...state, isCloudStoragesLoading: true };
      }
  
      case FETCH_CLOUD_STORAGES_REQUEST_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          cloud_obj: data,
          isCloudStoragesLoading: false
        };
      }
  
      case FETCH_CLOUD_STORAGES_REQUEST_FAILED:
        return { ...state, isCloudStoragesLoading: false };
  
      case FETCH_CLOUD_STORAGE_REQUEST: {
        return { ...state, isCloudStorageLoading: true };
      }
  
      case FETCH_CLOUD_STORAGE_REQUEST_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          cloud: data,
          isCloudStorageLoading: false
        };
      }
  
      case FETCH_CLOUD_STORAGE_REQUEST_FAILED:
        return { ...state, isCloudStorageLoading: false };
  
      case DELETE_CLOUD_STORAGE_REQUEST: {
        return { ...state, isDeleteCloudStorageLoading: true };
      }
  
      case DELETE_CLOUD_STORAGE_REQUEST_SUCCESS: {
        const { data, callback } = action.payload;
        callback()
        return {
          ...state,
          cloud: state.cloud.filter(res => res.id !== data.id),
          isDeleteCloudStorageLoading: false
        };
      }
  
      case DELETE_CLOUD_STORAGE_REQUEST_FAILED:
        return { ...state, isDeleteCloudStorageLoading: false };
  
      case UPDATE_CLOUD_STORAGE_REQUEST: {
        return { ...state, isUpdateCloudStorageLoading: true };
      }
  
      case UPDATE_CLOUD_STORAGE_REQUEST_SUCCESS: {
        const { data, callback } = action.payload;
        callback()
        return {
          ...state,
          isUpdateCloudStorageLoading: false
        };
      }
  
      case UPDATE_CLOUD_STORAGE_REQUEST_FAILED:
        return { ...state, isUpdateCloudStorageLoading: false };
      default:
        return state;
    }
  };
  