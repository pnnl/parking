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
const _ = require("lodash");
const { loggers } = require("winston");
const logger = loggers.get("default");
require("dotenv-flow").config({
  silent: true,
});

const parse = (date) => {
  try {
    const temp = _.isString(date) ? moment(date) : null;
    return temp.valueOf() > 0 ? temp : null;
  } catch (error) {
    return null;
  }
};

const counts = (data) => {
  return Object.entries(data).reduce(
    (map, [key, value]) =>
      _.set(map, [key], _.sum(value.map((v) => (v.occupied ? 1 : 0)))),
    {}
  );
};

const status = (data) => {
  return Object.entries(data).reduce(
    (map, [key, value]) => _.set(map, [key], value.map((v) => v.occupied)),
    {}
  );
};

const execute = (cache, params) => () => {
  const { url, key, host, port } = params;
  axios
    .get(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": key,
      },
      ...(!_.isEmpty(host) && {
        proxy: {
          host: host,
          port: port,
        },
      }),
    })
    .then((response) => {
      const error = _.get(response, ["data", "error"]);
      if (error) {
        throw Error(error.message);
      }
      const { previous } = cache;
      const current = _.get(
        response,
        ["data", "Result", "floatingCells"],
        []
      ).reduce((map, value) => {
        const { ParentGapName: id, arrival, departure, sType } = value;
        const record = {
          id,
          occupied: sType === "eOccupied",
          arrival: parse(arrival),
          departure: parse(departure),
        };
        _.set(map, [id], _.concat(_.get(map, [id], []), [record]));
        return map;
      }, {});
      const now = moment().local();
      const date = now.valueOf();
      const time = now.format("h:mm:ss a");
      const base = {
        date: date,
        time: time,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (_.isUndefined(previous)) {
        const sensors = status(current);
        Object.entries(counts(current)).forEach(([key, value]) => {
          logger.debug(
            _.merge(
              {
                blockId: null,
                blockfaceId: null,
                cvlzId: key,
                occupancy: value,
                sensors: JSON.stringify(sensors[key]),
              },
              base
            )
          );
          Occupancy.create(
            _.merge(
              {
                blockId: null,
                blockfaceId: null,
                cvlzId: key,
                occupancy: value,
                sensors: JSON.stringify(sensors[key]),
              },
              base
            )
          );
        });
      } else {
        const prevCounts = counts(previous);
        const prevSensors = status(previous);
        logger.debug({
          service: "cleverciti",
          previousOccupancy: prevCounts,
          currentOccupancy: counts(current),
        });
        const sensors = status(current);
        Object.entries(counts(current)).forEach(([key, value]) => {
          if (
            prevCounts[key] !== value ||
            !_.isEqual(prevSensors[key], sensors[key])
          ) {
            Occupancy.create(
              _.merge(
                {
                  blockId: null,
                  blockfaceId: null,
                  cvlzId: key,
                  occupancy: value,
                  sensors: JSON.stringify(sensors[key]),
                },
                base
              )
            );
          }
        });
      }
      cache.previous = current;
    })
    .catch((error) => {
      logger.error({ message: error.message, stack: error.stack });
    });
};

const task = () => {
  const cache = {};
  const params = {
    url: process.env.CLEVERCITI_API_URL,
    key: process.env.CLEVERCITI_API_KEY,
    schedule: process.env.CLEVERCITI_API_SCHEDULE,
    host: process.env.CLEVERCITI_PROXY_HOST,
    port: process.env.CLEVERCITI_PROXY_PORT,
  };
  if (!_.isEmpty(params.schedule)) {
    const task = execute(cache, params);
    task();
    cron.schedule(params.schedule, task);
  }
};

module.exports = task;
