import { Prisma } from "@prisma/client";
import { UserUpdate } from "../users/input";
import { authUser } from "@/auth";
import { builder } from "../builder";
import { pick } from "lodash";
import prisma from "@/prisma";

builder.mutationField("updateCurrent", (t) =>
  t.prismaField({
    description: "Update the currently logged in user.",
    authScopes: { user: true },
    type: "User",
    args: {
      update: t.arg({ type: UserUpdate }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user: Prisma.UserUpdateInput = pick(args.update, ["name", "email", "password", "preferences"]) ?? {};
      const auth = await authUser(ctx.req, ctx.res);
      if (auth.id === null) {
        throw new Error("User must be logged in.");
      }
      return prisma.user.update({
        ...query,
        where: { id: auth.id },
        data: user,
      });
    },
  })
);

builder.mutationField("deleteCurrent", (t) =>
  t.prismaField({
    description: "Delete the currently logged in user.",
    authScopes: { user: true },
    type: "User",
    resolve: async (query, root, args, ctx, info) => {
      const auth = await authUser(ctx.req, ctx.res);
      if (auth.id === null) {
        throw new Error("User must be logged in.");
      }
      return prisma.user.delete({
        ...query,
        where: { id: auth.id },
      });
    },
  })
);
