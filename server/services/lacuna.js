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
const Occupancy = require("../models").Occupancy;
const { parseBoolean } = require("../utils/util");
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
    cache.count = cache.ids.length;
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
  const status = _.get(error, ["response", "status"], 0);
  if ([401, 403].includes(status)) {
    cache.key = null;
    logger.warn(`Cleared the credentials for the Lacuna API.`);
  }
  cache.count = 0;
  cache.running = false;
};

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
  const { login: url, body, host, port } = params;
  logger.info(`Authenticating: ${`${url}`}`);
  return new Promise((resolve, reject) =>
    axios
      .post(`${url}`, JSON.parse(body), {
        headers: {
          "Content-Type": "application/json",
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
        cache.key = _.get(response, ["data", "access_token"]);
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
  cache.begin();
  login(cache, params).then(() => {
    const { key } = cache;
    const { url, host, port } = params;
    logger.info(
      `Querying: ${`${url}/stops?agency_key=seattle_wa`} with auth: ${key &&
        key.slice(0, 8)}${key && "..."}`
    );
    axios
      .get(`${url}/stops?agency_key=seattle_wa`, {
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
        const stops = _.get(response, ["data"], []);
        stops.forEach((stop) => {
          stop.spot_ids.forEach((id) => {
            logger.info(
              `Querying: ${`${url}/spots?spot_id=${id}`} with auth: ${key &&
                key.slice(0, 8)}${key && "..."}`
            );
            axios
              .get(`${url}/spots?spot_id=${id}`, {
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
                const site = _.get(response, ["data", "0"], []);
                const base = {
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                const coords = _.get(
                  site,
                  [
                    "geography",
                    "geography_json",
                    "features",
                    "0",
                    "geometry",
                    "coordinates",
                  ],
                  []
                );
                const i = site.sensors.length - 1;
                const length =
                  geolib.getDistance(
                    {
                      longitude: _.get(site, ["sensors", "0", "lng"], 0.0),
                      latitude: _.get(site, ["sensors", "0", "lat"], 0.0),
                    },
                    {
                      longitude: _.get(site, ["sensors", `${i}`, "lng"], 0.0),
                      latitude: _.get(site, ["sensors", `${i}`, "lat"], 0.0),
                    },
                    0.01
                  ) * 3.28084;
                let category = "";
                if (/passenger/i.test(site.spot_type)) {
                  category = "LOAD";
                } else if (/commercial/i.test(site.spot_type)) {
                  category = "CVLZ";
                }
                const record = _.merge(
                  {
                    label: `${stop.name} ${site.spot_name}`,
                    objectId: undefined,
                    blockId: "belltown",
                    blockfaceId: stop.name, // occupancies only
                    cvlzId: site.spot_name, // occupancies only
                    cvcpct: null, // occupancies only
                    rowNbr: undefined,
                    blockStart: undefined,
                    blockEnd: undefined,
                    widthOffset: undefined,
                    geoBasys: undefined,
                    spaceLength: undefined,
                    spaceType: category,
                    spaceTyped: site.spot_type,
                    timeLimit: null, // spaces and occupancies
                    spaceNb: undefined,
                    category: "CVLZ", // spaces and occupancies
                    side: undefined,
                    currentSt: undefined,
                    elementKey: undefined,
                    shapeLength: Math.max(
                      10,
                      length,
                      site.available_length * 3.28084
                    ), // spaces and occupancies
                    occupancy: site.sensors.length, // number of sensors
                    sensors: JSON.stringify(site.sensors.map((s) => s.name)), // sensor ids
                    geometry: JSON.stringify({
                      type: "LineString",
                      coordinates: coords,
                    }), // spaces and occupancies
                  },
                  base
                );
                Space.destroy({ where: { cvlzId: record.cvlzId } }).finally(
                  () => Space.create(record)
                );
                const now = moment().local();
                const date = now.valueOf();
                const time = now.format("h:mm:ss a");
                _.merge(base, {
                  date: date,
                  time: time,
                });
                const sensors = _.get(site, ["sensors"], []).map(
                  (s) => s.occupied
                );
                Occupancy.create(
                  _.merge(
                    {
                      blockId: "belltown",
                      blockfaceId: stop.name,
                      cvlzId: site.spot_name,
                      occupancy: sensors.filter((v) => v).length,
                      sensors: JSON.stringify(sensors),
                    },
                    base
                  )
                );
                cache.ids.push({
                  id: id,
                  blockId: "belltown",
                  blockfaceId: stop.name,
                  cvlzId: site.spot_name,
                });
                cache.end();
              })
              .catch((error) => {
                cache.reset(error);
                logger.error({ message: error.message, stack: error.stack });
              });
          });
        });
      })
      .catch((error) => {
        cache.reset(error);
        logger.error({ message: error.message, stack: error.stack });
      });
  });
};

const execute = (cache, params) => () => {
  if (!cache.begin()) {
    return;
  }
  login(cache, params).then(() => {
    const { ids, key } = cache;
    const { url, host, port } = params;
    ids.forEach(({ id, blockId, blockfaceId, cvlzId }) => {
      axios
        .get(`${url}/spots?spot_id=${id}`, {
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
          const previous = cache.previous[id];
          const current = _.get(response, ["data", "0"]);
          const now = moment().local();
          const date = now.valueOf();
          const time = now.format("h:mm:ss a");
          const base = {
            date: date,
            time: time,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const p = _.get(previous, ["sensors"], []).map((s) => s.occupied);
          const c = _.get(current, ["sensors"], []).map((s) => s.occupied);
          if (!previous || !_.isEqual(p, c)) {
            Occupancy.create(
              _.merge(
                {
                  blockId: blockId,
                  blockfaceId: blockfaceId,
                  cvlzId: cvlzId,
                  occupancy: c.filter((v) => v).length,
                  sensors: JSON.stringify(c),
                },
                base
              )
            );
          }
          cache.previous[id] = current;
          cache.end();
        })
        .catch((error) => {
          cache.reset(error);
          logger.error({ message: error.message, stack: error.stack });
        });
    });
  });
};

const task = () => {
  const cache = {
    ids: [],
    previous: {},
    running: false,
    key: null,
    timestamp: null,
  };
  _.merge(cache, {
    reset: reset(cache),
    begin: begin(cache),
    end: end(cache),
  });
  const params = {
    login: process.env.LACUNA_AUTH_URL,
    url: process.env.LACUNA_API_URL,
    body: process.env.LACUNA_API_BODY,
    schedule: process.env.LACUNA_API_SCHEDULE,
    load: parseBoolean(process.env.LACUNA_LOAD_SPACES),
    host: process.env.LACUNA_PROXY_HOST,
    port: process.env.LACUNA_PROXY_PORT,
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
