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
  UPDATE_PROJECT_REQUEST,
  UPDATE_PROJECT_REQUEST_SUCCESS,
  UPDATE_PROJECT_REQUEST_FAILED,
  FETCH_LABELS_REQUEST,
  FETCH_LABELS_REQUEST_SUCCESS,
  FETCH_LABELS_REQUEST_FAILED,
  SET_LABELS,
} from "../Constants/projectTypes";


const initialState = {
  projects_obj: { count: 0, next: null, previous: null, results: [] },
  project: null,
  labels_obj: { count: 0, next: null, previous: null, results: [] },
  isCreateProjectLoading: false,
  isProjectsLoading: false,
  isDeleteProjectLoading: false,
  isProjectLoading: false,
  isUpdateProjectLoading: false,
  isLabelsLoading: false,
};

export const projectReducer = (state = initialState, action) => {
  switch (action.type) {

    case CREATE_PROJECT_REQUEST: {
      return { ...state, isCreateProjectLoading: true };
    }

    case CREATE_PROJECT_REQUEST_SUCCESS: {
      const { data, callback } = action.payload;
      // return back to project page
      callback();
      return {
        ...state,
        // projects: [...state.projects, data],
        isCreateProjectLoading: false
      };
    }

    case CREATE_PROJECT_REQUEST_FAILED:
      return { ...state, isCreateProjectLoading: false };

    case FETCH_PROJECTS_REQUEST: {
      return { ...state, isProjectsLoading: true };
    }

    case FETCH_PROJECTS_REQUEST_SUCCESS: {
      const { data } = action.payload;
      return {
        ...state,
        projects_obj: data,
        isProjectsLoading: false
      };
    }

    case FETCH_PROJECTS_REQUEST_FAILED:
      return { ...state, isProjectsLoading: false };

    case FETCH_PROJECT_REQUEST: {
      return { ...state, isProjectLoading: true };
    }

    case FETCH_PROJECT_REQUEST_SUCCESS: {
      const { data } = action.payload;
      return {
        ...state,
        project: data,
        isProjectLoading: false
      };
    }

    case FETCH_PROJECT_REQUEST_FAILED:
      return { ...state, isProjectLoading: false };

    case DELETE_PROJECT_REQUEST: {
      return { ...state, isDeleteProjectLoading: true };
    }

    case DELETE_PROJECT_REQUEST_SUCCESS: {
      const { data, callback } = action.payload;
      // close the popup
      callback()
      return {
        ...state,
        projects: state.projects.filter(res => res.id !== data.id),
        isDeleteProjectLoading: false
      };
    }

    case DELETE_PROJECT_REQUEST_FAILED:
      return { ...state, isDeleteProjectLoading: false };

    case UPDATE_PROJECT_REQUEST: {
      return { ...state, isUpdateProjectLoading: true };
    }

    case UPDATE_PROJECT_REQUEST_SUCCESS: {
      const { data, callback } = action.payload;
      // close the popup
      callback()
      return {
        ...state,
        isUpdateProjectLoading: false
      };
    }

    case UPDATE_PROJECT_REQUEST_FAILED:
      return { ...state, isUpdateProjectLoading: false };
    default:
      return state;
  }
};
