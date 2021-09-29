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
import {
  CONTINUE_USER,
  FETCH_USER,
  LOGIN_USER,
  LOGOUT_USER,
  REMOVE_USER,
  UPDATE_USER,
  continueUserBusy,
  continueUserError,
  continueUserSuccess,
  fetchUserBusy,
  fetchUserError,
  fetchUserSuccess,
  loginUserBusy,
  loginUserError,
  loginUserSuccess,
  logoutUserBusy,
  logoutUserError,
  logoutUserSuccess,
  removeUserBusy,
  removeUserError,
  removeUserSuccess,
  updateUserBusy,
  updateUserError,
  updateUserSuccess,
} from "./action";
import { call, put, takeLatest } from "redux-saga/effects";
import { getAuthorization, setAuthorization } from "../api";
import { login, readUser, removeUser, updateUser } from "./api";

import { ActionTypes, clearError } from "../util";
import { BUSY_GLOBAL } from "../busy/action";
import _ from "lodash";
import { logError } from "utils/utils";
import { reset } from "../action";

const { REQUEST } = ActionTypes;

const parseJson = (json) => {
  try {
    if (_.isString(json)) {
      return JSON.parse(json);
    }
  } finally {
  }
  return json;
};

const defaultPreferences = (user) => {
  user.preferences = _.merge(
    {},
    {
      markers: false,
      predictions: false,
      requirement: 20,
      availability: 5,
    },
    parseJson(user.preferences)
  );
  return user;
};

export function* readUserSaga() {
  try {
    yield put(fetchUserBusy(true));
    yield put(fetchUserError());
    let response = yield call(readUser);
    response = yield call(defaultPreferences, response);
    yield put(fetchUserSuccess(response));
  } catch (error) {
    logError(error);
    yield put(fetchUserError(error.message));
  } finally {
    yield put(fetchUserBusy(false));
  }
}

export function* removeUserSaga() {
  try {
    yield put(removeUserBusy(BUSY_GLOBAL));
    yield put(removeUserError());
    yield call(removeUser);
    yield put(removeUserSuccess(true));
  } catch (error) {
    logError(error);
    yield put(removeUserError(error.message));
  } finally {
    yield put(removeUserBusy(false));
  }
}

export function* updateUserSaga(action) {
  const { email, password, preferences } = action.payload;
  try {
    yield put(updateUserBusy(BUSY_GLOBAL));
    yield put(updateUserError());
    const response = yield call(updateUser, email, password, preferences);
    yield put(updateUserSuccess(response));
  } catch (error) {
    logError(error);
    yield put(updateUserError(error.message));
  } finally {
    yield put(updateUserBusy(false));
  }
}

export function* loginSaga(action) {
  const { email, password } = action.payload;
  try {
    yield put(loginUserBusy(BUSY_GLOBAL));
    yield put(loginUserError());
    const response = yield call(login, email, password);
    yield call(setAuthorization, response && response.token);
    yield put(loginUserSuccess(response && response.token));
    yield call(readUserSaga);
  } catch (error) {
    logError(error);
    yield put(loginUserError(error.message));
  } finally {
    yield put(loginUserBusy(false));
  }
}

export function* logoutSaga() {
  try {
    yield put(logoutUserBusy(BUSY_GLOBAL));
    yield put(logoutUserError());
    yield call(setAuthorization, null);
    yield put(reset());
    yield put(logoutUserSuccess(true));
  } catch (error) {
    logError(error);
    yield put(logoutUserError(error.message));
  } finally {
    yield put(logoutUserBusy(false));
  }
}

export function* continueSaga() {
  try {
    yield put(continueUserBusy(BUSY_GLOBAL));
    yield put(continueUserError());
    const auth = yield call(getAuthorization);
    if (auth && auth !== "invalid") {
      yield call(readUser);
      yield put(loginUserSuccess(auth));
      yield put(continueUserSuccess(auth));
      yield call(readUserSaga);
    }
  } catch (error) {
    logError(error);
    yield call(setAuthorization, null);
    yield put(clearError(continueUserError(error.message)));
  } finally {
    yield put(continueUserBusy(false));
  }
}

export default function* usersSaga() {
  yield takeLatest(CONTINUE_USER[REQUEST], continueSaga);
  yield takeLatest(FETCH_USER[REQUEST], readUserSaga);
  yield takeLatest(REMOVE_USER[REQUEST], removeUserSaga);
  yield takeLatest(UPDATE_USER[REQUEST], updateUserSaga);
  yield takeLatest(LOGIN_USER[REQUEST], loginSaga);
  yield takeLatest(LOGOUT_USER[REQUEST], logoutSaga);
}
