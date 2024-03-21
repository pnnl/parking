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
  FETCH_PREFERENCE,
  UPDATE_PREFERENCE,
  fetchPreferenceBusy,
  fetchPreferenceError,
  fetchPreferenceSuccess,
  updatePreferenceBusy,
  updatePreferenceError,
  updatePreferenceSuccess,
} from "./action";
import { call, put, takeLatest } from "redux-saga/effects";
import { readPreference, updatePreference } from "./api";

import { ActionTypes } from "../util";
import { BUSY_GLOBAL } from "../busy/action";
import _ from "lodash";
import { logError } from "utils/utils";
import { vehicle } from "parking-common";

const { REQUEST } = ActionTypes;

const defaultPreferences = (preference) => {
  preference = _.merge(
    {},
    {
      markers: false,
      predictions: false,
      requirement: 20,
      availability: 5,
      vehicle: vehicle.Passenger.label,
      deferred: 8,
    },
    preference
  );
  return preference;
};

export function* readPreferenceSaga() {
  try {
    yield put(fetchPreferenceBusy(true));
    yield put(fetchPreferenceError());
    let response = yield call(readPreference);
    response = yield call(defaultPreferences, response);
    yield put(fetchPreferenceSuccess(response));
  } catch (error) {
    logError(error);
    yield put(fetchPreferenceError(error.message));
  } finally {
    yield put(fetchPreferenceBusy(false));
  }
}

export function* updatePreferenceSaga(action) {
  const preference = action.payload;
  try {
    yield put(updatePreferenceBusy(BUSY_GLOBAL));
    yield put(updatePreferenceError());
    const response = yield call(updatePreference, preference);
    yield put(updatePreferenceSuccess(response));
    yield call(readPreferenceSaga);
  } catch (error) {
    logError(error);
    yield put(updatePreferenceError(error.message));
  } finally {
    yield put(updatePreferenceBusy(false));
  }
}

export default function* preferencesSaga() {
  yield takeLatest(FETCH_PREFERENCE[REQUEST], readPreferenceSaga);
  yield takeLatest(UPDATE_PREFERENCE[REQUEST], updatePreferenceSaga);
}
