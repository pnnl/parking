import { NextApiRequest, NextApiResponse } from "next";
import { calculateAvailable, getFirstValue } from "@/utils/util";
import { cloneDeep, get, indexOf, isEmpty, isNil, isString, omit, range } from "lodash";

import { logger } from "@/logging";
import moment from "moment";
import prisma from "@/prisma";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { param } = req.query ?? {};
  const filename = getFirstValue(param);
  if (filename?.endsWith(".json")) {
    const { availability, requirement, n, e, s, w } = req.query;
    const duration = parseInt(getFirstValue(availability) ?? "5");
    const m = moment().local();
    const times = range(0, duration)
      .map((d) => m.clone().add(d, "minutes").format("h:mm:00 a"))
      .reverse();
    const required = parseInt(getFirstValue(requirement) ?? "20");
    return prisma.space
      .findMany({
        where: {
          cvlzId: {
            not: null,
          },
          // todo: refactor into raw query
          //   ...(n &&
          //     e &&
          //     s &&
          //     w && {
          //       [Op.and]: fn(
          //         "ST_Within",
          //         fn("ST_SetSRID", col("geometry"), 4326),
          //         fn(
          //           "ST_SetSRID",
          //           fn(
          //             "ST_MakePolygon",
          //             fn(
          //               "ST_GeomFromText",
          //               `LINESTRING(${w} ${n}, ${e} ${n}, ${e} ${n}, ${e} ${s}, ${e} ${s}, ${w} ${s}, ${w} ${s}, ${w} ${n}, ${w} ${n}, ${w} ${n})`
          //             )
          //           ),
          //           4326
          //         )
          //       ),
          //     }),
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
        return await Promise.all(
          spaces
            .filter((space) => space.cvlzId !== null)
            .map((space) =>
              prisma.occupancy.findMany({
                where: {
                  cvlzId: space.cvlzId as string,
                },
                orderBy: [{ objectId: "desc" }],
                take: 1,
              })
            )
        )
          .then((results) => {
            const occupancies = results
              .map((result) => {
                const id = get(result, ["0", "cvlzId"]);
                const value = get(result, ["0", "occupancy"], 0);
                let sensors = get(result, ["0", "sensors"]);
                if (isString(sensors)) {
                  try {
                    sensors = JSON.parse(sensors);
                  } catch (error) {
                    logger.warn(error);
                  }
                }
                return { id, value, sensors };
              })
              .reduce((map, value) => {
                if (!isEmpty(value.id)) {
                  map[value.id] = value;
                }
                return map;
              }, {} as any);
            return Promise.all(
              spaces
                .filter((space) => space.cvlzId !== null)
                .map((space) =>
                  prisma.prediction
                    .findMany({
                      where: {
                        AND: {
                          cvlzId: space.cvlzId as string,
                          time: { in: times },
                        },
                      },
                      orderBy: [{ date: "desc" }],
                      take: times.length,
                    })
                    .then((predictions) =>
                      predictions.sort((a, b) => indexOf(times, a.time) - indexOf(times, b.time)).slice(0, 1)
                    )
                )
            )
              .then((results) => {
                const predictions = results
                  .map((result) => {
                    const id = get(result, "[0].cvlzId");
                    const value = get(result, "[0].value");
                    let sensors = get(result, "[0].sensors");
                    if (isString(sensors)) {
                      try {
                        sensors = JSON.parse(sensors);
                      } catch (error) {
                        logger.warn(error);
                      }
                    }
                    return { id, value, sensors };
                  })
                  .reduce((map, value) => {
                    if (!(isNil(value.id) || isEmpty(value.id))) {
                      map[value.id] = value;
                    }
                    return map;
                  }, {} as any);
                const features = spaces.map((space) => {
                  const properties = cloneDeep(space) as any;
                  properties.shapeLength = Math.round(properties.shapeLength ?? 0);
                  properties.occupancies = true;
                  properties.sensors = JSON.parse(properties.sensors).length;
                  properties.occupancy = get(occupancies, [properties.cvlzId, "value"], 0);
                  properties.state = get(occupancies, [properties.cvlzId, "sensors"]);
                  properties.current = calculateAvailable(properties, "occupancy");
                  properties.predictions = true;
                  properties.prediction = get(predictions, [properties.cvlzId, "value"], null);
                  properties.state = get(predictions, [properties.cvlzId, "sensors"], null);
                  properties.required = required;
                  if (properties.prediction === null) {
                    properties.available = null;
                  } else {
                    properties.available = calculateAvailable(properties, "prediction");
                  }
                  properties.precise = Boolean(properties.state);
                  return {
                    type: "Feature",
                    properties: omit(properties, ["geojson", "geometry"]),
                    geometry: properties.geojson,
                  };
                });
                const collection = {
                  type: "FeatureCollection",
                  features: features,
                };
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
      })
      .catch((error) => {
        logger.warn(error);
        return res.status(400).json(error.message);
      });
  } else {
    res.status(404).end();
    return Promise.reject(new Error("Not Found"));
  }
};

export default handleRequest;
