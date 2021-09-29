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
const Space = require("../models").Space;
const Prediction = require("../models").Prediction;
const _ = require("lodash");
const { loggers } = require("winston");
const logger = loggers.get("default");
require("dotenv-flow").config({
  silent: true,
});

const begin = (cache) => () => {
  if (cache.running) {
    return false;
  } else {
    cache.running = true;
    cache.count = 1;
    return true;
  }
};

const end = (cache) => () => {
  cache.count = Math.max(0, cache.count - 1);
  if (cache.count === 0) {
    cache.running = false;
  }
};

const reset = (cache) => (error) => {
  cache.count = 0;
  cache.running = false;
};

const execute = (cache, params) => () => {
  if (!cache.begin()) {
    return;
  }
  const { url, host, port } = params;
  axios
    .get(`${url}`, {
      headers: {},
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
      const data = _.get(response, ["data"]);
      Object.keys(data).forEach((cvlzId) => {
        Object.keys(data[cvlzId]).forEach((timestamp) => {
          const d = moment(timestamp).local();
          const date = d.valueOf();
          const time = d.format("h:mm:ss a");
          const base = {
            date: date,
            time: time,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const values = data[cvlzId][timestamp];
          if (_.isObject(values.sensors)) {
            values.sensors = JSON.stringify(values.sensors);
          }
          values.probability = _.get(values, ["probability"], 1.0);
          values.minOccupancy = _.get(values, ["minOccupancy"], values.value);
          values.maxOccupancy = _.get(values, ["maxOccupancy"], values.value);
          Space.findAll({
            where: { cvlzId: cvlzId },
            limit: 1,
          })
            .then((spaces) => {
              const { blockId, blockfaceId } = _.get(spaces, ["0"], {});
              logger.debug(JSON.stringify({ timestamp, values }));
              Prediction.create(
                _.merge(
                  {
                    blockId: blockId,
                    blockfaceId: blockfaceId,
                    cvlzId: cvlzId,
                  },
                  values,
                  base
                )
              );
            })
            .catch((error) => {
              logger.error({ message: error.message, stack: error.stack });
            });
        });
      });
      cache.end();
    })
    .catch((error) => {
      cache.reset(error);
      logger.error({ message: error.message, stack: error.stack });
    });
};

const task = () => {
  const cache = { running: false };
  _.merge(cache, { begin: begin(cache), end: end(cache), reset: reset(cache) });
  const params = {
    url: process.env.PREDICTION_API_URL,
    schedule: process.env.PREDICTION_API_SCHEDULE,
    host: process.env.PREDICTION_PROXY_HOST,
    port: process.env.PREDICTION_PROXY_PORT,
  };
  if (params.load) {
    const worker = load(cache, params);
    worker();
  }
  if (!_.isEmpty(params.schedule)) {
    const worker = execute(cache, params);
    worker();
    cron.schedule(params.schedule, worker);
  }
};

module.exports = task;
