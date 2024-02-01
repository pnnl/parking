import { AuthRoles, AuthUser } from "./types";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { AuthOptions, getServerSession } from "next-auth";
import { authenticate, providers } from "./util";
import { merge, set } from "lodash";

import CredentialsProvider from "next-auth/providers/credentials";
import { NextRequest } from "next/server";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { RoleType } from "@/common";
import { User } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { logger } from "@/logging";
import prisma from "@/prisma";

const adapter = PrismaAdapter(prisma);

const authRoles = (scope: string) => {
  const scopes = scope.split(/[, |]+/);
  return RoleType.values.reduce(
    (a, v) => merge(a, { [v.enum]: authenticate ? v.granted(...scopes) ?? false : true }),
    {} as AuthRoles
  );
};

const authUser = async (...args: [NextApiRequest, NextApiResponse] | [NextRequest] | []): Promise<AuthUser> => {
  let id = undefined;
  let scope = undefined;
  if (authenticate) {
    const session = await (args.length === 2 ? getServerSession(...args, authOptions) : getServerSession(authOptions));
    ({ id, scope } = session?.user ?? {});
    if (!session?.user && (args.length === 1 || args.length === 2)) {
      const token = await getToken({ req: args[0] });
      id = (token?.id as string | undefined) ?? "";
      scope = (token?.scope as string | undefined) ?? "";
    }
  }
  return {
    id,
    roles: authRoles(scope ?? ""),
  };
};

const authOptions: AuthOptions = {
  adapter: adapter,
  session: {
    updateAge: parseInt(process.env.SESSION_UPDATE_AGE ?? "86400"),
    maxAge: parseInt(process.env.SESSION_MAX_AGE ?? "2592000"),
  },
  logger: {
    debug(code, metadata) {
      logger.debug(code, metadata);
    },
    error(code, metadata) {
      logger.error(code, metadata);
    },
    warn(code) {
      logger.warn(code);
    },
  },
  callbacks: {
    jwt({ token, user }) {
      token.id = user.id;
      token.scope = (user as User).scope;
      return token;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.scope = (user as User).scope;
      }
      return session;
    },
  },
  providers: [
    // Local authentication
    CredentialsProvider({
      id: "local",
      name: "Local",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (credentials) {
          const user = await adapter.getUserByEmail?.(credentials.email);
          if (!user || credentials.password !== (user as any).password) {
            throw new Error("Username or password is incorrect.");
          } else if (user) {
            set(req, "session.user", user);
            return user;
          }
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ].filter((p) => providers.includes(p.options.id) || providers.includes(p.options.name)),
};

const handleRequest = NextAuth(authOptions);

export { handleRequest, authOptions, authUser, authRoles };
