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
const passport = require("passport");
const generateJWT = require("../../utils/generateJWT");
const auth = require("../auth");
const User = require("../../models").User;
const Joi = require("joi");
const validate = require("../../models/validate");
const guard = require("express-jwt-permissions")({
  requestProperty: "user",
  permissionsProperty: "scope",
});
const { loggers } = require("winston");
const logger = loggers.get("default");
const _ = require("lodash");

// login
router.post("/login", auth.optional, (req, res, next) => {
  const user = req.body;
  const result = Joi.validate(user, validate.user.schema);
  if (result.error) {
    return res
      .status(422)
      .json(
        _.get(
          result,
          ["error", "details", "message"],
          "Error validating the user schema."
        )
      );
  }
  return passport.authenticate(
    "local",
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }
      if (passportUser) {
        const user = {
          id: passportUser.id,
          email: passportUser.email,
          token: generateJWT(passportUser),
        };
        return res.status(200).json(user);
      }
      return res.status(400).json(info);
    }
  )(req, res, next);
});

// update user
router.put("/", auth.required, guard.check("user"), (req, res, next) => {
  const { id } = req.user;
  const user = req.body;
  Object.keys(user)
    .filter((k) =>
      ["email", "password", "name", "surname", "preferences"].includes(k)
    )
    .forEach((k) => {
      const result = Joi.validate(
        { [k]: user[k] },
        Joi.object().keys({ [k]: validate.user.definition[k] })
      );
      if (result.error) {
        return res
          .status(422)
          .json(
            _.get(
              result,
              ["error", "details", "message"],
              "Error validating the user schema."
            )
          );
      }
    });
  User.update(
    {
      ...(user.email && { email: user.email }),
      ...(user.password && { password: user.password }),
      ...(user.name && { name: user.name }),
      ...(user.surname && { surname: user.surname }),
      ...(user.preferences && {
        preferences: user.preferences,
      }),
      updatedAt: new Date(),
    },
    {
      where: { id: id },
    }
  )
    .then((count) => {
      if (count === 0) {
        return res.status(404).json("User not found.");
      }
      User.findAll({
        where: { id: id },
        include: ["organization"],
        attributes: {
          exclude: ["name", "surname", "password", "organizationId"],
        },
      })
        .then((users) => {
          if (users.length === 0) {
            return res.status(404).json("User not found.");
          }
          return res.status(200).json(users[0]);
        })
        .catch((error) => {
          return res.status(400).json(error.message);
        });
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

// delete user
router.delete("/", auth.required, guard.check("user"), (req, res, next) => {
  const { id } = req.user;
  User.destroy({
    where: { id: id },
  })
    .then((count) => {
      if (count === 0) {
        return res.status(404).json("User not found.");
      }
      return res.status(200).json();
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

// get user
router.get("/", auth.required, (req, res, next) => {
  const { id } = req.user;
  User.findAll({
    where: { id: id },
    include: ["organization"],
    attributes: { exclude: ["name", "surname", "password", "organizationId"] },
  })
    .then((users) => {
      if (users.length === 0) {
        return res.status(404).json("User not found.");
      }
      return res.status(200).json(users[0]);
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
      return res.status(400).json(error.message);
    });
});

module.exports = router;
