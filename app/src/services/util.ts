import { SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler";
import { Worker, isMainThread } from "node:worker_threads";
import { isEmpty, isUndefined, merge, toLower } from "lodash";

import cron from "node-cron";
import fs from "fs";
import { logger } from "@/logging";
import { parseBoolean } from "@/utils/util";
import path from "path";

const useWorkerThreads = parseBoolean(process.env.USE_WORKER_THREADS);

const createPath = (value: string) => {
  const dir = path.resolve(process.cwd(), value);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getFiles = (root: string, dir: string, remove = false): Array<File> => {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const fullpath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      const ret = getFiles(root, fullpath, remove);
      if (remove && isEmpty(ret) && fullpath !== root) {
        fs.rmdir(fullpath, (error) => {
          if (error && !error.message.startsWith("ENOTEMPTY")) {
            logger.warn(error);
          }
        });
      }
      return ret;
    } else if (dirent.isFile()) {
      const stat = fs.statSync(fullpath);
      return {
        path: path.join(root, path.relative(root, dir)),
        filename: dirent.name,
        birthtime: new Date(stat.mtime),
      };
    }
  });
  return files.flat().filter((file) => !isUndefined(file)) as Array<File>;
};

const schedule = (worker: () => void, { schedule, service, leading, type }: ServiceOptions) => {
  const instance = process.env.CLUSTER_TYPE ?? "";
  if (
    !isEmpty(instance) &&
    !instance
      .split(/[, |-]+/)
      .map(toLower)
      .includes(toLower(service))
  ) {
    return;
  }
  const suffix = isEmpty(instance) ? `${type ? type + " " : ""}${service}.` : `${service} for instance ${instance}.`;
  if (isUndefined(schedule) || isEmpty(schedule)) {
    if (leading) {
      setTimeout(worker, 1);
      logger.info(`Configured initial service ${suffix}.`);
    }
    return;
  }
  const pattern = /^(\d+)$/;
  const [, milliseconds] = pattern.exec(schedule) ?? [];
  if (milliseconds) {
    const scheduler = new ToadScheduler();
    const task = new Task(`${service} Task`, worker);
    const job = new SimpleIntervalJob({ milliseconds: parseInt(milliseconds), runImmediately: leading }, task);
    scheduler.addSimpleIntervalJob(job);
    logger.info(`Configured interval service ${suffix}.`);
  } else {
    if (leading) {
      setTimeout(worker, 1);
    }
    cron.schedule(schedule, worker);
    logger.info(`Configured scheduled service ${suffix}.`);
  }
};

const startService = (filename: string | URL, options?: WorkerOptions): Promise<void> | undefined => {
  if (useWorkerThreads && process.env.NODE_ENV === "production" && isMainThread) {
    const name = options?.name ? `${options.name} ` : "";
    logger.info(`Starting ${name}in a worker thread.`);
    return new Promise((resolve, reject) => {
      const worker = new Worker(filename, options);
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) reject(new Error(`Service worker ${name}stopped with exit code ${code}`));
      });
    });
  }
};

function buildOptions(options: ServiceOptions): Readonly<ServiceOptions>;
function buildOptions<T extends {}>(options: ServiceOptions, state: T): ServiceState<T>;
function buildOptions<T extends {}>(options: ServiceOptions, state?: T): Readonly<ServiceOptions> | ServiceState<T> {
  if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
    options.proxy = {
      host: process.env.PROXY_HOST,
      port: parseInt(process.env.PROXY_PORT),
      ...(process.env.PROXY_PROTOCOL && { protocol: process.env.PROXY_PROTOCOL }),
    };
  }
  return merge(options, { state: state ?? {} });
}

export { createPath, getFiles, schedule, startService, buildOptions };
