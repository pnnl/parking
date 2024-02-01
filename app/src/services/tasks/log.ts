import { buildOptions, schedule, startService } from "../util";

import { logger } from "@/logging";
import { metadata } from "@/logging/builder";
import { parseBoolean } from "@/utils/util";
import prisma from "@/prisma";

const start = (options: LogOptions) => {
  options.state.running = true;
};

const failed = (options: LogOptions) => {
  options.state.running = false;
};

const completed = (options: LogOptions) => {
  options.state.completed = true;
  options.state.running = false;
};

const execute = (options: LogOptions) => () => {
  if (!options.state.running && !options.state.completed) {
    start(options);
    logger.info("Clearing existing log messages...");
    prisma.log
      .deleteMany({ where: { createdAt: { lt: metadata.loaded } } })
      .then(() => {
        logger.info("Successfully cleared old log messages.");
        completed(options);
      })
      .catch((error) => {
        logger.warn({ message: error.message, stack: error.stack });
        failed(options);
      });
  }
};

interface LogState {
  running: boolean;
  retries: number;
  completed: boolean;
}

interface LogOptions extends ServiceState<LogState> {}

const task = () => {
  const options: LogOptions = buildOptions(
    {
      service: "log",
      schedule: undefined,
      leading: parseBoolean(process.env.LOG_CLEAN),
    },
    {
      running: false,
      retries: 0,
      completed: false,
    }
  );
  const worker = execute(options);
  schedule(worker, options);
};

if (!startService(__filename, { name: "Log Service" })?.catch((error) => logger.warn(error))) {
  task();
}
