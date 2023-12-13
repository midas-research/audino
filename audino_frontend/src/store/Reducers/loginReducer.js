import { DEFAULT_USER_TYPE, ADMIN_USER_TYPE } from "../../constants/constants";
import {
  LOGIN_REQUEST,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAILED,
  USER_LOGOUT,
  SIGNUP_REQUEST,
  SIGNUP_REQUEST_SUCCESS,
  SIGNUP_REQUEST_FAILED,
} from "../Constants/loginTypes";

// email: "test@test.com";
// first_name: "test";
// id: 3;
// is_active: true;
// is_staff: false;
// is_superuser: false;
// last_name: "test";
// url: "http://127.0.0.1:7000/api/users/3";
// username: "test220217";

var localStorageKey = localStorage.getItem("audino-key");
var localStorageUserData = JSON.parse(localStorage.getItem("audino-user"));

const initialState = {
  audinoKey: localStorageKey ? localStorageKey : "",
  audinoUserData: localStorageUserData ? localStorageUserData : {},
  isLoginLoading: false,
  isSignupLoading: false,
};

export const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST: {
      return { ...state, isLoginLoading: true };
    }

    case LOGIN_REQUEST_SUCCESS: {
      const { data, userData } = action.payload;
      localStorage.setItem("audino-key", data.key);
      localStorage.setItem("audino-user", JSON.stringify(userData));
      return {
        ...state,
        audinoKey: data.key,
        audinoUserData: userData,
        isLoginLoading: false,
      };
    }

    case LOGIN_REQUEST_FAILED:
      return { ...state, isLoginLoading: false };

    case SIGNUP_REQUEST: {
      return { ...state, isSignupLoading: true };
    }

    case SIGNUP_REQUEST_SUCCESS: {
      const { data, callback } = action.payload;
      callback();
      return {
        ...state,
        isSignupLoading: false,
      };
    }

    case SIGNUP_REQUEST_FAILED:
      return { ...state, isSignupLoading: false };

    case USER_LOGOUT:
      localStorage.clear();
      return {
        ...state,
        audinoKey: "",
      };

    default:
      return state;
  }
};
