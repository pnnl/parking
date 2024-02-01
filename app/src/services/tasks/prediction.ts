import { buildOptions, schedule, startService } from "../util";
import { get, isObject, merge } from "lodash";

import axios from "axios";
import { logger } from "@/logging";
import moment from "moment";
import prisma from "@/prisma";

const begin = (options: PredictionOptions) => {
  if (options.state.running) {
    return false;
  } else {
    options.state.running = true;
    options.state.count = 1;
    return true;
  }
};

const end = (options: PredictionOptions) => {
  options.state.count = Math.max(0, options.state.count - 1);
  if (options.state.count === 0) {
    options.state.running = false;
  }
};

const reset = (options: PredictionOptions) => {
  options.state.count = 0;
  options.state.running = false;
};

const execute = (options: PredictionOptions) => () => {
  if (!begin(options)) {
    return;
  }
  const { proxy } = options;
  const { url } = options.state;
  axios
    .get(`${url}`, {
      headers: {},
      proxy: proxy ?? false,
    })
    .then((response) => {
      const error = get(response, ["data", "error"]);
      if (error) {
        throw Error(error.message);
      }
      const data = get(response, ["data"], {});
      Object.keys(data).forEach((cvlzId) => {
        Object.keys(data[cvlzId]).forEach((timestamp) => {
          const d = moment(timestamp).local();
          const date = d.valueOf();
          const time = d.format("hh:mm:ss a");
          const base = {
            date: date,
            time: time,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const values = data[cvlzId][timestamp];
          if (isObject(values.sensors)) {
            values.sensors = JSON.stringify(values.sensors);
          }
          values.probability = get(values, ["probability"], 1.0);
          values.minOccupancy = get(values, ["minOccupancy"], values.value);
          values.maxOccupancy = get(values, ["maxOccupancy"], values.value);
          prisma.space
            .findFirst({
              where: { cvlzId: cvlzId },
              orderBy: [{ createdAt: "desc" }],
            })
            .then((space) => {
              const { blockId, blockfaceId } = space ?? {};
              logger.debug({ timestamp, values });
              prisma.prediction.create({
                data: merge(
                  {
                    blockId: blockId,
                    blockfaceId: blockfaceId,
                    cvlzId: cvlzId,
                  },
                  values,
                  base
                ),
              });
            })
            .catch((error) => {
              logger.error({ message: error.message, stack: error.stack });
            });
        });
      });
      end(options);
    })
    .catch((error) => {
      reset(options);
      logger.error(error);
    });
};

interface PredictionState {
  running: boolean;
  count: number;
  url: string;
}

interface PredictionOptions extends ServiceState<PredictionState> {}

const task = () => {
  const options: PredictionOptions = buildOptions(
    {
      service: "prediction",
      schedule: process.env.PREDICTION_API_SCHEDULE,
      leading: false,
    },
    {
      running: false,
      count: 0,
      url: process.env.PREDICTION_API_URL ?? "",
    }
  );
  const worker = execute(options);
  schedule(worker, options);
};

if (!startService(__filename, { name: "Prediction Service" })?.catch((error) => logger.warn(error))) {
  task();
}
