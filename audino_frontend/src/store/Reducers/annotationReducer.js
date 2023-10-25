import {
  CREATE_ANNOTATION_REQUEST,
  CREATE_ANNOTATION_REQUEST_SUCCESS,
  CREATE_ANNOTATION_REQUEST_FAILED,
} from "../Constants/annotateTypes";


const initialState = {
  isCreateAnnotationLoading: false,
};

export const annotationReducer = (state = initialState, action) => {
  switch (action.type) {

    case CREATE_ANNOTATION_REQUEST: {
      return { ...state, isCreateAnnotationLoading: true };
    }

    case CREATE_ANNOTATION_REQUEST_SUCCESS: {
      const { data } = action.payload;
      // return back to task page
      // callback();
      return {
        ...state,
        // tasks: [...state.tasks, data],
        isCreateAnnotationLoading: false
      };
    }

    case CREATE_ANNOTATION_REQUEST_FAILED:
      return { ...state, isCreateAnnotationLoading: false };

    default:
      return state;
  }
};
