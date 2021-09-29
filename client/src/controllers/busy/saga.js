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
  call,
  delay,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import { logError } from "utils/utils";
import { ActionTypes } from "../util";
import {
  busyTokens,
  BUSY_GLOBAL,
  makeBusyBusy,
  makeBusyError,
  makeBusySuccess,
  MAKE_BUSY,
  selectBusyTokens,
} from "./action";
const { REQUEST, BUSY } = ActionTypes;

const modifyBusyToken = (action, tokens) => {
  const { type, payload } = action;
  if (payload) {
    tokens[type] = payload;
  } else {
    delete tokens[type];
  }
  return tokens;
};

export function* isBusySaga(action) {
  const tokens = yield select(selectBusyTokens);
  yield call(modifyBusyToken, action, tokens);
  yield put(busyTokens(tokens));
}

const isBusyAction = (action) => {
  const types = action.type.split("/");
  return types[types.length - 1] === BUSY;
};

export function* makeBusySaga() {
  try {
    yield put(makeBusyBusy(BUSY_GLOBAL));
    yield put(makeBusyError());
    yield delay(5000);
    yield put(makeBusySuccess("successfully busied"));
  } catch (error) {
    logError(error);
    yield put(makeBusyError(error.message));
  } finally {
    yield put(makeBusyBusy(false));
  }
}

export default function* busySaga() {
  yield takeEvery(isBusyAction, isBusySaga);
  yield takeLatest(MAKE_BUSY[REQUEST], makeBusySaga);
}
