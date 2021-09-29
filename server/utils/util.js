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
const crypto = require("crypto");
const fs = require("fs");
const { template } = require("lodash");
const path = require("path");
require("dotenv-flow").config({
  silent: true,
});

/**
 * Securely hash the supplied password.
 *
 * @param {String} password
 */
const hashPassword = (password) => {
  const salt = fs.readFileSync(
    path.join(process.cwd(), process.env.PASSWORD_SALT)
  );
  if (!salt) {
    logger.warn("PASSWORD_SALT should point to a valid salt file.");
  }
  return crypto
    .pbkdf2Sync(password, salt, 10000, 512, "sha512")
    .toString("hex");
};

/**
 * Parse a string and return a boolean value.
 *
 * @param {String} value
 */
const parseBoolean = (value) => /^\s*true|yes|t|y\s*$/i.test(value);

/**
 * Parse the template and replace all {enclosed} entries with the corresponding property.
 * @param {String} template
 * @param {Object} props
 */
const templateFormat = (template, props) => {
  return template.replace(/{([^{}]+)}/g, (v, k) => props[k]);
};

module.exports.hashPassword = hashPassword;
module.exports.parseBoolean = parseBoolean;
module.exports.templateFormat = templateFormat;
