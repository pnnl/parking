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
import { combineReducers } from "redux-immutable";
import { key as busyKey } from "./busy/action";
import busyReducer from "./busy/reducer";
import { key as commonKey } from "./common/action";
import commonReducer from "./common/reducer";
import { key as errorKey } from "./error/action";
import errorReducer from "./error/reducer";
import { key as mapKey } from "./map/action";
import mapReducer from "./map/reducer";
import { key as occupanciesKey } from "./occupancies/action";
import occupanciesReducer from "./occupancies/reducer";
import { key as organizationsKey } from "./organizations/action";
import organizationsReducer from "./organizations/reducer";
import { key as spacesKey } from "./spaces/action";
import spacesReducer from "./spaces/reducer";
import { key as userKey } from "./user/action";
import userReducer from "./user/reducer";
import { key as usersKey } from "./users/action";
import usersReducer from "./users/reducer";

export default combineReducers({
  [commonKey]: commonReducer,
  [userKey]: userReducer,
  [usersKey]: usersReducer,
  [organizationsKey]: organizationsReducer,
  [spacesKey]: spacesReducer,
  [occupanciesKey]: occupanciesReducer,
  [busyKey]: busyReducer,
  [errorKey]: errorReducer,
  [mapKey]: mapReducer,
});
