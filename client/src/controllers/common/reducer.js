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
import { fromJS } from "immutable";
import _ from "lodash";
import { ActionTypes, isActionType, isUpdateType } from "../util";
import { key, NOTICE, RESET } from "./action";
const { SUCCESS } = ActionTypes;

const initialState = {};

const toJS = (value) => (value && value.toJS ? value.toJS() : value);

const reducer = (state = fromJS(initialState), action) => {
  const { type, payload } = action;
  if (isActionType(key, type)) {
    return state.setIn(type.split("/"), fromJS(payload));
  }
  if (isUpdateType(key, type)) {
    const types = type.split("/");
    types[types.length - 1] = SUCCESS;
    return state.setIn(
      types,
      fromJS(_.assign(toJS(state.getIn(types)), payload))
    );
  }
  // do not clear on global reset
  // if (isResetType(key, type)) {
  //   return fromJS(initialState);
  // }
  switch (type) {
    case RESET:
      return fromJS(initialState);
    case NOTICE:
      return state.setIn(type.split("/"), fromJS(payload));
    default:
      return state;
  }
};

export default reducer;
