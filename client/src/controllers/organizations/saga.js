// This material was prepared as an account of work sponsored by an agency of the United
// States Government. Neither the United States Government nor the United States
// Department of Energy, nor Battelle, nor any of their employees, nor any jurisdiction or
// organization that has cooperated in the development of these materials, makes any
// warranty, express or implied, or assumes any legal liability or responsibility for the
// accuracy, completeness, or usefulness or any information, apparatus, product, software,
// or process disclosed, or represents that its use would not infringe privately owned rights.
// Reference herein to any specific commercial product, process, or service by trade name,
// trademark, manufacturer, or otherwise does not necessarily constitute or imply its
// endorsement, recommendation, or favoring by the United States Government or any
// agency thereof, or Battelle Memorial Institute. The views and opinions of authors
// expressed herein do not necessarily state or reflect those of the United States Government
// or any agency thereof.
//
//                      PACIFIC NORTHWEST NATIONAL LABORATORY
//                                   operated by
//                                     BATTELLE
//                                     for the
//                        UNITED STATES DEPARTMENT OF ENERGY
//                         under Contract DE-AC05-76RL01830
import { call, put, takeLatest } from "redux-saga/effects";
import { logError } from "utils/utils";
import { ActionTypes } from "../util";
import {
  createOrganizationBusy,
  createOrganizationError,
  createOrganizationSuccess,
  CREATE_ORGANIZATION,
  fetchOrganizationBusy,
  fetchOrganizationError,
  fetchOrganizationsBusy,
  fetchOrganizationsError,
  fetchOrganizationsSuccess,
  fetchOrganizationSuccess,
  FETCH_ORGANIZATION,
  FETCH_ORGANIZATIONS,
  removeOrganizationBusy,
  removeOrganizationError,
  removeOrganizationSuccess,
  REMOVE_ORGANIZATION,
  updateOrganizationBusy,
  updateOrganizationError,
  updateOrganizationSuccess,
  UPDATE_ORGANIZATION,
} from "./action";
import {
  createOrganization,
  readOrganization,
  readOrganizations,
  removeOrganization,
  updateOrganization,
} from "./api";
const { REQUEST } = ActionTypes;

export function* createOrganizationSaga(action) {
  const { name } = action.payload;
  try {
    yield put(createOrganizationBusy(true));
    yield put(createOrganizationError());
    const response = yield call(createOrganization, name);
    yield put(createOrganizationSuccess(response));
  } catch (error) {
    logError(error);
    yield put(createOrganizationError(error.message));
  } finally {
    yield put(createOrganizationBusy(false));
  }
}

export function* readOrganizationSaga(action) {
  const { id } = action.payload;
  try {
    yield put(fetchOrganizationBusy(true));
    yield put(fetchOrganizationError());
    const response = yield call(readOrganization, id);
    yield put(fetchOrganizationSuccess(response));
  } catch (error) {
    logError(error);
    yield put(fetchOrganizationError(error.message));
  } finally {
    yield put(fetchOrganizationBusy(false));
  }
}

export function* removeOrganizationSaga(action) {
  const { id } = action.payload;
  try {
    yield put(removeOrganizationBusy(true));
    yield put(removeOrganizationError());
    const response = yield call(removeOrganization, id);
    yield put(removeOrganizationSuccess(response));
  } catch (error) {
    logError(error);
    yield put(removeOrganizationError(error.message));
  } finally {
    yield put(removeOrganizationBusy(false));
  }
}

export function* updateOrganizationSaga(action) {
  const { name } = action.payload;
  try {
    yield put(updateOrganizationBusy(true));
    yield put(updateOrganizationError());
    const response = yield call(updateOrganization, name);
    yield put(updateOrganizationSuccess(response));
  } catch (error) {
    logError(error);
    yield put(updateOrganizationError(error.message));
  } finally {
    yield put(updateOrganizationBusy(false));
  }
}

export function* readOrganizationsSaga() {
  try {
    yield put(fetchOrganizationsBusy(true));
    yield put(fetchOrganizationsError());
    const response = yield call(readOrganizations);
    yield put(fetchOrganizationsSuccess(response));
  } catch (error) {
    logError(error);
    yield put(fetchOrganizationsError(error.message));
  } finally {
    yield put(fetchOrganizationsBusy(false));
  }
}

export default function* organizationsSaga() {
  yield takeLatest(CREATE_ORGANIZATION[REQUEST], createOrganizationSaga);
  yield takeLatest(FETCH_ORGANIZATIONS[REQUEST], readOrganizationsSaga);
  yield takeLatest(FETCH_ORGANIZATION[REQUEST], readOrganizationSaga);
  yield takeLatest(REMOVE_ORGANIZATION[REQUEST], removeOrganizationSaga);
  yield takeLatest(UPDATE_ORGANIZATION[REQUEST], updateOrganizationSaga);
}
