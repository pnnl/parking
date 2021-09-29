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
const _ = require("lodash");
const geolib = require("geolib");
const Space = require("../models").Space;
const Spaces = require("../config/spaces");

const selectProp = (props, ...types) => {
  return types.map((type) => props[type]).find((value) => value);
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    const items = Spaces.map((space) => {
      const props = space.properties;
      let length = selectProp(props, "SHAPE_Length", "shp_ln_");
      if (!length) {
        length =
          geolib.getDistance(
            {
              longitude: _.get(
                space,
                ["geometry", "coordinates", "0", "0"],
                0.0
              ),
              latitude: _.get(
                space,
                ["geometry", "coordinates", "0", "1"],
                0.0
              ),
            },
            {
              longitude: _.get(
                space,
                ["geometry", "coordinates", "1", "0"],
                0.0
              ),
              latitude: _.get(
                space,
                ["geometry", "coordinates", "1", "1"],
                0.0
              ),
            },
            0.01
          ) * 3.28084;
      }
      const count = _.get(props, ["spc_cnt"], 1);
      return Object.assign(
        {},
        {
          label: props.label,
          objectId: props.OBJECTID,
          blockId: selectProp(props, "BLOCKID", "blck_id"),
          blockfaceId: props.blckfc_, // occupancies only
          cvlzId: props.cvlz_id, // occupancies only
          cvcpct: props.cv_cpct, // occupancies only
          rowNbr: props.ROWNBR,
          blockStart: props.BLOCK_ST,
          blockEnd: props.BLOCK_END,
          widthOffset: props.WIDTH_OFFSET,
          geoBasys: props.GEOBASYS,
          spaceLength: props.SPACELENGTH,
          spaceType: props.SPACETYPE,
          spaceTyped: props.SPACETYPEDESC,
          timeLimit: selectProp(props, "TIME_LIMIT", "tim_lmt"), // spaces and occupancies
          spaceNb: props.SPACE_NB,
          category: selectProp(props, "CATEGORY", "prk_ctg"), // spaces and occupancies
          side: props.SIDE,
          currentSt: props.CURRENT_STATUS,
          elementKey: props.ELMNTKEY,
          shapeLength: Math.max(10, length), // spaces and occupancies
          occupancy: count,
          sensors: JSON.stringify(_.range(1, count + 1).map((i) => `${i}`)),
          geometry: JSON.stringify(space.geometry), // spaces and occupancies
        },
        {
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    });
    return Promise.all(
      _.chunk(items, 10000).map((chunk) =>
        queryInterface.bulkInsert("Spaces", chunk, { ignoreDuplicates: true })
      )
    );
  },

  down: (queryInterface, Sequelize) => {
    return Space.drop();
  },
};
