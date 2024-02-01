import { LogType } from "@/common";
import { PrismaClient } from "@prisma/client";
import { logger } from "@/logging";
import pino from "pino";

const level = LogType.parse(process.env.LOG_PRISMA_LEVEL ?? "")?.name as pino.Level | undefined;

const prisma = new PrismaClient(
  level
    ? {
        log: [
          {
            emit: "event",
            level: "query",
          },
        ],
      }
    : undefined
);

if (level) {
  prisma.$on("query", (event) => {
    logger[level](event, "Prisma Query");
  });
}

logger.info(`Prisma Client configured for database at:  ${(process.env.DATABASE_URL ?? "").split("@").pop()}`);

export default prisma;
