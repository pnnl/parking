import { NextApiRequest, NextApiResponse } from "next";

import { YogaInitialContext } from "graphql-yoga";
import { enum_log } from "@prisma/client";
import prisma from "@/prisma";

export interface Context extends YogaInitialContext {
  prisma: typeof prisma;
  req: NextApiRequest;
  res: NextApiResponse;
}

export type Scalars = {
  JSON: { Input: unknown; Output: unknown };
  DateTime: { Input: Date; Output: Date };
  LogType: { Input: enum_log; Output: enum_log };
};

export interface Aggregate<T extends string> {
  average?: T[] | null;
  count?: T[] | null;
  maximum?: T[] | null;
  minimum?: T[] | null;
  sum?: T[] | null;
}

export interface GroupBy<T extends string> {
  _avg?: { [k in T]: boolean | null };
  _count?: { [k in T]: boolean | null };
  _max?: { [k in T]: boolean | null };
  _min?: { [k in T]: boolean | null };
  _sum?: { [k in T]: boolean | null };
}
