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
const fs = require("fs");
const path = require("path");
const Occupancy = require("../../models").Occupancy;
const Space = require("../../models").Space;
const validate = require("../../models/validate");
const { loggers } = require("winston");
const logger = loggers.get("default");
const _ = require("lodash");
const { Op } = require("sequelize");
const moment = require("moment");
const { calculateAvailable } = require("./util");

// get geojson
router.get("/geojson.json", auth.required, (req, res, next) => {
  const { requirement } = req.query;
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
          const features = spaces.map((space) => {
            space.shapeLength = Math.round(space.shapeLength);
            space.occupancies = true;
            space.sensors = JSON.parse(space.sensors).length;
            space.required = required;
            space.occupancy = _.get(occupancies, [space.cvlzId, "value"], 0);
            space.state = _.get(occupancies, [space.cvlzId, "sensors"]);
            space.current = calculateAvailable(space, "occupancy");
            space.available = space.current;
            space.precise = Boolean(space.state);
            return {
              type: "Feature",
              properties: _.pick(space, keys),
              geometry: JSON.parse(space.geometry),
            };
          });
          const collection = { type: "FeatureCollection", features: features };
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
});

// get occupancies in a csv
router.get("/occupancies.csv", auth.required, (req, res, next) => {
  const { date } = req.query;
  const now = moment(date);
  let filename = ".csv";
  if (process.env.EXPORT_OFFSET_UNIT) {
    switch (process.env.EXPORT_OFFSET_UNIT.slice(0, 1).toLowerCase()) {
      case "m":
        filename = now.format("-mm") + filename;
      case "h":
        filename = now.format("-hh") + filename;
      case "d":
        filename = now.format("-DD") + filename;
      case "m":
        filename = now.format("-MM") + filename;
      case "y":
        filename = now.format("YYYY") + filename;
      default:
        filename = "Occupancies_" + filename;
    }
  }
  fs.readFile(
    path.resolve(process.cwd(), process.env.EXPORT_PATH, filename),
    (err, data) => {
      if (err) {
        return res.status(400).json("Requested data not available.");
      }
      return res.status(200).send(data);
    }
  );
});

// get occupancy
router.get("/:id", auth.required, (req, res, next) => {
  const { id } = req.params;
  Occupancy.findAll({
    where: { objectid: id },
  })
    .then((occupancies) => {
      if (occupancies.length === 0) {
        return res.status(404).json("Occupancy not found.");
      }
      return res.status(200).json(occupancies);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

// get occupancies
router.get("/", auth.required, (req, res, next) => {
  const { date, time, blockId, blockfaceId, cvlzId } = req.query;
  Occupancy.findAll({
    where: {
      [Op.and]: {
        ...(date && {
          date: { [Op.like]: date },
        }),
        ...(time && {
          time: { [Op.like]: time },
        }),
        ...(blockId && {
          blockId: { [Op.like]: blockId },
        }),
        ...(blockfaceId && {
          blockfaceId: { [Op.like]: blockfaceId },
        }),
        ...(cvlzId && {
          cvlzId: { [Op.like]: cvlzId },
        }),
      },
    },
    attributes: [
      "date",
      "time",
      "blockId",
      "blockfaceId",
      "cvlzId",
      "occupancy",
      "sensors",
    ],
    order: [["objectId", "DESC"]],
    limit: 10000,
  })
    .then((occupancies) => {
      return res.status(200).json(occupancies);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

module.exports = router;
