import { UserCreate, UserUpdate } from "./input";

import { Prisma } from "@prisma/client";
import { builder } from "../builder";
import { pick } from "lodash";
import prisma from "@/prisma";

builder.mutationField("createUser", (t) =>
  t.prismaField({
    description: "Create a new user.",
    authScopes: { admin: true },
    type: "User",
    args: {
      create: t.arg({ type: UserCreate }),
    },
    resolve: async (query, root, args, ctx, info) => {
      if (!args.create) {
        throw new Error("Create input required.");
      }
      if (!args.create?.email) {
        throw new Error(`email must be specified`);
      }
      const user: Prisma.UserCreateInput = pick(args.create, ["name", "email", "password", "scope", "preferences"]);
      user.preferences = user.preferences ?? {};
      return prisma.user.create({
        ...query,
        data: user,
      });
    },
  })
);

builder.mutationField("updateUser", (t) =>
  t.prismaField({
    description: "Update the specified user.",
    authScopes: { admin: true },
    type: "User",
    args: {
      id: t.arg({ type: "String", required: true }),
      update: t.arg({ type: UserUpdate }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user: Prisma.UserUpdateInput =
        pick(args.update, ["name", "email", "password", "scope", "preferences"]) ?? {};
      return prisma.user.update({
        ...query,
        where: { id: args.id },
        data: user,
      });
    },
  })
);

builder.mutationField("deleteUser", (t) =>
  t.prismaField({
    description: "Delete the specified user.",
    authScopes: { admin: true },
    type: "User",
    args: {
      id: t.arg({ type: "String", required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      return prisma.user.delete({
        ...query,
        where: { id: args.id },
      });
    },
  })
);
