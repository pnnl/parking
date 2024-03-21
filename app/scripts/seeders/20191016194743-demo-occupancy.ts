import { ParkingType } from "@/common";
import moment from "moment";
import prisma from "@/prisma";
import { randomUUID } from "crypto";
import { resolve } from "path";
import { logger } from "@/logging";
import { mkdir, readFile, readdir } from "fs/promises";
import { flatten } from "lodash";

const main = async () => {
  try {
    const dir = resolve(process.cwd(), process.env.SEEDER_DATA_PATH ?? "data/", "occupancies/");
    await mkdir(dir, { recursive: true });
    const files = await readdir(dir);
    let items = await Promise.all(
      files
        .filter((file) => {
          return file.endsWith(".json");
        })
        .map(async (file) => {
          const data = await readFile(resolve(dir, file));
          const occupancy = JSON.parse(data.toString());
          const records = occupancy.features.map((spc: any) => spc);
          logger.info(`Loaded ${records.length} records of occupancy data from: ${file}`);
          return records;
        })
    );
    items = flatten(items);
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
    for (const record of occupancies) {
      await prisma.occupancy.upsert({
        where: { objectId: record.objectId },
        update: {},
        create: record,
      });
    }
    logger.info(`Added ${occupancies.length} record${occupancies.length === 1 ? "" : "s"} to the space table.`);
  } catch (error: any) {
    logger.warn(error);
  }
};

export default main;
