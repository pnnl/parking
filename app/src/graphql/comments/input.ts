import { DateTimeFilter, IntFilter, StringFilter, builder } from "../builder";
import { UserOrderBy, UserWhere } from "../users/input";

import { Prisma } from "@prisma/client";

export const CommentFields = builder.enumType("CommentFields", {
  values: Object.values(Prisma.CommentScalarFieldEnum),
});

export const CommentAggregate = builder.inputType("CommentAggregate", {
  fields: (t) => ({
    average: t.field({ type: [CommentFields] }),
    count: t.field({ type: [CommentFields] }),
    maximum: t.field({ type: [CommentFields] }),
    minimum: t.field({ type: [CommentFields] }),
    sum: t.field({ type: [CommentFields] }),
  }),
});

export const CommentWhereUnique = builder.prismaWhereUnique("Comment", {
  fields: {
    id: "Int",
  },
});

export const CommentWhere = builder.prismaWhere("Comment", {
  fields: {
    id: IntFilter,
    message: StringFilter,
    createdAt: DateTimeFilter,
    updatedAt: DateTimeFilter,
    referenceId: IntFilter,
    userId: StringFilter,
    user: UserWhere,
  },
});

export const CommentOrderBy = builder.prismaOrderBy("Comment", {
  fields: {
    id: true,
    message: true,
    createdAt: true,
    updatedAt: true,
    userId: true,
    user: UserOrderBy,
  },
});

export const CommentCreate = builder.prismaCreate("Comment", {
  fields: {
    message: "String",
  },
});

export const CommentUpdate = builder.prismaUpdate("Comment", {
  fields: {
    message: "String",
  },
});
