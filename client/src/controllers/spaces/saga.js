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
  fetchSpaceBusy,
  fetchSpaceError,
  fetchSpacesBusy,
  fetchSpacesError,
  fetchSpacesSuccess,
  fetchSpaceSuccess,
  FETCH_SPACE,
  FETCH_SPACES,
} from "./action";
import { readSpace, readSpaces } from "./api";
const { REQUEST } = ActionTypes;

export function* readSpaceSaga(action) {
  const { id } = action.payload;
  try {
    yield put(fetchSpaceBusy(true));
    yield put(fetchSpaceError());
    const response = yield call(readSpace, id);
    yield put(fetchSpaceSuccess(response));
  } catch (error) {
    logError(error);
    yield put(fetchSpaceError(error.message));
  } finally {
    yield put(fetchSpaceBusy(false));
  }
}

export function* readSpacesSaga() {
  try {
    yield put(fetchSpacesBusy(true));
    yield put(fetchSpacesError());
    const response = yield call(readSpaces);
    yield put(fetchSpacesSuccess(response));
  } catch (error) {
    logError(error);
    yield put(fetchSpacesError(error.message));
  } finally {
    yield put(fetchSpacesBusy(false));
  }
}

export default function* spacesSaga() {
  yield takeLatest(FETCH_SPACES[REQUEST], readSpacesSaga);
  yield takeLatest(FETCH_SPACE[REQUEST], readSpaceSaga);
}
