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
const { loggers } = require("winston");
const logger = loggers.get("default");
const _ = require("lodash");

/**
 * Calculate the maximum available space.
 *
 * @param {*} space
 * @param {String} type of occupancy or prediction
 * @returns available space
 */
const calculateAvailable = (space, type) => {
  const open = space.sensors - space[type];
  const segment = space.shapeLength / Math.max(1, space.sensors);
  let available =
    open < space.sensors ? segment * Math.ceil(open / 2) : segment * open;
  if (_.isArray(space.state)) {
    let max = 0;
    let temp = 0;
    for (let i = 0; i < space.state.length; i++) {
      const occupied = space.state[i];
      temp += !occupied
        ? (i === 0 || i === space.state.length - 1 ? 1.0 : 1.0) * segment
        : 0;
      max = Math.max(max, temp);
      if (occupied) {
        temp = 0;
      }
    }
    available = max;
  }
  return Math.round(available);
};

module.exports.calculateAvailable = calculateAvailable;
