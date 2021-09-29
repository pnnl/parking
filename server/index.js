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
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const winston = require("winston");
const expressWinston = require("express-winston");
const ExpressCache = require("express-cache-middleware");
const cacheManager = require("cache-manager");
const path = require("path");
const util = require("./utils/util");

/* Make all variables from our .env file available in our process */
require("dotenv-flow").config({
  silent: true,
});

/* Init express */
let app = express();

/* Here we setup the middleware logging */
const desc = {
  transports: [
    new winston.transports.Console({ level: process.env.LOG_CONSOLE }),
    new winston.transports.File({
      filename: "server.log",
      level: process.env.LOG_FILE,
    }),
  ],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function(req, res) {
    return false;
  }, // optional: allows to skip some log messages based on request and/or response
};
winston.loggers.add("default", desc);
app.use(expressWinston.logger(desc));
// expressWinston.requestWhitelist.push("body"); // logging the body of messages should only be done during testing

/* Here we setup the middlewares & configs */
const public = fs.readFileSync(
  path.join(process.cwd(), process.env.PUBLIC_KEY)
);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: public,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(function(err, req, res, next) {
  if (err.code === "permission_denied") {
    res.status(403).send("Forbidden");
  }
});
require("./config/passport");

/* static public files hosting */
app.use(express.static(path.join(process.cwd(), "public")));

// setup the cache middleware
const cacheMiddleware = new ExpressCache(
  cacheManager.multiCaching([
    cacheManager.caching({
      store: "memory",
      max: 100,
      ttl: 5, // 5 seconds
    }),
  ]),
  {
    getCacheKey: (req) => {
      let key = undefined;
      switch (req.method) {
        case "GET":
          // cache all get requests
          if (!["no-store"].includes(req.header("Cache-Control"))) {
            key = `${req.url}`;
          }
          break;
        default:
        // don't cache
      }
      return key;
    },
  }
);
cacheMiddleware.attach(app);

/* Here we define the api routes */
app.use(require("./routes"));

/* Here we define the error handling */
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res
    .status(err.status ? err.status : 500)
    .send(err.message ? err.message : "Internal Server Error");
});

/* Here we setup the https certs if enabled */
if (util.parseBoolean(process.env.HTTPS)) {
  app = https.createServer(
    {
      key: fs.readFileSync(process.env.SERVER_KEY),
      cert: fs.readFileSync(process.env.SERVER_CERT),
    },
    app
  );
}

/* create the services */
const services = require("./services");

/* Create everything automatically with sequelize ORM */
const models = require("./models");
models.sequelize.sync({ alter: true }).then(function() {
  const port = process.env.SERVER_PORT || 3000;
  const address = process.env.SERVER_ADDRESS || "127.0.0.1";
  app.listen(port, address, () => {
    /* start the services */
    services();
    console.log(
      `Server running on http${
        util.parseBoolean(process.env.HTTPS) ? "s" : ""
      }://${address}:${port}`
    );
  });
});

module.exports = app;
