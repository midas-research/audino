import toast from "react-hot-toast";
import { call, takeEvery, put } from "redux-saga/effects";
import { CREATE_PROJECT_REQUEST, DELETE_PROJECT_REQUEST, FETCH_LABELS_REQUEST, FETCH_PROJECTS_REQUEST, FETCH_PROJECT_REQUEST, UPDATE_PROJECT_REQUEST } from "../Constants/projectTypes";
import { createProjectFailed, createProjectSuccess, deleteProjectFailed, deleteProjectSuccess, fetchLabelsFailed, fetchLabelsSuccess, fetchProjectFailed, fetchProjectSuccess, fetchProjectsFailed, fetchProjectsSuccess, updateProjectFailed, updateProjectSuccess } from "../Actions/projectAction";
import { createProjectApi, deleteProjectApi, fetchProjectsApi, fetchProjectApi, updateProjectApi, fetchLabelsApi } from "../../services/project.services";

function* createProject(action) {
  try {
    const { payload, callback } = action.payload;
    const data = yield call(createProjectApi, payload);
    toast.success('Project created successfully');
    yield put(createProjectSuccess({ data, callback }));
  } catch (error) {
    toast.error(error.message?.detail);
    yield put(createProjectFailed(error));
  }
}

function* fetchProjects(action) {
  try {
    const { payload } = action.payload;
    const data = yield call(fetchProjectsApi, payload);
    yield put(fetchProjectsSuccess({ data }));
  } catch (error) {
    toast.error(error.message);
    yield put(fetchProjectsFailed(error));
  }
}

function* deleteProject(action) {
  try {
    const { payload, callback } = action.payload;
    const data = yield call(deleteProjectApi, payload);
    toast.success('Project deleted successfully');
    yield put(deleteProjectSuccess({ data: payload, callback }));
  } catch (error) {
    toast.error(error.message);
    yield put(deleteProjectFailed(error));
  }
}

function* fetchProject(action) {
  try {
    const { payload } = action.payload;
    const data = yield call(fetchProjectApi, payload);
    yield put(fetchProjectSuccess({ data }));
  } catch (error) {
    toast.error(error.message);
    yield put(fetchProjectFailed(error));
  }
}

function* updateProject(action) {
  try {
    const { payload , callback} = action.payload;
    const data = yield call(updateProjectApi, payload);
    yield put(updateProjectSuccess({ data: data.data, callback }));
  } catch (error) {
    toast.error(error.message?.detail);
    yield put(updateProjectFailed(error));
  }
}

function* projectSaga() {
  yield takeEvery(CREATE_PROJECT_REQUEST, createProject);
  yield takeEvery(FETCH_PROJECTS_REQUEST, fetchProjects);
  yield takeEvery(DELETE_PROJECT_REQUEST, deleteProject);
  yield takeEvery(FETCH_PROJECT_REQUEST, fetchProject);
  yield takeEvery(UPDATE_PROJECT_REQUEST, updateProject);
}

export default projectSaga;
