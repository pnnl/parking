import { NextApiRequest, NextApiResponse } from "next";
import { cloneDeep, omit } from "lodash";
import { getFirstValue, parseBoolean } from "@/utils/util";

import { logger } from "@/logging";
import prisma from "@/prisma";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { param } = req.query ?? {};
  const filename = getFirstValue(param);
  if (filename?.endsWith(".json")) {
    const { dynamic, points, spaceTypes, bounds } = req.query;
    const [w, s, e, n] = getFirstValue(bounds)?.split(/,/) ?? [-180, -85.051129, 180, 85.051129];
    return prisma.space
      .findMany({
        where: {
          ...(dynamic && {
            cvlzId: parseBoolean(getFirstValue(dynamic))
              ? {
                  not: null,
                }
              : null,
          }),
          ...(getFirstValue(spaceTypes) && {
            OR: [
              { spaceType: { in: JSON.parse(getFirstValue(spaceTypes) ?? "") } },
              { category: { in: JSON.parse(getFirstValue(spaceTypes) ?? "") } },
            ],
          }),
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
        orderBy: [{ cvlzId: "asc" }, { label: "asc" }],
      })
      .then((spaces) => {
        const features = spaces
          .map((space) => {
            let properties = {} as any;
            let geometry = space.geojson as any;
            if (parseBoolean(getFirstValue(points))) {
              const findPoint = (p: any[]): number[] => (isFinite(p?.[0]) ? p : findPoint(p[0]));
              geometry = {
                type: "Point",
                coordinates: findPoint(geometry.coordinates),
              };
            } else {
              properties = omit(cloneDeep(space), ["geojson", "geometry"]) as any;
            }
            return {
              type: "Feature",
              properties: {
                id: space.objectId,
                ...properties,
              },
              geometry: geometry,
            };
          })
          .filter((space) => space.geometry.coordinates);
        const collection = { type: "FeatureCollection", features: features };
        return res.status(200).json(collection);
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
