import { NormalizationType, ParkingType } from "@/common";
import { cloneDeep, get, has, isUndefined, merge, range, set, uniqBy } from "lodash";
import { readFileSync, readdirSync } from "fs";

import { getDistance } from "geolib";
import { logger } from "@/logging";
import { range as mathRange } from "@/utils/math";
import moment from "moment";
import prisma from "@/prisma";
import { randomUUID } from "crypto";
import { resolve } from "path";

const COORD_REGEX = /^\(([0-9.-]+), ?([0-9.-]+)\)$/;

const getAndSet = <T extends {}, E>(obj: T, key: string, def: () => E): E => {
  if (!has(obj, key)) {
    set(obj, key, def());
  }
  return get(obj, key);
};

const findLatLon = (text: string) => {
  const [, latitude, longitude] = COORD_REGEX.exec(text) ?? ["", "0", "0"];
  return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
};

ParkingType.matcher = (value: string) =>
  NormalizationType.process("LOWERCASE", "TRIM", "COMPACT", "LETTERS", "NFKC")(value) ?? "";

const items = [] as any[];
readdirSync(resolve(process.cwd(), process.env.SEEDER_DATA_PATH ?? "data/", "alloc/"))
  .filter((file) => {
    return file.endsWith(".json");
  })
  .forEach((file) => {
    const data = readFileSync(resolve(process.cwd(), process.env.SEEDER_DATA_PATH ?? "data/", "alloc/", file));
    const spaces = JSON.parse(data.toString());
    spaces.forEach((space: any) => items.push(space));
    logger.info(`Loaded ${spaces.length} records of curb alloc data from: ${file}`);
  });
const defaults: {
  [label: string]: {
    template: {
      date: string;
      blockId: string;
      blockfaceId: string;
      cvlzId: string; // occupancies only
      occupancy: number;
      type: string;
      createdAt: string;
      updatedAt: string;
    };
    times: (string | undefined)[];
  };
} = {};
const data = items
  .filter((v) => v)
  .map((space) => {
    const coords = [findLatLon(space.loc_start), findLatLon(space.loc_end)];
    const length = getDistance(coords[0], coords[1], 0.01) * 3.28084;
    const geometry = {
      type: "LineString",
      coordinates: [
        [coords[0].longitude, coords[0].latitude],
        [coords[1].longitude, coords[1].latitude],
      ],
    };
    const count = 1;
    const category = space.Parkingtype;
    const { name: spaceType, label: spaceTyped } = ParkingType.parse(category) ?? { name: "unknown", label: "Unknown" };
    const label = `CA-${space.curbname}-${space.curbnum}`;
    const date = moment().local().format("YYYY-MM-DD");
    const time = moment(`${space.Time + 7}`, "H")
      .local()
      .format("hh:mm:ss a");
    getAndSet(defaults, label, () => ({
      template: {
        date: date,
        blockId: "CA",
        blockfaceId: `${space.curbname}`,
        cvlzId: label, // occupancies only
        occupancy: 0,
        type: spaceType,
      },
      times: Array(24).fill(undefined),
    })).times[space.Time + 7] = spaceType;
    return {
      occupancy: {
        objectId: randomUUID(),
        date: date,
        time: time,
        blockId: "CA",
        blockfaceId: `${space.curbname}`,
        cvlzId: label, // occupancies only
        occupancy: 0,
        type: spaceType,
      },
      space: {
        objectId: label,
        label: label,
        blockId: "CA",
        blockfaceId: `${space.curbname}`,
        cvlzId: label, // occupancies only
        cvcpct: undefined, // occupancies only
        rowNbr: undefined,
        blockStart: undefined,
        blockEnd: undefined,
        widthOffset: undefined,
        geoBasys: undefined,
        spaceLength: length,
        spaceType: spaceType || category,
        spaceTyped: spaceTyped || category,
        timeLimit: undefined, // spaces and occupancies
        spaceNb: undefined,
        category: category, // spaces and occupancies
        side: undefined,
        currentSt: undefined,
        elementKey: undefined,
        shapeLength: Math.max(10, length), // spaces and occupancies
        occupancy: count,
        sensors: JSON.stringify(range(1, count + 1).map((i) => `${i}`)),
        geojson: geometry, // spaces and occupancies
      },
    };
  });
const instance = data[0]?.space;
Object.values(
  data.reduce((p, c) => {
    const s = p[c.space.blockfaceId] ?? [];
    s.push(c.space);
    p[c.space.blockfaceId] = s;
    return p;
  }, {} as { [bfid: string]: (typeof instance)[] })
).forEach((v) => {
  v = uniqBy(v, "label");
  v.forEach((s, i) => {
    const coords = cloneDeep(s.geojson.coordinates);
    const [beg, end, lon, lat] = [0, 1, 0, 1];
    s.spaceLength = s.spaceLength / v.length;
    s.shapeLength = s.shapeLength / v.length;
    s.geojson.coordinates[beg][lon] = mathRange(0, v.length, coords[beg][lon], coords[end][lon], i);
    s.geojson.coordinates[end][lon] = mathRange(0, v.length, coords[beg][lon], coords[end][lon], i + 1);
    s.geojson.coordinates[beg][lat] = mathRange(0, v.length, coords[beg][lat], coords[end][lat], i);
    s.geojson.coordinates[end][lat] = mathRange(0, v.length, coords[beg][lat], coords[end][lat], i + 1);
  });
});
const spaces = uniqBy(
  data.map((i) => i.space),
  (i) => i.objectId
);
const occupancies = data.map((i) => i.occupancy);
Object.values(defaults).forEach((v) =>
  v.times.forEach((t, i) => {
    if (isUndefined(t)) {
      occupancies.push(
        merge(
          {
            objectId: randomUUID(),
            time: moment(`${i}`, "H").local().format("hh:mm:ss a"),
          },
          v.template
        )
      );
    }
  })
);

const main = async () => {
  try {
    for (const record of spaces) {
      await prisma.space.upsert({
        where: { objectId: record.objectId },
        update: {},
        create: record,
      });
    }
    console.info(`Added ${spaces.length} record${spaces.length === 1 ? "" : "s"} to the space table.`);
  } catch (error: any) {
    console.warn(error);
  }
  try {
    for (const record of occupancies) {
      await prisma.occupancy.upsert({
        where: { objectId: record.objectId },
        update: {},
        create: record,
      });
    }
    console.info(`Added ${occupancies.length} record${occupancies.length === 1 ? "" : "s"} to the occupancy table.`);
  } catch (error: any) {
    console.warn(error);
  }
};

export default main;
