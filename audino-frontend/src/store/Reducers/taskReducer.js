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


const initialState = {
  tasks_obj: { count: 0, next: null, previous: null, results: [] },
  task: null,
  isCreateTaskLoading: false,
  isTasksLoading: false,
  isDeleteTaskLoading: false,
  isTaskLoading: false,
  isUpdateTaskLoading: false
};

export const taskReducer = (state = initialState, action) => {
  switch (action.type) {

    case CREATE_TASK_REQUEST: {
      return { ...state, isCreateTaskLoading: true };
    }

    case CREATE_TASK_REQUEST_SUCCESS: {
      const { data, callback } = action.payload;
      // return back to task page
      callback();
      return {
        ...state,
        tasks: [...state.tasks, data],
        isCreateTaskLoading: false
      };
    }

    case CREATE_TASK_REQUEST_FAILED:
      return { ...state, isCreateTaskLoading: false };

    case FETCH_TASKS_REQUEST: {
      return { ...state, isTasksLoading: true };
    }

    case FETCH_TASKS_REQUEST_SUCCESS: {
      const { data } = action.payload;
      return {
        ...state,
        tasks_obj: data,
        isTasksLoading: false
      };
    }

    case FETCH_TASKS_REQUEST_FAILED:
      return { ...state, isTasksLoading: false };

    case FETCH_TASK_REQUEST: {
      return { ...state, isTaskLoading: true };
    }

    case FETCH_TASK_REQUEST_SUCCESS: {
      const { data } = action.payload;
      return {
        ...state,
        task: data,
        isTaskLoading: false
      };
    }

    case FETCH_TASK_REQUEST_FAILED:
      return { ...state, isTaskLoading: false };

    case DELETE_TASK_REQUEST: {
      return { ...state, isDeleteTaskLoading: true };
    }

    case DELETE_TASK_REQUEST_SUCCESS: {
      const { data, callback } = action.payload;
      // close the popup
      callback()
      return {
        ...state,
        tasks: state.tasks.filter(res => res.id !== data.id),
        isDeleteTaskLoading: false
      };
    }

    case DELETE_TASK_REQUEST_FAILED:
      return { ...state, isDeleteTaskLoading: false };

    case UPDATE_TASK_REQUEST: {
      return { ...state, isUpdateTaskLoading: true };
    }

    case UPDATE_TASK_REQUEST_SUCCESS: {
      const { data, callback } = action.payload;
      // close the popup
      callback()
      return {
        ...state,
        isUpdateTaskLoading: false
      };
    }

    case UPDATE_TASK_REQUEST_FAILED:
      return { ...state, isUpdateTaskLoading: false };

    default:
      return state;
  }
};
