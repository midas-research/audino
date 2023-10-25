import {
  LOGIN_REQUEST,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAILED,
  USER_LOGOUT,
  SIGNUP_REQUEST,
  SIGNUP_REQUEST_SUCCESS,
  SIGNUP_REQUEST_FAILED,
} from "../Constants/loginTypes";


export const loginRequest = (data) => {
  return { type: LOGIN_REQUEST, payload: data };
};

export const loginSuccess = (data) => {
  return { type: LOGIN_REQUEST_SUCCESS, payload: data };
};

export const loginFailed = (data) => {
  return { type: LOGIN_REQUEST_FAILED, payload: data };
};

export const signupRequest = (data) => {
  return { type: SIGNUP_REQUEST, payload: data };
};

export const signupSuccess = (data) => {
  return { type: SIGNUP_REQUEST_SUCCESS, payload: data };
};

export const signupFailed = (data) => {
  return { type: SIGNUP_REQUEST_FAILED, payload: data };
};

export const userLogout = (data) => {
  return { type: USER_LOGOUT, payload: data };
};
