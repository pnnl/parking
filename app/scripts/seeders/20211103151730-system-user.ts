import prisma from "@/prisma";

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
        update: {},
        create: record,
      });
    }
    console.info(`Added ${data.length} record${data.length === 1 ? "" : "s"} to the user table.`);
  } catch (error: any) {
    console.warn(error);
  }
};

export default main;
