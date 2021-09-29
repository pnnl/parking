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
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
require("dotenv-flow").config({
  silent: true,
});
console.log(`Node Environment: ${process.env.NODE_ENV}`);
const env = process.env.NODE_ENV || "development";
const config = require(path.join(process.cwd(), "config/config.js"))[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};
fs.readdirSync(path.join(process.cwd(), "models/database"))
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    console.log(`Importing database model: ${file}`);
    const model = require(path.join(
      path.join(process.cwd(), "models/database"),
      file
    ))(sequelize, Sequelize.DataTypes);
    console.log(`Imported database model: ${file}`);
    if (!model.name) {
      console.log(`Unable to import database model: ${file}`);
    }
    console.log(model.name);
    db[model.name] = model;
  });

db.User.belongsTo(db.Organization, { as: "organization" });

db.sequelize = sequelize;

module.exports = db;
