import toast from "react-hot-toast";
import { call, takeEvery, put } from "redux-saga/effects";
import {
  loginRequestApi,
  signupRequestApi,
} from "../../services/login.services";
import {
  loginFailed,
  loginSuccess,
  signupFailed,
  signupSuccess,
} from "../Actions/loginAction";
import { LOGIN_REQUEST, SIGNUP_REQUEST } from "../Constants/loginTypes";
import { fetchCurrentUserApi } from "../../services/user.services";

function* loginRequest(action) {
  try {
    const { payload } = action.payload;
    const data = yield call(loginRequestApi, payload);
    const userData = yield call(fetchCurrentUserApi, data);
    yield put(loginSuccess({ data, userData }));
  } catch (error) {
    yield put(loginFailed(error));
  }
}

function* signupRequest(action) {
  try {
    const { payload, callback } = action.payload;
    const data = yield call(signupRequestApi, payload);
    toast.success("User created successfully");
    yield put(signupSuccess({ data, callback }));
  } catch (error) {
    yield put(signupFailed(error));
  }
}

function* loginSaga() {
  yield takeEvery(LOGIN_REQUEST, loginRequest);
  yield takeEvery(SIGNUP_REQUEST, signupRequest);
}

export default loginSaga;
