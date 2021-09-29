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
const cron = require("node-cron");
const axios = require("axios");
const moment = require("moment");
const Occupancy = require("../models").Occupancy;
const { templateFormat } = require("../utils/util");
const _ = require("lodash");
const { loggers } = require("winston");
const logger = loggers.get("default");
require("dotenv-flow").config({
  silent: true,
});

const ids = [
  "b017173c-45d8-4a6e-9865-e2a72865f86d",
  "0dcbcaaa-982c-4af5-b6db-34b919a9f22e",
];

const execute = (cache, params) => () => {
  const { url, key } = params;
  ids.forEach((id) => {
    const props = {
      id: id,
    };
    logger.info(`Querying: ${templateFormat(url, props)}`);
    axios
      .get(templateFormat(url, props), {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": key,
        },
        ...(!_.isEmpty(process.env.AUTOMOTUS_PROXY_HOST) && {
          proxy: {
            host: process.env.AUTOMOTUS_PROXY_HOST,
            port: process.env.AUTOMOTUS_PROXY_PORT,
          },
        }),
      })
      .then((response) => {
        const error = _.get(response, ["data", "error"]);
        if (error) {
          throw Error(error.message);
        }
        const { previous } = cache;
        const current = _.get(response, ["data", "data"], []);
        const now = moment().local();
        const date = now.valueOf();
        const time = now.format("h:mm:ss a");
        const base = {
          date: date,
          time: time,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        if (current) {
          const { num_occupants } = current;
          if (_.isUndefined(previous[id])) {
            Occupancy.create(
              _.merge(
                {
                  blockId: null,
                  blockfaceId: null,
                  cvlzId: id,
                  occupancy: num_occupants,
                },
                base
              )
            );
          } else {
            logger.debug({
              service: "automotus",
              previousOccupancy: previous[id].num_occupants,
              currentOccupancy: current.num_occupants,
            });
            if (previous[id].num_occupants !== num_occupants) {
              Occupancy.create(
                _.merge(
                  {
                    blockId: null,
                    blockfaceId: null,
                    cvlzId: id,
                    occupancy: num_occupants,
                  },
                  base
                )
              );
            }
          }
          cache.previous[id] = current;
        }
      })
      .catch((error) => {
        logger.error({ message: error.message, stack: error.stack });
      });
  });
};

const task = () => {
  const cache = { previous: {} };
  const params = {
    url: process.env.AUTOMOTUS_API_URL,
    key: process.env.AUTOMOTUS_API_KEY,
    schedule: process.env.AUTOMOTUS_API_SCHEDULE,
  };
  if (!_.isEmpty(params.schedule)) {
    const task = execute(cache, params);
    task();
    cron.schedule(params.schedule, task);
  }
};

module.exports = task;
