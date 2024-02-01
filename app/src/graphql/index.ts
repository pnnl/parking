import { Aggregate, Context, GroupBy } from "./types";

import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { set } from "lodash";
import { useResponseCache as yogaResponseCache } from "@graphql-yoga/plugin-response-cache";

const { handleRequest, handle } = createYoga<Context>({
  schema: async (_context) => {
    return schema;
  },
  landingPage: false,
  maskedErrors: false,
  plugins: [
    yogaResponseCache({
      ttl: parseInt(process.env.GRAPHQL_CACHE_TTL ?? "5000"),
      session: (request: Request) => request.headers?.get("authentication"),
    }),
  ],

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/api/user/graphql",

  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },
});

const transformAggregate = <T extends string>(aggregate?: Aggregate<T> | null): GroupBy<T> => {
  const temp: GroupBy<T> = {};
  [
    { src: "average" as keyof Aggregate<T>, dst: "_avg" as keyof GroupBy<T> },
    { src: "count" as keyof Aggregate<T>, dst: "_count" as keyof GroupBy<T> },
    { src: "maximum" as keyof Aggregate<T>, dst: "_max" as keyof GroupBy<T> },
    { src: "minimum" as keyof Aggregate<T>, dst: "_min" as keyof GroupBy<T> },
    { src: "sum" as keyof Aggregate<T>, dst: "_sum" as keyof GroupBy<T> },
  ].forEach(({ src, dst }) => {
    const fields = aggregate?.[src];
    if (fields) {
      temp[dst] = fields.reduce((a, v) => set(a, v, true), {} as { [k in T]: boolean | null });
    }
  });
  return temp;
};

export { handleRequest, handle, transformAggregate };
