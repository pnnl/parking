import "@/env";

import { basename, extname, resolve } from "path";
import { readdir, stat } from "fs/promises";

import { logger } from "@/logging";
import prisma from "@/prisma";
import { Seed } from "@prisma/client";

async function main() {
  try {
    const seeders = await prisma.seed.findMany({ select: { filename: true, timestamp: true } });
    const seeded: Pick<Seed, "filename" | "timestamp">[] = [];
    const files = await readdir(resolve(__dirname, "seeders"), { withFileTypes: true });
    const index = basename(__filename);
    logger.info(`Running the database seeder scripts...`);
    for (const file of files) {
      try {
        const ext = extname(file.name);
        if (/\.ts|\.js/i.test(ext)) {
          if (file.isFile() && file.name !== index) {
            const metadata = await stat(resolve(__dirname, "seeders", file.name));
            const seed = seeders.find((v) => v.filename === file.name) ?? {
              filename: file.name,
              timestamp: new Date(0),
            };
            if (metadata.mtime > seed.timestamp) {
              logger.info(`Running seeder ${file.name}...`);
              try {
                const main: { default: () => Promise<void> } = await import(`./seeders/${file.name}`);
                await main.default();
                seed.timestamp = metadata.mtime;
                await prisma.seed.upsert({ where: { filename: file.name }, create: seed, update: seed });
                seeded.push(seed);
                logger.info(`Finished running seeder ${file.name}.`);
              } catch (error) {
                logger.warn(error, `Failed to run seeder ${file.name}.`);
              }
            }
          }
        }
      } catch (error) {
        logger.warn(error);
      }
    }
    if (seeded.length > 0) {
      logger.info(`Finished running the database seeder scripts.`);
    } else {
      logger.info(`No new database seeder scripts to run.`);
    }
  } catch (error) {
    logger.warn(error);
  }
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(() => {
    logger.flush();
  });
