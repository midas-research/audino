import toast from "react-hot-toast";
import { call, takeEvery, put } from "redux-saga/effects";
import { CREATE_TASK_REQUEST, DELETE_TASK_REQUEST, FETCH_TASKS_REQUEST, FETCH_TASK_REQUEST, UPDATE_TASK_REQUEST } from "../Constants/taskTypes";
import { createTaskApi, deleteTaskApi, fetchTaskApi, fetchTasksApi, updateTaskApi } from "../../services/task.services"
import { createTaskFailed, createTaskSuccess, deleteTaskFailed, deleteTaskSuccess, fetchTaskFailed, fetchTaskSuccess, fetchTasksFailed, fetchTasksSuccess, updateTaskFailed, updateTaskSuccess } from "../Actions/taskAction";

function* createTask(action) {
  try {
    const { payload, callback } = action.payload;
    const data = yield call(createTaskApi, payload);
    toast.success(data.msg);
    yield put(createTaskSuccess({ data: data.data, callback }));
  } catch (error) {
    toast.error(error.message);
    yield put(createTaskFailed(error));
  }
}

function* fetchTasks(action) {
  try {
    const { payload } = action.payload;
    const data = yield call(fetchTasksApi, payload);
    yield put(fetchTasksSuccess({ data }));
  } catch (error) {
    toast.error(error.message);
    yield put(fetchTasksFailed(error));
  }
}

function* fetchTask(action) {
  try {
    const { payload } = action.payload;
    const data = yield call(fetchTaskApi, payload);
    yield put(fetchTaskSuccess({ data: data.data }));
  } catch (error) {
    toast.error(error.message);
    yield put(fetchTaskFailed(error));
  }
}

function* deleteTask(action) {
  try {
    const { payload, callback } = action.payload;
    const data = yield call(deleteTaskApi, payload);
    toast.success('Task deleted successfully');
    yield put(deleteTaskSuccess({ data: payload, callback }));
  } catch (error) {
    toast.error(error.message);
    yield put(deleteTaskFailed(error));
  }
}

function* updateTask(action) {
  try {
    const { payload, callback } = action.payload;
    const data = yield call(updateTaskApi, payload);
    yield put(updateTaskSuccess({ data: payload, callback }));
  } catch (error) {
    toast.error(error.message);
    yield put(updateTaskFailed(error));
  }
}
function* taskSaga() {
  yield takeEvery(CREATE_TASK_REQUEST, createTask);
  yield takeEvery(FETCH_TASKS_REQUEST, fetchTasks);
  yield takeEvery(FETCH_TASK_REQUEST, fetchTask);
  yield takeEvery(DELETE_TASK_REQUEST, deleteTask);
  yield takeEvery(UPDATE_TASK_REQUEST, updateTask);
}

export default taskSaga;
