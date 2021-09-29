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
const geolib = require("geolib");
const Space = require("../models").Space;
const { parseBoolean } = require("../utils/util");
const _ = require("lodash");
const { loggers } = require("winston");
const logger = loggers.get("default");
require("dotenv-flow").config({
  silent: true,
});

const login = (cache, params) => {
  const { key, timestamp } = cache;
  if (key || (timestamp && moment().diff(timestamp, "seconds") < 10)) {
    // don't need to login or too soon
    return new Promise((resolve, reject) => {
      if (key) {
        resolve();
      } else {
        reject();
      }
    });
  }
  const { url, username, password, host, port } = params;
  logger.info(`Authenticating: ${`${url}/login`}`);
  return new Promise((resolve, reject) =>
    axios
      .post(
        `${url}/login`,
        { username: username, password: password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          ...(!_.isEmpty(host) && {
            proxy: {
              host: host,
              port: port,
            },
          }),
        }
      )
      .then((response) => {
        const error = _.get(response, ["data", "error"]);
        if (error) {
          throw Error(error.message);
        }
        cache.key = _.get(response, ["data", "jwt"]);
        cache.timestamp = moment();
        resolve();
      })
      .catch((error) => {
        logger.error({ message: error.message, stack: error.stack });
        reject();
      })
  );
};

const load = (cache, params) => () => {
  login(cache, params).then(() => {
    const { key } = cache;
    const { url, host, port } = params;
    logger.info(
      `Querying: ${`${url}/sites`} with auth: ${key && key.slice(0, 8)}${key &&
        "..."}`
    );
    axios
      .get(`${url}/sites`, {
        headers: {
          Authorization: `Bearer ${key}`,
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
        const current = _.get(response, ["data"], []);
        const base = {
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const sites = {};
        current.forEach((item) => {
          const match = /^([a-z]+-([a-z]+)[0-9]+)-([0-9]+)$/i.exec(
            item.site_name
          );
          const site = match[1];
          const number = match[3];
          _.set(sites, [site, number], item);
        });
        Object.keys(sites).forEach((k) => {
          const numbers = Object.keys(_.get(sites, [k], {}))
            .map((k) => parseInt(k))
            .sort();
          const site = _.get(sites, [k, `${numbers[0]}`], {});
          const last = _.get(sites, [k, `${numbers[numbers.length - 1]}`], {});
          const coords = [
            [site.longitude, site.latitude],
            [last.longitude, last.latitude],
          ];
          const length =
            geolib.getDistance(
              { longitude: site.longitude, latitude: site.latitude },
              { longitude: last.longitude, latitude: last.latitude },
              0.01
            ) * 3.28084;
          const record = _.merge(
            {
              label: site.district_name,
              objectId: undefined,
              blockId: undefined,
              blockfaceId: k, // occupancies only
              cvlzId: null, // occupancies only
              cvcpct: null, // occupancies only
              rowNbr: undefined,
              blockStart: undefined,
              blockEnd: undefined,
              widthOffset: undefined,
              geoBasys: undefined,
              spaceLength: undefined,
              spaceType: undefined,
              spaceTyped: undefined,
              timeLimit: null, // spaces and occupancies
              spaceNb: undefined,
              category: "CVLZ", // spaces and occupancies
              side: undefined,
              currentSt: undefined,
              elementKey: undefined,
              shapeLength: length, // spaces and occupancies
              occupancy: numbers.length, // number of sensors
              geometry: JSON.stringify({
                type: "LineString",
                coordinates: coords,
              }), // spaces and occupancies
            },
            base
          );
          Space.destroy({ where: { blockfaceId: record.blockfaceId } });
          Space.create(record);
        });
      })
      .catch((error) => {
        cache.key = null;
        logger.error({ message: error.message, stack: error.stack });
      });
  });
};

const execute = (cache, params) => () => {
  login(cache, params).then(() => {
    const { key } = cache;
    const { url, host, port } = params;
    logger.info(`Querying: ${`${url}/parking_sensors`}`);
    axios
      .get(`${url}/parking_sensors`, {
        headers: {
          Authorization: `Bearer ${key}`,
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
        const current = _.get(response, ["data"], []);
        const now = moment().local();
        const date = now.valueOf();
        const time = now.format("h:mm:ss a");
        const midnight = now.clone().startOf("day");
        const diff = now.diff(midnight, "seconds");
        const base = {
          date: date,
          time: time,
          seconds: parseInt(diff),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        current.forEach((item) => {});
        cache.previous = current;
      })
      .catch((error) => {
        cache.key = null;
        logger.error({ message: error.message, stack: error.stack });
      });
  });
};

const task = () => {
  const cache = { previous: {}, key: null, timestamp: null };
  const params = {
    url: process.env.FYBR_API_URL,
    username: process.env.FYBR_API_USERNAME,
    password: process.env.FYBR_API_PASSWORD,
    schedule: process.env.FYBR_API_SCHEDULE,
    load: parseBoolean(process.env.FYBR_LOAD_SPACES),
    host: process.env.FYBR_PROXY_HOST,
    port: process.env.FYBR_PROXY_PORT,
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
