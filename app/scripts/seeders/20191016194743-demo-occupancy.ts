import { readFileSync, readdirSync } from "fs";

import { ParkingType } from "@/common";
import moment from "moment";
import prisma from "@/prisma";
import { randomUUID } from "crypto";
import { resolve } from "path";

const items = [] as any[];
readdirSync(resolve(process.cwd(), process.env.SEEDER_DATA_PATH ?? "data/", "occupancies/"))
  .filter((file) => {
    return file.endsWith(".json");
  })
  .forEach((file) => {
    const data = readFileSync(resolve(process.cwd(), process.env.SEEDER_DATA_PATH ?? "data/", "occupancies/", file));
    const occupancy = JSON.parse(data.toString());
    occupancy.features.forEach((spc: any) => items.push(spc));
    console.info(`Loaded ${items.length} records of occupancy data from: ${file}`);
  });
const occupancies = items.map((occupancy) => {
  const id = occupancy.id ?? randomUUID();
  const date = moment(occupancy.date, "Y/M/D").local().format("YYYY-MM-DD");
  const time = moment(occupancy.time, "h:m:s a").local().format("hh:mm:ss a");
  return {
    objectId: id as string,
    date: date,
    time: time,
    blockId: occupancy.block_id as string | undefined,
    blockfaceId: occupancy.blockface_id as string | undefined,
    cvlzId: occupancy.cvlz_id as string,
    occupancy: (occupancy.occupancy ?? 0) as number,
    type: (occupancy ?? ParkingType.CV.name) as string,
  };
});

const data = occupancies;

const main = async () => {
  try {
    for (const record of data) {
      await prisma.occupancy.upsert({
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
