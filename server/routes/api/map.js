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
const MBTiles = require("@mapbox/mbtiles");
const { loggers } = require("winston");
const logger = loggers.get("default");
const Map = require("../../config/maps");
const util = require("../../utils/util");
const _ = require("lodash");
require("dotenv-flow").config({
  silent: true,
});

const mbtiles = new MBTiles(
  `${Map.length > 0 ? Map[0] : "map-data-not-found"}?mode=ro`,
  function(error, mbtiles) {
    if (error) {
      logger.error({ message: error.message, stack: error.stack });
    }
    logger.debug(mbtiles);
  }
);

const options = (function() {
  const proxy = util.parseBoolean(process.env.PROXY);
  const https = proxy
    ? util.parseBoolean(process.env.PROXY_HTTPS)
    : util.parseBoolean(process.env.HTTPS);
  const address = proxy
    ? process.env.PROXY_ADDRESS
    : process.env.SERVER_ADDRESS;
  const port = proxy ? process.env.PROXY_PORT : process.env.SERVER_PORT;
  const omit = (https && port == "443") || (!https && port == "80");
  return {
    https: https,
    address: address,
    port: port,
    service: `http${https ? "s" : ""}://${address}${omit ? "" : ":" + port}`,
  };
})();

// get map tiles
router.get("/tile/:z/:x/:y.vector.pbf", auth.required, (req, res, next) => {
  const { z, x, y } = req.params;
  mbtiles.getTile(z, x, y, function(err, data, headers) {
    if (err) {
      return res.status(400).json(err.message);
    }
    return res
      .status(200)
      .set(headers)
      .send(data);
  });
});

// get map style
router.get("/style", auth.required, (req, res, next) => {
  fs.readFile(path.join(process.cwd(), "data/map/style.json"), (err, data) => {
    if (err) {
      return res.status(400).json(err.message);
    }
    const json = JSON.parse(data);
    [
      "sources.openmaptiles.tiles[0]",
      "sources.spaces.data",
      "sources.occupancies.data",
      "glyphs",
    ].forEach((path) =>
      _.set(
        json,
        path,
        Object.keys(options).reduce(
          (p, k) => p.replace(`\$\{${k}\}`, options[k]),
          _.get(json, path)
        )
      )
    );
    return res.status(200).json(json);
  });
});

// get map info
router.get("/info", auth.required, (req, res, next) => {
  mbtiles.getInfo(function(err, info) {
    if (err) {
      return res.status(400).json(err.message);
    }
    return res.status(200).json(info);
  });
});

// get grid
router.get("/grid/:z/:x/:y", auth.required, (req, res, next) => {
  const { z, x, y } = req.params;
  mbtiles.getGrid(z, x, y, function(err, data) {
    if (err) {
      return res.status(400).json(err.message);
    }
    return res.status(200).json(data);
  });
});

module.exports = router;
