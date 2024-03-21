import { logger } from "@/logging";
import prisma from "@/prisma";
import { pick } from "lodash";

const data = [
  {
    id: "1",
    name: "Test User",
    email: "test-user@pnnl.gov",
    password: "password",
    scope: "user",
    preferences: {},
  },
  {
    id: "2",
    name: "Test Admin",
    email: "test-admin@pnnl.gov",
    password: "password",
    scope: "admin",
    preferences: {},
  },
  {
    id: "3",
    name: "System User",
    email: "system-user@pnnl.gov",
    password: "password",
    scope: "",
    preferences: {},
  },
];

const main = async () => {
  try {
    for (const record of data) {
      await prisma.user.upsert({
        where: { id: record.id },
        update: pick(record, ["name", "email", "password", "scope"]),
        create: record,
      });
    }
    logger.info(`Upserted ${data.length} record${data.length === 1 ? "" : "s"} for the user table.`);
  } catch (error: any) {
    logger.warn(error);
  }
};

export default main;
