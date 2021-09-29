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
import { all } from "redux-saga/effects";
import busySaga from "./busy/saga";
import commonSaga from "./common/saga";
import errorSaga from "./error/saga";
import mapSaga from "./map/saga";
import occupanciesSaga from "./occupancies/saga";
import organizationsSaga from "./organizations/saga";
import spacesSaga from "./spaces/saga";
import userSaga from "./user/saga";
import usersSaga from "./users/saga";

export default function* rootSaga() {
  yield all([
    commonSaga(),
    userSaga(),
    usersSaga(),
    organizationsSaga(),
    spacesSaga(),
    occupanciesSaga(),
    busySaga(),
    errorSaga(),
    mapSaga(),
  ]);
}
