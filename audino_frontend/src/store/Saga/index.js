import { all } from "redux-saga/effects";
import loginSaga from "./loginSaga";
import projectSaga from "./projectSaga";
import taskSaga from "./taskSaga";
import annotationSaga from "./annotationSaga";

export default function* rootSaga() {
  yield all([
    loginSaga(),
    taskSaga(),
    projectSaga(),
    annotationSaga(),
  ]);
}
