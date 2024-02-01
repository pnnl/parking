import "@/env";

import { lexicographicSortSchema, printSchema } from "graphql";

import { logger } from "@/logging";
import { relative } from "path";
import { schema } from "@/graphql/schema";
import { writeFileSync } from "fs";

async function main() {
  const schemaAsString = printSchema(lexicographicSortSchema(schema));
  const filename = relative(process.cwd(), "schema.graphql");
  writeFileSync(filename, schemaAsString);
  return filename;
}

main()
  .then(async (filename) => {
    logger.info(`GraphQL schema exported to: ${filename}\n`);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
