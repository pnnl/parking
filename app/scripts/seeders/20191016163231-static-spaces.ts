import { get, merge, range } from "lodash";
import { readFileSync, readdirSync } from "fs";

import { ParkingType } from "@/common";
import { getDistance } from "geolib";
import prisma from "@/prisma";
import { resolve } from "path";

const selectProp = (props: any, ...types: string[]) => {
  return types.map((type) => props[type]).find((value) => value);
};
const items = [] as any[];
readdirSync(resolve(process.cwd(), process.env.SEEDER_DATA_PATH ?? "data/", "spaces/"))
  .filter((file) => {
    return file.endsWith(".geojson");
  })
  .forEach((file) => {
    const data = readFileSync(resolve(process.cwd(), process.env.SEEDER_DATA_PATH ?? "data/", "spaces/", file));
    const spaces = JSON.parse(data.toString());
    spaces.features.forEach((spc: any) => items.push(merge({ sourceFilename: file.slice(0, -8) }, spc)));
    console.info(`Loaded ${items.length} records of space data from: ${file}`);
  });
const spaces = items
  .filter((space) => get(space, "geometry.type") === "LineString")
  .map((space, i) => {
    const props = space.properties;
    let length = selectProp(props, "SHAPE_Length", "shp_ln_");
    if (!length) {
      length =
        getDistance(
          {
            longitude: get(space, ["geometry", "coordinates", "0", "0"], 0.0),
            latitude: get(space, ["geometry", "coordinates", "0", "1"], 0.0),
          },
          {
            longitude: get(space, ["geometry", "coordinates", "1", "0"], 0.0),
            latitude: get(space, ["geometry", "coordinates", "1", "1"], 0.0),
          },
          0.01
        ) * 3.28084;
    }
    const count = get(props, ["spc_cnt"], 1);
    const category = selectProp(props, "CATEGORY", "prk_ctg");
    const { name: spaceType, label: spaceTyped } = ParkingType.parse(category) ?? {};
    return {
      objectId: `${space.sourceFilename}-${i}`,
      label: props.label as string | undefined,
      blockId: selectProp(props, "BLOCKID", "blck_id") as string | undefined,
      blockfaceId: props.blckfc_ as string | undefined, // occupancies only
      cvlzId: props.cvlz_id as string | undefined, // occupancies only
      cvcpct: props.cv_cpct as string | undefined, // occupancies only
      rowNbr: props.ROWNBR as string | undefined,
      blockStart: props.BLOCK_ST as number | undefined,
      blockEnd: props.BLOCK_END as number | undefined,
      widthOffset: props.WIDTH_OFFSET as number | undefined,
      geoBasys: props.GEOBASYS as string | undefined,
      spaceLength: props.SPACELENGTH as number | undefined,
      spaceType: (props.SPACETYPE || spaceType || category) as string | undefined,
      spaceTyped: (props.SPACETYPEDESC || spaceTyped || category) as string | undefined,
      timeLimit: selectProp(props, "TIME_LIMIT", "tim_lmt"), // spaces and occupancies
      spaceNb: props.SPACE_NB as string | undefined,
      category: category as string | undefined, // spaces and occupancies
      side: props.SIDE as string | undefined,
      currentSt: props.CURRENT_STATUS as string | undefined,
      elementKey: props.ELMNTKEY as number | undefined,
      shapeLength: Math.max(10, length), // spaces and occupancies
      occupancy: count,
      sensors: JSON.stringify(range(1, count + 1).map((i) => `${i}`)),
      geojson: space.geometry, // spaces and occupancies
    };
  });

const data = spaces;

const main = async () => {
  try {
    for (const record of data) {
      await prisma.space.upsert({
        where: { objectId: record.objectId },
        update: {},
        create: record,
      });
    }
    console.info(`Added ${data.length} record${data.length === 1 ? "" : "s"} to the space table.`);
  } catch (error: any) {
    console.warn(error);
  }
};

export default main;
