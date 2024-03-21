# Dynamic Curb Allocation Application

Dynamic Curb Allocation Application is a web-based application that alerts drivers in real time to available parking spaces near their destinations. Parking availability can be viewed on a map in real-time, using predictive modeling and sensor data supplied by external services. The app can be viewed with a web browser on a mobile device or PC.

This app is a full stack typescript web application that is configured with cloud deployment, authentication, database, and a map tile server.

The current stack consists of:

- Deployment: Docker Compose
- Database: Postgres (Postgis)
- Map Tiles: Open Street Maps
- Application: Nextjs
- Authentication: Lucia
- Object Relational Mapping (ORM): Prisma
- Data Query Layer: GraphQL
- End to End Type Safety: Pothos and Apollo
- Reverse Proxy: Traefik
- TLS (SSL/HTTPS): Let's Encrypt

---

## Quick Start Guide

This guide has been written, tested, and intended for Windows and Linux installations.

---

## Prerequesites

These applications should be installed on the host machine.

- [Visual Studio Code](https://code.visualstudio.com/) - `development` (optional)
- [Git](https://git-scm.com/) - `development` (optional)
- [Node.js](https://nodejs.org/) - `development` (verions 20.x - https://nodejs.org/dist/latest-v20.x/)
- [Yarn](https://yarnpkg.com/) - `development`
- [Docker-Desktop](https://www.docker.com/products/docker-desktop) - `deployment` or Docker and Docker-Compose
  - [Docker](https://www.docker.com/products/container-runtime) - (optional)
  - [Docker-Compose](https://docs.docker.com/compose/install/) - (optional)

## Development

### Installing

Download the Dynacurb App source code from the PNNL BitBucket repository. It's recommended to use the latest stable release from the master branch.

- [Github](https://github.com/pnnl/parking)

If Git is installed you can checkout directly from Github which will make updating to the latest release easier. You will only have to clone the repository once. After that you can pull to get the latest updates. Every time the application is updated you'll need to go through the build and deploy process.

```bash
git clone https://github.com/pnnl/parking.git
```

### Updating

If you downloaded directly from the Github site then you will need to repeat all steps in this guide as you would for a new installation. If you cloned from Github then follow these steps. This will stash your configuration changes, update to the latest, and then re-apply your configuration to the updated files.

```bash
git stash
git pull
git stash pop
```

### Building

If build errors occur it is very likely that Node.js or Yarn is out of date. The following steps assumes the user is in the main directory of the application.

Install or update all of the dependencies.

```bash
cd app
yarn install
yarn compile
yarn build
```

### Initializing

The database migrations and seeders are not automatically run for development.

To run any impending database migrations:

```bash
yarn migrate
```

To seed the database using the seeder scripts:

```bash
yarn seed
```

To reset the database to a clean state:

> Warning: This will delete all existing data!

```bash
yarn reset
```

### Running

To start the app in development mode enter the following command from the `./app/` directory.

```bash
yarn dev
```

Type `CTRL-C` to stop the app.

### Configuration

The primary configuration file is `./app/.env`. Changes to configuration should be made using a new file `./app/.env.local`. App client configuration options must be prefixed with `NEXT_PUBLIC_`. These are the only variables that will be available to client side code.

> <b>Note:</b> Only configuration that differs from the base configuration file should be specified.

#### Client

Environment variables that need to be accessed in the client code must be prefixed with `NEXT_PUBLIC_`.

#### Logging

> <b>Note:</b> All log levels should be one of the following types: trace, debug, info, warn, error, fatal

- LOG_TRANSPORTS: A comma separated list of logging transports to utilize.
- LOG_GLOBAL_LEVEL: The logging level to use for logging all API requests.
- LOG_CONSOLE_LEVEL: The logging level that should be displayed in console.
- LOG_FILE_PATH: The path to write the log file `./server.log`.
- LOG_FILE_LEVEL: The logging level that should be displayed to file.
- LOG_DATABASE_LEVEL: The logging level that should be logged to the database.
- LOG_PRISMA_LEVEL: Specify a logging level for showing Prisma database statements. This should only be used during development.

#### Session

- SESSION_UPDATE_AGE: The maximum age for a session without getting updated in seconds.
- SESSION_MAX_AGE: The maximum age for sessions specified in seconds.

#### Authentication

- AUTH_PROVIDERS: Comma separated list of authentication providers to enable. The defaults available are local and bearer.

#### General

- GRAPHQL_EDITOR: Set to true to display the GraphQL editor in production.

#### Database

- DATABASE_URL: The complete database connection URL which is populated using the following variables.
- DATABASE_HOST: The database hostname.
- DATABASE_PORT: The database port.
- DATABASE_NAME: The database name.
- DATABASE_SCHEMA: The database schema.
- DATABASE_USERNAME: The database username.
- DATABASE_PASSWORD: The database password.

#### Services

- CLUSTER_TYPE: Dash separated list of services to run on this instance. Providing an empty string, or "services", will start all available services.
- PROXY_PROTOCOL: The protocol to use for the proxy.
- PROXY_HOST: The proxy hostname.
- PROXY_PORT: The proxy port.
- LOG_CLEAN: Set to true to delete old log records from the database on app start.
- LOG_CLEAN: Set to true to delete old log records from the database on app start.
- FONTS_PATH: The file path for the fonts used by the OSM style.
- EXPORT_PATH: The file path for exporting data.
- SEEDER_DATA_PATH: The file path that contains the seeder data.

#### Wisemoving

- WISEMOVING_API_URL: The base API URL for the Wisemoving data service.
- WISEMOVING_API_KEY: The API key used to authenticate with the Wisemoving data service.
- WISEMOVING_API_CITY_PATH: The API path for getting the list of areas for a city. It is populated with the `{city-id}`.
- WISEMOVING_API_CITY_IDS: List of cities by Id to get data for.
- WISEMOVING_API_AREA_PATH: The API path for getting the list of spaces for an area. It is populated with the `{area-id}`.
- WISEMOVING_API_AREA_UPDATE: List of area names to filter on if specified.
- WISEMOVING_API_SCHEDULE: The Wisemoving update schedule specified in cron notation with an optional seconds field or in milliseconds.

#### Prediction

- PREDICTION_API_URL: The complete API URL for the prediction service.
- PREDICTION_API_SCHEDULE: The prediction service update schedule specified in cron notation with an optional seconds field or in milliseconds.

#### Allocation

- ALLOCATION_API_URL: The complete API URL for the allocation service.
- ALLOCATION_API_SCHEDULE: The allocation service update schedule specified in cron notation with an optional seconds field or in milliseconds.

#### Export

> <b>Note:</b> The valid offset units are: minute, hour, day, month, year

- EXPORT_SCHEDULE: The export service update schedule specified in cron notation with an optional seconds field or in milliseconds.
- EXPORT_OFFSET_UNIT: The time offset for grouping export files.
- EXPORT_OFFSET_AMOUNT: The amount of offsets to group together for each file.
- EXPORT_BACKLOG_COUNT: The number of units to export on startup.
- EXPORT_DATE_LIKE: The database `LIKE` statement to use for exporting in day increments.
- EXPORT_TIME_LIKE: The database `LIKE` statement to use for exporting in time increments.

## Deployment

The following steps will need to be completed to deploy the Dynacurb Application.

### Open Street Map (OSM) Data

The map tiles are generated by a server using Open Street Map data. The raw map data can be downloaded here: [download.geofabrik.de/north-america](https://download.geofabrik.de/north-america/us.html) Map data is enormous so it's important to combine only the areas that are needed. Osmium can be utilized for combining data sources for ingest. [https://osmcode.org/libosmium](https://osmcode.org/libosmium/) Finally the combined data is then hosted using a pre-made docker container. [https://hub.docker.com/r/overv/openstreetmap-tile-server](https://hub.docker.com/r/overv/openstreetmap-tile-server)

The demo map data utilizes a combination of Washington and Florida OSM data. A single OSM file will need to be placed at `./osm/region.osm.pbf` before building and starting the Docker Compose Deployment.

> <b>Note: </b> Mapbox-GL must remain at version 1.x to utilize open source license. The OSM contribution message must also remain on the displayed map.

Combine OSM files using Osmium and Anaconda:

```bash
cd osm
osmium merge file1.osm.pbf file2.osm.pbf -o region.osm.pbf
```

### Configuration

Configuration for docker compose can be found at `./.env`. The file `./docker-compose.yml` may need to be edited for some deployments.

### TLS (SSL/HTTPS)

TLS is provided by mkcert certificates and Let's Encrypt. The init container will generate a new certificate authority (CA) and certificates when first started or when any of them are missing. The CA will need to be added to web browsers or system for the locally signed certificates to be valid. TLS can also be provided by Let's Encrypt [https://letsencrypt.org/](https://letsencrypt.org/) for publicly facing websites that have a valid domain name.

### Docker Compose

A Docker compose file is included to manage the docker instances. The docker compose file will work in Windows, Mac, and Linux. By default the web application will be available at [https://dynacurb.localhost](https://dynacurb.localhost). The following commands deploy all of the docker containers.

> Note: The OSM setup container will need to complete data import before the OSM tile server will start.

Build the docker instances:

```bash
docker-compose build
```

Create and start the docker instances:

```bash
docker-compose up -d
```

Start the docker instances:

```bash
docker-compose start
```

Stop the docker instances:

```bash
docker-compose stop
```

Destroy the docker instances along with associated volumes:

```bash
docker-compose down -v
```

### Administration

These are the commands that can be used to interact with a docker instance. Replace `<container>` with the intended container.

SSH into a container to run commands:

```bash
docker exec -t -i <container> /bin/bash
```

View a container console log:

```bash
docker logs <container>
```

Export all of the images to an archive file:

> Note: Replace the tag text with the appropriate tag version number.

```powershell
$images = @(); docker-compose config | ?{$_ -match "image:.*$"} | ?{$_ -replace "${TAG}", "1.0.2"} | %{$images += ($_ -replace "image: ", "").Trim()}; docker save -o docker-images.tar $images
```

```bash
gzip docker-images.tar
```

Import the images archive file on another system:

```bash
gzip -d docker-images.tar.gz
docker load -i docker-images.tar
```

## Updating Version

To update the client version make changes within files matching these filters: `.env*,*.yml,*.json`

## License

Dynacurb Parking App
Copyright © 2021, Battelle Memorial Institute

1. Battelle Memorial Institute (hereinafter Battelle) hereby grants permission to any person or
   entity lawfully obtaining a copy of this software and associated documentation files
   (hereinafter “the Software”) to redistribute and use the Software in source and binary forms,
   with or without modification. Such person or entity may use, copy, modify, merge, publish,
   distribute, sublicense, and/or sell copies of the Software, and may permit others to do so,
   subject to the following conditions:
   - Redistributions of source code must retain the above copyright notice, this list of
     conditions and the following disclaimers.
   - Redistributions in binary form must reproduce the above copyright notice, this list of
     conditions and the following disclaimer in the documentation and/or other materials
     provided with the distribution.
   - Other than as used herein, neither the name Battelle Memorial Institute or Battelle may
     be used in any form whatsoever without the express written consent of Battelle.
2. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
   CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
   INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
   MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   DISCLAIMED. IN NO EVENT SHALL BATTELLE OR CONTRIBUTORS BE LIABLE
   FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
   THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
   USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
   DAMAGE.
