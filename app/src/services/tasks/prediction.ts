import { buildOptions, schedule, startService } from "../util";
import { get, isObject, merge } from "lodash";

import axios from "axios";
import { logger } from "@/logging";
import moment from "moment";
import prisma from "@/prisma";
import { ServiceState } from "../types";

const execute = (options: PredictionOptions) => async () => {
  const { proxy } = options;
  const { url } = options.state;
  await axios
    .get(`${url}`, {
      headers: {},
      proxy: proxy ?? false,
    })
    .then(async (response) => {
      const error = get(response, ["data", "error"]);
      if (error) {
        throw Error(error.message);
      }
      const data = get(response, ["data"], {});
      await Promise.all(
        Object.keys(data).map(async (cvlzId) => {
          await Promise.all(
            Object.keys(data[cvlzId]).map(async (timestamp) => {
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
              await prisma.space
                .findFirst({
                  where: { cvlzId: cvlzId },
                  orderBy: [{ createdAt: "desc" }],
                })
                .then(async (space) => {
                  const { blockId, blockfaceId } = space ?? {};
                  logger.debug({ timestamp, values });
                  await prisma.prediction.create({
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
            })
          );
        })
      );
    })
    .catch((error) => {
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
