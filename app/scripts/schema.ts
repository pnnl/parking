import "@/env";

import { writeFile } from "fs/promises";
import { lexicographicSortSchema, printSchema } from "graphql";
import { relative } from "path";

import { schema } from "@/graphql/schema";
import { logger } from "@/logging";

async function main() {
  const schemaAsString = printSchema(lexicographicSortSchema(schema));
  const filename = relative(process.cwd(), "schema.graphql");
  await writeFile(filename, schemaAsString);
  return filename;
}

main()
  .then((filename) => {
    logger.info(`GraphQL schema exported to: ${filename}\n`);
  })
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(() => logger.flush());
