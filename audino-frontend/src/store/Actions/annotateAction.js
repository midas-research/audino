import {
  CREATE_ANNOTATION_REQUEST,
  CREATE_ANNOTATION_REQUEST_SUCCESS,
  CREATE_ANNOTATION_REQUEST_FAILED,
} from "../Constants/annotateTypes";


export const createAnnotationRequest = (data) => {
  return { type: CREATE_ANNOTATION_REQUEST, payload: data };
};
export const createAnnotationSuccess = (data) => {
  return { type: CREATE_ANNOTATION_REQUEST_SUCCESS, payload: data };
};
export const createAnnotationFailed = (data) => {
  return { type: CREATE_ANNOTATION_REQUEST_FAILED, payload: data };
};
