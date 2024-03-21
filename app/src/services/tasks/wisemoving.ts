import { buildOptions, schedule, startService } from "../util";
import { get, isEmpty, isEqual } from "lodash";

import { ParkingType } from "@/common";
import axios from "axios";
import { logger } from "@/logging";
import moment from "moment";
import prisma from "@/prisma";
import { randomUUID } from "crypto";
import { templateFormat } from "@/utils/util";
import { ServiceState } from "../types";

const execute = (options: WisemovingOptions) => async () => {
  const { proxy } = options;
  const { url, key, cityPath, cityIds, areaPath, areaUpdate } = options.state;
  const loading = !options.state.loaded;
  try {
    for (const cityId of cityIds) {
      const now = moment().local();
      const date = moment().local().format("YYYY-MM-DD");
      const time = now.format("hh:mm:ss a");
      await axios
        .get(templateFormat(`${url}${cityPath}`, { "city-id": cityId }), {
          headers: {
            ...(!isEmpty(key) && { "X-API-KEY": `${key}` }),
          },
          proxy: proxy ?? false,
        })
        .then(async (response) => {
          const areas = get(response, "data", []) as any[];
          if (loading) {
            logger.info(`Found areas for city ${areas[0]?.city}: ${areas.map((v) => v.name).join(", ")}`);
          }
          for (const area of areas.filter((v) => areaUpdate.includes(v.name))) {
            await axios
              .get(templateFormat(`${url}${areaPath}`, { "area-id": area.id }), {
                headers: {
                  ...(!isEmpty(key) && { "X-API-KEY": `${key}` }),
                },
                proxy: proxy ?? false,
              })
              .then(async (response) => {
                const spaces = get(response, "data", []);
                if (loading) {
                  logger.info(`Found ${spaces.length} space${spaces.length === 1 ? "" : "s"} for area ${area.name}.`);
                }
                for (const space of spaces) {
                  await (loading
                    ? prisma.space.upsert({
                        where: { objectId: space.id as string },
                        update: {
                          geojson: {
                            type: "Point",
                            coordinates: [space.lng, space.lat],
                          },
                        },
                        create: {
                          label: space.address,
                          objectId: space.id,
                          blockId: space.areaId,
                          blockfaceId: space.areaName, // occupancies only
                          cvlzId: space.id, // occupancies only
                          cvcpct: null, // occupancies only
                          spaceType: ParkingType.PAID.name,
                          spaceTyped: ParkingType.PAID.label,
                          timeLimit: null, // spaces and occupancies
                          category: ParkingType.PAID.name, // spaces and occupancies
                          shapeLength: 20, // spaces and occupancies
                          occupancy: 1, // number of sensors
                          sensors: `["1"]`, // sensor ids
                          geojson: true
                            ? {
                                type: "Point",
                                coordinates: [space.lng, space.lat],
                              }
                            : {
                                type: "LineString",
                                coordinates: [
                                  [space.lng, space.lat],
                                  [space.lng, space.lat],
                                ],
                              },
                        },
                      })
                    : Promise.resolve()
                  ).then(async () => {
                    const sensors = [space.status === "BUSY"]; // true is occupied
                    if (loading || !isEqual(options.state.previous[space.id], sensors)) {
                      options.state.previous[space.id] = sensors;
                      options.state.updated++;
                      await prisma.occupancy.create({
                        data: {
                          objectId: randomUUID(),
                          blockId: space.areaId,
                          blockfaceId: space.areaName, // occupancies only
                          cvlzId: space.id, // occupancies only
                          occupancy: sensors.filter((v) => v).length,
                          sensors: JSON.stringify(sensors),
                          date: date,
                          time: time,
                          type: ParkingType.PAID.name,
                        },
                      });
                    }
                  });
                }
              });
          }
        });
    }
    options.state.loaded = true;
  } catch (error) {
    logger.error(error);
  }
};

interface WisemovingState {
  previous: Record<string, any>;
  updated: number;
  running: boolean;
  loaded: boolean;
  count: number;
  timestamp: number;
  debounce: {
    id: string | null;
    timestamp: number;
    messages: string[];
  };
  url: string;
  key: string;
  cityPath: string;
  cityIds: string[];
  areaPath: string;
  areaUpdate: string[];
}

interface WisemovingOptions extends ServiceState<WisemovingState> {}

const task = () => {
  const options: WisemovingOptions = buildOptions(
    {
      service: "wisemoving",
      schedule: process.env.WISEMOVING_API_SCHEDULE,
      leading: true,
    },
    {
      previous: {},
      updated: 0,
      running: false,
      loaded: false,
      count: 0,
      timestamp: 0,
      debounce: {
        id: null,
        timestamp: 0,
        messages: [],
      },
      url: process.env.WISEMOVING_API_URL ?? "",
      key: process.env.WISEMOVING_API_KEY ?? "",
      cityPath: process.env.WISEMOVING_API_CITY_PATH ?? "",
      cityIds: (process.env.WISEMOVING_API_CITY_IDS ?? "").split(",").map((v) => v.trim()),
      areaPath: process.env.WISEMOVING_API_AREA_PATH ?? "",
      areaUpdate: (process.env.WISEMOVING_API_AREA_UPDATE ?? "").split(",").map((v) => v.trim()),
    }
  );
  const worker = execute(options);
  schedule(worker, options);
};

if (!startService(__filename, { name: "Wisemoving Service" })?.catch((error) => logger.warn(error))) {
  task();
}
