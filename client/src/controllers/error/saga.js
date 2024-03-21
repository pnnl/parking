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
import _ from "lodash";
import { call, put, select, takeEvery } from "redux-saga/effects";
import { logError } from "utils/utils";
import { reset } from "../action";
import { ActionTypes, generateAction } from "../util";
import {
  clearErrorBusy,
  clearErrorError,
  clearErrorSuccess,
  CLEAR_ERROR,
  errorTokens,
  selectErrorTokens,
} from "./action";
const { REQUEST, ERROR } = ActionTypes;

const modifyErrorToken = (action, tokens) => {
  const { type, payload } = action;
  tokens[type] = _.assign({}, tokens[type], payload, {
    cleared: !Boolean(payload),
  });
  return tokens;
};

const isUnauthorized = (action) => {
  const { payload } = action;
  return /unauthorized|expired|session is invalid/gim.test(
    _.get(payload, "error", "")
  );
};

export function* isErrorSaga(action) {
  const tokens = yield select(selectErrorTokens);
  yield call(modifyErrorToken, action, tokens);
  if (isUnauthorized(action)) {
    yield put(reset());
  }
  yield put(errorTokens(tokens));
}

const isErrorAction = (action) => {
  const types = action.type.split("/");
  return types[types.length - 1] === ERROR;
};

export function* clearErrorSaga(action) {
  const { payload: key } = action;
  if (!key) {
    return;
  }
  const errorAction = generateAction(key);
  try {
    yield put(clearErrorBusy());
    yield put(clearErrorError());
    const tokens = yield select(selectErrorTokens);
    yield call(modifyErrorToken, errorAction(), tokens);
    yield put(clearErrorSuccess("successfully cleared error"));
  } catch (error) {
    logError(error);
    yield put(clearErrorError(error.message));
  } finally {
    yield put(clearErrorBusy(false));
  }
}

export default function* errorSaga() {
  yield takeEvery(isErrorAction, isErrorSaga);
  yield takeEvery(CLEAR_ERROR[REQUEST], clearErrorSaga);
}
