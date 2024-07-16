import toast from "react-hot-toast";
import { call, takeEvery, put } from "redux-saga/effects";
import {
  loginRequestApi,
  signupRequestApi,
} from "../../services/login.services";
import { getAllInvitationApi } from "../../services/invitation.services";
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

    // const invitationData = yield call(getAllInvitationApi, { params: {
    //   filter: `{"and":[{"==":[{"var":"user_id"}, ${userData.id}]}, {"==":[{"var":"accepted"},false]}]}`
    // }
    // });
    // console.log("invitationData", invitationData);
  } catch (error) {
    yield put(loginFailed(error));
  }
}

function* signupRequest(action) {
  try {
    const { payload, callback } = action.payload;
    const data = yield call(signupRequestApi, payload);
    let msg = "Your account has been created successfully.";
    if (data.email_verification_required) {
      msg = msg + " Please check your email to verify your account.";
    }
    toast.success(msg);
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
