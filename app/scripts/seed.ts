import "@/env";

import { basename, extname, resolve } from "path";
import { open, readdir } from "fs/promises";

import { logger } from "@/logging";
import prisma from "@/prisma";

async function main() {
  await open(resolve(process.cwd(), process.env.SEEDER_LOCK ?? "seeder.lock"), "a+").then(async (lock) => {
    const contents = await lock.readFile({ encoding: "utf-8" });
    try {
      const seeders = contents.split(/[\n\u0085\u2028\u2029]|\r\n?/g).filter((v) => v);
      const seeded = [];
      const files = await readdir(resolve(__dirname, "seeders"), { withFileTypes: true });
      const index = basename(__filename);
      logger.info(`Running the database seeder scripts...`);
      for (const file of files) {
        try {
          const ext = extname(file.name);
          const filename = file.name.substring(0, file.name.length - ext.length);
          if (file.isFile() && file.name !== index && !seeders.includes(filename)) {
            logger.info(`Running seeder ${filename}...`);
            const main: { default: () => Promise<void> } = await import(`./seeders/${filename}`);
            await main.default();
            seeded.push(filename);
            logger.info(`Finished running seeder ${filename}.`);
          }
        } catch (error: any) {
          console.warn(error);
        }
      }
      if (seeded.length > 0) {
        await lock.writeFile(seeded.join("\n") + "\n", { encoding: "utf-8" });
        logger.info(`Finished running the database seeder scripts.`);
      } else {
        logger.info(`No new database seeder scripts to run.`);
      }
    } catch (error: any) {
      logger.warn(error);
    } finally {
      await lock.close();
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
