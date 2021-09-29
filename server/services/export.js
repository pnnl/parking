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
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const Occupancy = require("../models").Occupancy;
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const _ = require("lodash");
const { loggers } = require("winston");
const { Op } = require("sequelize");
const { parseBoolean } = require("../utils/util");
const logger = loggers.get("default");
require("dotenv-flow").config({
  silent: true,
});

const attributes = [
  "date",
  "time",
  "blockId",
  "blockfaceId",
  "cvlzId",
  "occupancy",
  "sensors",
];

const execute = (cache, params) => () => {
  let amount = undefined;
  if (params.run && !cache.run) {
    amount = params.amount;
    cache.run = true;
  } else if (cache.backlog < params.backlog) {
    amount = ++cache.backlog;
  }
  const repeat = params.backlog > 0 && cache.backlog < params.backlog;
  const now = amount ? moment().subtract(amount, params.unit) : moment();
  const dateLike = _.isEmpty(params.dateLike)
    ? undefined
    : now.format(params.dateLike);
  const timeLike = _.isEmpty(params.timeLike)
    ? undefined
    : now.format(params.timeLike);
  Occupancy.findAll({
    where: {
      [Op.and]: {
        ...(dateLike && {
          date: { [Op.like]: dateLike },
        }),
        ...(timeLike && {
          time: { [Op.like]: timeLike },
        }),
      },
    },
    attributes: attributes,
  })
    .then((occupancies) => {
      if (occupancies.length === 0) {
        logger.info(
          `No occupancies for date: ${dateLike} and time: ${timeLike}`
        );
        if (repeat) {
          cache.worker();
        }
        return;
      }
      let filename = ".csv";
      if (params.unit) {
        switch (params.unit.slice(0, 1).toLowerCase()) {
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
      if (!fs.existsSync(path.resolve(process.cwd(), params.path))) {
        fs.mkdirSync(path.resolve(process.cwd(), params.path));
      }
      const csvWriter = createCsvWriter({
        path: path.resolve(process.cwd(), params.path, filename),
        header: attributes.map((a) => ({ id: a, title: a })),
      });
      csvWriter
        .writeRecords(occupancies)
        .then(() => {
          logger.info(
            `Completed writing of ${occupancies.length} record${
              occupancies.length === 1 ? "" : "s"
            } to file ${path.resolve(process.cwd(), params.path, filename)}`
          );
          if (repeat) {
            cache.worker();
          }
        })
        .catch((error) => {
          logger.warn({ message: error.message, stack: error.stack });
        });
    })
    .catch((error) => {
      logger.warn({ message: error.message, stack: error.stack });
    });
};

const task = () => {
  const cache = { run: false, backlog: 0 };
  const params = {
    run: parseBoolean(process.env.EXPORT_RUN_AT_START),
    schedule: process.env.EXPORT_SCHEDULE,
    unit: process.env.EXPORT_OFFSET_UNIT,
    amount: parseInt(process.env.EXPORT_OFFSET_AMOUNT),
    backlog: parseInt(process.env.EXPORT_BACKLOG_COUNT),
    path: process.env.EXPORT_PATH,
    dateLike: process.env.EXPORT_DATE_LIKE,
    timeLike: process.env.EXPORT_TIME_LIKE,
  };
  const worker = execute(cache, params);
  cache.worker = worker;
  if (params.run || params.backlog) {
    worker();
  }
  if (!_.isEmpty(params.schedule)) {
    cron.schedule(params.schedule, worker);
  }
};

module.exports = task;
