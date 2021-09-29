# Commercial Parking App

Commercial Parking Application is a web-based application that alerts delivery drivers in real time to available parking spaces near their destinations. Parking availability can be viewed on a map in real-time, using sensor data supplied by external services. The app can be viewed with a web browser on a mobile device or PC. Currently the app supports connections to real time sensors from Lacuna, Fybr, Cleverciti, and Automotus.

---

## Quick Start Guide

This guide has been written, tested, and intended for Windows and Linux installations.

---

### Description

This application is a Nodejs web application that utilizes a backend server and HTML and Javascript static web content (compiled from React) for the client. Parking spaces, occupancy status, and predictions are retreived using services that run at a specified frequency. This status is then inserted into the configured database. When the client needs spaces, occupancy, or prediction the most recent data is retrieved from the server and displayed. There are also REST API endpoints spcifically created for the external prediction service. These endpoints serve historical occupancy status as well as the latest occupancies.

---

### Prerequesites

These applications should be installed on the host machine.

- [Git](https://git-scm.com/) - required
- [Node.js](https://nodejs.org/) - required (verions 12 - https://nodejs.org/dist/latest-v12.x/)
- [Yarn](https://yarnpkg.com/) - required

You will need to acquire a vector MBTile for the appropriate area (in this case Washington state). You can scquire a licensed copy of OpenStreetMap vector tiles data from: [MapTiler](https://data.maptiler.com/downloads/planet/) The data needs to be placed within the `server/mbtiles` directory and have a file extension of `.mbtiles`.

---

### Installation

Download the Parking application source code from the PNNL Github repository. It's recommended to use the latest stable release from the master branch.

- [Github](https://stash.pnnl.gov/projects/UWTECHINT/repos/parking/browse)

If Git is installed you can checkout directly from Github which will make updating to the latest release easier. You will only have to clone the repository once. After that you can pull to get the latest updates. Every time the application is updated you'll need to go through the build process.

```bash
git clone https://stash.pnnl.gov/scm/uwtechint/parking.git
```

---

### Updating

If you downloaded directly from the Github site then you will need to repeat all steps in this guide as you would for a new installation. If you cloned from Github then follow these steps. This will stash your configuration changes, update to the latest, and then re-apply your configuration to the updated files.

```bash
git stash
git pull
git stash pop
```

---

### Building

If build errors occur it is very likely that Node.js or Yarn is out of date. The following steps assumes the user is in the root directory of the application.

Install or update all of the dependencies for the client. If the yarn install command fails it will often succeed when running it again.

```bash
cd client
yarn install
```

Build and deploy the client application to the server public directory.

```bash
yarn build
yarn deploy
```

Install or update all of the dependencies for the server. The reset command will drop all of the data from the database and seed it with fresh data.

```bash
cd ../server
yarn install
yarn reset
```

---

### Configuration

The client configuration must be edited before building and deploying. The primary configuration file used for the client is `/client/.env.production`. Client configuration should be performed in a local file called `/client/.env.production.local` where only fields that need to be overridden need to be specified. The client must be built and deployed for the changes to take effect.

If the client is not going to be deployed to a base URL (E.g. https://pnl.gov/example instead of https://pnl.gov) then the `homepage` attribute in `/client/package.json` will need to be set accordingly.

The server configuration consists of a primary configuration file. The primary configuration file used for the server is `/server/.env`. Server configuration should be performed in a local file called `/server/.env.local` where only fields that need to be overridden need to be specified. The server must be restarted in order for the changes to take effect.

#### General

- NODE_ENV: The current server node environment of type: `production`, `develop`, or `test`
- SERVER_PORT: The server port.
- SERVER_ADDRESS: The server domain address.
- HTTPS: Set to true in order to host using SSL.
- PASSWORD_SALT: Filename of the salt to use for encrypting the password for local login and user accounts.
- SERVER_KEY: The SSL key which must be generated for the host machine. The supplied one is not secure and should only be used for testing.
- SERVER_CERT: The SSL cert which must be generated for the host mahine. The supplied one is not secure and should only be used for testing.
- PUBLIC_KEY: The public key used for encrypting and decrypting the token for local login and user accounts.
- PRIVATE_KEY: The private key used for encrypting and decrypting the token for local login and user accounts.

#### Logging

- LOG_CONSOLE: The logging level that should be displayed in the console.
- LOG_FILE: The logging level that should be written to the log file `/server/server.log`.

#### Database

- DB_USERNAME: The database username.
- DB_PASSWORD: The database password.
- DB_NAME: The database name or `undefined` for default.
- DB_SCHEMA: The database schema or `undefined` for default.
- DB_DIALECT: The database schema of types: mysql, sqlite, pg
- DB_HOST: The database host name.
- DB_PORT: The database port.
- DB_LOGGING: Set to `true` to log the SQL queries to `info`.
- DB_MODE: Set to `update` to update the table schemas, `drop` to drop and then create the tables, or `undefined` to not update the schemas.

#### Map Tiles

- PROXY: Set to `true` if using a proxy for the map tile server.
- PROXY_HTTPS: Set to `true` if the tile proxy server requires SSL.
- PROXY_PORT: The tile proxy server port.
- PROXY_ADDRESS: The tile proxy server domain address.

#### Cleverciti Service

- CLEVERCITI_URL: The URL for this ingest service API endpoint.
- CLEVERCITI_API_KEY: The key to use for API endpoint requests.
- CLEVERCITI_API_SCHEDULE: The schedule to run the service in cron notation.
- CLEVERCITI_PROXY_HOST: The proxy host address to use.
- CLEVERCITI_PROXY_PORT: The proxy port to use.

#### Automotus Service

- AUTOMOTUS_URL: The URL for this ingest service API endpoint.
- AUTOMOTUS_API_KEY: The key to use for API endpoint requests.
- AUTOMOTUS_API_SCHEDULE: The schedule to run the service in cron notation.
- AUTOMOTUS_PROXY_HOST: The proxy host address to use.
- AUTOMOTUS_PROXY_PORT: The proxy port to use.

#### Fybr Service

- FYBR_API_URL: The URL for this ingest service API endpoint.
- FYBR_API_USERNAME: The username to use for API endpoint requests.
- FYBR_API_PASSWORD: The password to use for API endpoint requests.
- FYBR_API_SCHEDULE: The schedule to run the service in cron notation.
- FYBR_LOAD_SPACES: Set to true to load the spaces from the API on server start.
- FYBR_PROXY_HOST: The proxy host address to use.
- FYBR_PROXY_PORT: The proxy port to use.

#### Lacuna Service

- LACUNA_AUTH_URL: The URL for this ingest service authentication endpoint.
- LACUNA_API_URL: The URL for this ingest service API endpoint.
- LACUNA_API_BODY: The template to use as the body for API endpoint requests.
- LACUNA_API_SCHEDULE: The schedule to run the service in cron notation.
- LACUNA_LOAD_SPACES: Set to true to load the spaces from the API on server start.
- LACUNA_PROXY_HOST: The proxy host address to use.
- LACUNA_PROXY_PORT: The proxy port to use.

#### Prediction Service

- PREDICTION_API_URL: The URL for this prediction service API endpoint.
- PREDICTION_API_SCHEDULE: The schedule to run the service in cron notation.
- PREDICTION_PROXY_HOST: The proxy host address to use.
- PREDICTION_PROXY_PORT: The proxy port to use.

#### Export Service

- EXPORT_RUN_AT_START: Set to true to export occupancy records on server start.
- EXPORT_SCHEDULE: The schedule to run the service in cron notation.
- EXPORT_OFFSET_UNIT: The batch size for the export server of type: `day`, `week`, `month`, etc.
- EXPORT_OFFSET_AMOUNT: The offset to use for running the export service.
- EXPORT_BACKLOG_COUNT: The amount of backlog to export on server start.
- EXPORT_PATH: The relative file path for storing the exported data.
- EXPORT_DATE_LIKE: The SQL query like statement for the date.
- EXPORT_TIME_LIKE: The SQL query like statement for the time.

---

### Running

To start the server issue the following command.

```bash
yarn start
```

Type `CTRL-C` to stop the server.

---

### Deployment

Deploying the config portal to a host without internet should be performed using the following steps:

- From the build machine:
  1. Perform the `Building` step in this guide.
  2. Create a `zip` archive of the `server` directory.
  3. Delete the `.env.local`, `server.log`, and `db.development.sqlite` files from the archive.
  4. Add the `README.md` to the archive.
- From the deployment machine:
  1. Install `Node.js` and `Yarn`.
  2. Copy the archive from the build machine.
  3. Expand the archive into an install directory.
  4. Create a `.env.local` configuration file and edit as necessary.
  5. Ensure the system is configure to match the defaults in `.env` or add the correct variables to the `.env.local` configuration file.

> Note: To update the application perform the first set of steps and then steps 2, 3, and 5 of the second section.

---

### License

[PNNL (BSD)](LICENSE.txt)
                                        
This material was prepared as an account of work sponsored by an agency of the United
States Government. Neither the United States Government nor the United States
Department of Energy, nor Battelle, nor any of their employees, nor any jurisdiction or
organization that has cooperated in the development of these materials, makes any
warranty, express or implied, or assumes any legal liability or responsibility for the
accuracy, completeness, or usefulness or any information, apparatus, product, software,
or process disclosed, or represents that its use would not infringe privately owned rights.
Reference herein to any specific commercial product, process, or service by trade name,
trademark, manufacturer, or otherwise does not necessarily constitute or imply its
endorsement, recommendation, or favoring by the United States Government or any
agency thereof, or Battelle Memorial Institute. The views and opinions of authors
expressed herein do not necessarily state or reflect those of the United States Government
or any agency thereof.
                                        
                     PACIFIC NORTHWEST NATIONAL LABORATORY
                                  operated by
                                    BATTELLE
                                    for the
                       UNITED STATES DEPARTMENT OF ENERGY
                        under Contract DE-AC05-76RL01830
                                        