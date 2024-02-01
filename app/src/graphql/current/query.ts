import { authUser } from "@/auth";
import { builder } from "../builder";
import prisma from "@/prisma";

builder.queryField("readCurrent", (t) =>
  t.prismaField({
    description: "Read the currently logged in user.",
    authScopes: { user: true },
    type: "User",
    resolve: async (query, root, args, ctx, info) => {
      const auth = await authUser(ctx.req, ctx.res);
      if (auth.id === null) {
        throw new Error("User must be logged in.");
      }
      return prisma.user.findUniqueOrThrow({
        ...query,
        ...args,
        where: { id: auth.id },
      });
    },
  })
);
