import { LogCreate, LogUpdate } from "./input";

import { LogType } from "@/common";
import { Prisma } from "@prisma/client";
import { builder } from "../builder";
import { pick } from "lodash";
import prisma from "@/prisma";

builder.mutationField("createLog", (t) =>
  t.prismaField({
    description: "Create a new log.",
    authScopes: { admin: true },
    type: "Log",
    args: {
      create: t.arg({ type: LogCreate }),
    },
    resolve: async (query, root, args, ctx, info) => {
      if (!args.create) {
        throw new Error("Create input required.");
      }
      const log: Prisma.LogCreateInput = pick(args.create, ["type", "message", "expiration"]);
      const isBanner = log.type === LogType.BannerType?.enum;
      if (log.message) {
        log.message = `${isBanner ? "" : "[web-ui]: "}${log.message || ""}`;
      }
      return prisma.log.create({
        ...query,
        data: log,
      });
    },
  })
);

builder.mutationField("updateLog", (t) =>
  t.prismaField({
    description: "Update the specified log.",
    authScopes: { admin: true },
    type: "Log",
    args: {
      id: t.arg({ type: "Int", required: true }),
      update: t.arg({ type: LogUpdate }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const log: Prisma.LogUpdateInput = pick(args.update, ["type", "message", "expiration"]) ?? {};
      return prisma.log.update({
        ...query,
        where: { id: args.id },
        data: log,
      });
    },
  })
);

builder.mutationField("deleteLog", (t) =>
  t.prismaField({
    description: "Delete the specified log.",
    authScopes: { admin: true },
    type: "Log",
    args: {
      id: t.arg({ type: "Int", required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      return prisma.log.delete({
        ...query,
        where: { id: args.id },
      });
    },
  })
);
