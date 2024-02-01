import { NormalizationType, ParkingType } from "@/common";
import { buildOptions, schedule, startService } from "../util";
import { get, isEqual, uniqWith } from "lodash";

import axios from "axios";
import { logger } from "@/logging";
import moment from "moment";
import prisma from "@/prisma";
import { randomUUID } from "crypto";

ParkingType.matcher = (v: string) =>
  NormalizationType.process("LOWERCASE", "TRIM", "COMPACT", "LETTERS", "NFKC")(v) ?? "";

const begin = (options: AllocationOptions) => () => {
  if (options.state.running) {
    return false;
  } else {
    options.state.running = true;
    options.state.count = 1;
    return true;
  }
};

const start = (options: AllocationOptions) => () => {
  if (options.state.running) {
    options.state.count += 1;
  }
};

const end = (options: AllocationOptions) => () => {
  options.state.count = Math.max(0, options.state.count - 1);
  if (options.state.count === 0) {
    options.state.running = false;
  }
};

const execute = (options: AllocationOptions) => () => {
  if (!begin(options)) {
    return;
  }
  const { url } = options.state;
  logger.info(`Requesting data from: ${url}/process`);
  axios
    .post(`${url}/process`, {
      headers: {},
    })
    .then((response) => {
      const error = get(response, "data.error");
      if (error) {
        throw Error(error.message);
      }
      const data = get(response, "data", []) as any[];
      const items = uniqWith(
        data
          .filter((v) => v)
          .map((space, i) => {
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
      items.forEach((item) => {
        const { date, time, cvlzId, type, updatedAt } = item;
        start(options);
        logger.info(`Looking for occupancy: ${cvlzId} (${date} ${time})`);
        prisma.occupancy
          .findMany({ where: { date, time, cvlzId } })
          .then(([occupancy]) => {
            start(options);
            if (occupancy) {
              const { objectId } = occupancy;
              logger.info(`Updating occupancy: ${cvlzId} (${objectId})`);
              prisma.occupancy
                .update({ where: { objectId }, data: { type, updatedAt } })
                .catch((error) => logger.warn(error))
                .finally(() => end(options));
            } else {
              logger.info(`Creating occupancy: ${cvlzId} (${item.objectId})`);
              prisma.occupancy
                .create({ data: item })
                .catch((error) => logger.warn(error))
                .finally(() => end(options));
            }
          })
          .catch((error) => logger.warn(error))
          .finally(() => end(options));
      });
    })
    .catch((error) => logger.error({ url: `${url}/process`, message: error.message, stack: error.stack }))
    .finally(() => end(options));
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
