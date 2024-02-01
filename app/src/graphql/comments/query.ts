import { CommentAggregate, CommentFields, CommentOrderBy, CommentWhere, CommentWhereUnique } from "./input";
import { PagingInput, builder } from "../builder";

import { authUser } from "@/auth";
import { merge } from "lodash";
import prisma from "@/prisma";
import { transformAggregate } from "..";

builder.queryField("readComment", (t) =>
  t.prismaField({
    description: "Read a unique comment.",
    authScopes: { user: true },
    type: "Comment",
    args: {
      where: t.arg({ type: CommentWhereUnique }),
    },
    resolve: async (query, root, args, ctx, info) => {
      if (!args.where) {
        throw new Error("Read input required.");
      }
      const auth = await authUser(ctx.req, ctx.res);
      return prisma.comment.findUniqueOrThrow({
        ...query,
        where: merge(args.where, auth.roles.admin ? {} : { userId: auth.id }),
      });
    },
  })
);

builder.queryField("readComments", (t) =>
  t.prismaField({
    description: "Read a list of comments.",
    authScopes: { user: true },
    type: ["Comment"],
    args: {
      where: t.arg({ type: CommentWhere }),
      distinct: t.arg({ type: [CommentFields] }),
      orderBy: t.arg({ type: [CommentOrderBy] }),
      paging: t.arg({ type: PagingInput }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const auth = await authUser(ctx.req, ctx.res);
      return prisma.comment.findMany({
        ...query,
        where: merge(args.where ?? {}, auth.roles.admin ? {} : { userId: auth.id }),
        distinct: args.distinct ?? undefined,
        orderBy: args.orderBy ?? {},
        ...(args.paging ?? {}),
      });
    },
  })
);

builder.queryField("countComments", (t) =>
  t.field({
    description: "Count the number of comments.",
    authScopes: { user: true },
    type: "Int",
    args: {
      where: t.arg({ type: CommentWhere }),
    },
    resolve: async (root, args, ctx, info) => {
      const auth = await authUser(ctx.req, ctx.res);
      return prisma.comment.count({
        where: merge(args.where ?? {}, auth.roles.admin ? {} : { userId: auth.id }),
      });
    },
  })
);

builder.queryField("groupComments", (t) =>
  t.field({
    description: "Group a list of comments.",
    authScopes: { user: true },
    type: ["JSON"],
    args: {
      by: t.arg({ type: [CommentFields], required: true }),
      where: t.arg({ type: CommentWhere }),
      aggregate: t.arg({ type: CommentAggregate }),
    },
    resolve: async (root, args, ctx, info) => {
      const auth = await authUser(ctx.req, ctx.res);
      return prisma.comment.groupBy({
        by: args.by ?? [],
        ...(transformAggregate(args.aggregate) as any),
        where: merge(args.where ?? {}, auth.roles.admin ? {} : { userId: auth.id }),
      });
    },
  })
);
