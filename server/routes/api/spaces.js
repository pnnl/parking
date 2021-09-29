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
const Space = require("../../models").Space;
const validate = require("../../models/validate");
const Op = require("sequelize").Op;
const { loggers } = require("winston");
const logger = loggers.get("default");
const _ = require("lodash");

// get geojson
router.get("/geojson.json", auth.required, (req, res, next) => {
  const { spaceTypes } = req.query;
  Space.findAll({
    ...(spaceTypes && {
      where: { spaceType: { [Op.in]: JSON.parse(spaceTypes) } },
    }),
  })
    .then((spaces) => {
      const keys = Object.keys(validate.space.definition);
      const features = spaces.map((space) => ({
        type: "Feature",
        properties: _.pick(space, keys),
        geometry: JSON.parse(space.geometry),
      }));
      const collection = { type: "FeatureCollection", features: features };
      return res.status(200).json(collection);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

// get geojson
router.get("/", auth.required, (req, res, next) => {
  const { spaceTypes, blockId, blockfaceId, cvlzId } = req.query;
  Space.findAll({
    where: {
      [Op.and]: {
        ...(spaceTypes && {
          spaceType: { [Op.in]: JSON.parse(spaceTypes) },
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
    attributes: {
      exclude: ["objectId", "createdAt", "updatedAt"],
    },
    order: [["objectId", "DESC"]],
    limit: 10000,
  })
    .then((spaces) => {
      return res.status(200).json(spaces);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

module.exports = router;
