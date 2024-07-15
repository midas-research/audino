import toast from "react-hot-toast";
import { call, takeEvery, put } from "redux-saga/effects";
import { CREATE_ANNOTATION_REQUEST } from "../Constants/annotateTypes";
import { createAnnotationApi } from "../../services/annotation.services"
import { createAnnotationFailed, createAnnotationSuccess } from "../Actions/annotateAction";

function* createAnnotation(action) {
  try {
    const { payload } = action.payload;
    const data = yield call(createAnnotationApi, payload);
    toast.success(data.msg);
    yield put(createAnnotationSuccess({ data: data.data }));
  } catch (error) {
    toast.error(error.message);
    yield put(createAnnotationFailed(error));
  }
}

function* annotationSaga() {
  yield takeEvery(CREATE_ANNOTATION_REQUEST, createAnnotation);
}

export default annotationSaga;
