import toast from "react-hot-toast";
import { call, takeEvery, put } from "redux-saga/effects";
import { CREATE_CLOUD_STORAGE_REQUEST, DELETE_CLOUD_STORAGE_REQUEST,  FETCH_CLOUD_STORAGES_REQUEST, FETCH_CLOUD_STORAGE_REQUEST, UPDATE_CLOUD_STORAGE_REQUEST } from "../Constants/cloudTypes";
import { createCloudStorageFailed, createCloudStorageSuccess, deleteCloudStorageFailed, deleteCloudStorageSuccess, fetchCloudStorageFailed, fetchCloudStorageSuccess, fetchCloudStoragesFailed, fetchCloudStoragesSuccess, updateCloudStorageFailed, updateCloudStorageSuccess } from "../Actions/cloudActions";
import { createCloudStorageApi, fetchCloudStorageApi, fetchCloudStoragesApi, updateCloudStorageApi } from "../../services/cloudstorages.services";

function* createCloudStorage(action) {
  try {
    const { payload, callback } = action.payload;
    const data = yield call(createCloudStorageApi, payload);
    toast.success('Cloud storage created successfully');
    yield put(createCloudStorageSuccess({ data, callback }));
  } catch (error) {
    toast.error(error.message?.detail);
    yield put(createCloudStorageFailed(error));
  }
}

function* fetchCloudStorages(action) {
  try {
    const { payload } = action.payload;
    const data = yield call(fetchCloudStoragesApi, payload);
    yield put(fetchCloudStoragesSuccess({ data }));
  } catch (error) {
    toast.error(error.message);
    yield put(fetchCloudStoragesFailed(error));
  }
}

function* fetchCloudStorage(action) {
  try {
    const { payload } = action.payload;
    const data = yield call(fetchCloudStorageApi, payload);
    yield put(fetchCloudStorageSuccess({ data }));
  } catch (error) {
    toast.error(error.message);
    yield put(fetchCloudStorageFailed(error));
  }
}

function* updateCloudStorage(action) {
  try {
    const { data, id, callback } = action.payload;
    const response = yield call(updateCloudStorageApi, { data, id });
    yield put(updateCloudStorageSuccess({ data: response, callback }));
  } catch (error) {
    toast.error(error.message);
    yield put(updateCloudStorageFailed(error));
  }
}

function* cloudstorageSaga() {
  yield takeEvery(CREATE_CLOUD_STORAGE_REQUEST, createCloudStorage);
  yield takeEvery(FETCH_CLOUD_STORAGES_REQUEST, fetchCloudStorages);
  yield takeEvery(FETCH_CLOUD_STORAGE_REQUEST, fetchCloudStorage);
  yield takeEvery(UPDATE_CLOUD_STORAGE_REQUEST, updateCloudStorage);
}

export default cloudstorageSaga;
