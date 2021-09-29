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
const router = require("express").Router();
const auth = require("../auth");
const Occupancy = require("../../models").Occupancy;
const Prediction = require("../../models").Prediction;
const Space = require("../../models").Space;
const validate = require("../../models/validate");
const { loggers } = require("winston");
const logger = loggers.get("default");
const _ = require("lodash");
const moment = require("moment");
const { Op } = require("sequelize");
const { calculateAvailable } = require("./util");

const round = (value, factor = 1) => {
  return Math.round(value / factor) * factor;
};

// get geojson
router.get("/geojson.json", auth.required, (req, res, next) => {
  const { availability, requirement } = req.query;
  const duration = availability ? parseInt(availability) : 5;
  const m = moment().local();
  const times = _.range(0, duration)
    .map((d) =>
      m
        .clone()
        .add(d, "minutes")
        .format("h:mm:00 a")
    )
    .reverse();
  const required = requirement ? parseInt(requirement) : 20;
  Space.findAll({
    where: {
      cvlzId: {
        [Op.ne]: null,
      },
      category: "CVLZ",
    },
  })
    .then((spaces) => {
      const keys = _.difference(Object.keys(validate.space.definition), [
        "geometry",
      ]);
      return Promise.all(
        spaces
          .filter((space) => !_.isEmpty(space.cvlzId))
          .map((space) =>
            Occupancy.findAll({
              where: {
                cvlzId: space.cvlzId,
              },
              order: [["objectId", "DESC"]],
              limit: 1,
            })
          )
      )
        .then((results) => {
          const occupancies = results
            .map((result) => {
              const id = _.get(result, ["0", "cvlzId"]);
              const value = _.get(result, ["0", "occupancy"], 0);
              let sensors = _.get(result, ["0", "sensors"]);
              if (_.isString(sensors)) {
                try {
                  sensors = JSON.parse(sensors);
                } catch (error) {
                  logger.warn({
                    message: error.message,
                    stack: error.stack,
                  });
                }
              }
              return { id, value, sensors };
            })
            .reduce((map, value) => {
              if (!_.isEmpty(value.id)) {
                map[value.id] = value;
              }
              return map;
            }, {});
          return Promise.all(
            spaces
              .filter((space) => !_.isEmpty(space.cvlzId))
              .map((space) =>
                Prediction.findAll({
                  where: {
                    [Op.and]: {
                      cvlzId: space.cvlzId,
                      time: { [Op.in]: times },
                    },
                  },
                  order: [["date", "DESC"]],
                  limit: times.length,
                }).then((predictions) =>
                  predictions
                    .sort(
                      (a, b) =>
                        _.indexOf(times, a.time) - _.indexOf(times, b.time)
                    )
                    .slice(0, 1)
                )
              )
          )
            .then((results) => {
              const predictions = results
                .map((result) => {
                  const id = _.get(result, ["0", "cvlzId"]);
                  const value = _.get(result, ["0", "value"]);
                  let sensors = _.get(result, ["0", "sensors"]);
                  if (_.isString(sensors)) {
                    try {
                      sensors = JSON.parse(sensors);
                    } catch (error) {
                      logger.warn({
                        message: error.message,
                        stack: error.stack,
                      });
                    }
                  }
                  return { id, value, sensors };
                })
                .reduce((map, value) => {
                  if (!_.isEmpty(value.id)) {
                    map[value.id] = value;
                  }
                  return map;
                }, {});
              const features = spaces.map((space) => {
                space.shapeLength = Math.round(space.shapeLength);
                space.occupancies = true;
                space.sensors = JSON.parse(space.sensors).length;
                space.occupancy = _.get(
                  occupancies,
                  [space.cvlzId, "value"],
                  0
                );
                space.state = _.get(occupancies, [space.cvlzId, "sensors"]);
                space.current = calculateAvailable(space, "occupancy");
                space.predictions = true;
                space.prediction = _.get(
                  predictions,
                  [space.cvlzId, "value"],
                  null
                );
                space.state = _.get(
                  predictions,
                  [space.cvlzId, "sensors"],
                  null
                );
                space.required = required;
                if (space.prediction === null) {
                  space.available = null;
                } else {
                  space.available = calculateAvailable(space, "prediction");
                }
                space.precise = Boolean(space.state);
                return {
                  type: "Feature",
                  properties: _.pick(space, keys),
                  geometry: JSON.parse(space.geometry),
                };
              });
              const collection = {
                type: "FeatureCollection",
                features: features,
              };
              return res.status(200).json(collection);
            })
            .catch((error) => {
              logger.warn({ message: error.message, stack: error.stack });
              return res.status(400).json(error.message);
            });
        })
        .catch((error) => {
          logger.warn({ message: error.message, stack: error.stack });
          return res.status(400).json(error.message);
        });
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

// get prediction
router.get("/:id", auth.required, (req, res, next) => {
  const { id } = req.params;
  Prediction.findAll({
    where: { objectid: id },
  })
    .then((predictions) => {
      if (predictions.length === 0) {
        return res.status(404).json("Prediction not found.");
      }
      return res.status(200).json(predictions);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

// get predictions
router.get("/", auth.required, (req, res, next) => {
  const { where } = req.query;
  Prediction.findAll({ ...(where && { where: JSON.parse(where) }) })
    .then((predictions) => {
      return res.status(200).json(predictions);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

module.exports = router;
