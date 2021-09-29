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
const Joi = require("joi");
const router = require("express").Router();
const auth = require("../auth");
const Organization = require("../../models").Organization;
const { loggers } = require("winston");
const logger = loggers.get("default");

const organizationSchema = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .min(2)
    .max(100)
    .required(),
});

// create organization
router.post("/", auth.required, async (req, res, next) => {
  const organization = req.body;
  const result = Joi.validate(organization, organizationSchema);
  if (result.error) {
    return res
      .status(422)
      .json(
        _.get(
          result,
          ["error", "details", "message"],
          "Error validating the organization schema."
        )
      );
  }
  Organization.create(req.body)
    .then((created) => {
      return res.status(201).json(created);
    })
    .catch((error) => {
      return res.status(400).json(error.message);
    });
});

// update organization
router.put("/:id", auth.required, (req, res, next) => {
  const { id } = req.params;
  const organization = req.body;
  const result = Joi.validate(organization, organizationSchema);
  if (result.error) {
    return res
      .status(422)
      .json(
        _.get(
          result,
          ["error", "details", "message"],
          "Error validating the organization schema."
        )
      );
  }
  try {
    Organization.update(
      {
        name: organization.name,
        updatedAt: new Date(),
      },
      {
        where: { id: id },
      }
    )
      .then((count) => {
        if (count === 0) {
          return res.status(404).json("Organization not found.");
        }
        return res.status(200).json();
      })
      .catch((error) => {
        return res.status(400).json(error.message);
      });
  } catch (error) {
    logger.warn({ message: error.message, stack: error.stack });
    return res.status(409).json();
  }
});

// delete organization
router.delete("/:id", auth.required, (req, res, next) => {
  const { id } = req.params;
  Organization.destroy({
    where: { id: id },
  })
    .then((count) => {
      if (count === 0) {
        return res.status(404).json("Organization not found.");
      }
      return res.status(200).json();
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

// get organization
router.get("/:id", auth.optional, (req, res, next) => {
  const { id } = req.params;
  Organization.findAll({
    where: { id: id },
    attributes: ["id", "name", "createdAt", "updatedAt"],
  })
    .then((organizations) => {
      if (organizations.length === 0) {
        return res.status(404).json("Organization not found.");
      }
      return res.status(200).json(organizations);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

// get organizations
router.get("/", auth.optional, (req, res, next) => {
  const { where } = req.query;
  Organization.findAll({
    attributes: ["id", "name", "createdAt", "updatedAt"],
    ...(where && { where: JSON.parse(where) }),
  })
    .then((organizations) => {
      return res.status(200).json(organizations);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

module.exports = router;
