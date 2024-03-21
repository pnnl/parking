import { NormalizationType, ParkingType } from "@/common";
import { buildOptions, schedule, startService } from "../util";
import { get, isEqual, uniqWith } from "lodash";

import axios from "axios";
import { logger } from "@/logging";
import moment from "moment";
import prisma from "@/prisma";
import { randomUUID } from "crypto";
import { ServiceState } from "../types";

ParkingType.matcher = (v: string) =>
  NormalizationType.process("LOWERCASE", "TRIM", "COMPACT", "LETTERS", "NFKC")(v) ?? "";

const execute = (options: AllocationOptions) => async () => {
  const { url } = options.state;
  logger.info(`Requesting data from: ${url}/process`);
  await axios
    .post(`${url}/process`, {
      headers: {},
    })
    .then(async (response) => {
      const error = get(response, "data.error");
      if (error) {
        throw Error(error.message);
      }
      const data = get(response, "data", []) as any[];
      const items = uniqWith(
        data
          .filter((v) => v)
          .map((space) => {
            const category = space.Parkingtype;
            const { name: spaceType } = ParkingType.parse(category) ?? ParkingType.PAID;
            const label = `CA-${space.curbname}-${space.curbnum}`;
            const date = moment().local().format("YYYY-MM-DD");
            const time = moment()
              .local()
              .startOf("days")
              .add(space.Time || 0, "minutes")
              .format("hh:mm:00 a");
            return {
              objectId: randomUUID(),
              date: date,
              time: time,
              blockId: "CA",
              blockfaceId: space.curbname,
              cvlzId: label, // occupancies only
              occupancy: 0,
              type: spaceType,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }),
        isEqual
      );
      await Promise.all(
        items.map(async (item) => {
          const { date, time, cvlzId, type, updatedAt } = item;
          logger.info(`Looking for occupancy: ${cvlzId} (${date} ${time})`);
          await prisma.occupancy
            .findMany({ where: { date, time, cvlzId } })
            .then(async ([occupancy]) => {
              if (occupancy) {
                const { objectId } = occupancy;
                logger.info(`Updating occupancy: ${cvlzId} (${objectId})`);
                await prisma.occupancy
                  .update({ where: { objectId }, data: { type, updatedAt } })
                  .catch((error) => logger.warn(error));
              } else {
                logger.info(`Creating occupancy: ${cvlzId} (${item.objectId})`);
                await prisma.occupancy.create({ data: item }).catch((error) => logger.warn(error));
              }
            })
            .catch((error) => logger.warn(error));
        })
      );
    })
    .catch((error) => logger.error({ url: `${url}/process`, message: error.message, stack: error.stack }));
};

interface AllocationState {
  running: boolean;
  count: number;
  url: string;
}

interface AllocationOptions extends ServiceState<AllocationState> {}

const task = () => {
  const options: AllocationOptions = buildOptions(
    {
      service: "allocation",
      schedule: process.env.ALLOCATION_API_SCHEDULE,
      leading: false,
    },
    {
      running: false,
      count: 0,
      url: process.env.ALLOCATION_API_URL ?? "",
    }
  );
  const worker = execute(options);
  schedule(worker, options);
};

if (!startService(__filename, { name: "Allocation Service" })?.catch((error) => logger.warn(error))) {
  task();
}
