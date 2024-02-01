import { CommentCreate, CommentUpdate } from "./input";

import { Prisma } from "@prisma/client";
import { authUser } from "@/auth";
import { builder } from "../builder";
import { pick } from "lodash";
import prisma from "@/prisma";

builder.mutationField("createComment", (t) =>
  t.prismaField({
    description: "Create a new comment.",
    authScopes: { user: true },
    type: "Comment",
    args: {
      create: t.arg({ type: CommentCreate }),
    },
    resolve: async (query, root, args, ctx, info) => {
      if (!args.create) {
        throw new Error("Create input required.");
      }
      const auth = await authUser(ctx.req, ctx.res);
      const comment: Prisma.CommentCreateInput = pick(args.create, ["message"]);
      comment.user = { connect: { id: auth.id } };
      return prisma.comment.create({
        ...query,
        data: comment,
      });
    },
  })
);

builder.mutationField("updateComment", (t) =>
  t.prismaField({
    description: "Update the specified comment.",
    authScopes: { user: true },
    type: "Comment",
    args: {
      id: t.arg({ type: "Int", required: true }),
      update: t.arg({ type: CommentUpdate }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const comment: Prisma.CommentUpdateInput = pick(args.update, ["message"]) ?? {};
      const auth = await authUser(ctx.req, ctx.res);
      return prisma.comment.update({
        ...query,
        where: { id: args.id, ...(auth.roles.admin ? {} : { userId: auth.id }) },
        data: comment,
      });
    },
  })
);

builder.mutationField("deleteComment", (t) =>
  t.prismaField({
    description: "Delete the specified comment.",
    authScopes: { user: true },
    type: "Comment",
    args: {
      id: t.arg({ type: "Int", required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const auth = await authUser(ctx.req, ctx.res);
      return prisma.comment.delete({
        ...query,
        where: { id: args.id, ...(auth.roles.admin ? {} : { userId: auth.id }) },
      });
    },
  })
);
