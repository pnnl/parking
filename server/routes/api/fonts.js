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
const { loggers } = require("winston");
const logger = loggers.get("default");

// get map style
router.get("/:font/:range.pbf", auth.required, (req, res, next) => {
  const { font, range } = req.params;
  fs.readFile(
    // TODO recursively look for fonts
    path.join(process.cwd(), `fonts/${font.split(",")[0]}/${range}.pbf`),
    (error, data) => {
      if (error) {
        logger.warn({ message: error.message, stack: error.stack });
        return res.status(400).json(error.message);
      }
      return res.status(200).send(data);
    }
  );
});

module.exports = router;
