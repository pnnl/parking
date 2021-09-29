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
  fetchMapInfoBusy,
  fetchMapInfoError,
  fetchMapInfoSuccess,
  fetchMapStyleBusy,
  fetchMapStyleError,
  fetchMapStyleSuccess,
  FETCH_MAP_INFO,
  FETCH_MAP_STYLE,
} from "./action";
import { readMapInfo, readMapStyle } from "./api";
const { REQUEST } = ActionTypes;

export function* readMapInfoSaga() {
  try {
    yield put(fetchMapInfoBusy(true));
    yield put(fetchMapInfoError());
    const response = yield call(readMapInfo);
    yield put(fetchMapInfoSuccess(response));
  } catch (error) {
    logError(error);
    yield put(fetchMapInfoError(error.message));
  } finally {
    yield put(fetchMapInfoBusy(false));
  }
}

export function* readMapStyleSaga() {
  try {
    yield put(fetchMapStyleBusy(true));
    yield put(fetchMapStyleError());
    const response = yield call(readMapStyle);
    yield put(fetchMapStyleSuccess(response));
  } catch (error) {
    logError(error);
    yield put(fetchMapStyleError(error.message));
  } finally {
    yield put(fetchMapStyleBusy(false));
  }
}

export default function* mapSaga() {
  yield takeLatest(FETCH_MAP_INFO[REQUEST], readMapInfoSaga);
  yield takeLatest(FETCH_MAP_STYLE[REQUEST], readMapStyleSaga);
}
