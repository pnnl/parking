import { pick } from "lodash";

import prisma from "@/prisma";
import { Prisma } from "@prisma/client";

import { builder } from "../builder";
import { UserUpdate } from "../users/input";

builder.mutationField("updateCurrent", (t) =>
  t.prismaField({
    description: "Update the currently logged in user.",
    authScopes: { user: true },
    type: "User",
    args: {
      update: t.arg({ type: UserUpdate }),
    },
    resolve: async (query, _root, args, ctx, _info) => {
      const user: Prisma.UserUpdateInput = pick(args.update, ["name", "email", "password", "preferences"]) ?? {};
      const auth = ctx.authUser;
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
    resolve: async (query, _root, _args, ctx, _info) => {
      const auth = ctx.authUser;
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
