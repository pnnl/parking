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
const Occupancy = require("../models").Occupancy;
const Occupancies = require("../config/occupancies");
const moment = require("moment");

module.exports = {
  up: (queryInterface, Sequelize) => {
    if (Occupancies.length === 0) {
      console.log("No occupancy data to load.");
      return Promise.resolve();
    }
    const items = Occupancies.map((occupancy) => {
      const date = moment(occupancy.date, "Y/M/D")
        .local()
        .valueOf();
      const time = moment(occupancy.time, "h:m:s a")
        .local()
        .format("h:mm:ss a");
      return Object.assign(
        {},
        {
          date: date,
          time: time,
          blockId: occupancy.block_id,
          blockfaceId: occupancy.blockface_id,
          cvlzId: occupancy.cvlz_id,
          occupancy: occupancy.occupancy,
        },
        {
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    });
    return Promise.all(
      _.chunk(items, 10000).map((chunk) =>
        queryInterface.bulkInsert("Occupancies", chunk, {
          ignoreDuplicates: true,
        })
      )
    );
  },

  down: (queryInterface, Sequelize) => {
    return Occupancy.drop();
  },
};
