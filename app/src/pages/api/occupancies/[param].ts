import { NextApiRequest, NextApiResponse } from "next";
import { NormalizationType, ParkingType, VehicleType } from "@/common";
import { calculateAvailable, getFirstValue } from "@/utils/util";
import { cloneDeep, concat, get, isEmpty, isString, omit } from "lodash";

import { logger } from "@/logging";
import moment from "moment";
import prisma from "@/prisma";
import { readFile } from "fs";
import { resolve } from "path";

const matcher = (value: string) =>
  NormalizationType.process(
    NormalizationType.Uppercase,
    NormalizationType.Trim,
    NormalizationType.Compact,
    NormalizationType.Letters,
    NormalizationType.Numbers,
    NormalizationType.NFD
  )(value) ?? "";
VehicleType.matcher = matcher;
ParkingType.matcher = matcher;

const occupancyQuery = (cvlzIds: string[], time?: string) => `SELECT
"objectId",
"date",
"time",
"blockId",
"blockfaceId",
"cvlzId",
"occupancy",
"sensors",
"type",
"createdAt",
"updatedAt"
FROM
(
    SELECT
        "objectId",
        "date",
        "time",
        "blockId",
        "blockfaceId",
        "cvlzId",
        "occupancy",
        "sensors",
        "type",
        "createdAt",
        "updatedAt",
        ROW_NUMBER() OVER (
            PARTITION BY "Occupancy_A"."cvlzId"
            ORDER BY
                ${
                  time
                    ? `CASE
                  WHEN "Occupancy_A"."time" LIKE '${time}' THEN 1
                  ELSE 2
                END ASC,`
                    : ""
                }
                "Occupancy_A"."createdAt" DESC
        ) rn
    FROM
        "Occupancy" AS "Occupancy_A"
    WHERE
        "Occupancy_A"."cvlzId" IN (${cvlzIds.map((v) => `'${v}'`).join(", ")})
) x
WHERE
x.rn = 1;`;

const predictionQuery = (cvlzIds: string[], time: string) => `SELECT
"objectId",
"date",
"time",
"blockId",
"blockfaceId",
"cvlzId",
"maxOccupancy",
"minOccupancy",
"value",
"probability",
"sensors",
"createdAt",
"updatedAt"
FROM
(
    SELECT
        "objectId",
        "date",
        "time",
        "blockId",
        "blockfaceId",
        "cvlzId",
		"maxOccupancy",
		"minOccupancy",
		"value",
		"probability",
		"sensors",
		"createdAt",
		"updatedAt",
        ROW_NUMBER() OVER (
            PARTITION BY "Prediction_A"."cvlzId"
            ORDER BY
                ${
                  time
                    ? `CASE
                  WHEN "Prediction_A"."time" LIKE '${time}' THEN 1
                  ELSE 2
                END ASC,`
                    : ""
                }
                "Prediction_A"."createdAt" DESC
        ) rn
    FROM
        "Prediction" AS "Prediction_A"
    WHERE
        "Prediction_A"."cvlzId" IN (${cvlzIds.map((v) => `'${v}'`).join(", ")})
) x
WHERE
x.rn = 1;`;

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { param } = req.query ?? {};
  const filename = getFirstValue(param);
  if (filename?.endsWith(".json")) {
    const { requirement, bounds, vehicle, deferred } = req.query ?? {};
    const [w, s, e, n] = getFirstValue(bounds)?.split(/,/) ?? [-180, -85.051129, 180, 85.051129];
    const required = parseInt(getFirstValue(requirement) ?? "20");
    const vehicleType = VehicleType.parse(getFirstValue(vehicle) ?? "");
    const parkingTypes = vehicleType
      ? ParkingType.values
          .filter((p) => p.allowed(vehicleType))
          .reduce((p, c) => concat(p, [c.name, c.label]), [] as string[])
      : undefined;
    const deferredTime = deferred
      ? moment()
          .startOf("minutes")
          .set("minutes", Math.floor(moment().startOf("minutes").get("minutes") / 15) * 15)
          .add(parseInt(deferred?.[0] ?? deferred) * 15, "minutes")
          .format("hh:mm:__ a")
      : undefined;
    logger.debug(`Deferred Time: ${deferredTime}`);
    return prisma.space
      .findMany({
        where: {
          cvlzId: { not: null },
          ...(!deferredTime &&
            parkingTypes && {
              OR: [
                {
                  spaceType: {
                    in: parkingTypes,
                  },
                },
                {
                  spaceTyped: {
                    in: parkingTypes,
                  },
                },
              ],
            }),
          // todo: refactor into raw query
          // ...(n &&
          //   e &&
          //   s &&
          //   w && {
          //     AND: fn(
          //       "ST_Within",
          //       fn("ST_SetSRID", col("geometry"), 4326),
          //       fn(
          //         "ST_SetSRID",
          //         fn(
          //           "ST_MakePolygon",
          //           fn(
          //             "ST_GeomFromText",
          //             `LINESTRING(${w} ${n}, ${e} ${n}, ${e} ${n}, ${e} ${s}, ${e} ${s}, ${w} ${s}, ${w} ${s}, ${w} ${n}, ${w} ${n}, ${w} ${n})`
          //           )
          //         ),
          //         4326
          //       )
          //     ),
          //   }),
        },
        select: {
          blockfaceId: true,
          blockId: true,
          category: true,
          cvlzId: true,
          geojson: true,
          label: true,
          objectId: true,
          occupancy: true,
          sensors: true,
          shapeLength: true,
        },
        orderBy: [{ cvlzId: "asc" }],
      })
      .then(async (spaces) => {
        const cvlzIds = spaces.filter((v) => v.cvlzId !== null).map((v) => v.cvlzId as string);
        return await Promise.all([
          !isEmpty(cvlzIds) ? prisma.$queryRawUnsafe<any[]>(occupancyQuery(cvlzIds)) : Promise.resolve([[]]),
          !isEmpty(cvlzIds) && deferredTime
            ? prisma.$queryRawUnsafe<any[]>(occupancyQuery(cvlzIds, deferredTime))
            : Promise.resolve([[]]),
          !isEmpty(cvlzIds) && deferredTime
            ? prisma.$queryRawUnsafe<any[]>(predictionQuery(cvlzIds, deferredTime))
            : Promise.resolve([[]]),
        ])
          .then(([results, dynaTypes, predicts]) => {
            const occupancies = results
              .map((result: any) => {
                const id = result.cvlzId;
                const value = result.occupancy || 0;
                let sensors = result.sensors;
                if (isString(sensors)) {
                  try {
                    sensors = JSON.parse(sensors);
                  } catch (error) {
                    logger.warn(error);
                  }
                }
                return { id, value, sensors };
              })
              .reduce((map: any, value: any) => {
                if (!isEmpty(value.id)) {
                  map[value.id] = value;
                }
                return map;
              }, {} as any);
            dynaTypes.forEach((result: any) => {
              const type = result.type;
              if (occupancies[result.cvlzId]) {
                occupancies[result.cvlzId].type = type;
                occupancies[result.cvlzId].typed = true;
              }
            });
            predicts.forEach((result: any) => {
              const value = result.value;
              if (occupancies[result.cvlzId]) {
                occupancies[result.cvlzId].value = value;
                occupancies[result.cvlzId].predicted = true;
              }
            });
            const parkingTypesSet = parkingTypes && deferred ? new Set(parkingTypes) : undefined;
            const features = spaces
              .map((space) => {
                const properties = cloneDeep(space) as any;
                const occupancy = get(occupancies, properties.cvlzId);
                properties.shapeLength = Math.round(properties.shapeLength);
                properties.occupancies = Boolean(occupancy);
                properties.sensors = JSON.parse(properties.sensors).length;
                properties.required = required;
                properties.occupancy = occupancy?.value || 0;
                properties.state = occupancy?.sensors;
                properties.current = calculateAvailable(properties, "occupancy");
                properties.available = properties.sensors > 0 ? properties.current : null;
                properties.precise = Boolean(properties.state);
                if (occupancy?.type) {
                  const type = ParkingType.parse(occupancy.type || properties.spaceType);
                  if (type) {
                    properties.spaceType = type.name;
                    properties.spaceTyped = type.label;
                  }
                }
                return {
                  type: "Feature",
                  properties: omit(properties, ["geojson", "geometry"]),
                  geometry: properties.geojson,
                };
              })
              .filter((f) =>
                parkingTypesSet
                  ? parkingTypesSet.has(f.properties.spaceType) || parkingTypesSet.has(f.properties.spaceTypes)
                  : true
              );
            const collection = { type: "FeatureCollection", features: features };
            return res.status(200).json(collection);
          })
          .catch((error) => {
            logger.warn(error);
            return res.status(400).json(error.message);
          });
      })
      .catch((error) => {
        logger.warn(error);
        return res.status(400).json(error.message);
      });
  } else if (filename?.endsWith(".csv")) {
    const { date } = req.query;
    const now = moment(getFirstValue(date));
    let exportname = ".csv";
    if (process.env.EXPORT_OFFSET_UNIT) {
      switch (process.env.EXPORT_OFFSET_UNIT.toLowerCase()) {
        case "minute":
          exportname = now.format("-mm") + exportname;
        // fallthrough
        case "hour":
          exportname = now.format("-hh") + exportname;
        // fallthrough
        case "day":
          exportname = now.format("-DD") + exportname;
        // fallthrough
        case "month":
          exportname = now.format("-MM") + exportname;
        // fallthrough
        case "year":
          exportname = now.format("YYYY") + exportname;
        // fallthrough
        default:
          exportname = "Occupancies_" + exportname;
      }
    }
    readFile(resolve(process.cwd(), process.env.EXPORT_PATH ?? "", exportname), (err, data) => {
      if (err) {
        return res.status(400).json("Requested data not available.");
      }
      return res.status(200).send(data);
    });
  } else {
    return res.status(404).end();
  }
};

export default handleRequest;
