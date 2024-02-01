import { buildOptions, schedule, startService } from "../util";
import { existsSync, mkdirSync } from "fs";

import { Occupancy } from "@prisma/client";
import { createObjectCsvWriter } from "csv-writer";
import { isEmpty } from "lodash";
import { logger } from "@/logging";
import moment from "moment";
import prisma from "@/prisma";
import { resolve } from "path";

const fields = ["date", "time", "blockId", "blockfaceId", "cvlzId", "occupancy", "sensors"];

const execute = (options: ExportOptions, repeated?: true) => () => {
  let offset = options.state.offset;
  let repeat = false;
  if ((repeated || options.state.initial) && options.state.backlog > 0) {
    // this is a backlog run
    options.state.initial = false;
    offset = ++options.state.index;
    repeat = options.state.index < options.state.backlog;
  } else {
    // this is a scheduled run
  }
  const now = offset ? moment().subtract(offset, options.state.unit) : moment();
  const dateLike = isEmpty(options.state.dateLike) ? undefined : now.format(options.state.dateLike);
  const timeLike = isEmpty(options.state.timeLike) ? undefined : now.format(options.state.timeLike);
  prisma.$queryRaw<Occupancies>`
    SELECT
        "date",
        "time",
        "blockId",
        "blockfaceId",
        "cvlzId",
        "occupancy",
        "sensors"
    FROM
        "Occupancy"
    WHERE
        "date" LIKE '${dateLike}'
        AND "time" LIKE '${timeLike}'
  `
    .then((occupancies) => {
      if (occupancies.length === 0) {
        logger.info(`No occupancies for date: ${dateLike} and time: ${timeLike}`);
        if (repeat) {
          execute(options, true);
        }
        return;
      }
      let filename = ".csv";
      switch (options.state.unit?.slice(0, 1).toLowerCase()) {
        case "m":
          filename = now.format("-mm") + filename;
        // fallthrough
        case "h":
          filename = now.format("-hh") + filename;
        // fallthrough
        case "d":
          filename = now.format("-DD") + filename;
        // fallthrough
        case "m":
          filename = now.format("-MM") + filename;
        // fallthrough
        case "y":
          filename = now.format("YYYY") + filename;
        // fallthrough
        default:
          filename = "Occupancies_" + filename;
      }
      if (!existsSync(resolve(process.cwd(), options.state.path))) {
        mkdirSync(resolve(process.cwd(), options.state.path));
      }
      const csvWriter = createObjectCsvWriter({
        path: resolve(process.cwd(), options.state.path, filename),
        header: fields.map((a) => ({ id: a, title: a })),
      });
      csvWriter
        .writeRecords(occupancies)
        .then(() => {
          logger.info(
            `Completed writing of ${occupancies.length} record${occupancies.length === 1 ? "" : "s"} to file ${resolve(
              process.cwd(),
              options.state.path,
              filename
            )}`
          );
          if (repeat) {
            execute(options, true);
          }
        })
        .catch((error: any) => {
          logger.warn(error);
        });
    })
    .catch((error) => {
      logger.warn(error);
    });
};

type Fields = "date" | "time" | "blockId" | "blockfaceId" | "cvlzId" | "occupancy" | "sensors";

type Occupancies = Pick<Occupancy, Fields>[];

type Unit = "minute" | "hour" | "day" | "month" | "year";

interface ExportState {
  unit: Unit;
  offset: number;
  backlog: number;
  path: string;
  dateLike?: string;
  timeLike?: string;
  initial: boolean;
  index: number;
}

interface ExportOptions extends ServiceState<ExportState> {}

const task = () => {
  const backlog = parseInt(process.env.EXPORT_BACKLOG_COUNT ?? "0");
  const options: ExportOptions = buildOptions(
    {
      service: "export",
      schedule: process.env.EXPORT_SCHEDULE,
      leading: backlog > 0,
    },
    {
      unit: (process.env.EXPORT_OFFSET_UNIT ?? "day") as Unit,
      offset: parseInt(process.env.EXPORT_OFFSET_AMOUNT ?? "0"),
      backlog: backlog,
      path: process.env.EXPORT_PATH ?? "../data/export/",
      dateLike: process.env.EXPORT_DATE_LIKE,
      timeLike: process.env.EXPORT_TIME_LIKE,
      initial: backlog > 0,
      index: 0,
    }
  );
  const worker = execute(options);
  schedule(worker, options);
};

if (!startService(__filename, { name: "Export Service" })?.catch((error) => logger.warn(error))) {
  task();
}
